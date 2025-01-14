import { View } from '@web3-explorer/uikit-view';
import { AppRegionDrag } from '../components/AppRegionDrag';
import { GlobalUi } from '../components/GlobalUi';
import { IBrowserProvider, useBrowserContext } from '../providers/BrowserProvider';
import { MAIN_NAV_TYPE } from '../types';

import { SideBarVert } from '../components/app/SideBarVert';
import { TopBar } from '../components/app/TopBar';
import { HomHeaderHeight, SiderBarWidth } from '../constant';
import { FavorProvider } from '../providers/FavorProvider';
import { useIAppContext } from '../providers/IAppProvider';

import { useEffect } from 'react';
import { ChainListView } from '../components/app/ChainListView';
import { TitleBarControlView } from '../components/app/TitleBarControlView';
import { WalletView } from '../components/app/WalletView';
import { MainMessageDispatcher } from '../components/MainMessageDispatcher';
import { ProHandler } from '../components/ProHandler';
import { ControlsView } from '../components/webview/ControlsView';
import { DevicesProvider } from '../providers/DevicesProvider';
import { PlaygroundProvider } from '../providers/PlaygroundProvider';
import { ProProvider } from '../providers/ProProvider';
import { RecognitionProvider } from '../providers/RecognitionProvider';
import { ScreenshotProvider } from '../providers/ScreenshotProvider';
import { Web3AppThemeWrpper } from '../providers/Web3AppThemeWrpper';
import { BrowserFavorPage } from './Discover/BrowserFavorPage';
import { BrowserHistoryPage } from './Discover/BrowserHistoryPage';
import DevicesPage from './Discover/DevicesPage';
import { WebviewPage } from './Discover/WebviewPage';
import { ManageAccountsPage } from './Preferences/ManageAccountsPage';
import { ConnectedAppsPage } from './Wallet/connect/ConnectedAppsPage';
import { DesktopMultiSendFormPage } from './Wallet/multi-send/MultiSendFormPage';
import { WalletPage } from './Wallet/WalletPage';

function Pages() {
    let { currentTabId } = useBrowserContext();
    const mainNavType = currentTabId as MAIN_NAV_TYPE;
    return (
        <>
            <View wh100p hide={mainNavType !== MAIN_NAV_TYPE.WALLET}>
                <WalletPage />
            </View>
            <View wh100p hide={mainNavType !== MAIN_NAV_TYPE.MULTI_SEND}>
                <DesktopMultiSendFormPage />
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

            <View wh100p displayNone={mainNavType !== MAIN_NAV_TYPE.MOBILE_MONITORS}>
                <DevicesPage />
            </View>
            <View wh100p hide={mainNavType !== MAIN_NAV_TYPE.CONNECTED_APPS}>
                <ConnectedAppsPage />
            </View>
            <View wh100p hide={mainNavType !== MAIN_NAV_TYPE.FAVOR}>
                <BrowserFavorPage />
            </View>
            <WalletView />
            <ChainListView />
        </>
    );
}

export const Web3AppInner = () => {
    const { env, isFullScreen } = useIAppContext();
    const { theme, currentTabId } = useBrowserContext();
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
    useEffect(() => {
        const loading = document.querySelector('#__loading');
        //@ts-ignore
        document.body.style.appRegion = 'unset';
        //@ts-ignore
        if (loading) loading.style.display = 'none';
    }, []);
    const isMiniSideBar = false;

    let left = SiderBarWidth;
    if (!isMiniSideBar) {
        left = 180;
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
            <SideBarVert isMiniSideBar={isMiniSideBar} left={left} />
            <TitleBarControlView main />
            <View
                borderBox
                sx={{
                    transition: 'left 0.2s ease'
                }}
                userSelectNone
                abs
                top0
                left={80}
                appRegionDrag
                height={HomHeaderHeight}
                w={topLeft + left - SiderBarWidth - 80}
            ></View>
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
                left={topLeft + left - SiderBarWidth}
            >
                <TopBar />
            </View>
            <View
                absFull
                sx={{
                    transition: 'left 0.2s ease'
                }}
                left={left}
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
            <DevicesProvider>
                <ScreenshotProvider>
                    <IBrowserProvider>
                        <FavorProvider>
                            <PlaygroundProvider>
                                <RecognitionProvider>
                                    <Web3AppThemeWrpper>
                                        <Web3AppInner />
                                    </Web3AppThemeWrpper>
                                </RecognitionProvider>
                            </PlaygroundProvider>
                        </FavorProvider>
                    </IBrowserProvider>
                </ScreenshotProvider>
            </DevicesProvider>
        </ProProvider>
    );
};
