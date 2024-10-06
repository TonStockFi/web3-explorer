import { OnAction } from '../libs/message';
import { getLocalIPAddress } from './ws-server/server';
import { session, webContents } from 'electron';
import { MainWindow } from './mainWindow';
import isDev from 'electron-is-dev';

export const willNavigateHandler = async (e: Electron.Event & { url: string }) => {
    if (e.url.startsWith('tonkeeper-tc://')) {
        const window = await MainWindow.openMainWindow();
        window.show();
        window.webContents.send('tc', e.url);
        e.preventDefault();
    }
};

export const handleActionMessage = async (message: OnAction): Promise<unknown> => {
    console.log('ipcMain,onMessage', message);
    const { action, value } = message.payload;
    if ('getLocalIPAddress' === action) {
        return getLocalIPAddress();
    }
    if ('didAttach' === action) {
        console.log('pid:', value);
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
            let responseHeaders = details.responseHeaders;
            // Check if the CSP header exists
            if (responseHeaders['Content-Security-Policy']) {
                console.log('>>> onHeadersReceived', details.url);
                console.log('Original CSP:', responseHeaders['Content-Security-Policy']);
                // Modify the CSP header to allow the desired URL or scheme
                const csp = responseHeaders['Content-Security-Policy'][0];
                const newCsp = csp.replace(
                    'default-src',
                    "default-src tonkeeper-tc: data: 'self' https:"
                );
                responseHeaders['Content-Security-Policy'] = [newCsp];
                console.log('Modified CSP:', newCsp);
            }

            // Proceed with the headers
            callback({
                cancel: false,
                responseHeaders: details.responseHeaders
            });
        });
        console.log('WebRequest onHeadersReceived handler attached');
    }

    if ('getEnv' === action) {
        return {
            __dirname,
            isDev
        };
    }

    if ('sendTcUrl' === action) {
        const window = await MainWindow.openMainWindow();
        window.show();
        window.webContents.send('tc', value);
    }

    if ('setWillNavigate' === action) {
        const wc = webContents.fromId(value as number);
        if (wc) {
            wc.on('will-navigate', willNavigateHandler);
        }
    }
    if ('removeWillNavigate' === action) {
        const wc = webContents.fromId(value as number);
        if (wc) {
            wc.off('will-navigate', willNavigateHandler);
        }
    }
    return true;
};
