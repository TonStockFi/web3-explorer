import { IndexedDbCache } from '@web3-explorer/utils';

export interface CacheServiceProps{
    value:any
}
type IdType = "AUDIO_MUTED" | "TWA_IFRAME_URL"  | "SETTINGS"

export default class CacheService {
    indexedDb: IndexedDbCache;
    private id: string;

    constructor(id: string,key: IdType) {
        this.indexedDb = CacheService.getIndexedDbCache();
        this.id = key + "_" + id;
    }
    static getIndexedDbCache(){
        return new IndexedDbCache().init(`cache/common`)
    }
    static async getAll() {
        try {
            return await CacheService.getIndexedDbCache().getAll();
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async get():Promise<{value?:any}> {
        try {
            const res = await this.indexedDb.get(`${this.id}`);
            return res ? res : {}
        } catch (e) {
            console.error(e);
            return {};
        }
    }

    async save(info: CacheServiceProps) {
        await this.indexedDb.put(`${this.id}`, info);
        return info;
    }

    async remove() {
        await this.indexedDb.delete(`${this.id}`);
    }
}
