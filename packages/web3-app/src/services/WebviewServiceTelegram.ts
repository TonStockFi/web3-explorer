import { showGlobalLoading } from '../common/helpers';
import { sleep } from '../common/utils';
import { isTelegramWeb } from '../providers/PlaygroundProvider';
import { AccountPublic } from '../types';
import TgAuthService, { TgAuthinfo } from './TgAuthService';
import WebviewService from './WebviewService';

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

export default class WebviewServiceTelegram extends WebviewService {
    
    constructor(tabId: string) {
        super(tabId)
    }
    async getIframeUrl(){
        const ws = this;

        if (!ws.getWebview()) {
            return;
        }

        const iframeUrl = await ws.waitForTgIframeUrl();
        console.log('get iframe url', iframeUrl);
        return iframeUrl

    }

    async getAuthInfo(): Promise<null|TgAuthinfo> {
        const webview = this.getWebview();
        if (!webview) {
            console.warn('webview is null when isLogged ');
            return null;
        }
        const code = `
        const user_auth = JSON.parse(localStorage.getItem("user_auth") || "{}")
        if(user_auth.dcID){
            const hash = JSON.parse(localStorage.getItem("dc"+user_auth.dcID+"_hash") || "")
            const auth_key = JSON.parse(localStorage.getItem("dc"+user_auth.dcID+"_auth_key") || "")
            return {hash,auth_key,user_auth}
        }
        return null`;
        console.debug('getAuthInfo', code);
        return this.execJs(code);
    }
    async getAuthUserId(): Promise<null|string> {
        const webview = this.getWebview();
        if (!webview) {
            console.warn('webview is null when isLogged ');
            return null;
        }
        const code = `
        const user_auth = JSON.parse(localStorage.getItem("user_auth") || "{}")
        return user_auth.id || null`;
        console.debug('getAuthUserId', code);
        return this.execJs(code);
    }

    async isLogged(): Promise<boolean> {
        const userId = this.getAuthUserId()
        return !!userId
    }

    async waitForLogged(): Promise<boolean> {
        const webview = this.getWebview();
        if (!webview) {
            console.warn('webview is null when waitForLogged ');
            return false;
        }
        const code = `const user_auth = JSON.parse(localStorage.getItem("user_auth") || "{}")
        return user_auth.id;`;
        console.debug('waitForLogged', code);
        return this.waitForExecJsResult(code);
    }
    async handleJoinConfirm(delay?:number){
        const res1 = await this.getElemenBoundingClientRect('button.join-subscribe-button');
        console.log('>> button.join-subscribe-button', res1);
        if (res1) {
            await this.sendClickEventAtRect(res1);
            if(delay){
                await sleep(delay)
            }
        }
    }
    async sendTextMessage(text:string){
        const res = await this.waitForElemenBoundingClientRect(`#editable-message-text`);
        if (res) {
            await this.sendClickEvent(res.left + res.width / 2, res.top + res.height / 2);
            await sleep(100);
            this.insertText(text);
            await sleep(100);
            const res1 = await this.waitForElemenBoundingClientRect(`.main-button.send`);
            if (res1) {
                await this.sendClickEvent(res1.left + 20, res1.top + 10);
            }
        }
    }
    async handleItem(){
        const ws = this;

        if (!ws.getWebview()) {
            return;
        }
        await ws.execJs(
            ` document.querySelectorAll(".Message").forEach(row=>row.style.display = "none")`
        );
        this.handleJoinConfirm()
        const res = await ws.waitForElemenBoundingClientRect(`#editable-message-text`);
        console.log('#editable-message-text', res);
        if (res) {
            await ws.sendClickEvent(res.left + res.width / 2, res.top + res.height / 2);
            await sleep(100);
            ws.insertText("");
            await sleep(100);
            const res1 = await ws.waitForElemenBoundingClientRect(`.main-button.send`);
            if (res1) {
                await ws.execJs(
                    ` document.querySelectorAll(".Message").forEach(row=>row.style.display = "none")`
                );

                await ws.sendClickEvent(res1.left + 20, res1.top + 10);

                const iframeUrl = await ws.waitForTgIframeUrl();
                console.log('get iframe url', iframeUrl);
            }
        }
        await sleep(2000);
    }
    async handleAuth(currentAccount:AccountPublic,urlGoTo:string){
        const ws = this;
        const url = ws.getWebviewUrl();
        
        if (url && isTelegramWeb(url)) {
            const tgs = new TgAuthService(currentAccount.id, currentAccount.index);
            const authInfo = await tgs.get();
            if (!authInfo) {
                const userAuthInfo = await ws.getAuthInfo();
                if (userAuthInfo) {
                    await new TgAuthService(currentAccount.id, currentAccount.index).save(
                        userAuthInfo
                    );
                }
            } else {
                const userAuthInfo = await ws.getAuthInfo();
                if (!userAuthInfo) {
                    const dcID = authInfo.user_auth.dcID;
                    const hash = authInfo.hash;
                    const auth_key = authInfo.auth_key;
                    const code = `
                        localStorage.setItem("user_auth",'${JSON.stringify(
                            authInfo.user_auth
                        )}');
                        localStorage.setItem("dc${dcID}_hash",'${JSON.stringify(hash)}');
                        localStorage.setItem("dc${dcID}_auth_key",'${JSON.stringify(
                        auth_key
                    )}');`;

                    showGlobalLoading(true)
                    showGlobalLoading(false,1)
                    await ws.execJs(code);
                    await sleep(1000);
                    await ws.goTo(urlGoTo);
                }
            }
        }
    }
    
}
