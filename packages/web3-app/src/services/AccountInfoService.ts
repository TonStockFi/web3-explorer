import { IndexedDbCache } from '@web3-explorer/utils';
import { AccountPublic } from '../types';

export default class AccountInfoService {
    indexedDb: IndexedDbCache;

    constructor(id: string) {
        this.indexedDb = AccountInfoService.getIndexedDbCache(id);
    }
    static getIndexedDbCache(id: string) {
        return new IndexedDbCache().init(`asset/${id}`);
    }

    async getAll() {
        try {
            return await this.indexedDb.getAll();
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async get(index: number): Promise<AccountPublic|null> {
        try {
            const res = await this.indexedDb.get(`${index}`);
            return res || null;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async save(index: number, data:AccountPublic) {
        await this.indexedDb.put(`${index}`, data);
        return data;
    }

    async remove(index: number) {
        await this.indexedDb.delete(`${index}`);
    }
}
