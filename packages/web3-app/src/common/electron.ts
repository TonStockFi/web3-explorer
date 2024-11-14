import { SUB_WIN_ID } from '../types';
import { currentTs } from './utils';

export function onAction(action: string, payload?: any, webContentsId?:number) {
    if (!window.backgroundApi) {
        console.warn('backgroundApi is null');
        return null;
    }
    const value =  payload || {}
    if(!value.payload){
        value.payload = {}
    }
    value.payload.__msg_id =  currentTs()
    return window.backgroundApi.message({
        king: 'onAction',
        payload: {
            webContentsId,
            action: action,
            value
        }
    });
}

export function openWindow(payload: { openDevTools?:boolean;url: string; windowOptions: any; winId: string |SUB_WIN_ID }) {
    return onAction('openWindow', payload);
}

export function sendToSubWin(toWinId: SUB_WIN_ID |string, action: string, payload: any) {
    return onAction('subWin', {
        toWinId,
        action,
        payload
    });
}
