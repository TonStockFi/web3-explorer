import { IndexedDbCache } from '@web3-explorer/utils';

export interface TgAuthinfo {
    hash: string;
    auth_key: string;
    user_auth: {id:string};
}

export default class TgAuthService {
    indexedDb: IndexedDbCache;

    private id: string;

    constructor(accountId: string,accountIndex:number) {
        this.indexedDb = TgAuthService.getIndexedDbCache();
        this.id = `${accountId}_${accountIndex}`
    }
    
    static getIndexedDbCache(){
        return new IndexedDbCache().init(`tg/auth`)
    }
    static async getAll() {
        try {
            return await TgAuthService.getIndexedDbCache().getAll();
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async get() {
        try {
            return await this.indexedDb.get(`${this.id}`);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async save(info: TgAuthinfo) {
        await this.indexedDb.put(`${this.id}`, info);
    }

    async remove() {
        await this.indexedDb.delete(`${this.id}`);
    }
}
