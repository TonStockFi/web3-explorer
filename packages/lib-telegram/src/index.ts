import TelegramApi from './TelegramApi';

export { TelegramApi };

export enum TelegramApiAction {
    GetBotUserInfo = 'GetBotUserInfo',
    PlaySpin = 'PlaySpin',
    SendTextMessage = 'SendTextMessage',
    SendDocument = 'SendDocument',
    GetExtensionDecryptKey = 'GetExtensionDecryptKey',
    PublishExtension = 'PublishExtension',
    GetExtPassword = 'GetExtPassword'
}

export interface TelegramApi_GetBotUserInfo {
    userId: string;
}

export interface TelegramApi_PlaySpin {
    userId: string;
}

export interface TelegramApi_GetExtensionDecryptKey {
    chatId: string;
}

export interface TelegramApi_SendTextMessage {
    text: string;
    chatId: string;
}

export interface TelegramApi_SendDocument {
    chatId: string;
    dataHex: string;
    fileType?: string;
    filename?: string;
    caption?: string;
}

export interface TelegramApi_PublishExtension {
    chatId: string;
    data: string;
    fileType?: string;
    filename?: string;
    caption?: string;
}

export interface TelegramApi_GetExtPassword {
    extensionId: string;
    createTs: number;
}

export type TelegramApiPayload =
    | TelegramApi_PlaySpin
    | TelegramApi_GetBotUserInfo
    | TelegramApi_GetExtPassword
    | TelegramApi_PublishExtension
    | TelegramApi_SendDocument
    | TelegramApi_SendTextMessage;
