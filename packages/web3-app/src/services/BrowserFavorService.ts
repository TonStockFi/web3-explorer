import { IndexedDbCache } from '@web3-explorer/utils';

export interface BrowserFavorProps {
    id:string,
    title:string,
    folder?:string
    url:string
    ts:number
}
export default class BrowserFavorService {
    indexedDb: IndexedDbCache;
    private id: string;

    constructor(id: string) {
        this.indexedDb = BrowserFavorService.getIndexedDbCache();
        this.id = id;
    }

    static getIndexedDbCache(){
        return new IndexedDbCache().init(`browser/favor`)
    }
    static async getAll() {
        try {
            return await BrowserFavorService.getIndexedDbCache().getAll();
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

    async save(info: BrowserFavorProps) {
        await this.indexedDb.put(`${this.id}`, info);
        return info;
    }

    async remove() {
        await this.indexedDb.delete(`${this.id}`);
    }
}
