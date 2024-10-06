interface BackgroundApi {
    platform: () => string;
    arch: () => string;
    node: () => string;
    chrome: () => string;
    electron: () => string;
    message: <Result>(message: Message) => Promise<Result>;
    onTonConnect: (callback: (url: string) => void) => void;
    onSiteMessage: (
        callback: (event: {
            senderWebContentsId: number;
            message: { action: string; payload?: Record<string, any> };
        }) => void
    ) => void;
    onTonConnectTransaction: (callback: (value: SendTransactionAppRequest) => void) => void;
    onTonConnectDisconnect: (callback: (value: AccountConnection) => void) => void;
    onRefresh: (callback: () => void) => void;
}

interface AppApi {
    message: <Result>(message: { action: string; payload: any }) => Promise<Result>;
}

declare global {
    interface Window {
        backgroundApi: BackgroundApi;
        __appApi: AppApi;
    }
}

export {};
