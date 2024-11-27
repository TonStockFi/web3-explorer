import { copyImageToClipboard } from '../common/image';
import { base64ToBlob, urlToBlob } from '../common/opencv';
import { sleep } from '../common/utils';
import LLMService from './LLMService';
import WebviewService from './WebviewService';

export default class LLMChatGptService extends LLMService {
    
    constructor(tabId:string) {
        super(tabId)
    }
    static getTabIdFromRecoId(recoId:string){
        return `${recoId}_chatgpt`
    }

    async getPromptInputRect(timeOut:number = -1){
        const ws = new WebviewService(this.tabId);
        await ws.waitwebviewIsReady()!;
        const rect = (await ws.waitForExecJsResult(
            `const textarea = document.querySelector("textarea")
        const parentDiv = textarea.parentElement;
        const rect = parentDiv.getBoundingClientRect();
        return {top:rect.top,left:rect.left,width:rect.width,height:rect.height}`,
            timeOut
        )) as any;
        return rect;
    }

    async getSendButtonRect(timeOut:number = -1){
        const ws = new WebviewService(this.tabId);
        await ws.waitwebviewIsReady()!;
        return ws.waitForElemenBoundingClientRect("[data-testid='send-button']",timeOut);
    }
    
    async onPrompt(prompt: string, image?: string) {
        const ws = new WebviewService(this.tabId);
        const webview = await ws.waitwebviewIsReady();
        const rect = await this.getPromptInputRect();
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
        
        await ws.execJs(`document.getElementById("prompt-textarea").innerText = ""`)
        await sleep(100);
        await webview!.insertText(prompt);
        await sleep(100);
        
        const rect1 = await ws.waitForElemenBoundingClientRect(`[data-testid='send-button']`)
        if(rect1){
            await ws.sendClickEvent(rect1!.left + rect1.width/2, rect1!.top + rect1.height / 2);
            return true;
        }else{
            return false
        }
    };

    override async checkWebviewIsReady() {
        const rect1 = this.getSendButtonRect(15000)
        const rect= this.getPromptInputRect(15000)
        const res = !!rect && !!rect1
        this.setIsReady(res);
        return res;
    }
}
