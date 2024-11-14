import { IndexedDbCache } from '@web3-explorer/utils';


export default class WebviewMuteService {
    indexedDb: IndexedDbCache;
    private id: string;

    constructor(url:string,index:number) {
        this.indexedDb = WebviewMuteService.getIndexedDbCache();
        const uri = new URL(url)
        const id = `${uri.host}_${index}`
        this.id = id
    }
    static getIndexedDbCache(){
        return new IndexedDbCache().init(`tg/iframe`)
    }
    
    async get():Promise<boolean> {
        try {
            const res = await this.indexedDb.get(`${this.id}`);
            return res ? res : false
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async save(mute: boolean) {
        await this.indexedDb.put(`${this.id}`, mute);
        return mute;
    }

    async remove() {
        await this.indexedDb.delete(`${this.id}`);
    }
}
