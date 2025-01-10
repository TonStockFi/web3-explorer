
import { TelegramApiAction } from '@web3-explorer/lib-telegram';
import { showAlertMessage, showGlobalLoading } from '../common/helpers';
import { BOT_ID_EXTESSION_CENTER, SERVICE_ChatId } from '../constant';

import { addressToShortValue, formatTsToDate } from '../common/utils';
import { ExtenssionPublishData } from '../types';
import TelegramApiService from './TelegramApiService';
import WebviewServiceTelegram from './WebviewServiceTelegram';

export default class WebviewServiceTelegramExtenssion extends WebviewServiceTelegram {
    constructor(tabId: string) {
        super(tabId+"_tg")
    }
    async checkDolowdExt(){
        const {uri:{hash}} = this.getWebviewUrlUri()
        if(hash === `#${BOT_ID_EXTESSION_CENTER}`){
            const res = await this.onGetdownloadExt()
            return res;
        }
    }
    async onGetdownloadExt(){
        const file = await this.execJs(`return localStorage.getItem("extension_download")`)
        if(file){
            await this.execJs(`localStorage.removeItem("extension_download")`)
            const url = await this.execJs(`return localStorage.getItem("extension_download_url")`)
            if(url){
                await this.execJs(`localStorage.removeItem("extension_download_url")`)
                const res = await this.execJs(`const res = await fetch('${url}');
                    const text = await res.json();
                    return text
                    `)
                return res as ExtenssionPublishData
            }
        }
        // console.log("no ext file download")
        return null;
    }
    async publishExtension(extension:ExtenssionPublishData){
        const {desc,extensionId} = extension;
        const data = JSON.stringify(extension)
        const userId = await this.openExtensionCenter()
        if(!userId){
            return 
        }
        const api = new TelegramApiService(BOT_ID_EXTESSION_CENTER);
        const filename = `extension-${extensionId}.wet`;
        const fileType = 'text/plain';
        const caption = `
☝️☝️☝️ 
点击 上方文件进行安装
------------------------

ID: ${extension.extensionId}

⌚️ 创建时间: ${formatTsToDate(extension.createTs)}

♦️  当前版本: ${extension.version}

🧒 收款地址: ${addressToShortValue(extension.payAddress)}

💲 ${extension.amount > 0 ? `金额: ${extension.amount} TON`:"免费"}

------------------------

${desc}

`;

        await api.request(TelegramApiAction.PublishExtension, {
            chatId: userId,
            filename,
            data,
            fileType,
            caption
        });
    }
    async openExtensionCenter(){
        const isReady = await this.waitwebviewIsReady()
        if(!isReady){
            return showAlertMessage("请等待网页加载完成！")
        }

        const userId = await this.getAuthUserId()
        if(!userId){
            return showAlertMessage("请先登陆")
        }

        const {uri:{hash}} = this.getWebviewUrlUri()
        const chatId = BOT_ID_EXTESSION_CENTER
        if(hash !== `#${chatId}`){
            await this.goToTgChat(chatId)
        }else{
            showGlobalLoading(true,2)
        }
        await this.waitForExecJsResult(`return location.hash === "#${chatId}"`)
        const res = await this.waitForElemenBoundingClientRect(`#editable-message-text`);
        return res ? userId :false
    }
    

    async openServiceCenter(){
        const isReady = await this.waitwebviewIsReady()
        if(!isReady){
            return showAlertMessage("请等待网页加载完成！")
        }

        const userId = await this.getAuthUserId()
        if(!userId){
            return showAlertMessage("请先登陆")
        }

        const {uri:{hash}} = this.getWebviewUrlUri()
        
        const chatId = SERVICE_ChatId
        alert(2)
        if(hash !== `#${chatId}`){
            await this.goToTgChat(chatId)
        }else{
            showGlobalLoading(true,2)
        }
        await this.waitForExecJsResult(`return location.hash === "#${chatId}"`)
        const res = await this.waitForElemenBoundingClientRect(`#editable-message-text`);
        return res ? userId :false
    }
}
