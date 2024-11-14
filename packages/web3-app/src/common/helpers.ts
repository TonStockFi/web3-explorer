import { DISCOVER_HOST, DISCOVER_HOST_DEV } from "../constant";

export function getDiscoverHost(isDev: boolean) {
    if(isDev){
        return `${DISCOVER_HOST_DEV}?isDev=true`
    }else{
        return `${DISCOVER_HOST}?`
    }
}