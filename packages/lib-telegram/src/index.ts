import TelegramApi from './TelegramApi';

export { TelegramApi };

export enum TaskId{
    INVITE = "INVITE",
    DAILY_SIGN = "DAILY_SIGN",
    FOLLOW_W3C_TG_BOT = "FOLLOW_W3C_TG_BOT",
    FOLLOW_W3C_X = "FOLLOW_W3C_X",
    FOLLOW_W3C_YOUTUBE = "FOLLOW_W3C_YOUTUBE",
    FOLLOW_W3C_TIKTOK = "FOLLOW_W3C_TIKTOK",
    LOGIN_W3C_GMAIL = "FOLLOW_W3C_GMAIL",
    LOGIN_W3C_GEMINI = "FOLLOW_W3C_GEMINI",
    LOGIN_W3C_CHATGPT = "FOLLOW_W3C_CHATGPT",
}

export interface TaskItem {
    taskId: TaskId;
    title: string;
    icon?: string;
    iconUrl?: string;
    tmaOnly?: boolean;
    desktopOnly?: boolean;
    rewardW3C?: number;
    rewardPoints?: number;
}

export interface TaskClaimedItem {
    task_id: TaskId;
    user_id: string;
    status: string;
}

export interface TgUserPublic {
    id: number;
    first_name: string;
    last_name: string;
    language_code: 'en' | string;
    allows_write_to_pm: boolean;
    photo_url: string;
}

export enum TelegramApiAction {
    ClaimAirdrop ='ClaimAirdrop',
    BindAccountId = 'BindAccountId',
    GetBotUserInfo = 'GetBotUserInfo',
    DailyCheckIn = 'DailyCheckIn',
    PlaySpin = 'PlaySpin',
    GetTasks = 'GetTasks',
    SendTextMessage = 'SendTextMessage',
    SendDocument = 'SendDocument',
    GetExtensionDecryptKey = 'GetExtensionDecryptKey',
    PublishExtension = 'PublishExtension',
    GetExtPassword = 'GetExtPassword'
}

export interface TelegramApi_BindAccountId {
    userId: string;
    accountId:string,
}

export interface TelegramApi_ClaimAirdrop {
    userId?: string;
    accountId?:string,
    taskId: TaskId,
}

export interface TelegramApi_GetBotUserInfo {
    userId: string;
    user:TgUserPublic,
    startParam?:string
}

export interface TelegramApi_GetTasks {
    userId?: string;
    accountId?:string,
}

export interface TelegramApi_PlaySpin {
    userId: string;
}


export interface TelegramApi_DailyCheckIn {
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
    | TelegramApi_BindAccountId
    | TelegramApi_PlaySpin
    | TelegramApi_GetTasks
    | TelegramApi_GetBotUserInfo
    | TelegramApi_GetExtPassword
    | TelegramApi_PublishExtension
    | TelegramApi_SendDocument
    | TelegramApi_SendTextMessage;

