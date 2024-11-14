import { IndexedDbCache } from '@web3-explorer/utils';

export interface BrowserHistoryProps{
    url:string,
    ts:number,
    title:string,
    desc?:string,
    id:string,
}
export default class BrowserHistoryService {
    indexedDb: IndexedDbCache;
    private id: string;

    constructor(id: string) {
        this.indexedDb = BrowserHistoryService.getIndexedDbCache();
        this.id = id;
    }

    static getIndexedDbCache(){
        return new IndexedDbCache().init(`browser/history`)
    }
    static async getAll() {
        try {
            return await BrowserHistoryService.getIndexedDbCache().getAll();
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

    async save(info: BrowserHistoryProps) {
        await this.indexedDb.put(`${this.id}`, info);
        return info;
    }

    async remove() {
        await this.indexedDb.delete(`${this.id}`);
    }
}
