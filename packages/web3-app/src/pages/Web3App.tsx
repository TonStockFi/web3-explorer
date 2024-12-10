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

import { TitleBarControlView } from '../components/app/TitleBarControlView';
import { MainMessageDispatcher } from '../components/MainMessageDispatcher';
import { ProHandler } from '../components/ProHandler';
import { ControlsView } from '../components/webview/ControlsView';
import { PlaygroundProvider } from '../providers/PlaygroundProvider';
import { ProProvider } from '../providers/ProProvider';
import { RecognitionProvider } from '../providers/RecognitionProvider';
import { ScreenshotProvider } from '../providers/ScreenshotProvider';
import { Web3AppThemeWrpper } from '../providers/Web3AppThemeWrpper';
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
