import { ipcRenderer } from 'electron';

export function sendMessageToMain(
    action:'onTgWebJoinButton'| 'onTgWebLogged' | 'onTgWebLogout' | 'onTgWebIframe' | 'CurrentAccountBalance'|'CurrentAccountJettons' | 'onTgWebIframeConfirm' | "onTgSiteSelectText",
    payload?: never | {url:string} | {user:any} | {}
) {
    ipcRenderer.invoke('siteMessage', { action, payload });
}
