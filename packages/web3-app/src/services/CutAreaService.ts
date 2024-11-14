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

    static clickCutArea(row: RoiInfo, tabId?: string, accountIndex?: number) {
        const { start, end } = row.cutAreaRect;
        const width = Math.abs(start.x - end.x) / 2;
        const height = Math.abs(start.y - end.y) / 2;
        const x = start.x < end.x ? start.x + width : end.x + width;
        const y = start.y < end.y ? start.y + height : end.y + height;

        if (tabId && accountIndex !== undefined) {
            const toWinId = WebviewMainEventService.getPlaygroundWinId({
                index: accountIndex,
                tabId
            });
            onAction('subWin', {
                action: 'sendClickEvent',
                toWinId,
                payload: {
                    x,
                    y,
                    tabId: tabId
                }
            });
        } else {
            const ws = new WebviewService(row.catId);
            ws.sendClickEvent(x, y);
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
