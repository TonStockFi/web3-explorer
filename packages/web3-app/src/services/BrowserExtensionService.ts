import { IndexedDbCache } from '@web3-explorer/utils';
import { BrowserExtensionInfo } from '..';

export default class BrowserExtensionService {
    indexedDb: IndexedDbCache;
    indexedDbIds: IndexedDbCache;

    constructor() {
        this.indexedDb = new IndexedDbCache().init(`ext/Info`);
        this.indexedDbIds = new IndexedDbCache().init(`ext/Ids`);
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
        let id = await this.indexedDbIds.get("id");
        if (!id) {
            id = "#1";
        } else {
            id = `#${id + 1}`;
        }
        await this.saveId(Number(id.replace('#', '')))
        return id;
    }
    async saveId(id:number) {
        await this.indexedDbIds.put("id", id);
        return id;
    }
    
    async update(info: BrowserExtensionInfo) {
        await this.indexedDb.put(`${info.id}`, info);
        return true;
    }

    async get(id: string) {
        return this.indexedDb.get(`${id}`);
    }

    async save(id: string, info: BrowserExtensionInfo) {
        await this.indexedDb.put(`${id}`, info);
        return true;
    }

    async remove(id: string) {
        await this.indexedDb.delete(id);
    }
}
