import TelegramApi from './TelegramApi';

export { TelegramApi };

export enum TelegramApiAction  {
    SendTextMessage="SendTextMessage",
    SendDocument="SendDocument",
    GetExtensionDecryptKey="GetExtensionDecryptKey",
    PublishExtension="PublishExtension",
}

export interface TelegramApi_GetExtensionDecryptKey{
    chatId: string
}

export interface TelegramApi_SendTextMessage{
    text: string, 
    chatId: string
}

export interface TelegramApi_SendDocument{
    chatId: string, 
    dataHex: string, 
    fileType?: string, 
    filename?: string, 
    caption?: string
}

export interface TelegramApi_PublishExtension{
    chatId: string, 
    data: string, 
    fileType?: string, 
    filename?: string, 
    caption?: string
}


export type TelegramApiPayload  = TelegramApi_PublishExtension| TelegramApi_SendDocument | TelegramApi_SendTextMessage
