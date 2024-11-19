import { ConfirmationDialogProps } from '@web3-explorer/uikit-view/dist/View/types';
import { useLocalStorageState } from '@web3-explorer/utils';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

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
    showWalletAside: (v: boolean) => void;
    isMacNotFullScreen: boolean;
    onSelectToken: (v: string | 'ton') => void;
    walletAside: boolean;
    windowSize: { width: number; height: number };
    alert: undefined | AlertProps;
    confirm: undefined | ConfirmationDialogProps;
    backdrop: boolean;
    snackbar: undefined | { message: string };
    showBackdrop: (visible: boolean) => void;
    showSnackbar: (snackbar: boolean | SnackbarProps) => void;
    showAlert: (alert: AlertProps | boolean) => void;
    showConfirm: (confirm: ConfirmationDialogProps | boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const IAppProvider = (props: { children: ReactNode }) => {
    const { children } = props || {};

    const [selectedToken, setSelectedToken] = useLocalStorageState('selected_token', '');
    const [walletAside, setWalletAside] = useLocalStorageState('ui_walletAside', false);
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

    const showWalletAside = (visible: boolean) => setWalletAside(visible);
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
