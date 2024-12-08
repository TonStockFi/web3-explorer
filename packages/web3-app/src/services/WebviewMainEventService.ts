import {
    amber,
    blue,
    brown,
    cyan,
    deepOrange,
    deepPurple,
    green,
    indigo,
    lightBlue,
    lightGreen,
    lime,
    orange,
    pink,
    purple,
    red,
    teal,
    yellow
} from '@mui/material/colors';
import { BaseWindowConstructorOptions } from 'electron';
import { onAction, openWindow } from '../common/electron';
import { getDiscoverHost } from '../common/helpers';
import { currentTs, getPartitionKey } from '../common/utils';
import { DISCOVER_PID, PLAYGROUND_WIN_HEIGHT, TELEGRAME_WEB } from '../constant';
import { BrowserTab, SideWebProps } from '../providers/BrowserProvider';
import { AppEnv } from '../providers/IAppProvider';
import { AccountPublic, RoiInfo, SUB_WIN_ID } from '../types';
import LLMService, { MessageLLM } from './LLMService';

const colors = [
    indigo,
    purple,
    pink,
    amber,
    brown,
    cyan,
    deepOrange,
    deepPurple,
    green,
    lightBlue,
    blue,
    lightGreen,
    lime,
    orange,
    red,
    teal,
    yellow
];
const keys = [900, 800];

function getTopColor(index: number) {
    const i = index % colors.length;
    const c = Math.floor(index / colors.length) % keys.length;
    //@ts-ignore
    const topColor = colors[i][keys[c]];
    return topColor;
}

export default class WebviewMainEventService {
    constructor() {
        if (!window.backgroundApi) {
            throw new Error('backgroundApi API is not available');
        }
    }
    async onSelectFeature(payload:{roiInfo:RoiInfo,account:AccountPublic,tab:BrowserTab}){
        const res = await this.isWinReady(
            SUB_WIN_ID.PLAYGROUND
        );
        if (!res) {
            await this.openFeatureWindow(
                {
                    tab:payload.tab,
                    account: payload.account
                }
            );
        }
        await this.sendMessageToSubWin(
            SUB_WIN_ID.PLAYGROUND,
            'onSelectRoiArea',
            payload
        );
    }
    async openFeatureWindow(payload?:{tab:BrowserTab,account:AccountPublic}) {
        const isDev = this.getIsDev();
        const initMessage  = this.getInitMessage()
        const url = `${getDiscoverHost(isDev)}&initMessage=${initMessage}#${SUB_WIN_ID.PLAYGROUND}`;
        const width = 910;
        const height = 500;
        const x = 100;
        const y = 100 ;
        await this.openWindow(
            SUB_WIN_ID.PLAYGROUND,
            url,
            {
                x,
                y,
                width,
                height,
                minWidth: width,
                minHeight: 200,
                titleBarStyle: 'hiddenInset',
                titleBarOverlay: false,
                trafficLightPosition: { x: 18, y: 14 },
                frame: false,
                autoHideMenuBar: true,
                webPreferences: {
                    partition: getPartitionKey(DISCOVER_PID)
                }
            },
            isDev
        );
        const res = await this.waitForIsWinReady(SUB_WIN_ID.PLAYGROUND);
        if (res && payload) {
            await this.sendMessageToSubWin(SUB_WIN_ID.PLAYGROUND, "onOpenFeatureView", payload || {});
        }
    }

    getIsDev(){
        const uri = new URL(location.href)
        return !!uri.searchParams.get('isDev');
    }

    getInitMessage(){
        const uri = new URL(location.href)
        return uri.searchParams.get('initMessage');
    }

    async openOcrWindow(sideWeb?: SideWebProps) {
        const isDev = this.getIsDev();
        const winId = SUB_WIN_ID.OCR
        const url = `${getDiscoverHost(isDev)}#${winId}`;
        const width = 386;
        const height = 860;
        const x = window.screen.width - width - 12;
        const y = 12;
        
        await this.openWindow(
            winId,
            url,
            {
                x,
                y,
                width,
                minWidth: width,
                height: height,
                minHeight: height,
                titleBarStyle: 'hiddenInset',
                titleBarOverlay: false,
                trafficLightPosition: { x: 18, y: 14 },
                frame: false,
                autoHideMenuBar: true,
                webPreferences: {
                    partition: getPartitionKey(DISCOVER_PID)
                }
            },
            true
        );
        await this.waitForIsWinReady(winId);
        if(sideWeb){
            await this.sendMessageToSubWin(
                winId,
                'openSideWeb',
                sideWeb
                    ? sideWeb
                    : {
                          site: 'GEMINI'
                      }
            );
        }
      
    }
    async openLLMWindow(sideWeb?: SideWebProps,message?:Partial<MessageLLM>) {

        const uri = new URL(location.href)
        const isDev = !!uri.searchParams.get('isDev');
        
        const url = `${getDiscoverHost(isDev)}#${SUB_WIN_ID.LLM}`;
        const width = 420;
        const height = 860;
        const x = window.screen.width - width - 12;
        const y = 12;
        
        await this.openWindow(
            SUB_WIN_ID.LLM,
            url,
            {
                x,
                y,
                width,
                minWidth: width,
                height: height,
                minHeight: height,
                titleBarStyle: 'hiddenInset',
                titleBarOverlay: false,
                trafficLightPosition: { x: 18, y: 14 },
                frame: false,
                autoHideMenuBar: true,
                webPreferences: {
                    partition: getPartitionKey(DISCOVER_PID)
                }
            },
            true
        );
        await this.waitForIsWinReady(SUB_WIN_ID.LLM);
        if(sideWeb || message){
            let sideWeb1 = {
                site: 'ChatGpt',
                ...sideWeb,
            }
            if(message){
                let id = message.id || LLMService.genId()
                let prompt = message.prompt || "";
                if(!prompt){
                    return;
                }
                sideWeb1.message = {
                    ...message,
                    prompt,
                    id,ts:currentTs()
                }
            }
            await this.sendMessageToSubWin(
                SUB_WIN_ID.LLM,
                'openSideWeb',
                sideWeb1
            );
        }
        
    }
    static getPlaygroundWinId({ index, tabId }: { index: number; tabId: string }) {
        const winId = 'PLAYGROUND_' + index + '_' + encodeURIComponent(tabId);
        return winId;
    }
    static getPlaygroundWindowProps({
        isDev,
        index,
        tabId,
        initMessage,
        resizable
    }: {
        initMessage:string;
        isDev: boolean;
        index: number;
        resizable?:boolean;
        tabId: string;
    }) {
        const topColor = getTopColor(index);

        let height = PLAYGROUND_WIN_HEIGHT;
        let resizable_ = true;
        const minWidth = 368;
        let y = 12;
        const winId = WebviewMainEventService.getPlaygroundWinId({ index, tabId });

        const playgroundUrl = `${getDiscoverHost(isDev)}&winId=${winId}&initMessage=${initMessage}&topColor=${encodeURIComponent(
            topColor
        )}#${winId}`;
        let width = minWidth;
        let x = window.screen.width - width - 12;

        return {
            winId,
            playgroundUrl,
            options: {
                width: width,
                minWidth,
                minHeight: height,
                resizable:resizable_,
                height: height,
                x,
                y,
                titleBarStyle: 'hiddenInset',
                titleBarOverlay: false,
                trafficLightPosition: { x: 18, y: 14 },
                frame: false,
                autoHideMenuBar: true,
                webPreferences: {
                    partition: getPartitionKey(DISCOVER_PID)
                }
            } as BaseWindowConstructorOptions
        };
    }
    async closeWindow(winId: SUB_WIN_ID | string) {
        return onAction('closeWin', {
            winId
        });
    }
    async closePlaygroundWindow({ index ,tabId}: {index:number,tabId:string}) {
        const winId = WebviewMainEventService.getPlaygroundWinId({index,tabId})
        const r = await this.isWinReady(winId);
        console.log({ winId }, r);
        await this.closeWindow(winId);
    }

    async makeWindowToTopRight(index: number,tabId:string) {
        const winId = WebviewMainEventService.getPlaygroundWinId({index,tabId})
        let width = 368;
        let x = window.screen.width - width - 12;

        onAction('setBounds', {
            winId,
            bounds: {
                width,
                y: 12,
                x
            },
            animate: true
        });
    }
    async openTelegramWindow(account: AccountPublic){
        const url = TELEGRAME_WEB
        const uri = new URL(url)
        const tabId = uri.hostname.replace(/\./g,"_")
        const tab:BrowserTab = {
            tabId,
            ts: currentTs(),
            url,
            ts1: 0
        }
        const isDev = this.getIsDev();

        const initMessage = Buffer.from(JSON.stringify({
            account,tab
        })).toString("hex")
        
        const { options, winId, playgroundUrl } = WebviewMainEventService.getPlaygroundWindowProps({
            index:account.index,
            isDev,
            tabId: tab.tabId,
            initMessage,
            resizable:!tab.twa
        });

        await this.openWindow(winId, playgroundUrl, options, isDev);
        
    }
    async openPlaygroundWindow(
        tab: BrowserTab,
        account: AccountPublic,
        env: AppEnv
    ) {
        const { index } = account;
        const { isDev } = env;

        const initMessage = Buffer.from(JSON.stringify({
            account,tab
        })).toString("hex")

        const { options, winId, playgroundUrl } = WebviewMainEventService.getPlaygroundWindowProps({
            index,
            isDev,
            tabId: tab.tabId,
            initMessage,
            resizable:!tab.twa
        });

        await this.openWindow(winId, playgroundUrl, options, isDev);
       
    }
    async openWindow(
        winId: SUB_WIN_ID | string,
        url: string,
        options?: any,
        openDevTools?: boolean
    ) {
        await openWindow({
            url,
            openDevTools,
            winId,
            windowOptions: options
        });
    }
    async isWinReady(winId: SUB_WIN_ID | string) {
        return onAction('isWinReady', { winId });
    }

    async isWinOpen(winId: SUB_WIN_ID | string) {
        return onAction('isWinOpen', { winId });
    }

    async sendMessageToSubWin(
        toWinId: SUB_WIN_ID | string,
        action: string,
        payload?: any,
        fromWinId?: SUB_WIN_ID
    ) {
        return onAction('subWin', {
            toWinId,
            action,
            payload: payload || {},
            fromWinId
        });
    }
    async waitForIsWinReady(
        winId: SUB_WIN_ID | string,
        timeout: number = 0,
        interval: number = 100
    ) {
        const startTime = Date.now();

        return new Promise((resolve, reject) => {
            const checkWinReady = async () => {
                const isReady = await this.isWinReady(winId);
                console.debug({isReady},winId)
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

    async notifyWindowAction({
        action,
        payload,
        accounts,
        tabId,
        currentAccount
    }: {
        accounts: AccountPublic[];
        currentAccount: null | AccountPublic;
        action: string;
        payload: any;
        tabId: string;
    }) {
        if (!currentAccount) return;
        let rows = [];
        for (let i = 0; i < accounts.length; i++) {
            const { index } = accounts[i];

            const winId = WebviewMainEventService.getPlaygroundWinId({ index, tabId });
            const res = await this.isWinOpen(winId);
            if (res) {
                rows.push(index);
            }
        }
        rows.forEach(index => {
            const winId = WebviewMainEventService.getPlaygroundWinId({ index, tabId });
            onAction('subWin', {
                toWinId: winId,
                action,
                payload
            });
        });
    }
    async getWindowStatus(accounts: AccountPublic[],tabId:string) {
        let rows = new Map();
        for (let i = 0; i < accounts.length; i++) {
            const { index } = accounts[i];
            const winId = WebviewMainEventService.getPlaygroundWinId({
                index,tabId
            })
            const res = await this.isWinOpen(winId);
            rows.set(index, res);
        }
        return rows;
    }
}
