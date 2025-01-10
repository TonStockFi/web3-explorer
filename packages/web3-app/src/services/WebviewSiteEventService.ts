import { InitConfig, SUB_WIN_ID } from '../types';

export default class WebviewSiteEventService {
    constructor() {
        if (!window.__appApi) {
            throw new Error('Application API is not available');
        }
    }
    async sendAction(action:string,payload?:any){
        await window.__appApi.message({
            action,
            payload:payload||{}
        });
    }
    async onOpenWindow(
        winId: SUB_WIN_ID | string,
        url: string,
        options?: any,
        openDevTools?: boolean
    ) {
        return window.__appApi.message({
            action: 'openWindow',
            payload: {
                url,
                winId,
                openDevTools,
                windowOptions: {
                    width: 820,
                    height: 800,
                    ...options
                }
            }
        });
    }
    async isWinReady(winId: SUB_WIN_ID | string) {
        return window.__appApi.message({
            action: 'isWinReady',
            payload: {
                winId
            }
        });
    }
    
    async sendMessageToSubWin(toWinId: string, action: string, payload?: any) {
        return window.__appApi.message({
            action: 'subWin',
            payload: {
                toWinId,
                action,
                payload: payload || {}
            }
        });
    }
    async waitForIsWinReady(
        winId: SUB_WIN_ID | string,
        timeout: number = 0,
        interval: number = 200
    ) {
        const startTime = Date.now();
        return new Promise((resolve, reject) => {
            const checkWinReady = async () => {
                const isReady = await this.isWinReady(winId);
                if (isReady) {
                    resolve(true); // Resolve the promise if the window is ready
                } else if (timeout > 0 && Date.now() - startTime >= timeout) {
                    reject(new Error(`Timeout: Window ${winId} is not ready after ${timeout}ms`)); // Reject after timeout
                } else {
                    setTimeout(checkWinReady, interval); // Check again after the interval
                }
            };

            checkWinReady();
        });
    }
    initConfig(config:InitConfig){
        return window.__appApi.message({
            action: 'initConfig',
            payload: {
                ...config
            }
        });
    }
}
