let CacheMessageList: Map<string,{ message: string }[]> = new Map();

export default class LogService {
    tabId: string;
    prefix: string;

    constructor(tabId:string,prefix?:string){
        this.tabId = tabId
        this.prefix = `[${prefix}]` || "[>>>]"
    }
    getStorageKey(){
        const key = `console_${this.tabId}_${this.prefix}`
        return key;
    }
    addLog({message}:{message:string}){
        if (message.indexOf(`[${this.prefix}]`) > -1) {
            const max = 1000;
            const messageList = this.getLogs()
            CacheMessageList.set(this.getStorageKey(),messageList.length > max ? 
            [
                {message},
                ...messageList.slice(0,max)
            ]:
            [
                {message},
                ...messageList
            ])
        }
        
    }
    getLogs(){
        return CacheMessageList.get(this.getStorageKey()) || [];
    }

    clearLogs(){
        CacheMessageList.delete(this.getStorageKey())
    }
    

    static getConsoleLogMessage(tabId: string, suffix?: string) {
        const key = `console_${tabId}${suffix ? '_' + suffix : ''}`;
        const res = localStorage.getItem(key);
        return res ? JSON.parse(res) : [];
    }

    static clearConsoleLogMessage(tabId: string, suffix?: string) {
        const key = `console_${tabId}${suffix ? '_' + suffix : ''}`;
        localStorage.removeItem(key);
    }

}
