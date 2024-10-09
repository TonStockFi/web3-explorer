import { SERVER_URL } from '../constant';

import {md5} from '@web3-explorer/lib-crypto/dist/utils';

export default class ServerApi {
    static url(path: string): any {
        return `${ServerApi.getServerApi()}/${path}`;
    }

    static getServerApi(): any {
        return localStorage.getItem('client-serverApi') || SERVER_URL;
    }

    static useWs(): any {
        return ServerApi.getServerApi().startsWith('ws');
    }

    static setServerApi(api: string): any {
        localStorage.setItem('client-serverApi', api);
    }

    static getPassword(hash?: boolean): any {
        const password = localStorage.getItem('client-password') || '';
        if (hash && password) {
            return md5(password);
        }
        return password;
    }

    static getDeviceId() {
        return localStorage.getItem('client-deviceId') || '';
    }
}
