interface BackgroundApi {
    writeText: (text: string) => Promise<void>;
    readText: () => Promise<string>;
    writeImage: (image: Electron.NativeImage) => Promise<void>;
    readImage: () => Promise<Electron.NativeImage>;
    platform: () => string;
    arch: () => string;
    node: () => string;
    chrome: () => string;
    electron: () => string;
    message: <Result>(message: Message) => Promise<Result>;
    onTonConnect: (callback: (url: string) => void) => void;
    onTonConnectTransaction: (callback: (value: SendTransactionAppRequest) => void) => void;
    onTonConnectDisconnect: (callback: (value: AccountConnection) => void) => void;
    onRefresh: (callback: () => void) => void;
    onMainMessage: (callback: (e:{toWinId?:string,fromWinId?:string,action:string,payload?: Record<string, any>}) => void) => void;
    onSiteMessage: (
        callback: (event: {
            senderWebContentsId: number;
            message: { action: string; payload?: Record<string, any> };
        }) => void
    ) => void;
}

interface AppApi {
    message: <Result>(message: { action: string; payload: any }) => Promise<Result>;
    onRenderMessage: (callback: (e:{action:string,payload?: Record<string, any>}) => void) => void;
}

declare global {
    interface Window {
        backgroundApi: BackgroundApi;
        __appApi: AppApi;
    }
}

export { };

