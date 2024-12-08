import { IndexedDbCache } from '@web3-explorer/utils';
import { PayCommentOrder } from '../types';

export default class PayCommentOrderService {
    indexedDb: IndexedDbCache;

    constructor() {
        this.indexedDb = new IndexedDbCache().init(`pay/orderComment`);
    }
    async getAll(): Promise<PayCommentOrder[]> {
        try {
            return await this.indexedDb.getAll() || [];
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async get(id: string): Promise<PayCommentOrder | null> {
        try {
            const res = await this.indexedDb.get(`${id}`);
            return res || null;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async save(id: string, data: PayCommentOrder) {
        await this.indexedDb.put(`${id}`, data);
        return data;
    }

    async remove(id: string) {
        await this.indexedDb.delete(`${id}`);
    }
}
