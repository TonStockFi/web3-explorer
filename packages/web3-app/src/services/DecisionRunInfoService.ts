import { IndexedDbCache } from '@web3-explorer/utils';
import { RoiRunInfo } from '../providers/RecognitionProvider';

export default class DecisionRunInfoService {
    indexedDb: IndexedDbCache;

    constructor(id: string) {
        this.indexedDb = DecisionRunInfoService.getIndexedDbCache(id);
    }
    static getIndexedDbCache(id: string) {
        return new IndexedDbCache().init(`decision/${id}`);
    }

    async getAll() {
        try {
            return await this.indexedDb.getAll();
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async get(index: number): Promise<RoiRunInfo | null> {
        try {
            const res = await this.indexedDb.get(`${index}`);
            return res || null;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async save(index: number, data: RoiRunInfo) {
        await this.indexedDb.put(`${index}`, data);
        return data;
    }

    async remove(index: number) {
        await this.indexedDb.delete(`${index}`);
    }

}
