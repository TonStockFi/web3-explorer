import { PropTypes } from '@mui/material';

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
    walletAccountId?:string
    deviceId: string;
    name?: string;
    connected?: boolean;
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

export enum WsCloseCode {}

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

export interface CutAreaRect {
    start: { x: number; y: number };
    end: { x: number; y: number };
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

export interface DeviceOptions {
    walletAccountId?:string;
    index?:number;
    canCut?: boolean;
    tgUserId?: string;
    webviewTitle?: string;
    customHosts?: { host: string }[];
    setCustomHosts?: (v:{host:string}[])=>void;
    partitionId?: string;
    deleteTgSite?: (userId: string)=>void;
    canDelete?: boolean;
    headerColor?: PropTypes.Color | 'transparent' | 'error' | 'info' | 'success' | 'warning';
    isInfoPanel?: boolean,
    setIsInfoPanel?: (v: boolean)=>void,
    isSettingPanel?: boolean,
    setIsSettingPanel?: (v: boolean)=>void,
    setGlobalUpdatedAt?: (v: number)=>void;
    setUpdatedAt?: (v: number)=>void;
    setSnackbar: (v: string)=>void;
    isAdding?: boolean;
    optionsTab?: 'CUT_AREA' | string,
    setOptionsTab?: (v: string)=>void,
    webview?: any;
    isWebview?: boolean;
    logsUpdateAt: number;
    isLogged?: boolean;
    recognitionAreaRect: CutAreaRect[];
    setRecognitionAreaRect: (v: RecAreaRect[])=>void;
    cutAreaRect: CutAreaRect;
    setCutAreaRect: (v: CutAreaRect)=>void;
    ws?: WebSocket;
    isCutEnable: boolean;
    setIsCutEnable: (v: boolean)=>void;
    monitorScale: number;
    setMonitorScale: (v: number)=>void;
    errCode?: ErrCodes;
    auth?: (deviceId:string, password:string, serverApi:string)=>Promise<boolean>;
    deviceId: string;
    updatedAt?: number;
    setDeviceId?: (v: string)=>void;
    getDeviceInfo: (key?: keyof DeviceInfo, defaultVal?: any) => any;
    onChangeDeviceInfo?: (key: keyof DeviceInfo, value: any)=>void;
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
