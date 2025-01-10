import { clipboard, contextBridge, ipcRenderer } from 'electron';

export const callback = (message: { action: string; payload: never }) => {
    // console.debug('render callback', message);
    switch (message.action){
        case "tgLogged":
        case "tgLogout":
            break;
        default:
            break;
    }
};

contextBridge.exposeInMainWorld('__appApi', {
    writeText: async (text: string) => clipboard.writeText(text),
    message: (message: any) => ipcRenderer.invoke('siteMessage', message),
    onRenderMessage: (callback: (e:{action:string,payload?: Record<string, any>}) => void) =>
        ipcRenderer.on('render', (_event, value) => callback(value))
});

console.log('preload preload site init!');

document.addEventListener(
    'DOMContentLoaded',
    () => {
        ipcRenderer.on('render', (_event: never, message: { action: string; payload: never }) =>
            callback(message)
        );
    },
    false
);
