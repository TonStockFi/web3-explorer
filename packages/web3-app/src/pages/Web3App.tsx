import { View } from '@web3-explorer/uikit-view';
import { AppRegionDrag } from '../components/AppRegionDrag';
import { GlobalUi } from '../components/GlobalUi';
import { IBrowserProvider, useBrowserContext } from '../providers/BrowserProvider';
import { MAIN_NAV_TYPE } from '../types';
import DashboardPage from './Dashboard/DashboardPage';

import { SideBarVert } from '../components/app/SideBarVert';
import { TopBar } from '../components/app/TopBar';
import { HomHeaderHeight, SiderBarWidth } from '../constant';
import { FavorProvider } from '../providers/FavorProvider';
import { useIAppContext } from '../providers/IAppProvider';

import { AccountMAM } from '@tonkeeper/core/dist/entries/account';
import { useActiveAccount, useMutateActiveTonWallet } from '@tonkeeper/uikit/dist/state/wallet';
import { useEffect } from 'react';
import { onAction } from '../common/electron';
import { TitleBarControlView } from '../components/app/TitleBarControlView';
import { ProHandler } from '../components/ProHandler';
import { ControlsView } from '../components/webview/ControlsView';
import { useAccountInfo, usePublicAccountsInfo } from '../hooks/wallets';
import { PlaygroundProvider } from '../providers/PlaygroundProvider';
import { ProProvider, usePro } from '../providers/ProProvider';
import { RecognitionProvider } from '../providers/RecognitionProvider';
import { ScreenshotProvider } from '../providers/ScreenshotProvider';
import { Web3AppThemeWrpper } from '../providers/Web3AppThemeWrpper';
import ProService from '../services/ProService';
import DevView from './DevView';
import { BrowserFavorPage } from './Discover/BrowserFavorPage';
import { BrowserHistoryPage } from './Discover/BrowserHistoryPage';
import { WebviewPage } from './Discover/WebviewPage';
import { ManageAccountsPage } from './Preferences/ManageAccountsPage';
import { ConnectedAppsPage } from './Wallet/connect/ConnectedAppsPage';
import { DesktopMultiSendFormPage } from './Wallet/multi-send/MultiSendFormPage';
import { WalletPage } from './Wallet/WalletPage';

function Pages() {
    let { currentTabId, openTab } = useBrowserContext();
    const mainNavType = currentTabId as MAIN_NAV_TYPE;
    return (
        <>
            <View wh100p hide={mainNavType !== MAIN_NAV_TYPE.WALLET}>
                <WalletPage />
            </View>
            <View wh100p hide={mainNavType !== MAIN_NAV_TYPE.MULTI_SEND}>
                <DesktopMultiSendFormPage />
            </View>
            <View wh100p hide={mainNavType !== MAIN_NAV_TYPE.DASHBOARD}>
                <DashboardPage />
            </View>
            <View wh100p hide={mainNavType !== MAIN_NAV_TYPE.DEV}>
                <DevView />
            </View>
            <View wh100p hide={mainNavType !== MAIN_NAV_TYPE.ACCOUNTS_MANAGE}>
                <ManageAccountsPage />
            </View>

            <View wh100p displayNone={!currentTabId.startsWith('tab')}>
                <WebviewPage />
            </View>

            <View wh100p hide={mainNavType !== MAIN_NAV_TYPE.BROWSER_HISTORY}>
                <BrowserHistoryPage />
            </View>
            <View wh100p hide={mainNavType !== MAIN_NAV_TYPE.CONNECTED_APPS}>
                <ConnectedAppsPage />
            </View>
            <View wh100p hide={mainNavType !== MAIN_NAV_TYPE.FAVOR}>
                <BrowserFavorPage />
            </View>
        </>
    );
}

export function MainMessageDispatcher() {
    const { onShowProBuyDialog } = usePro();
    const accounts = usePublicAccountsInfo();
    const { id: accountId } = useAccountInfo();
    const activeAcount = useActiveAccount();
    const { mutateAsync: setActiveAccount } = useMutateActiveTonWallet();

    useEffect(() => {
        window.backgroundApi &&
            window.backgroundApi.onMainMessage(async (e: any) => {
                if (e.action === 'onPayPro') {
                    onShowProBuyDialog(true);
                }
                if (e.action === 'changeAccount') {
                    const { accountIndex } = e.payload;
                    if (activeAcount.type === 'mam') {
                        const { derivations } = activeAcount as AccountMAM;
                        const account = derivations.find(row => row.index === accountIndex);
                        if (account) {
                            setActiveAccount(account.activeTonWalletId);
                        }
                    }
                }

                if (e.action === 'getProInfo') {
                    const proInfoList = await new ProService(accountId).getAll();
                    onAction('subWin', {
                        toWinId: e.fromWinId,
                        action: 'updateProInfo',
                        payload: {
                            proInfoList
                        }
                    });
                }
                if (e.action === 'getAccountsPublic') {
                    onAction('subWin', {
                        fromWinId: 'main',
                        toWinId: e.fromWinId,
                        action: 'accountsPublic',
                        payload: { accounts }
                    });
                }
            });
    }, []);

    return null;
}
export const Web3AppInner = () => {
    const { env, isFullScreen } = useIAppContext();
    const { theme, t, currentTabId } = useBrowserContext();
    let topLeft = 0;

    if (env.isMac && !isFullScreen) {
        topLeft = 80;
    }
    if (env.isMac && isFullScreen) {
        topLeft = 54;
    }
    if (env.isWin) {
        topLeft = 80;
    }

    return (
        <View
            bgColor={theme.backgroundBrowser}
            borderBox
            sx={{
                color: theme.textPrimary
            }}
            wh100p
        >
            <AppRegionDrag />
            <SideBarVert />
            <TitleBarControlView main />
            <View
                borderBox
                sx={{
                    transition: 'left 0.2s ease'
                }}
                userSelectNone
                abs
                top0
                right0
                height={HomHeaderHeight}
                left={topLeft}
            >
                <TopBar />
            </View>
            <View
                absFull
                sx={{
                    transition: 'left 0.2s ease'
                }}
                left={SiderBarWidth}
                top={HomHeaderHeight}
                right={0}
            >
                <Pages />
                {currentTabId && <ControlsView tabId={currentTabId} />}
            </View>
            <GlobalUi />
            <MainMessageDispatcher />
            <ProHandler />
        </View>
    );
};

export const Web3App = () => {
    return (
        <ProProvider>
            <IBrowserProvider>
                <FavorProvider>
                    <PlaygroundProvider>
                        <RecognitionProvider>
                            <ScreenshotProvider>
                                <Web3AppThemeWrpper>
                                    <Web3AppInner />
                                </Web3AppThemeWrpper>
                            </ScreenshotProvider>
                        </RecognitionProvider>
                    </PlaygroundProvider>
                </FavorProvider>
            </IBrowserProvider>
        </ProProvider>
    );
};
