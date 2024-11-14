import { deepDiff, useLocalStorageState, useSessionStorageState } from '@web3-explorer/utils';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import WebviewMainEventService from '../services/WebviewMainEventService';
import { AccountPublic, SUB_WIN_ID } from '../types';
import { BrowserTab, useBrowserContext } from './BrowserProvider';

export function isPlaygroundMaster() {
    return location.hash === `#${SUB_WIN_ID.PLAYGROUND}`;
}

export function getWinId() {
    return location.hash.replace('#', '');
}

interface AppContextType {
    currentTabId: string;
    showGameListDrawer: boolean;
    onShowGameListDrawer: (v: boolean) => void;
    tab: BrowserTab | undefined;
    windowStatus: Map<number, boolean>;
    getWindowStatus: (
        accounts: AccountPublic[],
        delay?: number
    ) => Promise<null | Map<number, boolean>>;
    onChangeWindowStatus: (status: Map<number, boolean>) => void;
    currentAccount: AccountPublic | null;
    screenCopyVisible: boolean;
    showScreenCopy: (v: boolean) => void;

    accounts: AccountPublic[];
    saveAccounts: (accounts: AccountPublic[]) => void;
    switchCurrentAccount: (account: AccountPublic) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const PlaygroundProvider = (props: { children: ReactNode }) => {
    const { children } = props || {};
    const [windowStatus, setWindowStatus] = useState<Map<number, boolean>>(new Map());
    const { currentTabId, newTab, browserTabs } = useBrowserContext();
    const uri = new URL(location.href);
    const initMessage = uri.searchParams.get('initMessage');
    let account = null;
    let tabInit: BrowserTab | null = null;
    if (initMessage) {
        const res = JSON.parse(Buffer.from(initMessage, 'hex').toString());
        if (res) {
            tabInit = res.tab as BrowserTab;
            account = res.account;
        }
    }
    useEffect(() => {
        if (tabInit) {
            newTab(tabInit);
        }
    }, []);

    const [showGameListDrawer, setShowGameListDrawer] = useState<boolean>(false);

    const [accounts, setAccounts] = useLocalStorageState<AccountPublic[]>('accounts', []);
    const [screenCopyVisible, setScreenCopyVisible] = useState(false);
    const [currentAccount, setCurrentAccount] = useSessionStorageState<AccountPublic | null>(
        'currentAccount',
        account
    );
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

    const tab = tabInit || browserTabs.get(currentTabId);
    // console.log({ tab, tabInit });
    // console.log(
    //     {
    //         tab,
    //         initMessage,
    //         browserTabs,
    //         currentTabId,
    //         tabInit,
    //         account,
    //         currentAccount
    //     },
    //     browserTabs.size
    // );

    return (
        <AppContext.Provider
            value={{
                onShowGameListDrawer,
                showGameListDrawer,
                getWindowStatus,
                onChangeWindowStatus,
                windowStatus,
                currentTabId,
                tab,
                currentAccount,
                showScreenCopy,
                screenCopyVisible,
                switchCurrentAccount,
                saveAccounts,
                accounts
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
