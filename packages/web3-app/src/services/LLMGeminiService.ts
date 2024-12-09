import { showGlobalLoading } from '../common/helpers';
import { copyImageToClipboard } from '../common/image';
import { base64ToBlob, urlToBlob } from '../common/opencv';
import { sleep } from '../common/utils';
import LLMService from './LLMService';
import WebviewService from './WebviewService';

export default class LLMGeminiService extends LLMService {
    
    constructor(tabId:string) {
        super(tabId)
    }

    static getTabId(){
        return `llm_gemini`
    }
    static getTabIdFromRecoId(recoId:string){
        return `${recoId}_gemini`
    }
    async getPromptInputRect(timeOut:number = -1){
        const ws = new WebviewService(this.tabId);
        await ws.waitwebviewIsReady()!;
        const rect = (await ws.waitForExecJsResult(
            `const textarea = document.querySelector("rich-textarea");
                    if (!textarea) return null;
                    const rect = textarea.getBoundingClientRect()
                    return {top:rect.top,left:rect.left,width:rect.width,height:rect.height};`,
            timeOut
        )) as any;
        return rect;
    }
    
    async inputPrompt(prompt: string) {
        const ws = new WebviewService(this.tabId);
        const webview = await ws.waitwebviewIsReady();
        const rect = await this.getPromptInputRect();
        await ws.sendClickEvent(rect!.left + rect.width / 2, rect!.top + rect.height / 2);
    
        await ws.execJs(
            `document.querySelector("rich-textarea p").innerText="";`
        )

        await sleep(200);
        await webview!.insertText(prompt);
        
    }
    async onPrompt(prompt: string, image?: string) {
        const ws = new WebviewService(this.tabId);
        const webview = await ws.waitwebviewIsReady();
        const rect = await this.getPromptInputRect();
        showGlobalLoading(true)
        await ws.sendClickEvent(rect!.left + rect.width / 2, rect!.top + rect.height / 2);
    
        if (image) {
            if (image.startsWith('http') || image.startsWith('blob:http') || image.startsWith('data')) {
                let imgBlob;
                if (image.startsWith('data')) {
                    imgBlob = base64ToBlob(image);
                } else {
                    imgBlob = await urlToBlob(image);
                }
                if (imgBlob) {
                    await copyImageToClipboard(imgBlob);
                    await sleep(200);
                    webview!.paste();
                }
            }
        }
    
        await ws.execJs(
            `document.querySelector("rich-textarea p").innerText="";`
        )
        await sleep(200);
        await webview!.insertText(prompt);
        await sleep(200);
        
        const rect1 = (await ws.waitForExecJsResult(
            `const sendBtn = document.querySelector(".send-button")
            const isDisabled = sendBtn.getAttribute("aria-disabled") === "true";
    
            const rect = sendBtn.getBoundingClientRect();
            if(!isDisabled){
                return {top:rect.top,left:rect.left,width:rect.width,height:rect.height,isDisabled}
            }`,
            0
        )) as any;
        console.log('send-button', rect1);
        await ws.sendClickEvent(rect1!.left + rect1.width / 2, rect1!.top + rect1.height / 2);
        showGlobalLoading(false)
        return true;
    };

    override async checkWebviewIsReady() {
        const rect= await this.getPromptInputRect(15000)
        this.setIsReady(!!rect);
        return !!rect;
    }
}
