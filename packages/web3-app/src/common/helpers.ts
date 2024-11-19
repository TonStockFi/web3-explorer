import { MenuProps } from "@mui/material/Menu/Menu";
import { DISCOVER_HOST, DISCOVER_HOST_DEV } from "../constant";
import { RoiInfo } from "../services/RoiService";
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
export function getDropdownMenuOptions(id:string){
    return {
        id,
        anchorOrigin:{
            vertical: 'bottom',
            horizontal: 'right'
        },
        transformOrigin:{
            vertical: 'top',
            horizontal: 'right'
        },
        MenuListProps:{
            'aria-labelledby': 'fade-button'
        }
    } as Partial<MenuProps>
}
export const sortPriority = (a: RoiInfo, b: RoiInfo) => b.priority - a.priority;
