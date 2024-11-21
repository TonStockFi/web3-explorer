import { IndexedDbCache } from '@web3-explorer/utils';
import { urlToDataUri } from '../common/opencv';
import { CutAreaRect } from '../providers/ScreenshotProvider';

export interface RoiInfo {
    id: string;
    catId: string;
    threshold: number;
    name?: string;
    priority: number;
    pageBelongTo?: string;
    ts: number;
    page?: string;
    isTry?: boolean;
    isMark?: boolean;
    clickOffsetX?: number;
    clickOffsetY?: number;
    cutAreaRect: CutAreaRect;
    clickOnVisible?: boolean;
    clickIdOnVisible?: string;
}

export default class RoiService {
    indexedDb: IndexedDbCache;
    indexedDbImg: IndexedDbCache;
    indexedDbIds: IndexedDbCache;
    catId: string;

    constructor(catId: string) {
        this.catId = catId;
        this.indexedDb = new IndexedDbCache().init(`roi-Info/${catId}`);
        this.indexedDbImg = new IndexedDbCache().init(`roi-Img/${catId}`);
        this.indexedDbIds = new IndexedDbCache().init(`roi-Ids/${catId}`);
    }

    static async getProVersionId(catId:string): Promise<{free:number, pro:number}> {
        const indexedDb = new IndexedDbCache().init(`roi-Ids/versions`);
        return indexedDb.get(catId) || {pro:0,free:0};
    }

    static async saveProVersionId(catId: string,data:{free:number, pro:number}): Promise<void> {
        const indexedDb = new IndexedDbCache().init(`roi-Ids/versions`);
        await indexedDb.put(catId,data);
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
        let id = await this.indexedDbIds.get(this.catId);
        if (!id) {
            id = `#1`;
        } else {
            id = `#${id + 1}`;
        }
        await this.saveId(Number(id.replace('#', '')))
        return id;
    }
    async saveId(id:number) {
        await this.indexedDbIds.put(this.catId, id);
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
        this.indexedDbIds.delete(this.catId)
    }
}
