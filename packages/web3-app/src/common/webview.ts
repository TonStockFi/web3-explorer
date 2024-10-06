import { WebviewTag } from 'electron';
import { sleep } from './utils';


export const getWebviewScreenImage = async (width:number,height:number,webview: WebviewTag) => {

    const screenImage = await webview.capturePage({
        height, width,
        x: 0,
        y: 0
    });
    return screenImage.toDataURL();
};

export const getAvatar = async (userId: string, accessKey: string, webview: WebviewTag) => {
    try {
        await webview.executeJavaScript(`  
  
async function getCachedImageAsDataUri(userId,accessKey){
    const cacheName = "tt-media-avatars";
    const cacheKey = "/a/avatar"+userId+"?"+accessKey;
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(cacheKey);
        if (!cachedResponse) {
            throw new Error('Image not found in cache');
        }
        const blob = await cachedResponse.blob();
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error(error);
        return null;
    }
}
(() => {
    getCachedImageAsDataUri("${userId}","${accessKey}").then((res) => {
    debugger
        window.__jsEvalResAvatar = res
    }).catch((e)=>{
    debugger
        window.__jsEvalResAvatar = {err: e.message}
    });
})()

 `);
        await sleep(400);
        const res = await webview.executeJavaScript(`window.__jsEvalResAvatar;`);
        await webview.executeJavaScript(`window.__jsEvalResAvatar = null;`);
        return res;
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const getTgGlobalState = async (webview: WebviewTag) => {
    try {
        await webview.executeJavaScript(`   
 (() => {
    let state = null;
    async function getTgGlobalState() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('tt-data', 1);

            request.onsuccess = (event) => {
                const db = request.result;
                const transaction = db.transaction(['store'], 'readonly');
                const objectStore = transaction.objectStore('store');
                const getRequest = objectStore.get('tt-global-state'); // replace 'yourKey' with your actual key

                getRequest.onsuccess = (event) => {
                    resolve(event.target.result);
                };

                getRequest.onerror = (event) => {
                    reject('Error retrieving data from IndexedDB');
                };
            };

            request.onerror = (event) => {
                reject('Error opening IndexedDB');
            };
        });
    }

    getTgGlobalState().then((res) => {
        window.__jsEvalResGlobalState = res
    }).catch((e)=>{
        window.__jsEvalResGlobalState = {err:e.message}
    });
})();`);
        await sleep(400);
        const res = await webview.executeJavaScript(`window.__jsEvalResGlobalState;`);
        await webview.executeJavaScript(`window.__jsEvalResGlobalState = {};`);
        return res;
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const getTgAuthInfo = async (webview: WebviewTag) => {
    try {
        const res = await webview.executeJavaScript(`   
(()=>{
    const user_auth = JSON.parse(localStorage.getItem("user_auth") || "{}")
    let dcId,auth_key,hash,userId;
    if(user_auth.dcID) {
        dcId = user_auth.dcID;
        userId = user_auth.id;
        auth_key = localStorage.getItem("dc"+dcId+"_auth_key")
        hash = localStorage.getItem("dc"+dcId+"_hash")
    }
    return {
        dcId,auth_key,hash,userId
    }
})()   
        `);
        return res || {};
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const getTgInfo = async (webview: WebviewTag) => {
    try {
        const res = await webview.executeJavaScript(
            `
(()=>{
    let webview_url = "";
    const iframe = document.querySelector("#portals iframe")
    if(iframe){
        webview_url = iframe.src
        iframe.src="about:blank"
    }
    console.log("getTgInfo",{iframe,webview_url})
    window.__jsEvalRes = {
        webview_url:webview_url || ""
    }
})()   
window.__jsEvalRes;
        `
        );
        return res;
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const getTgConfirmButtonInfo = async (webview: WebviewTag) => {
    try {
        const res = await webview.executeJavaScript(
            `   
(()=>{
    window.__jsEvalRes_ConfirmButtonInfo = null
    const button = document.querySelector("#portals button.Button.confirm-dialog-button.default.danger.text");
    if(button){
        const rect = button.getBoundingClientRect();
        window.__jsEvalRes_ConfirmButtonInfo = {
            top: rect.top  + rect.height / 2,
            left: rect.left + rect.width / 2
        };
    }
    
})()   
window.__jsEvalRes_ConfirmButtonInfo;
        `
        );
        return res;
    } catch (e) {
        console.error(e);
        return null;
    }
};
export const sendEvent = async (
    webview: WebviewTag,
    type: 'mouseDown' | 'mouseUp',
    x: number,
    y: number,
    button: 'left',
    clickCount: number = 1
) => {
    await webview.sendInputEvent({
        type,
        x,
        y,
        button,
        clickCount
    });
};

export const sendClick = async (webview: WebviewTag, x: number, y: number) => {
    await webview.sendInputEvent({
        type: 'mouseDown',
        x,
        y,
        button: 'left',
        clickCount: 1
    });
    await webview.sendInputEvent({
        type: 'mouseUp',
        x,
        y,
        button: 'left',
        clickCount: 1
    });
};
