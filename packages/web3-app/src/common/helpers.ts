import { MenuProps } from '@mui/material/Menu/Menu';
import {
    DISCOVER_HOST,
    DISCOVER_HOST_DEV,
    PLAYGROUND_WEBVIEW_HEIGHT,
    PLAYGROUND_WEBVIEW_WIDTH,
    TELEGRAME_WEB
} from '../constant';

import { md5 } from '@web3-explorer/lib-crypto/dist/utils';
import { v4 as uuidv4 } from 'uuid';
import { BrowserTab } from '../providers/BrowserProvider';
import { DeviceInfo, RoiInfo, SUB_WIN_ID } from '../types';
import { isValidDomain } from './utils';

export function genId() {
    return uuidv4();
}

export function getPlaygroundScreenSize(tab: BrowserTab) {
    let width = `${PLAYGROUND_WEBVIEW_WIDTH}px`;
    let height = `${PLAYGROUND_WEBVIEW_HEIGHT}px`;
    if (!tab.twa) {
        width = 'calc(100% - 8px)';
        height = 'calc(100% - 4px)';
    }
    return { width, height };
}

export function getDiscoverHost(isDev: boolean, version?: string) {
    const lang = localStorage.getItem("i18nextLng")
    if (false) {
        return `${DISCOVER_HOST_DEV}?isDev=true&version=${version || ''}&lang=${lang || ''}`;
    } else {
        return `${DISCOVER_HOST}?version=${version || ''}&lang=${lang || ''}`;
    }
}

export function showAlertMessage(message: string, hideGlobalLoading?: boolean) {
    if (hideGlobalLoading) {
        showGlobalLoading(false);
    }
    window.dispatchEvent(
        new CustomEvent('showAlertMessage', {
            detail: {
                message
            }
        })
    );
}

export function showGlobalLoading(visible: boolean, delay: number = 0) {
    if (visible) {
        window.dispatchEvent(
            new CustomEvent('showGlobalLoading', {
                detail: {
                    visible: true
                }
            })
        );
    }

    if (delay || !visible) {
        setTimeout(() => {
            window.dispatchEvent(
                new CustomEvent('showGlobalLoading', {
                    detail: {
                        visible: false
                    }
                })
            );
        }, delay * 1000);
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
export function getDropdownMenuOptions(id: string) {
    return {
        id,
        anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'right'
        },
        transformOrigin: {
            vertical: 'top',
            horizontal: 'right'
        },
        MenuListProps: {
            'aria-labelledby': 'fade-button'
        }
    } as Partial<MenuProps>;
}
export const sortPriority = (a: RoiInfo, b: RoiInfo) => b.priority - a.priority;

export function getTelegramChatUrl(chatId: string) {
    return `${TELEGRAME_WEB}#${chatId}`;
}

export function getAccountIdFromAccount(account: { id: string; index: number }) {
    return `${account.index}${md5(account.id + 'TON_WEB3' + account.id.substring(0, 4))}`;
}

export const goToUrlFromInput = (
    newUrl: string,
    openTabFromWebview: any,
    cb?: () => void
) => {
    newUrl = newUrl.trim();
    if (newUrl.startsWith('chrome://')) {
        return;
    }
    let url = newUrl
    if (!newUrl.startsWith('http')) {
        if (isValidDomain(newUrl)) {
            url = `https://${newUrl}`;
        } else {
            // `https://www.google.com/search?q=${encodeURIComponent(newUrl)}`
            url = `https://bing.com/search?q=${encodeURIComponent(
                newUrl
            )}`;
        }
    }
    openTabFromWebview({
        url,
        name: '',
        description: '',
        icon: ''
    });
    cb && cb();
};


export function deviceIsDesktopPlatform(device: Partial<DeviceInfo>) {
    return device.platform === 'darwin'  || 'win32' === device.platform;
}


export function deviceMacOsPlatform(device: Partial<DeviceInfo>) {
    return device.platform === 'darwin';
}

export function deviceWin32Platform(device: Partial<DeviceInfo>) {
    return device.platform === 'win32';
}