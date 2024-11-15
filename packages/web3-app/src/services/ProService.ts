import { IndexedDbCache } from '@web3-explorer/utils';
import { currentTs } from '../common/utils';
import { CurrentPayPlan, ProInfoProps } from '../types';

export default class ProService {
    indexedDb: IndexedDbCache;

    constructor(id: string) {
        this.indexedDb = ProService.getIndexedDbCache(id);
    }
    static getIndexedDbCache(id: string) {
        return new IndexedDbCache().init(`pro/${id}`);
    }

    async getAll() {
        try {
            return await this.indexedDb.getAll();
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async get(index: number): Promise<ProInfoProps | null> {
        try {
            const res = await this.indexedDb.get(`${index}`);
            return res || null;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async save(index: number, data: ProInfoProps) {
        await this.indexedDb.put(`${index}`, data);
        return data;
    }

    async remove(index: number) {
        await this.indexedDb.delete(`${index}`);
    }

    static getCurrentPlan(proInfoList: ProInfoProps[], id: string, index: number) {
        const isLoginProLevel = !!proInfoList.find(row => row.id === id && row.level === 'LONG');
        let currentPlan: null | ProInfoProps = null;
        if (!isLoginProLevel) {
            const res = proInfoList.find(row => row.index === index);
            if (res) {
                const { level, ts } = res;
                if (level === 'MONTH' && currentTs() > ts + 30 * 3600 * 24 * 1000) {
                    currentPlan = null;
                } else if (level === 'YEAR' && currentTs() > ts + 12 * 30 * 3600 * 24 * 1000) {
                    currentPlan = null;
                } else {
                    currentPlan = res;
                }
            }
        }
        return { isLoginProLevel, plan:currentPlan,plans:proInfoList } as CurrentPayPlan;
    }
}
