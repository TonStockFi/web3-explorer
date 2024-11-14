import { IndexedDbCache } from '@web3-explorer/utils';
import { DeviceInfo } from '../types';

export default class DeviceService {
    indexedDb: IndexedDbCache;
    private deviceId: string;

    constructor(deviceId: string) {
        this.indexedDb = DeviceService.getIndexedDbCache();
        this.deviceId = deviceId;
    }

    static getIndexedDbCache(){
        return new IndexedDbCache().init(`device/info`)
    }
    static async getAll() {
        try {
            return await DeviceService.getIndexedDbCache().getAll();
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async get() {
        try {
            return await this.indexedDb.get(`${this.deviceId}`);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async save(info: DeviceInfo) {
        let avatar;
        const user = { ...info, avatar }
        await this.indexedDb.put(`${this.deviceId}`, user);
        return user;
    }

    async update(info: DeviceInfo) {
        await this.indexedDb.put(`${this.deviceId}`, info);
        return true;
    }

    async remove() {
        await this.indexedDb.delete(`${this.deviceId}`);
    }
}
