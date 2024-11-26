import { Html5Cache, IndexedDbCache } from '@web3-explorer/utils';
import { onAction } from '../common/electron';
import { resizeImage } from '../common/image';
import { urlToBlob } from '../common/opencv';
import { CutAreaRect } from '../providers/ScreenshotProvider';
import { RoiInfo } from './RoiService';
import WebviewMainEventService from './WebviewMainEventService';
import WebviewService from './WebviewService';

export default class CutAreaService {
    indexedDb: IndexedDbCache;
    private html5Cache: Html5Cache;

    constructor(deviceId: string) {
        this.indexedDb = new IndexedDbCache().init(`screenCut/cut_${deviceId}`);
        this.html5Cache = new Html5Cache().init(`screenCutBlob_${deviceId}`);
    }

    async getImage(id: string): Promise<any> {
        const res = await this.html5Cache.get(`cut/blob/${id}`);
        const blob = await res!.blob();
        return blob ? URL.createObjectURL(blob) : null;
    }

    async getAll() {
        try {
            return await this.indexedDb.getAll();
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async saveArea(id: string, info: any, cutImageUrl: string) {
        await this.indexedDb.put(`${id}`, info);
        const blob = await urlToBlob(cutImageUrl);
        await this.html5Cache.put(`cut/blob/${id}`, blob);
        return true;
    }

    async update(id: string, info: any) {
        await this.indexedDb.put(`${id}`, info);
        return true;
    }

    async remove(id: string) {
        await this.indexedDb.delete(id);
    }
    static getClickPosition(roi: RoiInfo){
        const { cutAreaRect } = roi;
        const { x, y, w, h } = cutAreaRect;
        
        let clickX = x + w / 2;
        let clickY = y + h / 2;
        return {clickX,clickY}
    }

    static async sendDragEvent(row: RoiInfo, start:{x:number,y:number},end:{x:number,y:number},steps:number,tabId?: string, accountIndex?: number) {
        if (tabId && accountIndex !== undefined) {
            const toWinId = WebviewMainEventService.getPlaygroundWinId({
                index: accountIndex,
                tabId
            });
            onAction('subWin', {
                action: 'sendDragEvent',
                toWinId,
                payload: {
                    start, end,steps,
                    tabId: tabId
                }
            });
        } else {
            const ws = new WebviewService(row.tabId);
            await ws.sendDragEvent(start, end,steps);
        }
    }
    static clickCutArea(row: RoiInfo, tabId?: string, accountIndex?: number) {
        const {clickX,clickY} = CutAreaService.getClickPosition(row)
        
        if (tabId && accountIndex !== undefined) {
            const toWinId = WebviewMainEventService.getPlaygroundWinId({
                index: accountIndex,
                tabId
            });
            onAction('subWin', {
                action: 'sendClickEvent',
                toWinId,
                payload: {
                    x: clickX,
                    y: clickY,
                    tabId: tabId
                }
            });
        } else {
            const ws = new WebviewService(row.tabId);
            ws.sendClickEvent(clickX, clickY);
        }
    }

    static async getCutBlob(tabId: string, cutAreaRect: CutAreaRect) {
        if (tabId) {
            const ws = new WebviewService(tabId);
            const webview = ws.getWebview();
            if (webview) {
                const width = cutAreaRect.w;
                const height = cutAreaRect.h;
                const screenImage = await webview.capturePage({
                    x: cutAreaRect.x,
                    y: cutAreaRect.y,
                    width,
                    height
                });
                const image = screenImage.toDataURL();
                return await resizeImage(image, width, height);
            }
        }
        return null;
    }
}
