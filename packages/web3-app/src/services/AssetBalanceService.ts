import { IndexedDbCache } from '@web3-explorer/utils';
import { AccountAssetBalance } from '../types';

export default class AssetBalanceService {
    indexedDb: IndexedDbCache;

    constructor(id: string,isMain:boolean) {
        this.indexedDb = AssetBalanceService.getIndexedDbCache(id,isMain);
    }
    static getIndexedDbCache(id: string,isMain:boolean) {
        return new IndexedDbCache().init(`asset/${id}_${isMain?1:0}`);
    }

    async getAll() {
        try {
            return await this.indexedDb.getAll();
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async get(index: number): Promise<{}> {
        try {
            const res = await this.indexedDb.get(`${index}`);
            return res || [];
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async save(index: number, data:AccountAssetBalance) {
        await this.indexedDb.put(`${index}`, data);
        return data;
    }

    async remove(index: number) {
        await this.indexedDb.delete(`${index}`);
    }
}
