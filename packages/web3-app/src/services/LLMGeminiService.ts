import { IndexedDbCache } from '@web3-explorer/utils';
import { v4 as uuidv4 } from 'uuid';
import { currentTs, waitForResult } from '../common/utils';
import { parseRecognitionCatId } from '../providers/RecognitionProvider';
import { CutAreaRect } from '../providers/ScreenshotProvider';
import JsCodeService from './JsCodeService';
import WebviewService from './WebviewService';


export interface MessageLLM {
    id: string;
    ts: number;
    tabId:string;
    accountId?: string;
    accountIndex?: number;
    winId?: string;
    prompt: string;
    ts1?: number;
    isFinished?: boolean;
    isRunning?: boolean;
    imageUrl?: string;
    cutArea?: CutAreaRect;
    reply?: string |any;
    formatResult?: string;
    isOnce?: Boolean;
}

export default class LLMGeminiService {
    tabId: string;

    indexedDb: IndexedDbCache;

    constructor(tabId:string) {
        this.indexedDb = LLMGeminiService.getIndexedDbCache(tabId);
        this.tabId = tabId;
    }
    static getTabIdFromRecoId(recoId:string){
        return `${recoId}_gemini`
    }

    static parseMasterTabIdFromTabId(tabId:string){
        const recoCatId = tabId.replace("_gemini","")
        try{
            return parseRecognitionCatId(recoCatId)
        }catch(e){
            return null
        }
        
    }
    static getIndexedDbCache(tabId:string) {
        return new IndexedDbCache().init(`llm/`+tabId);
    }
    static genId() {
        return uuidv4();
    }
    async fisnishMessage(id: string, reply: string | any) {
        const message = await this.get(id);
        if (message) {
            this.save(id, {
                ...message,
                reply,
                isFinished: true,
                isRunning: false
            });
        }
    }
    async pullMessage() {
        let messages = await this.getAll();
        if (messages.length > 0) {
            messages.sort((a,b)=>a.ts-b.ts)
            if(messages[0].isRunning || messages[0].isFinished){
                return null
            }
            return messages[0];
        } 
        return null;
    }

    async sendMessageOnce(message: MessageLLM) {
        await this.__sendMessage({
            ...message,
            isOnce: true
        });
    }

    async sendMessageWaitForReply(message: MessageLLM, timeout?: number) {
        await this.__sendMessage({
            ...message,
            prompt: message.prompt.trim(),
            isOnce: false
        });
        const newMessage = await this.waitForReply(message.id, timeout);
        await this.remove(message.id);
        return {
            ...message,
            ...newMessage
        };
    }
    private async __sendMessage(message: MessageLLM) {
        await this.save(message.id, message);
    }

    async waitForReply(id: string, timeout: number = 3000): Promise<MessageLLM | null> {
        return await waitForResult(async ()=>{
            const message = await this.get(id);
            if (message && message.isFinished) {
                return message;
            }else{
                return null;
            }
        },timeout)
    }
    async getAll() {
        try {
            return await this.indexedDb.getAll();
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async get(id: string): Promise<MessageLLM | null> {
        try {
            const res = await this.indexedDb.get(`${id}`);
            return res || null;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async save(id: string, data: MessageLLM) {
        await this.indexedDb.put(`${id}`, data);
        return data;
    }

    async remove(id: string) {
        await this.indexedDb.delete(`${id}`);
    }

    async checkGeminiWebviewIsReady() {
        const ws = new WebviewService(this.tabId);
        await ws.waitwebviewIsReady(15000);
        const rect = (await ws.waitForExecJsResult(
            `const textarea = document.querySelector("rich-textarea");
                    if (!textarea) return null;
                    const rect = textarea.getBoundingClientRect()
                    return {top:rect.top,left:rect.left,width:rect.width,height:rect.height};`,
            15000
        )) as any;
        this.setGeminiIsReady(!!rect);
        return !!rect;
    }

    async waitWebviewMessageReply(message: MessageLLM) {
        const ws = new WebviewService(this.tabId);
        console.log("waitWebviewMessageReply",message.id)
        await ws.waitwebviewIsReady();
        let {formatResult} = message
        formatResult = formatResult?.replace(/MESSAGE_ID/g,message.id)
        
        const res = (await ws.waitForExecJsResult(
            `${JsCodeService.formatCode(formatResult!)}`,
            60000,
            1000
        )) as any;
        console.log("waitWebviewMessageReply res",message.id)
        return res;
    }
    async checkGeminiIsReady(timeout:number = -1){
        return waitForResult(()=>{
            return this.getGeminiIsReady()
        },timeout)
    }
    setGeminiIsReady(ready: boolean) {
        localStorage.setItem('LLM_ready_' + this.tabId, ready ? '1' : '0');
        localStorage.setItem('LLM_ready_ts_'+ this.tabId, currentTs() + '');
    }

    getGeminiIsReady() {
        const r = localStorage.getItem('LLM_ready_' + this.tabId);
        return r === '1';
    }
}
