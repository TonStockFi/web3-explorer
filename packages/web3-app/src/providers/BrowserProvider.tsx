import { md5 } from '@web3-explorer/lib-crypto/dist/utils';
import { useSessionStorageState } from '@web3-explorer/utils';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DefaultTheme, useTheme } from 'styled-components';
import { currentTs } from '../common/utils';
import { getCurrentAccount } from '../components/webview/WebviewDiscoverApps';
import LLMService, { MessageLLM } from '../services/LLMService';
import WebviewMainEventService from '../services/WebviewMainEventService';
import { MAIN_NAV_TYPE } from '../types';
import { useIAppContext } from './IAppProvider';

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
    openTab: (tabId: string) => void;
    closeTab: (tabId: string) => void;
    tabs: BrowserTab[];
    currentTabId: string;
    browserTabs: Map<string, BrowserTab>;
    t: (v: string) => string;
    theme: DefaultTheme;
    updateAt: number;

    sideWeb: null | SideWebProps;
    openSideWeb: (sideWeb: SideWebProps | null) => void;
}

export function formatTabIdByUrl(url: string) {
    const id = md5(url);
    const { hostname } = new URL(url);
    const hostName = hostname.replace(/\./g, '_');
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
    const theme = useTheme();
    const { children } = props || {};
    const { showWalletAside, env } = useIAppContext();
    const [sideWeb, setSideWeb] = useSessionStorageState<null | SideWebProps>('sideWeb', null);
    const [updateAt, setUpdateAt] = useState(currentTs());

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
                    if (event.message.action === 'onTgSiteSelectText') {
                        const { text } = event.message.payload as { text: string };

                        const prompt = `${t('PleaseTranslateTo').replace(
                            '%{lang}',
                            t(i18n.language)
                        )}: ${text}`;

                        const message = {
                            id: LLMService.genId(),
                            tabId: currentTabId,
                            ts: currentTs(),
                            prompt
                        };
                        new WebviewMainEventService().openLLMWindow({
                            site: 'ChatGpt',
                            message
                        });
                    } else {
                        window.dispatchEvent(
                            new CustomEvent(`onSiteMessage_${event.senderWebContentsId}`, {
                                detail: {
                                    message: event.message
                                }
                            })
                        );
                    }
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
            setTabs();
        }
    }, []);

    const openSideWeb = (sideWeb: SideWebProps | null) => {
        setSideWeb(sideWeb);
    };
    const setTabs = () => {
        const tabs = Array.from(BrowserTabs)
            .map(row => row[1])
            .filter(row => row.tabId !== MAIN_NAV_TYPE.GAME_FI)
            .filter(row => row.tabId !== MAIN_NAV_TYPE.DISCOVERY);
        if (tabs.length > 0) {
            tabs.sort((a, b) => a.ts - b.ts);
        }
        // Tabs = tabs;
    };

    const openUrl = async (url: string) => {
        const account = getCurrentAccount();
        if (!account) {
            ('account is null');
            return;
        }
        const ts = currentTs();
        const tabId = formatTabIdByUrl(url);
        const tab = {
            tabId,
            ts,
            url: url
        };

        new WebviewMainEventService().openPlaygroundWindow(tab, account, env);
    };

    const newTab = (tab: BrowserTab) => {
        const { tabId } = tab;
        setCurentTabId(tabId);
        showWalletAside(false);
        saveTab(tabId, tab);
        setUpdateAt(currentTs());
    };

    const saveTab = (tabId: string, tab: BrowserTab) => {
        BrowserTabs.set(tabId, tab);
        setTabs();
        setTimeout(async () => {
            localStorage.setItem('BrowserTabs', JSON.stringify(Array.from(BrowserTabs)));
        });
    };

    const editTab = (tab: BrowserTab) => {
        const { tabId } = tab;
        saveTab(tabId, tab);
        setUpdateAt(currentTs());
    };

    const openTab = (tabId: string | MAIN_NAV_TYPE) => {
        if (tabId === currentTabId) {
            return;
        }
        let tab = BrowserTabs.get(tabId);
        if (!tab) {
            const ts = currentTs();
            if (tabId === MAIN_NAV_TYPE.GAME_FI) {
                tab = {
                    tabId,
                    url: 'https://web.telegram.org/a/',
                    name: 'Games',
                    icon: 'SportsEsports',
                    ts
                };
            } else if (tabId === MAIN_NAV_TYPE.MARKET) {
                tab = {
                    tabId,
                    url: 'https://www.coingecko.com/',
                    ts,
                    name: 'Market'
                };
            } else if (tabId === MAIN_NAV_TYPE.CHATGPT) {
                tab = {
                    tabId,
                    url: 'https://chatgpt.com/',
                    ts,
                    name: 'ChatGpt'
                };
            } else {
                tab = {
                    tabId,
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
        const tabs = Array.from(BrowserTabs).map(row => row[1]);
        if (tabs.length === 0) {
            setCurentTabId(MAIN_NAV_TYPE.GAME_FI);
            setUpdateAt(currentTs());
            setTimeout(async () => {
                localStorage.setItem('BrowserTabs', JSON.stringify(Array.from(BrowserTabs)));
            });
        } else {
            if (currentTabId === tabId) {
                openTab(tabs[0].tabId);
            } else {
                setTabs();
                setUpdateAt(currentTs());
                setTimeout(async () => {
                    localStorage.setItem('BrowserTabs', JSON.stringify(Array.from(BrowserTabs)));
                });
            }
        }
    };

    return (
        <BrowserContext.Provider
            value={{
                tabs: Tabs,
                openUrl,
                saveTab,
                addTab,
                currentTabId,
                newTab,
                openTab,
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
