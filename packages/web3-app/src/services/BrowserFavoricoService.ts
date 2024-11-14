import { IndexedDbCache } from '@web3-explorer/utils';

export interface BrowserFavoricoServiceProps{
    icon:string,
    host:string,
    favicons?:string[]
}
export default class BrowserFavoricoService {
    indexedDb: IndexedDbCache;
    private id: string;

    constructor(id: string) {
        this.indexedDb = BrowserFavoricoService.getIndexedDbCache();
        this.id = id;
    }

    static getIndexedDbCache(){
        return new IndexedDbCache().init(`browser/favorico`)
    }
    static async getAll() {
        try {
            return await BrowserFavoricoService.getIndexedDbCache().getAll();
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

    async save(info: BrowserFavoricoServiceProps) {
        await this.indexedDb.put(`${this.id}`, info);
        return info;
    }

    async remove() {
        await this.indexedDb.delete(`${this.id}`);
    }
}
