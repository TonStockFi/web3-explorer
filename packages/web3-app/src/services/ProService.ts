import { IndexedDbCache } from '@web3-explorer/utils';
import { ProInfoProps } from '../types';


export default class ProService {
    indexedDb: IndexedDbCache;

    constructor(id:string) {
        this.indexedDb = ProService.getIndexedDbCache(id);
    }
    static getIndexedDbCache(id:string){
        return new IndexedDbCache().init(`pro/${id}`)
    }

    async getAll() {
        try {
            return await this.indexedDb.getAll();
        } catch (e) {
            console.error(e);
            return [];
        }
    }
    
    async get(index:number):Promise<ProInfoProps| null> {
        try {
            const res = await this.indexedDb.get(`${index}`);
            return res|| null
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async save(index:number,data: ProInfoProps) {
        await this.indexedDb.put(`${index}`, data);
        return data;
    }

    async remove(index:number) {
        await this.indexedDb.delete(`${index}`);
    }
}
