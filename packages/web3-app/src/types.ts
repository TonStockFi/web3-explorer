import {WebviewTag} from "electron";

export enum MAIN_NAV_TYPE {
    MOBILE_MONITORS = 'MOBILE_MONITORS',
    DISCOVERY = 'DISCOVERY',
    SETTING = 'SETTING',
    GAME_FI = 'GAME_FI',
    WALLET = 'WALLET',
    DEV = 'DEV'
}

export interface SiteInfo {
    partitionId: string;
    deviceId: string;
    url: string;
    order: number;
}

export interface AppOptions {
    options: {
        mainNavType?: MAIN_NAV_TYPE;
        setMainNavType: (v:MAIN_NAV_TYPE)=>void;
        windowSize?: {
            width: number;
            height: number;
        };
    };
}

export interface WebviewProps {
    onSiteMessage?: (
        message: { action: string; payload?: Record<string, any> },
        webview: WebviewTag
    ) => Promise<void>;
    onReady?: (webview: WebviewTag) => Promise<void>;
    insertCss?: string;
    insertJs?: string;
}
