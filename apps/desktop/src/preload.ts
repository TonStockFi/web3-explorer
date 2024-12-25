// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { AccountConnection } from '@tonkeeper/core/dist/service/tonConnect/connectionService';
import { SendTransactionAppRequest } from '@tonkeeper/uikit/dist/components/connect/connectHook';
import { clipboard, contextBridge, ipcRenderer } from 'electron';
import { Message } from './libs/message';

contextBridge.exposeInMainWorld('backgroundApi', {
    writeText: async (text: string) => clipboard.writeText(text),
    readText: async () => clipboard.readText(),
    writeImage: async (image: Electron.NativeImage) => clipboard.writeImage(image),
    readImage: async () => clipboard.readImage(),
    platform: () => process.platform,
    arch: () => process.arch,
    node: () => process.versions.node,
    chrome: () => process.versions.chromes,
    electron: () => process.versions.electron,
    message: (message: Message) => ipcRenderer.invoke('message', message),
    onSiteMessage: (
        callback: (event: {
            senderWebContentsId: number;
            message: { action: string; payload?: Record<string, any> };
        }) => void
    ) => ipcRenderer.on('siteMessage', (_event, value) => callback({...value,__msg_id:+new Date()})),
    onTonConnect: (callback: (url: string) => void) =>
        ipcRenderer.on('tc', (_event, value) => callback(value)),
    onTonConnectTransaction: (callback: (value: SendTransactionAppRequest) => void) =>
        ipcRenderer.on('sendTransaction', (_event, value) => callback(value)),
    onTonConnectDisconnect: (callback: (value: AccountConnection) => void) =>
        ipcRenderer.on('disconnect', (_event, value) => callback(value)),
    onRefresh: (callback: () => void) => ipcRenderer.on('refresh', _event => callback()),
    onMainMessage: (callback: (e:{toWinId?:string;fromWinId?:string;action:string,payload?: Record<string, any>}) => void) =>
        ipcRenderer.on('onMainMessage', (_event, value) => callback({...value,__msg_id:+new Date()}))
});
