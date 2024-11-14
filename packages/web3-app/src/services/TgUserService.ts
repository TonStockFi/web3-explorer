import { Html5Cache, IndexedDbCache } from '@web3-explorer/utils';

export interface UserInfo {
    avatar?: string;
    index:number,
    walletAccountId?:string;
    partitionId: string;
    userId: string;
    firstName: string;
    phoneNumber: string;
}

function dataURIToBlob(dataURI: string): Blob {
    // Split the Data URL into its components
    const [header, base64Data] = dataURI.split(',');
    const contentType = header.match(/:(.*?);/)?.[1] || ''; // Extract the content type

    // Decode the Base64 string into binary data
    const byteCharacters = atob(base64Data);
    const byteArrays: Uint8Array[] = [];

    const sliceSize = 512; // Size of each slice

    // Convert the binary string into an array of bytes
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    // Create the Blob object
    return new Blob(byteArrays, { type: contentType });
}

export default class TgUserService {
    indexedDb: IndexedDbCache;
    private html5Cache: Html5Cache;
    private userId: string;

    constructor(userId: string) {
        this.indexedDb = TgUserService.getIndexedDbCache();
        this.html5Cache = new Html5Cache().init(`tgUser`);
        this.userId = userId;
    }

    async getAvatar(): Promise<any> {
        const res = await this.html5Cache.get(`avatar/${this.userId}`);
        if (!res) return null;
        const blob = await res!.blob();
        return blob ? URL.createObjectURL(blob) : null;
    }
    static getIndexedDbCache(){
        return new IndexedDbCache().init(`tgUser/info`)
    }
    static async getAll() {
        try {
            return await TgUserService.getIndexedDbCache().getAll();
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async get() {
        try {
            return await this.indexedDb.get(`${this.userId}`);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async save(info: UserInfo, imageBase64Data?: string) {
        let avatar;
        if (imageBase64Data) {
            const blob = dataURIToBlob(imageBase64Data);
            avatar = this.userId;
            await this.html5Cache.put(`avatar/${this.userId}`, blob);
        }
        const user = { ...info, avatar }
        await this.indexedDb.put(`${this.userId}`, user);
        return user;
    }

    async update(info: UserInfo) {
        await this.indexedDb.put(`${this.userId}`, info);
        return true;
    }

    async remove() {
        await this.indexedDb.delete(`${this.userId}`);
    }
}
