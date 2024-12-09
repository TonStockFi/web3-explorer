import { MenuProps } from "@mui/material/Menu/Menu";
import { DISCOVER_HOST, DISCOVER_HOST_DEV } from "../constant";

import { v4 as uuidv4 } from 'uuid';
import { RoiInfo, SUB_WIN_ID } from "../types";

export function genId() {
    return uuidv4();
}
 
export function getDiscoverHost(isDev: boolean) {
    if(isDev){
        return `${DISCOVER_HOST_DEV}?isDev=true`
    }else{
        return `${DISCOVER_HOST}?`
    }
}
 
export function showAlertMessage(message:string,hideGlobalLoading?:boolean) {
    if(hideGlobalLoading){
        showGlobalLoading(false);   
    }
    window.dispatchEvent(new CustomEvent("showAlertMessage",{
        detail:{
            message
        }
    }))
}

export function showGlobalLoading(visible:boolean,delay:number  = 1) {
   
    if(!visible){
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent("showGlobalLoading",{
                detail:{
                    visible
                }
            }))
        }, delay * 1000);
    }else{
        window.dispatchEvent(new CustomEvent("showGlobalLoading",{
            detail:{
                visible
            }
        }))
    }
}

export function getWinId() {
    return location.hash.replace('#', '');
}

export function isPlaygroundMaster() {
    return location.hash === `#${SUB_WIN_ID.PLAYGROUND}`;
}

export function isPlaygroundWebApp() {
    return !isPlaygroundMaster() && location.hash.indexOf(`${SUB_WIN_ID.PLAYGROUND}_`) > -1;
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
