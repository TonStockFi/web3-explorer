import { IndexedDbCache } from '@web3-explorer/utils';
import { currentTs } from '../common/utils';
import { PRO_WHITE_LIST_LONG, PRO_WHITE_LIST_MONTH, PRO_WHITE_LIST_YEAR } from '../constant';
import { AccountPublic, CurrentPayPlan, ProInfoProps } from '../types';

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

    static getAccountCurrentPlan(proInfoList: ProInfoProps[], account?: AccountPublic | null) {
        if(!account){
            return null
        }
        return ProService.getCurrentPlan(proInfoList,account.id,account.index)
    }

    static getCurrentPlan(proInfoList: ProInfoProps[], id: string, index: number) {
        const pro_white_list_long = PRO_WHITE_LIST_LONG.split("|")
        const pro_white_list_month = PRO_WHITE_LIST_MONTH.split("|")
        const pro_white_list_year = PRO_WHITE_LIST_YEAR.split("|")
       
        let isLongProLevel = !!proInfoList.find(row => row.id === id && row.level === 'LONG');
        let isPayMmeber = isLongProLevel;
        let currentPlan: null | ProInfoProps = null;
        if (!isLongProLevel) {
            const res = proInfoList.find(row => row.index === index);
            if (res) {
                const { level, ts } = res;
                if (level === 'MONTH' && currentTs() > ts + 30 * 3600 * 24 * 1000) {
                    currentPlan = null;
                } else if (level === 'YEAR' && currentTs() > ts + 12 * 30 * 3600 * 24 * 1000) {
                    currentPlan = null;
                } else {
                    currentPlan = res;
                    isPayMmeber = true;
                }
            }
        }
        if(pro_white_list_long.indexOf(id) > -1){
            isLongProLevel = true;
            isPayMmeber = true;
        }

        if(pro_white_list_month.indexOf(`${id},${index}`) > -1){
            currentPlan = {
                id,
                index,
                level:"MONTH",
                amount:1.99,
                ts:currentTs()
            };
            isPayMmeber = true;
        }

        if(pro_white_list_year.indexOf(`${id},${index}`) > -1){
            currentPlan = {
                id,
                index,
                level:"YEAR",
                amount:19.99,
                ts:currentTs()
            };
            isPayMmeber = true;
        }
        return { isLongProLevel,isPayMmeber, plan:currentPlan,plans:proInfoList } as CurrentPayPlan;
    }
}
