import { bool } from '@web3-explorer/opencv/dist/types/opencv';
import { IndexedDbCache } from '@web3-explorer/utils';
import { urlToDataUri } from '../common/opencv';
import { ENTRY_ID_ROI, START_ID_ROI, TASK_ID_ROI } from '../constant';
import { ExtenssionPublishData, RoiInfo } from '../types';


export default class RoiService {
    indexedDb: IndexedDbCache;
    indexedDbImg: IndexedDbCache;
    indexedDbIds: IndexedDbCache;
    indexedDbExt: IndexedDbCache;
    tabId: string;

    constructor(tabId: string) {
        this.tabId = tabId;
        this.indexedDb = new IndexedDbCache().init(`roi-Info/${tabId}`);
        this.indexedDbImg = new IndexedDbCache().init(`roi-Img/${tabId}`);
        this.indexedDbIds = new IndexedDbCache().init(`roi-Ids/${tabId}`);
        this.indexedDbExt = new IndexedDbCache().init(`roi-ext/${tabId}`);
    }
    
    getExtenssion(eId: any) {
        return this.indexedDbExt.get(eId)
    }

    saveExtenssion(eId: any,ext:ExtenssionPublishData) {
        return this.indexedDbExt.put(eId,ext)
    }
    
    async getImage(id: string): Promise<string> {
        return await this.indexedDbImg.get(id);
    }
    async updateImage(id: string, data: string) {
        return await this.indexedDbImg.put(id, data);
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
        let id = await this.indexedDbIds.get(this.tabId);
        if (!id) {
            id = START_ID_ROI;
        } else {
            id = `#${id + 1}`;
        }
        await this.saveId(Number(id.replace('#', '')))
        return id;
    }
    async saveId(id:number) {
        await this.indexedDbIds.put(this.tabId, id);
        return id;
    }
    
    async update(info: RoiInfo) {
        await this.indexedDb.put(`${info.id}`, info);
        return true;
    }

    async get(id: string) {
        return this.indexedDb.get(`${id}`);
    }

    async save(id: string, info: RoiInfo, imageUrl?: string, isDataUrl?: boolean) {
        await this.indexedDb.put(`${id}`, info);
        if(imageUrl){
            const dataUrl = isDataUrl ? imageUrl : await urlToDataUri(imageUrl);
            await this.indexedDbImg.put(`${id}`, dataUrl);
        }
        return true;
    }

    async remove(id: string) {
        await this.indexedDb.delete(id);
        await this.indexedDbImg.delete(id);

    }
    async emptyDb() {
        const rows  = await this.indexedDb.getAll();
        for (let index = 0; index < rows.length; index++) {
            const {id} = rows[index];
            await this.remove(id)
        }
        this.indexedDbIds.delete(this.tabId)
    }
    
    
    static hasActionOrIsRecoFeature(row: RoiInfo): bool {
        return Boolean(row.action) || row.type === "reco"
    }
    static hasAction(row: RoiInfo): bool {
        return Boolean(row.action) 
    }
    
    static isRecoFeature(row: RoiInfo): bool {
        return row.type === "reco"
    }
    
    static isNotMarkFeature(row: RoiInfo): bool {
        return row.type !== "mark"
    }

    static getEntryId(): string {
        return ENTRY_ID_ROI
    }
    
    static isTask(row: RoiInfo): bool {
        return row.pid === TASK_ID_ROI
    }
    static isRunTask(row: RoiInfo): bool {
        return  row.jsCode !== '' && row.pid === TASK_ID_ROI && row.action === 'invokeCode'
    }
    static isEntryElement(row: RoiInfo): bool {
        return row.pid === RoiService.getEntryId()
    }

    static getEntryRunElements(rows?: RoiInfo[]):  RoiInfo[]{
        return rows ? rows.filter(row=>RoiService.isRecoFeature(row) && RoiService.isEntryElement(row)):[]
    }

    static getEntryElements(rows?: RoiInfo[]):  RoiInfo[]{
        return rows ? rows.filter(row=>RoiService.isEntryElement(row)):[]
    }

    static getNotEntryElements(rows?: RoiInfo[]):  RoiInfo[]{
        return rows ? rows.filter(row=>!RoiService.isEntryElement(row)):[]
    }

    static getFinishLoopElements(rows?: RoiInfo[]):  RoiInfo[]{
        return rows ? rows.filter(row=>row.action === 'finishLoop'):[]
    }
}
