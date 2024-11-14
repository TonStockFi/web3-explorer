import { resizeImage } from '../common/image';
import {
    getAccountIndexByTabId,
    getFocusWebviewByTabId,
    getFocusWebviewIsReadyByTabId,
    getTabIdByWebviewContentsId,
    getUrlByTabId,
    getWebviewContentsIdByTabId,
    TabIdWebveiwSizedMap
} from '../components/webview/WebViewBrowser';
import { BoundingClientRect } from '../types';



// export const getAvatar = async (userId: string, accessKey: string, webview: WebviewTag) => {
//     try {
//         await webview.executeJavaScript(`  
  
// async function getCachedImageAsDataUri(userId,accessKey){
//     const cacheName = "tt-media-avatars";
//     const cacheKey = "/a/avatar"+userId+"?"+accessKey;
//     try {
//         const cache = await caches.open(cacheName);
//         const cachedResponse = await cache.match(cacheKey);
//         if (!cachedResponse) {
//             throw new Error('Image not found in cache');
//         }
//         const blob = await cachedResponse.blob();
//         const reader = new FileReader();
//         return new Promise((resolve, reject) => {
//             reader.onloadend = () => resolve(reader.result);
//             reader.onerror = reject;
//             reader.readAsDataURL(blob);
//         });
//     } catch (error) {
//         console.error(error);
//         return null;
//     }
// }
// (() => {
//     getCachedImageAsDataUri("${userId}","${accessKey}").then((res) => {
//         window.__jsEvalResAvatar = res
//     }).catch((e)=>{
//         window.__jsEvalResAvatar = {err: e.message}
//     });
// })()

//  `);
//         await sleep(400);
//         const res = await webview.executeJavaScript(`window.__jsEvalResAvatar;`);
//         await webview.executeJavaScript(`window.__jsEvalResAvatar = null;`);
//         return res;
//     } catch (e) {
//         console.error(e);
//         return null;
//     }
// };

// export const getTgGlobalState = async (webview: WebviewTag) => {
//     try {
//         await webview.executeJavaScript(`   
//  (() => {
//     let state = null;
//     async function getTgGlobalState() {
//         return new Promise((resolve, reject) => {
//             const request = indexedDB.open('tt-data', 1);

//             request.onsuccess = (event) => {
//                 const db = request.result;
//                 const transaction = db.transaction(['store'], 'readonly');
//                 const objectStore = transaction.objectStore('store');
//                 const getRequest = objectStore.get('tt-global-state'); // replace 'yourKey' with your actual key

//                 getRequest.onsuccess = (event) => {
//                     resolve(event.target.result);
//                 };

//                 getRequest.onerror = (event) => {
//                     reject('Error retrieving data from IndexedDB');
//                 };
//             };

//             request.onerror = (event) => {
//                 reject('Error opening IndexedDB');
//             };
//         });
//     }

//     getTgGlobalState().then((res) => {
//         window.__jsEvalResGlobalState = res
//     }).catch((e)=>{
//         window.__jsEvalResGlobalState = {err:e.message}
//     });
// })();`);
//         await sleep(400);
//         const res = await webview.executeJavaScript(`window.__jsEvalResGlobalState;`);
//         await webview.executeJavaScript(`window.__jsEvalResGlobalState = {};`);
//         return res;
//     } catch (e) {
//         console.error(e);
//         return null;
//     }
// };

// export const getTgAuthInfo = async (webview: WebviewTag) => {
//     try {
//         const res = await webview.executeJavaScript(`   
// (()=>{
//     const user_auth = JSON.parse(localStorage.getItem("user_auth") || "{}")
//     let dcId,auth_key,hash,userId;
//     if(user_auth.dcID) {
//         dcId = user_auth.dcID;
//         userId = user_auth.id;
//         auth_key = localStorage.getItem("dc"+dcId+"_auth_key")
//         hash = localStorage.getItem("dc"+dcId+"_hash")
//     }
//     return {
//         dcId,auth_key,hash,userId
//     }
// })()   
//         `);
//         return res || {};
//     } catch (e) {
//         console.error(e);
//         return null;
//     }
// };

// export const getTgInfo = async (webview: WebviewTag) => {
//     try {
//         const res = await webview.executeJavaScript(
//             `
// (()=>{
//     let webview_url = "";
//     const iframe = document.querySelector("#portals iframe")
//     if(iframe){
//         webview_url = iframe.src
//         iframe.src="about:blank"
//     }
//     console.log("getTgInfo",{iframe,webview_url})
//     window.__jsEvalRes = {
//         webview_url:webview_url || ""
//     }
// })()   
// window.__jsEvalRes;
//         `
//         );
//         return res;
//     } catch (e) {
//         console.error(e);
//         return null;
//     }
// };

// export const getTgConfirmButtonInfo = async (webview: WebviewTag) => {
//     try {
//         const res = await webview.executeJavaScript(
//             `   
// (()=>{
//     window.__jsEvalRes_ConfirmButtonInfo = null
//     const button = document.querySelector("#portals button.Button.confirm-dialog-button.default.danger.text");
//     if(button){
//         const rect = button.getBoundingClientRect();
//         window.__jsEvalRes_ConfirmButtonInfo = {
//             top: rect.top  + rect.height / 2,
//             left: rect.left + rect.width / 2
//         };
//     }
    
// })()   
// window.__jsEvalRes_ConfirmButtonInfo;
//         `
//         );
//         return res;
//     } catch (e) {
//         console.error(e);
//         return null;
//     }
// };



export default class WebviewService {
    private tabId: string;

    constructor(tabId: string) {
        this.tabId = tabId;
    }
    getTabId(){
        return this.tabId
    }
    getAccountIndex(){
        return getAccountIndexByTabId(this.getTabId()) || 0
    }
    static getServiceByWebContentsId(id: number) {
        const tabId = getTabIdByWebviewContentsId(id);
        if (tabId) {
            return new WebviewService(tabId);
        } else {
            return null;
        }
    }
    getWebview() {
        return getFocusWebviewByTabId(this.tabId);
    }

    webviewIsReady() {
        return getFocusWebviewIsReadyByTabId(this.tabId);
    }

    getWebviewContentsId() {
        return getWebviewContentsIdByTabId(this.tabId);
    }
    getContentsId() {
        const webview = this.getWebview();
        if (!webview) {
            console.warn('webview is null when waitForElemenBoundingClientRect ');
            return null;
        }
        return webview?.getWebContentsId();
    }
    goBack(){
        const webview = this.getWebview();
        return webview ? webview.goBack() : '';
    }
    getUrl() {
        const webview = this.getWebview();
        return webview ? webview.getURL() : '';
    }

    getWebviewUrl() {
        const url = getUrlByTabId(this.tabId) || ""
        return url
    }

    getWebviewUrlUri() {
        const url = this.getWebviewUrl()
        const uri = url ? new URL(url) :{host:"", hash:"",pathname:""}
        return { uri, url };
    }
    
    goToTelegramWebChatId(chatId: string) {
        const webview = this.getWebview();
        if (!webview) {
            console.warn('webview is null when goToTelegramWebChatId ');
            return;
        }
        const code = `
    const currentUrl = window.location.href.split('#')[0];
    const newHash = '#${chatId}';
    history.replaceState(null, '',currentUrl + newHash);
    location.reload()
    return {url:currentUrl + newHash}
    `;
        return this.execJs(code)
    }
    async goTo(url: string) {
        const webview = this.getWebview();
        if (!webview) {
            console.warn('webview is null when goTo ');
            return;
        }
        if(url){
            await webview.executeJavaScript(`location.href="${url}";`)
        }
    }

    async getElemenBoundingClientRect(selector: string): Promise<BoundingClientRect | null> {
        const webview = this.getWebview();
        if (!webview) {
            console.warn('webview is null when waitForElemenBoundingClientRect ');
            return null;
        }
        const code = `
const element = document.querySelector("${selector}")
if(element){
    const rect = element.getBoundingClientRect();
    return {top:rect.top,left:rect.left,width:rect.width,height:rect.height}
}else{
    return null
} `;
        console.debug('getElemenBoundingClientRect', code);
        return this.execJs(code);
    }
    async waitForElemenBoundingClientRect(
        selector: string,
        timeout?: number
    ): Promise<BoundingClientRect | null> {
        const webview = this.getWebview();
        if (!webview) {
            console.warn('webview is null when waitForElemenBoundingClientRect ');
            return null;
        }
        const code = `
const element = document.querySelector("${selector}")
if(element){
    const rect = element.getBoundingClientRect();
    return {top:rect.top,left:rect.left,width:rect.width,height:rect.height}
}else{
    return null
} `;
        console.debug('waitForElemenBoundingClientRect', code);
        return this.waitForExecJsResult(code, timeout || 30000);
    }
    async querySelector(selector: string, key: string) {
        return await this.execJs(`
            const ele = document.querySelector("${selector}");
            if(ele){return ele["${key}"]}else{return null}`);
    }
    async execJs(code: string): Promise<any | null> {
        const wv = this.getWebview();
        if (!wv) {
            console.warn('webview is null when execJs ');
            return null;
        }
        try {
            const res = await wv.executeJavaScript(`(()=>{${code}})()`);
            return res;
        } catch (e) {
            console.error(e);
            return null;
        }
    }
    async waitForExecJsResult(code: string, timeout: number = 0): Promise<any | null> {
        let startTs = 0;
        let delayMs = 800;
        return new Promise(resolve => {
            const interval = setInterval(async () => {
                try {
                    const res = await this.execJs(code);
                    if (res) {
                        clearInterval(interval);
                        resolve(res);
                    } else {
                        if (timeout > 0) {
                            if (startTs > timeout!) {
                                resolve(null);
                            } else {
                                startTs += delayMs;
                            }
                        }
                    }
                } catch (e) {
                    console.error('waitForJsExecResult error:', e);
                    resolve(null);
                }
            }, delayMs);
        });
    }
    async insertText(text: string) {
        const wv = this.getWebview();
        if (!wv) {
            console.warn('webview is null when insertText ');
            return null;
        }
        await wv.insertText(text);
    }

    goToTgChat(chatId: string) {
        const code = `
const currentUrl = window.location.href.split('#')[0];
const newHash = '#${chatId}';
history.replaceState(null, '',currentUrl + newHash);
location.reload()
return {url:currentUrl + newHash}
    `;
        return this.execJs(code);
    }
    async waitForTgIframeUrl(): Promise<null | string> {
        const code = `
const element = document.querySelector("#portals iframe");
if(element && element.src){
    return element.src
}else{
    return null
}
    `;
        console.debug('waitForTgIframeUrl', code);
        return this.waitForExecJsResult(code, 0);
    }

    async getTgLastMessage(): Promise<null | any> {
        const code = `
            const messages = document.querySelectorAll(".Message")
            if(messages.length > 0){
                const message = messages[messages.length - 1]
                message.style.display = ""
                const ele = message.querySelector(".text-entity-link")
                if(ele){
                    return true;
                }
            }
            return null;    
            `;
        console.debug('getTgLastMessageUrlInGroup', code);
        return this.execJs(code);
    }
    async getTgLastMessageUrlInGroup(): Promise<null | any> {
        const code = `
            const messages = document.querySelectorAll(".Message")
            if(messages.length > 0){
                const message = messages[messages.length - 1]
                const ele = message.querySelector(".text-entity-link")
                if(ele){
                    message.style.display = ""
                    const rect = message.getBoundingClientRect();
                    return {link:ele.textContent,top:rect.top,left:rect.left,width:rect.width,height:rect.height}
                }
            }
            return null;    
            `;
        console.debug('getTgLastMessageUrlInGroup', code);
        return this.execJs(code);
    }
    async waitForTgLastMessageUrlInGroupRect(url: string): Promise<null | BoundingClientRect> {
        const code = `
    const element = document.querySelector(".Message.last-in-group .text-entity-link");
    if(element && element.textContent === "${url}"){
        const rect = element.getBoundingClientRect();
        return {top:rect.top,left:rect.left,width:rect.width,height:rect.height}
    }else{
        return null
    }
    `;
        console.debug('waitForTgLastMessageUrlInGroupRect', code);
        return this.waitForExecJsResult(code, 60000);
    }
    async sendClickEventAtRect(rect: BoundingClientRect) {
        const wv = this.getWebview();
        if (!wv) {
            console.warn('webview is null when sendClickEventAtRect ');
            return null;
        }
        const { top, left, width, height } = rect;
        await this.sendClickEvent(left + width / 2, top + height / 2);
    }

    async sendInputEvent(tabId: StringConstructor, type: 'mouseDown' | 'mouseUp', x: number, y: number, button: 'left', clickCount: number = 1) {
        const wv = this.getWebview();
        if (!wv) {
            console.warn('webview is null when sendClick ');
            return null;
        }
        await wv.sendInputEvent({
            type,
            x,
            y,
            button,
            clickCount
        });
    };
    
    
    async sendClickEvent(x: number, y: number) {
        const wv = this.getWebview();
        if (!wv) {
            console.warn('webview is null when sendClick ');
            return null;
        }
        await wv.sendInputEvent({
            type: 'mouseDown',
            x,
            y,
            button: 'left',
            clickCount: 1
        });
        await wv.sendInputEvent({
            type: 'mouseUp',
            x,
            y,
            button: 'left',
            clickCount: 1
        });
    }
    async setAudioMuted(muted: boolean) {
        const wv = this.getWebview();
        if (!wv) {
            console.warn('webview is null when setAudioMuted ');
            return;
        }
        wv.setAudioMuted(muted);
    }

    reloadWebview() {
        const webview = this.getWebview();
        if (webview) {
            webview.reload();
        }
    }
    getWebViewSize() {
        return TabIdWebveiwSizedMap.get(this.tabId) || null
    }

    async captureScreenToDataURL(x:number,y:number,width:number,height:number){
        const webview = this.getWebview();
        if (!webview) {
            return null;
        }
        const screenImage = await webview.capturePage({
            height, width,
            x,
            y
        });
        return screenImage.toDataURL();
    }

    async captureScreenToBlob(x:number,y:number,width:number,height:number){
        const image = await this.captureScreenToDataURL(x,y,width,height)
        if(!image){
            return null;
        }
        const blob = await resizeImage(image, width, height);
        return blob;
    }
    async getScreenImageBlob(size?:{width:number;height:number}) {
        if(!size){
            const s = this.getWebViewSize()
            if(!s){
                return null;
            }
            size = s
        }
       
        return this.captureScreenToBlob(0,0,size.width,size.height)
    }

    async getScreenImageUrl(size?:{width:number;height:number}) {
        const blob = await this.getScreenImageBlob(size);
        if (blob) {
            return URL.createObjectURL(blob);
        } else {
            return null;
        }
    }
    
}
