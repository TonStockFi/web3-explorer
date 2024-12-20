import { md5 } from '@web3-explorer/lib-crypto/dist/utils';
import { useLocalStorageState, useSessionStorageState } from '@web3-explorer/utils';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DefaultTheme, useTheme } from 'styled-components';
import { currentTs, getSessionCacheInfo } from '../common/utils';

import { LeftSideActions } from '../constant';
import { MessageLLM } from '../services/LLMService';
import WebviewMainEventService from '../services/WebviewMainEventService';
import { MAIN_NAV_TYPE, MainNavListItem, WebApp } from '../types';
import { useIAppContext } from './IAppProvider';
import { isTelegramTab } from './PlaygroundProvider';
import { useScreenshotContext } from './ScreenshotProvider';

export interface BrowserTab {
    tabId: string;
    ts: number;
    ts1?: number;
    iframeBaseUrl?: string;
    name?: string;
    icon?: string;
    url?: string;
    twa?: boolean;
}

export type SideWebType =
    | 'TRANS_CHATGPT'
    | 'TRANS_IMG_GEMINI'
    | 'RECO_IMG_GEMINI'
    | 'EXPLAIN_IMG_GEMINI'
    | 'TG_SAVE'
    | 'COMMON';

export type SideWebSite = 'ChatGpt' | 'Gemini' | 'Telegram' | 'Twitter' | 'Discord';

export interface SideWebProps {
    site: SideWebSite;
    message?: MessageLLM;
    type?: SideWebType;
    value?: string;
    imgData?: string;
    ts?: number;
}

interface BrowserContextType {
    addTab: () => void;
    openUrl: (url: string) => void;
    newTab: (tab: BrowserTab) => void;
    saveTab: (tabId: string, tab: BrowserTab) => void;
    editTab: (tab: BrowserTab) => void;
    openTab: (tabId: string, url?: string, icon?: string, name?: string) => void;
    closeTab: (tabId: string) => void;
    openTabFromWebview: (item: WebApp) => void;
    onChangeLeftSideActions: (v: MainNavListItem[]) => void;
    t: (v: string) => string;
    openSideWeb: (sideWeb: SideWebProps | null) => void;
    theme: DefaultTheme;
    updateAt: number;

    sideWeb: null | SideWebProps;
    leftSideActions: MainNavListItem[];
    tabs: BrowserTab[];
    currentTabId: string;
    browserTabs: Map<string, BrowserTab>;
}
export function isDiscoverTab(tabId: string) {
    return tabId === MAIN_NAV_TYPE.GAME_FI || tabId === MAIN_NAV_TYPE.DISCOVERY;
}
export function formatTabIdByUrl(url: string) {
    const id = md5(url);
    const { hostname } = new URL(url);
    const hostName = hostname.replace(/\./g, '');
    return `tab_${hostName}${id}`;
}

const BrowserContext = createContext<BrowserContextType | undefined>(undefined);

export const useBrowserContext = () => {
    const context = useContext(BrowserContext);
    if (!context) {
        throw new Error('useBrowserContext must be used within an IBrowserProvider');
    }
    return context;
};

export const BrowserTabs: Map<string, BrowserTab> = new Map();
let Tabs: BrowserTab[] = [];

export const IBrowserProvider = (props: { children: ReactNode }) => {
    const { t, i18n } = useTranslation();
    const { onCut } = useScreenshotContext();
    const theme = useTheme();
    const { children } = props || {};
    const { showWalletAside, env } = useIAppContext();
    const [sideWeb, setSideWeb] = useSessionStorageState<null | SideWebProps>('sideWeb', null);
    const [updateAt, setUpdateAt] = useState(currentTs());

    const [leftSideActions, setLeftSideActions] = useLocalStorageState<MainNavListItem[]>(
        'LeftSideActions_1',
        LeftSideActions
    );
    const [currentTabId, setCurentTabId] = useSessionStorageState<string>(
        'currentTabId',
        MAIN_NAV_TYPE.GAME_FI
    );

    useEffect(() => {
        if (window.backgroundApi) {
            window.backgroundApi.onSiteMessage(
                async (event: {
                    senderWebContentsId: number;
                    message: { action: string; payload?: Record<string, any> };
                }) => {
                    console.log(
                        '> _ET onSiteMessage',
                        event.message.action,
                        event.senderWebContentsId
                    );
                    // if (event.message.action === 'onTgSiteSelectText') {
                    //     const { text } = event.message.payload as { text: string };

                    //     const prompt = `${t('PleaseTranslateTo').replace(
                    //         '%{lang}',
                    //         t(i18n.language)
                    //     )}: ${text}`;

                    //     const message = {
                    //         id: LLMService.genId(),
                    //         tabId: currentTabId,
                    //         ts: currentTs(),
                    //         prompt
                    //     };
                    //     new WebviewMainEventService().openLLMWindow({
                    //         site: 'ChatGpt',
                    //         message
                    //     });
                    // }
                    window.dispatchEvent(
                        new CustomEvent(`onSiteMessage_${event.senderWebContentsId}`, {
                            detail: {
                                message: event.message
                            }
                        })
                    );
                }
            );
        }
        const res = localStorage.getItem('BrowserTabs');
        if (res) {
            const rows = JSON.parse(res);
            rows.forEach((row: any[]) => {
                BrowserTabs.set(row[0], row[1]);
            });
            setUpdateAt(currentTs());
        }
    }, []);

    const onChangeLeftSideActions = (actions: MainNavListItem[]) => {
        setLeftSideActions(actions);
    };
    const openSideWeb = (sideWeb: SideWebProps | null) => {
        setSideWeb(sideWeb);
    };

    const openTabFromWebview = (item: WebApp) => {
        const account = getSessionCacheInfo();

        const { id, url, ...item1 } = item;
        const ts = currentTs();
        const tabId = id ? `tab_${id}` : formatTabIdByUrl(url);
        const tab = {
            ...item1,
            url,
            tabId,
            ts
        };
        if (isTelegramTab(tab) || id) {
            new WebviewMainEventService().openPlaygroundWindow(tab, account, env);
        } else {
            openTab(tabId, tab.url, tab.icon);
        }
    };
    const openUrl = async (url: string) => {
        const account = getSessionCacheInfo();
        if (!account) {
            ('account is null');
            return;
        }
        const tabId = formatTabIdByUrl(url);
        openTab(tabId, url, '', '');
    };

    const newTab = (tab: BrowserTab) => {
        onCut(false);
        const { tabId } = tab;
        setCurentTabId(tabId);
        showWalletAside(false);
        saveTab(tabId, tab);
        setUpdateAt(currentTs());
    };

    const saveTab = (tabId: string, tab: BrowserTab) => {
        BrowserTabs.set(tabId, tab);
        setTimeout(async () => {
            localStorage.setItem('BrowserTabs', JSON.stringify(Array.from(BrowserTabs)));
        });
    };

    const editTab = (tab: BrowserTab) => {
        const { tabId } = tab;
        saveTab(tabId, tab);
        setUpdateAt(currentTs());
    };

    const openTab = (tabId: string | MAIN_NAV_TYPE, url?: string, icon?: string, name?: string) => {
        if (tabId === currentTabId) {
            return;
        }
        onCut(false);
        let tab = BrowserTabs.get(tabId);
        const ts = currentTs();
        if (!tab) {
            tab = {
                tabId,
                url,
                icon,
                name,
                ts
            };
            newTab(tab);
        } else {
            if (url) {
                tab = {
                    ...tab,
                    ts,
                    tabId,
                    name,
                    url,
                    icon
                };
            } else {
                tab = {
                    ...tab,
                    name,
                    ts
                };
            }
        }

        setCurentTabId(tabId);
        saveTab(tabId, tab);
        setUpdateAt(currentTs());
    };

    const addTab = () => {
        const tabs = Array.from(BrowserTabs).map(row => row[1]);
        const ts = currentTs();
        if (tabs.length > 0) {
            const r = tabs.find(tab => !tab.url);
            if (r) {
                openTab(r.tabId);
                return;
            }
        }
        newTab({
            tabId: `tab_${ts}`,
            ts
        });
    };
    const closeTab = (tabId: string) => {
        BrowserTabs.delete(tabId);
        onCut(false);
        const tabs = Array.from(BrowserTabs).map(row => row[1]);
        if (tabs.length === 0) {
            setCurentTabId(MAIN_NAV_TYPE.GAME_FI);
            setUpdateAt(currentTs());
            setTimeout(async () => {
                localStorage.setItem('BrowserTabs', JSON.stringify(Array.from(BrowserTabs)));
            });
        } else {
            if (currentTabId === tabId) {
                setCurentTabId(MAIN_NAV_TYPE.DISCOVERY);
            } else {
                setUpdateAt(currentTs());
            }
            setTimeout(async () => {
                localStorage.setItem('BrowserTabs', JSON.stringify(Array.from(BrowserTabs)));
            });
        }
    };

    return (
        <BrowserContext.Provider
            value={{
                onChangeLeftSideActions,
                leftSideActions,
                tabs: Tabs,
                openUrl,
                saveTab,
                addTab,
                currentTabId,
                newTab,
                openTab,
                openTabFromWebview,
                editTab,
                closeTab,
                browserTabs: BrowserTabs,
                t,
                sideWeb,
                openSideWeb,
                theme,
                updateAt
            }}
        >
            {children}
        </BrowserContext.Provider>
    );
};
