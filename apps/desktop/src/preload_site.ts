import { clipboard, contextBridge, ipcRenderer } from 'electron';
import { callback, observeBody } from './preload/preload';


contextBridge.exposeInMainWorld('__appApi', {
    writeText: async (text: string) => clipboard.writeText(text),
    message: (message: any) => ipcRenderer.invoke('siteMessage', message),
    onRenderMessage: (callback: (e:{action:string,payload?: Record<string, any>}) => void) =>
        ipcRenderer.on('render', (_event, value) => callback(value))
});

console.log('preload site init!');

document.addEventListener(
    'DOMContentLoaded',
    () => {
        ipcRenderer.on('render', (_event: never, message: { action: string; payload: never }) =>
            callback(message)
        );
        observeBody();
    },
    false
);
