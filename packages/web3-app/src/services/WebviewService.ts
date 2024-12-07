import { WebviewTag } from 'electron';
import { resizeImage } from '../common/image';
import { sleep } from '../common/utils';
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

export default class WebviewService {
    
    openDevTools() {
        const webview = this.getWebview()
        if(!webview){
            return;
        }
        webview.openDevTools();
        // if (!webview.isDevToolsOpened()) {
        //     webview.openDevTools();
        // }
        // const webContentsId = this.getWebviewContentsId()
        // onAction("openDevTools",{
        //     webContentsId,
        // })
    }
    private tabId: string;

    constructor(tabId: string) {
        this.tabId = tabId;
    }
    getTabId() {
        return this.tabId;
    }
    getAccountIndex() {
        return getAccountIndexByTabId(this.getTabId()) || 0;
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

    async waitwebviewIsReady(timeout: number = -1, interval: number = 100): Promise<WebviewTag|null|undefined> {
        const startTime = Date.now();
    
        return new Promise((resolve, reject) => {
            const checkWebviewReady = async () => {
                try {
                    const isReady = this.webviewIsReady(); // Call the existing `webviewIsReady` method
                    if (isReady) {
                        const webview = this.getWebview()
                        resolve(webview!); // Webview is ready
                        return;
                    }
    
                    // Check if the timeout has been reached
                    if (Date.now() - startTime > timeout && timeout !== -1) {
                        resolve(null); // Timeout, webview is not ready
                        return;
                    }
    
                    // Retry after the interval
                    setTimeout(checkWebviewReady, interval);
                } catch (error) {
                    reject(null); // Handle any errors
                }
            };
    
            checkWebviewReady(); // Start polling
        });
    }
    getWebviewContentsId() {
        return getWebviewContentsIdByTabId(this.tabId);
    }
    getContentsId() {
        const webview = this.getWebview();
        if (!webview) {
            console.warn('webview is null when getContentsId ');
            return null;
        }
        return webview?.getWebContentsId();
    }
    goBack() {
        const webview = this.getWebview();
        return webview ? webview.goBack() : '';
    }
    getUrl() {
        const webview = this.getWebview();
        return webview ? webview.getURL() : '';
    }

    getWebviewUrl() {
        const url = getUrlByTabId(this.tabId) || '';
        return url;
    }

    getWebviewUrlUri() {
        const url = this.getWebviewUrl();
        const uri = url ? new URL(url) : { host: '', hash: '', pathname: '' };
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
        return this.execJs(code);
    }
    async goTo(url: string) {
        const webview = this.getWebview();
        if (!webview) {
            console.warn('webview is null when goTo ');
            return;
        }
        if (url) {
            await webview.executeJavaScript(`location.href="${url}";`);
        }
    }

    async getElemenBoundingClientRect(selector: string): Promise<BoundingClientRect | null> {
        const webview = this.getWebview();
        if (!webview) {
            console.warn('webview is null when getElemenBoundingClientRect ');
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
            const res = await wv.executeJavaScript(`(async ()=>{${code}})()`);
            return res;
        } catch (e) {
            console.error(e, code);
            return null;
        }
    }
    async waitForExecJsResult(code: string, timeout: number = 0,delayMs:number = 800): Promise<any | null> {
        let startTs = 0;
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

    async checkTgIframeUrl(): Promise<null | string> {
        const code = `
const element = document.querySelector("#portals iframe");
if(element && element.src){
    return element.src
}else{
    return null
}
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

    async sendInputEvent(
        tabId: StringConstructor,
        type: 'mouseDown' | 'mouseUp',
        x: number,
        y: number,
        button: 'left',
        clickCount: number = 1
    ) {
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
    }

    async sendDragEvent(
        start: { x: number; y: number },
        end: { x: number; y: number },
        steps: number = 10
    ) {
        const wv = this.getWebview();
        if (!wv) {
            console.warn('webview is null when sendClick ');
            return null;
        }
        await wv.sendInputEvent({
            type: 'mouseDown',
            x: start.x,
            y: start.y,
            button: 'left',
            clickCount: 1
        });
        await sleep(100);

    // Calculate intermediate steps for smooth dragging
    const deltaX = (end.x - start.x) / steps;
    const deltaY = (end.y - start.y) / steps;

    for (let i = 1; i <= steps; i++) {
        const intermediateX = start.x + deltaX * i;
        const intermediateY = start.y + deltaY * i;

        await wv.sendInputEvent({
            type: 'mouseMove',
            x: Math.round(intermediateX),
            y: Math.round(intermediateY),
            button: 'left', // Keep the left button pressed during the drag
        });

        // Optional sleep for smoother visual drag simulation
        await sleep(50);
    }
        await wv.sendInputEvent({
            type: 'mouseUp',
            x: end.x,
            y: end.y,
            button: 'left',
            clickCount: 1
        });
    }
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
        return TabIdWebveiwSizedMap.get(this.tabId) || null;
    }

    async captureScreenToDataURL(x: number, y: number, width: number, height: number) {
        const webview = this.getWebview();
        if (!webview) {
            return null;
        }
        const screenImage = await webview.capturePage({
            height,
            width,
            x,
            y
        });
        return screenImage.toDataURL();
    }

    async captureScreenToBlob(x: number, y: number, width: number, height: number) {
        const image = await this.captureScreenToDataURL(x, y, width, height);
        if (!image) {
            return null;
        }
        const blob = await resizeImage(image, width, height);
        return blob;
    }
    async getScreenImageBlob(size?: { width: number; height: number }) {
        if (!size) {
            const s = this.getWebViewSize();
            if (!s) {
                return null;
            }
            size = s;
        }

        return this.captureScreenToBlob(0, 0, size.width, size.height);
    }

    async getScreenImageUrl(size?: { width: number; height: number }) {
        const blob = await this.getScreenImageBlob(size);
        if (blob) {
            return URL.createObjectURL(blob);
        } else {
            return null;
        }
    }
}
