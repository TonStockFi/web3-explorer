import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Account } from '@tonkeeper/core/dist/entries/account';
import { localizationText } from '@tonkeeper/core/dist/entries/language';
import { getApiConfig } from '@tonkeeper/core/dist/entries/network';
import { WalletVersion } from '@tonkeeper/core/dist/entries/wallet';
import { useWindowsScroll } from '@tonkeeper/uikit/dist/components/Body';
import ConnectLedgerNotification from '@tonkeeper/uikit/dist/components/ConnectLedgerNotification';
import { FooterGlobalStyle } from '@tonkeeper/uikit/dist/components/Footer';
import { HeaderGlobalStyle } from '@tonkeeper/uikit/dist/components/Header';
import { DarkThemeContext } from '@tonkeeper/uikit/dist/components/Icon';
import { GlobalListStyle } from '@tonkeeper/uikit/dist/components/List';
import PairKeystoneNotification from '@tonkeeper/uikit/dist/components/PairKeystoneNotification';
import PairSignerNotification from '@tonkeeper/uikit/dist/components/PairSignerNotification';
import QrScanner from '@tonkeeper/uikit/dist/components/QrScanner';
import { SybHeaderGlobalStyle } from '@tonkeeper/uikit/dist/components/SubHeader';
import ReceiveNotification from '@tonkeeper/uikit/dist/components/home/ReceiveNotification';
import NftNotification from '@tonkeeper/uikit/dist/components/nft/NftNotification';
import {
    AddFavoriteNotification,
    EditFavoriteNotification
} from '@tonkeeper/uikit/dist/components/transfer/FavoriteNotification';
import SendActionNotification from '@tonkeeper/uikit/dist/components/transfer/SendNotifications';
import SendNftNotification from '@tonkeeper/uikit/dist/components/transfer/nft/SendNftNotification';

import { useTrackLocation } from '@tonkeeper/uikit/dist/hooks/amplitude';
import { AppContext, IAppContext } from '@tonkeeper/uikit/dist/hooks/appContext';
import { AppSdkContext } from '@tonkeeper/uikit/dist/hooks/appSdk';
import { useLock } from '@tonkeeper/uikit/dist/hooks/lock';
import { StorageContext } from '@tonkeeper/uikit/dist/hooks/storage';
import {
    I18nContext,
    TranslationContext,
    useTWithReplaces
} from '@tonkeeper/uikit/dist/hooks/translation';
import { useDebuggingTools } from '@tonkeeper/uikit/dist/hooks/useDebuggingTools';
import { Unlock } from '@tonkeeper/uikit/dist/pages/home/Unlock';
import { UnlockNotification } from '@tonkeeper/uikit/dist/pages/home/UnlockNotification';

import { UserThemeProvider } from '@tonkeeper/uikit/dist/providers/UserThemeProvider';
import { useDevSettings } from '@tonkeeper/uikit/dist/state/dev';
import { useUserFiatQuery } from '@tonkeeper/uikit/dist/state/fiat';
import { useGlobalPreferencesQuery } from '@tonkeeper/uikit/dist/state/global-preferences';
import { useGlobalSetup } from '@tonkeeper/uikit/dist/state/globalSetup';
import { useUserLanguage } from '@tonkeeper/uikit/dist/state/language';
import { useCanPromptTouchId } from '@tonkeeper/uikit/dist/state/password';
import { useProBackupState } from '@tonkeeper/uikit/dist/state/pro';
import { useTonendpoint, useTonenpointConfig } from '@tonkeeper/uikit/dist/state/tonendpoint';
import {
    useAccountsStateQuery,
    useActiveAccountQuery,
    useActiveTonNetwork
} from '@tonkeeper/uikit/dist/state/wallet';
import { Container, GlobalStyleCss } from '@tonkeeper/uikit/dist/styles/globalStyle';

import { CopyNotification } from '@web3-explorer/web3-app/dist/components/CopyNotification';
import { Loading } from '@web3-explorer/web3-app/dist/components/Loading';
import Initialize from '@web3-explorer/web3-app/dist/pages/Initialize';
import { Web3App } from '@web3-explorer/web3-app/dist/pages/Web3App';
import { IAppProvider } from '@web3-explorer/web3-app/dist/providers/IAppProvider';
import { Buffer } from 'buffer';
import { FC, Suspense, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { ModalsRoot } from '../ModalsRoot';
import '../i18n';
import { BrowserAppSdk } from './libs/appSdk';
import { useAppHeight, useAppWidth } from './libs/hooks';
window.Buffer = Buffer;

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30000,
            refetchOnWindowFocus: false
        }
    }
});

const GlobalStyle = createGlobalStyle`
    ${GlobalStyleCss}
    ;

    .MuiPopper-root{z-index:1000000!important}

    #react-portal-modal-container > div {
        z-index: 10001 !important;
    }

    .MuiToolbar-dense{
        padding-left: 0px!important;
        padding-right: 0px!important;
    }
    button{
        text-transform: none!important;
    }

    body {
        font-family: '-apple-system', BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, Tahoma, Verdana, 'sans-serif';
        background-color: #232323;
    }

    html, body, #root {
        height: 100%;
        overflow: hidden;
    }

    html.is-locked {
        height: var(--app-height);
    }

    #root > div.MuiBox-root {
        color:#e9e9e9
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

const sdk = new BrowserAppSdk();
const TARGET_ENV = 'desktop';

// const langs = 'en,zh_TW,zh_CN,id,ru,it,es,uk,tr,bg,uz,bn';
const langs = 'en,zh_CN,ru';

declare const REACT_APP_TONCONSOLE_API: string;
declare const REACT_APP_TG_BOT_ID: string;
declare const REACT_APP_STONFI_REFERRAL_ADDRESS: string;

export const Providers = () => {
    const { t: tSimple, i18n } = useTranslation();

    const t = useTWithReplaces(tSimple);

    const translation = useMemo(() => {
        const languages = langs.split(',');
        const client: I18nContext = {
            t,
            i18n: {
                enable: true,
                reloadResources: i18n.reloadResources,
                changeLanguage: i18n.changeLanguage as any,
                language: i18n.language,
                languages: languages
            }
        };
        return client;
    }, [t, i18n]);

    useEffect(() => {
        window.backgroundApi && document.body.classList.add(window.backgroundApi.platform());
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <Suspense fallback={<div></div>}>
                <AppSdkContext.Provider value={sdk}>
                    <TranslationContext.Provider value={translation}>
                        <StorageContext.Provider value={sdk.storage}>
                            <ThemeAndContent />
                        </StorageContext.Provider>
                    </TranslationContext.Provider>
                </AppSdkContext.Provider>
            </Suspense>
        </QueryClientProvider>
    );
};

const ThemeAndContent = () => {
    const { data } = useProBackupState();
    return (
        <UserThemeProvider displayType="full-width" isPro={data?.valid} isProSupported>
            <DarkThemeContext.Provider value={!data?.valid}>
                <GlobalStyle />
                <HeaderGlobalStyle />
                <FooterGlobalStyle />
                <SybHeaderGlobalStyle />
                <GlobalListStyle />
                <Loader />
                <UnlockNotification sdk={sdk} />
            </DarkThemeContext.Provider>
        </UserThemeProvider>
    );
};

const FullSizeWrapper = styled(Container)`
    max-width: 800px;
`;

export const Loader: FC = () => {
    const network = useActiveTonNetwork();
    const { data: activeAccount, isLoading: activeWalletLoading } = useActiveAccountQuery();
    const { data: accounts, isLoading: isWalletsLoading } = useAccountsStateQuery();
    const { data: lang, isLoading: isLangLoading } = useUserLanguage();
    const { data: devSettings } = useDevSettings();
    const { isLoading: globalPreferencesLoading } = useGlobalPreferencesQuery();
    useGlobalSetup();

    const lock = useLock(sdk);
    const { i18n } = useTranslation();
    const { data: fiat } = useUserFiatQuery();

    const tonendpoint = useTonendpoint({
        targetEnv: TARGET_ENV,
        build: sdk.version,
        network,
        lang,
        platform: 'desktop'
    });
    const { data: config } = useTonenpointConfig(tonendpoint);

    useAppHeight();
    useEffect(() => {
        if (lang && i18n.language !== localizationText(lang)) {
            i18n.reloadResources([localizationText(lang)]).then(() =>
                i18n.changeLanguage(localizationText(lang))
            );
        }
    }, [lang, i18n]);

    useEffect(() => {
        window.backgroundApi &&
            window.backgroundApi.onRefresh(() => queryClient.invalidateQueries());
    }, []);

    if (
        activeWalletLoading ||
        isLangLoading ||
        isWalletsLoading ||
        config === undefined ||
        lock === undefined ||
        fiat === undefined ||
        !devSettings ||
        globalPreferencesLoading
    ) {
        return <Loading />;
    }

    const context: IAppContext = {
        api: getApiConfig(config, network, REACT_APP_TONCONSOLE_API),
        fiat,
        config,
        tonendpoint,
        standalone: true,
        extension: false,
        proFeatures: true,
        experimental: true,
        ios: false,
        env: {
            tgAuthBotId: REACT_APP_TG_BOT_ID,
            stonfiReferralAddress: REACT_APP_STONFI_REFERRAL_ADDRESS
        },
        defaultWalletVersion: WalletVersion.V5R1
    };

    return (
        <AppContext.Provider value={context}>
            <Content activeAccount={activeAccount} lock={lock} />
            <CopyNotification hideSimpleCopyNotifications />
            <QrScanner />
            <ModalsRoot />
        </AppContext.Provider>
    );
};

const usePrefetch = () => {
    useCanPromptTouchId();
};

export const Content: FC<{
    activeAccount?: Account | null;
    lock: boolean;
}> = ({ activeAccount, lock }) => {
    useWindowsScroll();
    useAppWidth();
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

    if (!activeAccount) {
        return <Initialize />;
    }

    return (
        <>
            <Web3App />
            <BackgroundElements />
        </>
    );
};

const BackgroundElements = () => {
    return (
        <>
            <SendActionNotification />
            <ReceiveNotification />
            <NftNotification />
            <SendNftNotification />
            <AddFavoriteNotification />
            <EditFavoriteNotification />
            <PairSignerNotification />
            <ConnectLedgerNotification />
            <PairKeystoneNotification />
        </>
    );
};

const router = createMemoryRouter([
    {
        path: '/*',
        element: <Providers />
    }
]);

export const App = () => {
    return (
        <IAppProvider>
            <RouterProvider router={router} />
        </IAppProvider>
    );
};
