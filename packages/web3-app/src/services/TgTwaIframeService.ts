import { IndexedDbCache } from '@web3-explorer/utils';
import { AccountPublic } from '../types';


export default class TgTwaIframeService {
    indexedDb: IndexedDbCache;
    private id: string;

    constructor(account: AccountPublic,tabId:string) {
        this.indexedDb = TgTwaIframeService.getIndexedDbCache();
        const id = `${account.id}_${account.index}_${tabId}`
        this.id = id
    }
    static getIndexedDbCache(){
        return new IndexedDbCache().init(`tg/iframe`)
    }
    
    async get():Promise<string> {
        try {
            const res = await this.indexedDb.get(`${this.id}`);
            return res ? res : ""
        } catch (e) {
            console.error(e);
            return "";
        }
    }

    async save(url: string) {
        await this.indexedDb.put(`${this.id}`, url);
        return url;
    }

    async remove() {
        await this.indexedDb.delete(`${this.id}`);
    }
    
    async enableIframe(enable:boolean) {
        await this.indexedDb.put(`${this.id}_enable`, enable);
    }

    async isEnableIframe() {
        const res = await this.indexedDb.get(`${this.id}_enable`);
        return res;
    }
}
