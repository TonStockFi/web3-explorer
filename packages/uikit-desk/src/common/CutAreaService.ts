import { Html5Cache, IndexedDbCache } from '@web3-explorer/utils';
import { urlToBlob } from './opencv';

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
}
