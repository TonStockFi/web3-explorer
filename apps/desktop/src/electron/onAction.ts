import { session } from 'electron';
import { OnAction } from '../libs/message';
import { MainWindow } from './mainWindow';

export const willNavigateHandler = async (e: Electron.Event & { url: string },webContentsId?:number) => {
    // console.log("willNavigateHandler",e.url)
    if (
        e.url.startsWith('tonkeeper-tc://') ||
        e.url.startsWith('tonkeeper://') ||
        e.url.startsWith('tonkeeper-tc://')
    ) {
        const window = await MainWindow.openMainWindow();
        window.show();
        const {url} = e;
        window.webContents.send('tc', url);
        e.preventDefault();
    }

    if (e.url.startsWith('tg://')) {
        e.preventDefault();
    }
};

export const handleActionMessage = async (message: OnAction): Promise<unknown> => {
    const { action, value } = message.payload;

    if ('didAttach' === action) {
        //console.log('pid:', value);
        // Ensure the partition is valid and retrieve the session
        const s = session.fromPartition(value);
        if (!s) {
            console.error('Session not found for the provided partition');
            return;
        }

        s.webRequest.onBeforeRequest((details, callback) => {
            //console.log('onBeforeRequest:', details.url);
            callback({ cancel: false });
        });

        s.webRequest.onBeforeSendHeaders((details, callback) => {
            //console.log('Request headers:', details.requestHeaders);
            callback({ requestHeaders: details.requestHeaders });
        });

        // Listen for headers received on the session's webRequest
        s.webRequest.onHeadersReceived((details, callback) => {
            const responseHeaders = details.responseHeaders;
            // Check if the CSP header exists
            if (responseHeaders['Content-Security-Policy']) {
                // Modify the CSP header to allow the desired URL or scheme
                const csp = responseHeaders['Content-Security-Policy'][0];
                const newCsp = csp.replace(
                    'default-src',
                    "default-src tonkeeper-tc: data: 'self' https:"
                );
                responseHeaders['Content-Security-Policy'] = [newCsp];
                //console.log('Modified CSP:', newCsp);
            }

            // Proceed with the headers
            callback({
                cancel: false,
                responseHeaders: details.responseHeaders
            });
        });
        //console.log('WebRequest onHeadersReceived handler attached');
    }
    
    if ('sendTcUrl' === action) {
        const window = await MainWindow.openMainWindow();
        window.show();
        window.webContents.send('tc', value);
    }

    // if ('setWillNavigate' === action) {
    //     const wc = webContents.fromId(value as number);
    //     if (wc) {
    //         wc.on('will-navigate', willNavigateHandler);
    //     }
    // }
    // if ('removeWillNavigate' === action) {
    //     const wc = webContents.fromId(value as number);
    //     if (wc) {
    //         wc.off('will-navigate', willNavigateHandler);
    //     }
    // }
    return true;
};
