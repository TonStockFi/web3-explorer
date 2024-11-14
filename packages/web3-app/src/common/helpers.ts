import { DISCOVER_HOST, DISCOVER_HOST_DEV } from "../constant";
import { SUB_WIN_ID } from "../types";

export function getDiscoverHost(isDev: boolean) {
    if(isDev){
        return `${DISCOVER_HOST_DEV}?isDev=true`
    }else{
        return `${DISCOVER_HOST}?`
    }
}

export function getWinId() {
    return location.hash.replace('#', '');
}

export function isPlaygroundMaster() {
    return location.hash === `#${SUB_WIN_ID.PLAYGROUND}`;
}