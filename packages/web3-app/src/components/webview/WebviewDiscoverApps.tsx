import { View } from '@web3-explorer/uikit-view';
import { WebviewTag } from 'electron';
import { useEffect, useState } from 'react';
import { useAccountInfo } from '../../hooks/wallets';
import { BrowserTab, useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';

import { getDiscoverHost } from '../../common/helpers';
import { currentTs } from '../../common/utils';
import { DISCOVER_PID, START_URL } from '../../constant';
import { usePro } from '../../providers/ProProvider';
import WebviewService from '../../services/WebviewService';
import { InitConfig, MAIN_NAV_TYPE, WebApp } from '../../types';
import { LoadingView } from '../LoadingView';

import { useScreenshotContext } from '../../providers/ScreenshotProvider';
import ScreenshotView from './ScreenshotView';
import WebViewBrowser from './WebViewBrowser';
import { WebviewTopBar } from './WebViewTopBar';

export function WebviewDiscoverApps({
    winId,
    tabId
}: {
    winId: 'Games' | 'Discover';
    tabId: string;
}) {
    const isGames = winId === 'Games';
    const { isCutEnable } = useScreenshotContext();
    const { env } = useIAppContext();
    const { theme, openTabFromWebview, currentTabId, onChangeLeftSideActions, browserTabs } =
        useBrowserContext();
    let tab: BrowserTab | undefined = browserTabs.get(tabId);

    if (!tab) {
        tab = { tabId: tabId, ts: currentTs() };
    }
    const isSelected = currentTabId === tabId;
    const [loading, setLoading] = useState<boolean>(true);
    const { updateProPlans } = usePro();
    const { name, emoji, index, id, address } = useAccountInfo();
    const currentAccount = { name, emoji, index, id, address };
    if (isGames) {
        sessionStorage.setItem('currentAccount', JSON.stringify(currentAccount));
    }

    const [firstLoad, setFirstLoad] = useState(!isGames);
    useEffect(() => {
        if (currentTabId === MAIN_NAV_TYPE.DISCOVERY && !isGames) {
            setFirstLoad(false);
        }
    }, [currentTabId]);
    const url = `${getDiscoverHost(env.isDev)}#${winId}`;
    // console.log({ tab, currentTabId, firstLoad });

    const onSiteMessage = async ({
        action,
        payload
    }: {
        action: string;
        payload?: Record<string, any> | undefined;
    }) => {
        if (action === 'initConfig') {
            const { proPlans, proRecvAddress, leftSideActions } = payload as InitConfig;
            updateProPlans({ proPlans, proRecvAddress });
            onChangeLeftSideActions(leftSideActions);
        }

        if (action === 'onOpenTab') {
            const { item } = payload as { item: WebApp };
            openTabFromWebview(item);
        }
    };

    if (firstLoad) {
        return null;
    }
    return (
        <View
            bgColor={theme.backgroundBrowserActive}
            rowVCenter
            overflowHidden
            jSpaceBetween
            wh100p
            relative
        >
            <View abs xx0 top0 borderBox w100p h={44} px={12} aCenter row jSpaceBetween>
                <View aCenter jStart flex1>
                    <WebviewTopBar
                        hideOpenInNew
                        tab={{
                            ...tab!,
                            tabId
                        }}
                        currentUrl={url}
                    />
                </View>
            </View>
            <View
                abs
                borderRadius={8}
                overflowHidden
                right={8}
                left={8}
                bottom={8}
                top={44}
                borderBox
            >
                <WebViewBrowser
                    hideBoxShadow
                    borderRadius={0}
                    url={START_URL}
                    tabId={tabId}
                    partitionId={DISCOVER_PID}
                    webviewProps={{
                        onSiteMessage,
                        onError: () => setLoading(false),
                        onErrorReset: () => setLoading(true),
                        onReady: (webview: WebviewTag) => {
                            if (webview.getURL() === START_URL) {
                                new WebviewService(tabId).goTo(url);
                            }
                            setLoading(false);
                        }
                    }}
                />
                <LoadingView
                    loading={loading}
                    setLoading={(loading: boolean) => setLoading(loading)}
                />
            </View>
            {Boolean(isCutEnable && isSelected) && <ScreenshotView tabId={currentTabId} />}
        </View>
    );
}
