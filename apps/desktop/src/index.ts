// import { initialize as aptabaseInitialize } from '@aptabase/electron/main';
import { app, BrowserWindow, ContextMenuParams, globalShortcut, powerMonitor } from 'electron';
import log from 'electron-log/main';
import { updateElectronApp } from 'update-electron-app';
import './electron/i18n';
import { MainWindow } from './electron/mainWindow';
import { willNavigateHandler } from './electron/onAction';
import {
    setDefaultProtocolClient,
    setProtocolHandlerOSX,
    setProtocolHandlerWindowsLinux
} from './electron/protocol';
import { TonConnectSSE } from './electron/sseEvetns';
import { delay } from './electron/utils';
import { WebSocketServerWrapper } from './electron/ws-server/server';

app.setName('Web3 Explorer');

log.initialize({ preload: true });
log.info('Application start-up',app.getVersion());

if (require('electron-squirrel-startup')) {
    app.quit();
}

const connection = TonConnectSSE.getInstance();

const onUnLock = () => {
    log.info('unlock-screen');
    connection.reconnect();
};

if (process.platform != 'linux') {
    powerMonitor.on('unlock-screen', onUnLock);
}
app.on('ready', async () => {
    console.log("App is ready")
});

app.on('web-contents-created', (_event, contents) => {
    // console.log('web-contents-created');
    // contents.setWindowOpenHandler(({ url }:{url:string}) => {
    //     console.log("setWindowOpenHandler",{url})
    //     return { action: 'allow' }
    // })
    // contents.on('update-target-url', (e, url) => {
    //     console.log('update-target-url', url);
    // });

    // contents.on('will-attach-webview', (_wawevent, webPreferences, _params) => {
    //     console.log('will-attach-webview');
    //     console.log({ webPreferences, _params, __dirname });
    // });

    const session = contents.session
    // session.setProxy()
    // session.loadExtension('/Users/ton/Desktop/projects/chrome-ext/test').then(({ id }) => {
    //     console.log("loadExtension",{id})
    // })

    contents.on('context-menu', (event,params:ContextMenuParams) => {
        if(!params.frameURL.startsWith(MainWindow.currentUrl)){
            MainWindow.mainWindow.webContents.send('onMainMessage', {
                webContentsId: contents.id,
                action: "onContextMenu",
                payload: params
            });
        }
    });
    contents.on('will-navigate', (e)=>{
        return willNavigateHandler(e,contents.id)
    });
});

app.on('before-quit', async e => {
    globalShortcut.unregisterAll();

    e.preventDefault();
    if(WebSocketServerWrapper.serverIsReady()){
        await WebSocketServerWrapper.stopServer()
    }
    connection.destroy();
    if (process.platform != 'linux') {
        powerMonitor.off('unlock-screen', onUnLock);
    }

    await delay(100);
    app.exit();
});

setDefaultProtocolClient();

switch (process.platform) {
    case 'darwin':
        setProtocolHandlerOSX();
        break;
    case 'linux':
    case 'win32':
        setProtocolHandlerWindowsLinux();
        break;
    default:
        throw new Error('Process platform is undefined');
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        MainWindow.openMainWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

updateElectronApp({ logger: log });
//
// declare const REACT_APP_APTABASE: string;
// declare const REACT_APP_APTABASE_HOST: string;
//
// aptabaseInitialize(REACT_APP_APTABASE, { host: REACT_APP_APTABASE_HOST });
