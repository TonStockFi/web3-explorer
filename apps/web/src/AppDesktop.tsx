import { Account } from '@tonkeeper/core/dist/entries/account';
import { useWindowsScroll } from '@tonkeeper/uikit/dist/components/Body';
import ConnectLedgerNotification from '@tonkeeper/uikit/dist/components/ConnectLedgerNotification';
import MemoryScroll from '@tonkeeper/uikit/dist/components/MemoryScroll';
import PairKeystoneNotification from '@tonkeeper/uikit/dist/components/PairKeystoneNotification';
import PairSignerNotification from '@tonkeeper/uikit/dist/components/PairSignerNotification';
import { AsideAccountsMenu } from '@tonkeeper/uikit/dist/components/desktop/aside/AsideAccountsMenu';
import { AsideMenu } from '@tonkeeper/uikit/dist/components/desktop/aside/AsideMenu';
import { DeviceAsideMenu } from '@tonkeeper/uikit/dist/components/desktop/aside/DeviceAsideMenu';
import { PreferencesAsideMenu } from '@tonkeeper/uikit/dist/components/desktop/aside/PreferencesAsideMenu';
import { WalletAsideMenu } from '@tonkeeper/uikit/dist/components/desktop/aside/WalletAsideMenu';
import { DesktopDeviceHeader } from '@tonkeeper/uikit/dist/components/desktop/header/DesktopDeviceHeader';
import { desktopHeaderContainerHeight } from '@tonkeeper/uikit/dist/components/desktop/header/DesktopHeaderElements';
import { DesktopPreferencesHeader } from '@tonkeeper/uikit/dist/components/desktop/header/DesktopPreferencesHeader';
import { DesktopWalletHeader } from '@tonkeeper/uikit/dist/components/desktop/header/DesktopWalletHeader';
import ReceiveNotification from '@tonkeeper/uikit/dist/components/home/ReceiveNotification';
import NftNotification from '@tonkeeper/uikit/dist/components/nft/NftNotification';
import {
    AddFavoriteNotification,
    EditFavoriteNotification
} from '@tonkeeper/uikit/dist/components/transfer/FavoriteNotification';
import SendActionNotification from '@tonkeeper/uikit/dist/components/transfer/SendNotifications';
import SendNftNotification from '@tonkeeper/uikit/dist/components/transfer/nft/SendNftNotification';
import DesktopBrowser from '@tonkeeper/uikit/dist/desktop-pages/browser';
import { DesktopCoinPage } from '@tonkeeper/uikit/dist/desktop-pages/coin/DesktopCoinPage';
import { DesktopHistoryPage } from '@tonkeeper/uikit/dist/desktop-pages/history/DesktopHistoryPage';
import { DesktopMultiSendPage } from '@tonkeeper/uikit/dist/desktop-pages/multi-send';
import { DesktopCollectables } from '@tonkeeper/uikit/dist/desktop-pages/nft/DesktopCollectables';
import { DesktopPreferencesRouting } from '@tonkeeper/uikit/dist/desktop-pages/preferences/DesktopPreferencesRouting';
import {
    DesktopConnectedAppsSettings
} from "@tonkeeper/uikit/dist/desktop-pages/settings/DesktopConnectedAppsSettings";
import { DesktopSwapPage } from '@tonkeeper/uikit/dist/desktop-pages/swap';
import { DesktopTokens } from '@tonkeeper/uikit/dist/desktop-pages/tokens/DesktopTokens';
import { useTrackLocation } from '@tonkeeper/uikit/dist/hooks/amplitude';
import { useRecommendations } from '@tonkeeper/uikit/dist/hooks/browser/useRecommendations';
import { useDebuggingTools } from '@tonkeeper/uikit/dist/hooks/useDebuggingTools';
import { any, AppProRoute, AppRoute } from '@tonkeeper/uikit/dist/libs/routes';
import { Unlock } from '@tonkeeper/uikit/dist/pages/home/Unlock';
import ImportRouter from '@tonkeeper/uikit/dist/pages/import';
import Initialize, { InitializeContainer } from '@tonkeeper/uikit/dist/pages/import/Initialize';
import { useCanPromptTouchId } from '@tonkeeper/uikit/dist/state/password';
import { Container, GlobalStyleCss } from '@tonkeeper/uikit/dist/styles/globalStyle';
import { DarkTheme, IAppProvider, IThemeProvider, useLocalStorageState } from '@web3-explorer/uikit-mui';
import { View } from '@web3-explorer/uikit-view';
import { TgSiteView, Web3App } from '@web3-explorer/web3-app';
import DeviceView from '@web3-explorer/web3-app/dist/pages/DeskMonitor/DeviceView';
import { MAIN_NAV_TYPE } from '@web3-explorer/web3-app/dist/types';
import { Buffer } from 'buffer';
import React, { FC, Suspense, useMemo } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';
import styled, { createGlobalStyle, ThemeProvider, useTheme } from 'styled-components';
import { useAppWidth } from './libs/hooks';

window.Buffer = Buffer;

const GlobalStyle = createGlobalStyle`
    ${GlobalStyleCss}

    ;

    body {
        font-family: '-apple-system', BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, Tahoma, Verdana, 'sans-serif';
        background-color: #10161F;
    }

    html, body, #root {
        height: 100%;
        overflow: hidden;
    }

    html.is-locked {
        height: var(--app-height);
    }

    button, input[type="submit"], input[type="reset"] {
        background: none;
        color: inherit;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
        outline: inherit;
    }
`;

const FullSizeWrapper = styled(Container)`
    max-width: 800px;
`;

const Wrapper = styled.div`
    box-sizing: border-box;

    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: ${props => props.theme.backgroundPage};
    white-space: pre-wrap;
`;

const WideLayout = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
`;

const WideContent = styled.div`
    flex: 1;
    min-width: 0;
    min-height: 0;
`;

const WalletLayout = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const DeviceLayoutBody = styled.div`
    flex: 1;
    display: flex;
    max-height: calc(100%);
`;

const WalletLayoutBody = styled.div`
    flex: 1;
    display: flex;
    max-height: calc(100% - ${desktopHeaderContainerHeight});
`;

const WalletRoutingWrapper = styled.div`
    flex: 1;
    overflow: auto;
    position: relative;
`;

const PreferencesLayout = styled.div`
    height: calc(100%);
    display: flex;
    overflow: auto;
`;

const PreferencesRoutingWrapper = styled.div`
    flex: 1;
    overflow: auto;
    position: relative;
`;

const FullSizeWrapperBounded = styled(FullSizeWrapper)`
    max-height: 100%;
    overflow: auto;

    justify-content: center;
`;

const usePrefetch = () => {
    useRecommendations();
    useCanPromptTouchId();
};

export const DesktopContent: FC<{
    activeAccount?: Account | null;
    lock: boolean;
}> = ({ activeAccount, lock }) => {
    const location = useLocation();
    useWindowsScroll();
    useTrackLocation();
    usePrefetch();
    useDebuggingTools();

    if (lock) {
        return (
            <FullSizeWrapper>
                <Unlock />
            </FullSizeWrapper>
        );
    }

    if (!activeAccount || location.pathname.startsWith(AppRoute.import)) {
        return (
            <FullSizeWrapperBounded className="full-size-wrapper">
                <InitializeContainer fullHeight={false}>
                    <Routes>
                        <Route path={any(AppRoute.import)} element={<ImportRouter />} />
                        <Route path="*" element={<Initialize />} />
                    </Routes>
                </InitializeContainer>
            </FullSizeWrapperBounded>
        );
    }

    return (
        <View empty>
            <AppWrapper>
                <WideLayout>
                    <AsideMenu />
                    <WideContent>
                        <Routes>
                            <Route
                                path={any(AppProRoute.multiSend)}
                                element={<DesktopMultiSendPage />}
                            />
                            <Route path="*" element={<WalletContent />} />
                        </Routes>
                    </WideContent>
                </WideLayout>
            </AppWrapper>
            <BackgroundElements />
        </View>
    );
};

const WalletContent = () => {
    return (
        <WalletLayout>
            <DesktopWalletHeader />
            <WalletLayoutBody>
                <WalletAsideMenu />
                <WalletRoutingWrapper className="hide-scrollbar">
                    <Routes>
                        <Route element={<OldAppRouting />}>
                            <Route path={AppRoute.activity} element={<DesktopHistoryPage />} />
                            <Route
                                path={any(AppRoute.purchases)}
                                element={<DesktopCollectables />}
                            />
                            {/* <Route path={any(AppRoute.dns)} element={<DesktopDns />} /> */}
                            <Route path={AppRoute.coins}>
                                <Route path=":name/*" element={<DesktopCoinPage />} />
                            </Route>
                            {/* <Route
                                path={AppRoute.multisigWallets}
                                element={<DesktopManageMultisigsPage />}
                            /> */}
                            {/* <Route
                                path={AppRoute.multisigOrders}
                                element={<DesktopMultisigOrdersPage />}
                            /> */}
                            {/* <Route
                                path={any(AppRoute.walletSettings)}
                                element={<DesktopWalletSettingsRouting />}
                            /> */}
                            <Route path={AppRoute.swap} element={<DesktopSwapPage />} />
                            <Route path="*" element={<DesktopTokens />} />
                        </Route>
                    </Routes>
                </WalletRoutingWrapper>
            </WalletLayoutBody>
        </WalletLayout>
    );
};

const DeviceContent = () => {
    return (
        <WalletLayout>
            <DesktopDeviceHeader />
            <DeviceLayoutBody>
                <DeviceAsideMenu />
                <WalletRoutingWrapper className="hide-scrollbar">
                    <Routes>
                        <Route element={<OldAppRouting />}>
                            <Route path={AppRoute.device} element={<DeviceView />} />
                            <Route path={AppRoute.tgSite} element={<TgSiteView />} />
                            <Route path={AppRoute.connect_apps} element={<DesktopConnectedAppsSettings />} />
                            <Route path="*" element={<TgSiteView />} />
                        </Route>
                    </Routes>
                </WalletRoutingWrapper>
            </DeviceLayoutBody>
        </WalletLayout>
    );
};

const PreferencesContent = () => {
    return (
        <>
            <DesktopPreferencesHeader />
            <PreferencesLayout>
                <PreferencesAsideMenu />
                <PreferencesRoutingWrapper className="hide-scrollbar">
                    <DesktopPreferencesRouting />
                </PreferencesRoutingWrapper>
            </PreferencesLayout>
        </>
    );
};

const OldAppRouting = () => {
    return (
        <Wrapper>
            <Outlet />
            <MemoryScroll />
        </Wrapper>
    );
};

const BackgroundElements = () => {
    return (
        <Suspense>
            <SendActionNotification />
            <ReceiveNotification />
            <NftNotification />
            <SendNftNotification />
            <AddFavoriteNotification />
            <EditFavoriteNotification />
            <PairSignerNotification />
            <ConnectLedgerNotification />
            <PairKeystoneNotification />
        </Suspense>
    );
};

const DesktopView: FC<{
    activeAccount?: Account | null;
    lock: boolean;
}> = ({ activeAccount, lock }) => {
    const theme = useTheme();
    useWindowsScroll();
    useAppWidth(false);
    useRecommendations();
    useTrackLocation();
    useDebuggingTools();

    const updated = useMemo(() => {
        theme.displayType = 'full-width';
        return theme;
    }, [theme]);
    return (
        <IAppProvider>
            <ThemeProvider theme={updated}>
                <GlobalStyle />
                <DesktopContent activeAccount={activeAccount} lock={lock} />
            </ThemeProvider>
        </IAppProvider>
    );
};

const AppWrapper = ({ children }: { children: React.ReactNode }) => {
    const [mainNavType, setMainNavType] = useLocalStorageState(
        'MAIN_NAV_TYPE_3',
        MAIN_NAV_TYPE.WALLET
    );
    return (
        <IThemeProvider theme={DarkTheme}>
            <Web3App
                {...{
                    mainNavType,
                    setMainNavType: (v: MAIN_NAV_TYPE) => {
                        setMainNavType(v);
                    }
                }}
            />
            <View
                hide={mainNavType !== MAIN_NAV_TYPE.DISCOVERY}
                absolute
                x={64}
                y={0}
                right={0}
                bottom={0}
            >
                <DesktopBrowser />
            </View>
            <View
                absFull
                displayNone={mainNavType !== MAIN_NAV_TYPE.MOBILE_MONITORS}
                x={64}
                y={0}
                right={0}
                bottom={0}
            >
                <WideLayout>
                    <AsideAccountsMenu />
                    <WideContent>
                        <Routes>
                            <Route path="*" element={<DeviceContent />} />
                        </Routes>
                    </WideContent>
                </WideLayout>
            </View>

            <View
                hide={mainNavType !== MAIN_NAV_TYPE.SETTING}
                absolute
                x={64}
                y={0}
                right={0}
                bottom={0}
            >
                <Routes>
                    <Route path={any(AppRoute.settings)} element={<PreferencesContent />} />
                    <Route path="*" element={<PreferencesContent />} />
                </Routes>
            </View>
            <View absFull x={64} hide={mainNavType !== MAIN_NAV_TYPE.WALLET}>
                {children}
            </View>
        </IThemeProvider>
    );
};

export default DesktopView;
