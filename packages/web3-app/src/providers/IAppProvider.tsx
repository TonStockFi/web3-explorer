import { ConfirmationDialogProps } from '@web3-explorer/uikit-view/dist/View/types';
import { useLocalStorageState, useSessionStorageState } from '@web3-explorer/utils';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { CHAIN } from '../types';

interface SnackbarProps {
    message: string;
}

export interface AppEnv {
    bounds: { x: number; y: number; width: number; height: number };
    dirname: string;
    version: string;
    sessionPath: string;
    isFullScreen: boolean;
    ip: null | { adr: string; interfaceName: string };
    isMac: boolean;
    isWin: boolean;
    isDev: boolean;
    workAreaSize: { width: number; height: number };
    workArea: { x: number; y: number; width: number; height: number };
}

interface AlertProps {
    message: string;
    title?: string;
    cancelTxt?: string;
}

interface AppContextType {
    env: AppEnv;
    isFullScreen: boolean;
    selectedToken: string;
    isMacNotFullScreen: boolean;
    showWalletList: boolean;
    walletAside: boolean;
    showWallet: boolean;
    showChainList: boolean;
    currentChainCode: CHAIN;
    windowSize: { width: number; height: number };
    alert: undefined | AlertProps;
    confirm: undefined | ConfirmationDialogProps;
    backdrop: boolean;
    snackbar: undefined | { message: string };
    showWalletAside: (v: boolean) => void;
    onShowWalletList: (v: boolean) => void;
    onShowWallet: (v: boolean) => void;
    onSelectToken: (v: string | 'ton') => void;
    onShowChainList: (v: boolean) => void;
    onChangeCurrentChainCode: (v: CHAIN) => void;
    showBackdrop: (visible: boolean) => void;
    showSnackbar: (snackbar: boolean | SnackbarProps) => void;
    showAlert: (alert: AlertProps | boolean) => void;
    showConfirm: (confirm: ConfirmationDialogProps | boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const IAppProvider = (props: { children: ReactNode }) => {
    const { children } = props || {};

    const [selectedToken, setSelectedToken] = useLocalStorageState('selected_token', '');
    const [currentChainCode, setCurrentChainCode] = useLocalStorageState(
        'currentChainCode',
        CHAIN.TON
    );
    const [walletAside, setWalletAside] = useSessionStorageState('ui_walletAside', false);
    const [showWallet, setShowWallet] = useSessionStorageState('showWallet', false);
    const [showChainList, setShowChainList] = useSessionStorageState('showChainList', false);
    const [showWalletList, setShowWalletList] = useSessionStorageState('showWalletList', false);
    const [backdrop, setBackdrop] = useState(false);
    const [snackbar, setSnackbar] = useState<undefined | SnackbarProps>(undefined);
    const [alert, setAlert] = useState<undefined | AlertProps>(undefined);
    const [confirm, setConfirm] = useState<undefined | ConfirmationDialogProps>(undefined);
    const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    const [env, setEnv] = useState<AppEnv>({
        dirname: '',
        version: '0.0.0',
        sessionPath: '',
        isFullScreen: false,
        ip: null,
        isMac: false,
        isWin: false,
        isDev: false,
        workAreaSize: { width: 0, height: 0 },
        bounds: { x: 0, y: 0, width: 0, height: 0 },
        workArea: { x: 0, y: 0, width: 0, height: 0 }
    });

    const onSelectToken = (token: string | 'ton') => setSelectedToken(token);
    const onChangeCurrentChainCode = (v: CHAIN) => setCurrentChainCode(v);
    const onShowWallet = (visible: boolean) => {
        onShowWalletList(false);
        setShowWallet(visible);
    };
    const showWalletAside = (visible: boolean) => setWalletAside(visible);
    const onShowWalletList = (visible: boolean) => setShowWalletList(visible);
    const onShowChainList = (visible: boolean) => setShowChainList(visible);
    const showBackdrop = (visible: boolean) => setBackdrop(visible);
    const showSnackbar = (v: boolean | SnackbarProps) =>
        setSnackbar(v ? (v as SnackbarProps) : undefined);
    const showAlert = (v: boolean | AlertProps) => setAlert(v ? (v as AlertProps) : undefined);
    const showConfirm = (v: boolean | ConfirmationDialogProps) =>
        setConfirm(v ? (v as ConfirmationDialogProps) : undefined);
    useEffect(() => {
        if (window.backgroundApi) {
            window.backgroundApi
                .message({
                    king: 'onAction',
                    payload: {
                        action: 'getEnv'
                    }
                })
                .then((v: any) => {
                    const uri = new URL(location.href);
                    const isDev = !!uri.searchParams.get('isDev');
                    setIsFullScreen(v.isFullScreen);
                    console.log('app env:', v, { isDev });

                    if (isDev) {
                        setEnv({
                            ...v,
                            isDev: true
                        });
                    } else {
                        setEnv(v);
                    }
                    setIsReady(true);
                });

            window.backgroundApi.onMainMessage(async (e: any) => {
                if (e.__msg_id) {
                    const flag = sessionStorage.getItem(String(e.__msg_id) + '1');
                    console.log('__msg_id', e.__msg_id, flag);
                    if (flag) {
                        return false;
                    }
                    sessionStorage.setItem(String(e.__msg_id) + '1', 'true');
                }
                if (e.action === 'onFullScreen') {
                    setIsFullScreen(e.payload.isFullScreen);
                    setEnv(env => {
                        return {
                            ...env,
                            isFullScreen: e.payload.isFullScreen
                        };
                    });
                }
            });
        }

        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
            if (!window.backgroundApi) {
                setIsReady(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    const isMacNotFullScreen = env.isMac && !env.isFullScreen;
    return (
        <AppContext.Provider
            value={{
                onChangeCurrentChainCode,
                currentChainCode,
                onShowChainList,
                showChainList,
                onShowWalletList,
                showWalletList,
                onShowWallet,
                showWallet,
                env,
                isMacNotFullScreen,
                showConfirm,
                confirm,
                isFullScreen,
                selectedToken,
                onSelectToken,
                showWalletAside,
                walletAside,
                alert,
                windowSize,
                showAlert,
                snackbar,
                showSnackbar,
                backdrop,
                showBackdrop
            }}
        >
            {!isReady ? null : children}
        </AppContext.Provider>
    );
};

export const useIAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useIAppContext must be used within an IAppProvider');
    }
    return context;
};
