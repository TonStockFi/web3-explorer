import { deepDiff, useLocalStorageState, useSessionStorageState } from '@web3-explorer/utils';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { onAction } from '../common/electron';
import { getWinId } from '../common/helpers';
import WebviewMainEventService from '../services/WebviewMainEventService';
import { AccountPublic } from '../types';
import { BrowserTab, useBrowserContext } from './BrowserProvider';
import { useIAppContext } from './IAppProvider';

interface AppContextType {
    currentTabId: string;
    showCodeDrawer: boolean;
    showGameListDrawer: boolean;
    tab: BrowserTab | undefined;
    windowStatus: Map<number, boolean>;
    currentAccount: AccountPublic | null;
    screenCopyVisible: boolean;
    currentExtension: ExtensionType;
    currentRecoAreaImage: string;
    accounts: AccountPublic[];
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

export enum ExtensionType {
    NULL = 'NULL',
    GEMINI = 'GEMINI',
    JS_CODE = 'JS_CODE',
    DECISION = 'DECISION'
}

export const PlaygroundProvider = (props: { children: ReactNode }) => {
    const { children } = props || {};
    const { env } = useIAppContext();
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

    const [currentExtension, setCurrentExtension] = useLocalStorageState<ExtensionType>(
        'currentExtension_' + (account?.id || '1') + '' + (account?.index || '1'),
        ExtensionType.NULL
    );

    useEffect(() => {
        if (tabInit) {
            newTab(tabInit);
        }
    }, []);

    const [showGameListDrawer, setShowGameListDrawer] = useState<boolean>(false);
    const [showCodeDrawer, setShowCodeDrawer] = useState<boolean>(false);

    const [accounts, setAccounts] = useLocalStorageState<AccountPublic[]>('accounts', []);
    const [screenCopyVisible, setScreenCopyVisible] = useState(false);
    const [currentAccount, setCurrentAccount] = useSessionStorageState<AccountPublic | null>(
        'currentAccount',
        account
    );
    const [currentRecoAreaImage, setCurrentRecoAreaImage] = useState('');

    function onChangeCurrentRecoAreaImage(v: string) {
        setCurrentRecoAreaImage(v);
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
        onAction('getBounds', { winId: getWinId() })?.then(r => {
            let { x } = r as { x: number };
            const { workArea } = env;
            const width = v === ExtensionType.NULL ? 368 : 368 * 3;
            if (workArea.width < x + width) {
                x = workArea.width - width;
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
        setCurrentExtension(v);
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
