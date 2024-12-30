import { deepDiff, useLocalStorageState, useSessionStorageState } from '@web3-explorer/utils';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { onAction } from '../common/electron';
import { getWinId, isPlaygroundMaster } from '../common/helpers';
import { T_ME_WEB, TELEGRAME_WEB } from '../constant';
import WebviewMainEventService from '../services/WebviewMainEventService';
import { AccountPublic, PlaygroundMasterSideAction } from '../types';
import { BrowserTab, useBrowserContext } from './BrowserProvider';
import { useIAppContext } from './IAppProvider';

interface AppContextType {
    currentTabId: string;
    showCodeDrawer: boolean;
    showGameListDrawer: boolean;
    tab: BrowserTab;
    windowStatus: Map<number, boolean>;
    currentAccount: AccountPublic;
    screenCopyVisible: boolean;
    currentExtension: ExtensionType;
    currentRecoAreaImage: string;
    accounts: AccountPublic[];
    showMobile: boolean;
    playgroundMasterSideAction: PlaygroundMasterSideAction;
    onChangePlaygroundMasterSideAction: (v: PlaygroundMasterSideAction) => void;
    onShowMobile: (v: boolean) => void;
    onChangeCurrentRecoAreaImage: (v: string) => void;
    onShowCodeDrawer: (v: boolean) => void;
    onShowGameListDrawer: (v: boolean) => void;
    getWindowStatus: (
        accounts: AccountPublic[],
        delay?: number
    ) => Promise<null | Map<number, boolean>>;
    onChangeWindowStatus: (status: Map<number, boolean>) => void;
    onChangeCurrentExtension: (v: ExtensionType) => void;
    showScreenCopy: (v: boolean) => void;
    saveAccounts: (accounts: AccountPublic[]) => void;
    switchCurrentAccount: (account: AccountPublic) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function getRecoId(tab: Partial<BrowserTab>, account: AccountPublic) {
    return `${tab.tabId}-${account?.id}-${account?.index}`;
}

export function isTelegramWeb(url: string) {
    let res = false;
    if (url.startsWith(TELEGRAME_WEB)) {
        res = true;
    }
    return res;
}

export function isDeviceMonitor(tab: Partial<BrowserTab>) {
    let res = false;
    if (!tab.url) {
        return res;
    }
    if (tab.url && tab.url.endsWith('#DeviceMonitor')) {
        res = true;
    }
    return res;
}

export function isTelegramTab(tab: BrowserTab) {
    let res = false;
    if (!tab.url) {
        return res;
    }
    if (tab.twa || isTelegramWeb(tab.url) || tab.url.startsWith(T_ME_WEB)) {
        res = true;
    }
    return res;
}

export enum ExtensionType {
    NULL = 'NULL',
    GEMINI = 'GEMINI',
    JS_CODE = 'JS_CODE',
    DECISION = 'DECISION',
    CRONTAB = 'CRONTAB',
    MARKET = 'MARKET',
    EXTENSION_CENTER = 'EXTENSION_CENTER'
}

export const PlaygroundProvider = (props: { children: ReactNode }) => {
    const { children } = props || {};
    const { env } = useIAppContext();
    const [playgroundMasterSideAction, setPlaygroundMasterSideAction] =
        useLocalStorageState<PlaygroundMasterSideAction>(
            'selectedSideAction',
            PlaygroundMasterSideAction.FEATURE
        );
    const [windowStatus, setWindowStatus] = useState<Map<number, boolean>>(new Map());
    const { currentTabId, newTab, browserTabs } = useBrowserContext();
    const uri = new URL(location.href);
    const initMessage = uri.searchParams.get('initMessage');
    let account = null;
    let tabInit: BrowserTab | null = null;
    if (initMessage && !isPlaygroundMaster()) {
        const res = JSON.parse(Buffer.from(initMessage, 'hex').toString());
        if (res) {
            tabInit = res.tab as BrowserTab;
            const tab = browserTabs.get(tabInit.tabId);
            if (!tabInit.icon && tab?.icon) {
                tabInit.icon = tab?.icon;
            }
            account = res.account;
        }
    }
    let showMobileInit = !!tabInit?.twa;
    if (
        tabInit &&
        tabInit.url &&
        (tabInit.url.indexOf(TELEGRAME_WEB) > -1 ||
            tabInit.url.indexOf('t.me/') > -1 ||
            isDeviceMonitor(tabInit))
    ) {
        showMobileInit = true;
    }
    const [showMobile, setShowMobile] = useSessionStorageState<boolean>(
        'showMobile_' + (account?.id || '1') + (account?.index || '1') + (tabInit?.tabId || ''),
        showMobileInit
    );
    const [currentExtension, setCurrentExtension] = useLocalStorageState<ExtensionType>(
        'currentExtension_' +
            (account?.id || '1') +
            (account?.index || '1') +
            (tabInit?.tabId || ''),
        ExtensionType.NULL
    );

    useEffect(() => {
        if (tabInit) {
            newTab({
                ...tabInit
            });
        }
    }, []);

    const [showGameListDrawer, setShowGameListDrawer] = useState<boolean>(false);
    const [showCodeDrawer, setShowCodeDrawer] = useState<boolean>(false);

    const [accounts, setAccounts] = useLocalStorageState<AccountPublic[]>('accounts', []);
    const [screenCopyVisible, setScreenCopyVisible] = useState(false);
    const [currentAccount, setCurrentAccount] = useSessionStorageState<AccountPublic>(
        'currentAccount',
        account
    );
    const [currentRecoAreaImage, setCurrentRecoAreaImage] = useState('');

    function onChangePlaygroundMasterSideAction(v: PlaygroundMasterSideAction) {
        setPlaygroundMasterSideAction(v);
    }
    function onChangeCurrentRecoAreaImage(v: string) {
        setCurrentRecoAreaImage(v);
    }

    function onShowMobile(v: boolean) {
        setShowMobile(v);
    }
    function onShowCodeDrawer(v: boolean) {
        setShowCodeDrawer(v);
    }
    function getWindowStatus(accounts: AccountPublic[], delay?: number) {
        return new Promise<null | Map<number, boolean>>(resolve => {
            setTimeout(() => {
                if (tab) {
                    new WebviewMainEventService()
                        .getWindowStatus(accounts, tab.tabId)
                        .then(v => {
                            setWindowStatus(() => v);
                            resolve(v);
                        })
                        .catch(e => resolve(null));
                } else {
                    resolve(null);
                }
            }, delay || 0);
        });
    }
    const onChangeWindowStatus = (status: Map<number, boolean>) => {
        setWindowStatus(() => status);
    };
    const switchCurrentAccount = (account: AccountPublic) => {
        setCurrentAccount(() => account);
    };
    const saveAccounts = (accounts: AccountPublic[]) => {
        setAccounts(rows => {
            if (deepDiff(rows, accounts)) {
                return accounts;
            }
            return rows;
        });
    };
    const showScreenCopy = (v: boolean) => {
        setScreenCopyVisible(v);
    };
    const onShowGameListDrawer = (v: boolean) => {
        setShowGameListDrawer(v);
    };

    const onChangeCurrentExtension = (v: ExtensionType) => {
        debugger;
        if (showMobile) {
            onAction('getBounds', { winId: getWinId() })?.then(r => {
                let { x } = r as { x: number };
                const { screen } = window;
                const width = v === ExtensionType.NULL ? 368 : 368 * 2;
                if (screen.width < x + width) {
                    x = screen.width - width;
                }
                onAction('setBounds', {
                    winId: getWinId(),
                    bounds: {
                        width,
                        x
                    },
                    animate: false
                });
            });
        }

        setCurrentExtension(v);
    };

    let tab = tabInit;
    if (isPlaygroundMaster()) {
        tab = browserTabs.get(currentTabId)!;
    }

    return (
        <AppContext.Provider
            value={{
                playgroundMasterSideAction,
                onChangePlaygroundMasterSideAction,
                currentRecoAreaImage,
                onChangeCurrentRecoAreaImage,
                onChangeCurrentExtension,
                currentExtension,
                onShowCodeDrawer,
                showCodeDrawer,
                onShowGameListDrawer,
                showGameListDrawer,
                getWindowStatus,
                onChangeWindowStatus,
                windowStatus,
                currentTabId,
                tab: tab!,
                currentAccount,
                showScreenCopy,
                screenCopyVisible,
                switchCurrentAccount,
                saveAccounts,
                accounts,
                showMobile,
                onShowMobile
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const usePlayground = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('usePlayground must be used within an PlaygroundProvider');
    }
    return context;
};
