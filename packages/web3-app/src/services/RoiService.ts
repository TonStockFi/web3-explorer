import { IndexedDbCache } from '@web3-explorer/utils';
import { urlToDataUri } from '../common/opencv';
import { CutAreaRect } from '../providers/ScreenshotProvider';

export interface RoiInfo {
    id: string;
    tabId: string;
    threshold: number;
    name?: string;
    priority: number;
    pageBelongTo?: string;
    ts: number;
    page?: string;
    ocrPrompt?:string;
    ocrReplyFormat?:string;
    jsCode?:string;
    testJsCode?:string;
    isTry?: boolean;
    isMark?: boolean;
    action?:"click" | "callOcr" | "invokeCode" | string;
    mergeArea?: boolean;
    isOcr?: boolean;
    cutAreaRect: CutAreaRect;
    ocrId?: string;
}

export default class RoiService {
    indexedDb: IndexedDbCache;
    indexedDbImg: IndexedDbCache;
    indexedDbIds: IndexedDbCache;
    tabId: string;

    constructor(tabId: string) {
        this.tabId = tabId;
        this.indexedDb = new IndexedDbCache().init(`roi-Info/${tabId}`);
        this.indexedDbImg = new IndexedDbCache().init(`roi-Img/${tabId}`);
        this.indexedDbIds = new IndexedDbCache().init(`roi-Ids/${tabId}`);
    }
    

    async getImage(id: string): Promise<string> {
        return await this.indexedDbImg.get(id);
    }
    async updateImage(id: string, data: string) {
        return await this.indexedDbImg.put(id, data);
    }

    async getAll() {
        try {
            return await this.indexedDb.getAll();
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async getId() {
        let id = await this.indexedDbIds.get(this.tabId);
        if (!id) {
            id = `#1`;
        } else {
            id = `#${id + 1}`;
        }
        await this.saveId(Number(id.replace('#', '')))
        return id;
    }
    async saveId(id:number) {
        await this.indexedDbIds.put(this.tabId, id);
        return id;
    }
    
    async update(info: RoiInfo) {
        await this.indexedDb.put(`${info.id}`, info);
        return true;
    }

    async save(id: string, info: RoiInfo, imageUrl: string, isDataUrl?: boolean) {
        await this.indexedDb.put(`${id}`, info);
        const dataUrl = isDataUrl ? imageUrl : await urlToDataUri(imageUrl);
        await this.indexedDbImg.put(`${id}`, dataUrl);
        return true;
    }

    async remove(id: string) {
        await this.indexedDb.delete(id);
        await this.indexedDbImg.delete(id);

    }
    async emptyDb() {
        const rows  = await this.indexedDb.getAll();
        for (let index = 0; index < rows.length; index++) {
            const {id} = rows[index];
            await this.remove(id)
        }
        this.indexedDbIds.delete(this.tabId)
    }
}
