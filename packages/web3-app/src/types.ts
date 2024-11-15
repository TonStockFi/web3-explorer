import { WebviewTag } from 'electron';

export type VoidFun = Promise<void> | void;

export enum MAIN_NAV_TYPE {
    FAVOR = 'FAVOR',
    MARKET = 'tab_Market',
    ACCOUNTS_MANAGE = 'ACCOUNTS_MANAGE',
    MOBILE_MONITORS = 'MOBILE_MONITORS',
    DISCOVERY = 'DISCOVERY',
    BROWSER_HISTORY = 'BROWSER_HISTORY',
    CONNECTED_APPS = 'CONNECTED_APPS',
    MULTI_SEND = 'MULTI_SEND',
    DASHBOARD = 'DASHBOARD',
    SETTING = 'SETTING',
    GAME_FI = 'tab_GAME_FI',
    CHATGPT = 'tab_CHATGPT',
    GENIMI = 'tab_GEMINI',
    WALLET = 'WALLET',
    DEV = 'DEV',
    SWAP = 'SWAP',
    NULL = 'NULL'
}

export interface SiteInfo {
    partitionId: string;
    deviceId: string;
    url: string;
    order: number;
}

export interface AppOptions {
    IS_DEV?: boolean;
    options: {
        mainNavType?: MAIN_NAV_TYPE;
        setMainNavType: (v: MAIN_NAV_TYPE) => void;
        windowSize?: {
            width: number;
            height: number;
        };
    };
}

export interface ContextMenuProps {
    webContentsId: number;
    params: {
        x: number;
        y: number;
        selectionText: string;
        selectionRect: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    };
}
export type WebveiwEventType =
    | 'new-window'
    | 'context-menu'
    | 'found-in-page'
    | 'did-start-navigation'
    | 'load-commit'
    | 'did-start-loading'
    | 'did-stop-loading'
    | 'will-navigate'
    | 'did-frame-finish-load'
    | 'did-fail-load'
    | 'did-finish-load'
    | 'dom-ready'
    | 'page-title-updated'
    | 'page-favicon-updated'
    | 'enter-html-full-screen'
    | 'leave-html-full-screen'
    | 'close'
    | 'destroyed';

export interface WebviewProps {
    httpReferrer?: string;
    onLoading?: (loading: boolean) => void;
    onStopLoading?: () => void;
    onError?: (error: {}) => void;
    onContextMenu?: (e: {params:any,webContentsId:number,tabId:string}) => void;
    onErrorReset?: () => void;
    onSiteMessage?: (
        message: { action: string; payload?: Record<string, any> },
        webview: WebviewTag
    ) => Promise<void>;
    onReady?: (webview: WebviewTag) => Promise<void> | void;
    onEvent?: (
        webview: WebviewTag,
        eventType: WebveiwEventType,
        paylaod: any,
        webContentsId: number
    ) => Promise<void>;
    insertCss?: string;
    insertJs?: string;
}

export interface GameDetail {
    id: string;
    icon: string;
    name: string;
    url: string;
    iframeBaseUrl: string;
    description: string;
    iframeUrl?: string;
}
export interface GameProps {
    detail: GameDetail;
    ts?: number;
    ts1?: number;
    account: {
        id: string;
        address: string;
        name: string;
        emoji: string;
        index: number;
    };
}
export interface BoundingClientRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

export enum SUB_WIN_ID {
    DEVICES = 'DEVICES',
    ASSETS = 'ASSETS',
    PLAYGROUND = 'PLAYGROUND',
    LLM = 'LLM',
    OPENCV = 'OPENCV',
    MAIN = 'MAIN'
}

export interface AccountPublic {
    isMam?:boolean,
    isActive?:boolean,
    isHide?:boolean,
    address: string;
    name: string;
    index: number;
    emoji: string;
    id: string;
}

export interface CustomDeviceWsServerHosts {
    host: string;
}

export enum GLOBAL_ACTIONS {
    GLOBAL_ACTION_BACK = 1,
    GLOBAL_ACTION_HOME = 2,
    GLOBAL_ACTION_RECENTS = 3,
    GLOBAL_ACTION_NOTIFICATIONS = 4,
    GLOBAL_ACTION_QUICK_SETTINGS = 5,
    GLOBAL_ACTION_POWER_DIALOG = 6,
    GLOBAL_ACTION_TOGGLE_SPLIT_SCREEN = 7,
    GLOBAL_ACTION_LOCK_SCREEN = 8,
    GLOBAL_ACTION_KEYCODE_HEADSETHOOK = 10,
    GLOBAL_ACTION_ACCESSIBILITY_ALL_APPS = 14,
    GLOBAL_ACTION_DPAD_CENTER = 20
}

export const GLOBAL_ACTIONS_MAP = {
    1: 'GLOBAL_ACTION_BACK',
    2: 'GLOBAL_ACTION_HOME',
    3: 'GLOBAL_ACTION_RECENTS',
    4: 'GLOBAL_ACTION_NOTIFICATIONS',
    5: 'GLOBAL_ACTION_QUICK_SETTINGS',
    6: 'GLOBAL_ACTION_POWER_DIALOG',
    7: 'GLOBAL_ACTION_TOGGLE_SPLIT_SCREEN',
    8: 'GLOBAL_ACTION_LOCK_SCREEN',
    10: 'GLOBAL_ACTION_KEYCODE_HEADSETHOOK',
    14: 'GLOBAL_ACTION_ACCESSIBILITY_ALL_APPS',
    20: 'GLOBAL_ACTION_DPAD_CENTER'
};

export interface DeviceInfo {
    deviceId: string;
    password?: string;
    passwordHash?: string;
    serverApi?: string;
    inputIsOpen?: boolean;
    mediaIsStart?: boolean;
    compressQuality?: number;
    delayPullEventMs?: number;
    delaySendImageDataMs?: number;
    screen?: {
        height: number;
        width: number;
        scale: number;
        dpi: number;
    };
}

export enum SWIPER_KIND {
    SWIPER_KIND_UP_DOWN = 10,
    SWIPER_KIND_UP_DOWN_SLOW = 11,
    SWIPER_KIND_LEFT_RIGHT = 20,
    SWIPER_KIND_LEFT_RIGHT_SLOW = 21
}

export enum WsCloseCode {
    //@delete
    CLOSE_AND_DESTROY = 1001,
    //@delete
    CLOSE_AND_RECONNECT = 1002,

    WS_CLOSE_STOP_RECONNECT = 3001,
    WS_CLOSE_RECONNECT = 3002
}

export enum ErrCodes {
    DEVICE_NOT_EXISTS = 'DEVICE_NOT_EXISTS',
    PASSWORD_NOT_VALID = 'PASSWORD_NOT_VALID',
    SCREEN_IMAGE_NOT_EXISTS = 'SCREEN_IMAGE_NOT_EXISTS',
    SCREEN_IMAGE_NOT_UPDATE = 'SCREEN_IMAGE_NOT_UPDATE',
    EVENT_NOT_UPDATE = 'EVENT_NOT_UPDATE'
}

export type sendMessageParams = {
    eventType:
        | 'action'
        | 'click'
        | 'swiper'
        | 'dragStart'
        | 'dragMove'
        | 'dragEnd'
        | 'delayPullEventMs'
        | 'delaySendImageDataMs'
        | string;
    x?: number;
    y?: number;
    value?: GLOBAL_ACTIONS | SWIPER_KIND | number;
    delta?: number;
    text?: string;
};

export type ScreenInfo = {
    width: number;
    height: number;
    dpi: number;
    scale: number;
};


export type ViewSize = {
    width: number;
    height: number;
};
export interface CutAreaRect {
    start: { x: number; y: number };
    end: { x: number; y: number };
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface RecAreaRect {
    start: { x: number; y: number };
    end: { x: number; y: number };
    maxVal:number
}

export interface XYWHProps {
    x: number;
    y: number;
    w: number;
    h: number;
}



export interface CutItemProps {
    roiXYWH: XYWHProps;
    matchThreshold: number;
    compressQuality: number;
    monitorScale: number;
    id: string;
    deviceId: string;
    ts: number;
    name: string;
    screen: ScreenInfo;
}
export type PRO_LEVEL =  "MONTH"|"YEAR"|"LONG"

export interface ProPlan {
    level:PRO_LEVEL;
    name: string;
    description?: string;
    /**
     * nanoton
     */
    amount: string;
}

export interface ProInfoProps{
    id:string,
    index:number,
    level:PRO_LEVEL,
    amount:number,
    ts:number
}