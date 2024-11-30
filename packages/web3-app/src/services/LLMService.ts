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
}

export default class LLMService {
    tabId: string;
    indexedDb: IndexedDbCache;

    constructor(tabId:string) {
        this.indexedDb = LLMService.getIndexedDbCache(tabId);
        this.tabId = tabId;
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
        await this.__sendMessage(message);
    }

    async sendMessageWaitForReply(message: MessageLLM, timeout?: number) {
        await this.__sendMessage({
            ...message,
            prompt: message.prompt.trim(),
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
    async getAll():Promise<MessageLLM[]> {
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


    async emptyQueue() {
        const rows = await this.getAll();
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            await this.remove(row.id)
        }
    }

    async checkWebviewIsReady() {
        return false;
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
    
    
    async checIsReady(timeout:number = -1){
        return waitForResult(()=>{
            return this.getIsReady()
        },timeout)
    }
    setIsReady(ready: boolean) {
        localStorage.setItem('LLM_ready_' + this.tabId, ready ? '1' : '0');
        localStorage.setItem('LLM_ready_ts_'+ this.tabId, currentTs() + '');
    }

    getIsReady() {
        const r = localStorage.getItem('LLM_ready_' + this.tabId);
        return r === '1';
    }
}
