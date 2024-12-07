import { TelegramApiAction, TelegramApiPayload } from "@web3-explorer/lib-telegram";

export default class TelegramApiService {
    private botId: string;
    constructor(botId:string){
        this.botId = botId
    }
    async request(action:TelegramApiAction,payload:TelegramApiPayload){
        const apiHost = `https://telegram-bot.web3r.site/api`
        const response = await fetch(`${apiHost}/telegram-api/TelegramApiHandler`,{
            method:"POST",
            body:JSON.stringify({
                botId:this.botId,
                action,
                payload
            })
        });
        const res = (await response.json()) as any;
        return res
    }
    
}
