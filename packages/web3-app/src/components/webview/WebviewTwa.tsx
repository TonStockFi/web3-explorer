import { View } from '@web3-explorer/uikit-view';
import { WebviewTag } from 'electron';
import { useEffect, useState } from 'react';
import { openWindow } from '../../common/electron';
import { useAccountInfo } from '../../hooks/wallets';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';

import { getDiscoverHost } from '../../common/helpers';
import { DISCOVER_PID, START_URL } from '../../constant';
import { BalanceBackgroundPage } from '../../pages/Wallet/BalanceBackgroundPage';
import { usePro } from '../../providers/ProProvider';
import WebviewService from '../../services/WebviewService';
import { MAIN_NAV_TYPE, ProPlan } from '../../types';
import { onOpenTab } from '../discover/DiscoverView';
import { LoadingView } from '../LoadingView';
import WebViewBrowser from './WebViewBrowser';
import { WebviewTopBar } from './WebViewTopBar';

export const getCurrentAccount = (key?: string) => {
    const res = sessionStorage.getItem(key || 'currentAccount');
    if (res) {
        return JSON.parse(res);
    } else {
        return null;
    }
};
let _tabId = '';

export function WebviewTwa() {
    const { env } = useIAppContext();
    const { theme, editTab, openTab, closeTab, newTab, browserTabs } = useBrowserContext();
    const tab = browserTabs.get(MAIN_NAV_TYPE.GAME_FI);
    const [loading, setLoading] = useState<boolean>(true);
    const [showBlockViewer, setShowBlockViewer] = useState<boolean>(false);
    const { updateProPlans, orderComment } = usePro();
    const { name, emoji, index, id, address } = useAccountInfo();
    const currentAccount = { name, emoji, index, id, address };
    sessionStorage.setItem('currentAccount', JSON.stringify(currentAccount));
    const tabId = 'game_center';

    useEffect(() => {
        _tabId = tabId;
    }, [tabId]);

    const url = `${getDiscoverHost(env.isDev)}#Games`;

    useEffect(() => {
        try {
            const ws = new WebviewService(tabId);
            if (ws.webviewIsReady()) {
                ws.execJs(
                    `localStorage.setItem('__currentAccount', '${JSON.stringify(currentAccount)}');`
                );
            }
        } catch (e) {}
    }, [currentAccount]);

    const onSiteMessage = async ({
        action,
        payload
    }: {
        action: string;
        payload?: Record<string, any> | undefined;
    }) => {
        if (action === 'onShowBlockViewer') {
            if (env.isDev) {
                setShowBlockViewer(showBlockViewer => !showBlockViewer);
            }
        }

        if (action === 'updateProPlan') {
            const { proPlans, proRecvAddress } = payload as {
                proPlans: ProPlan[];
                proRecvAddress: string;
            };
            console.log('updateProPlan', proPlans);
            updateProPlans({ proPlans, proRecvAddress });
        }
        if (action === 'openWindow') {
            openWindow(payload as any);
        }

        if (action === 'onOpenTab') {
            onOpenTab({ _tabId, payload, editTab, openTab, closeTab, newTab, browserTabs });
        }
    };
    return (
        <View
            bgColor={theme.backgroundBrowse}
            rowVCenter
            overflowHidden
            jSpaceBetween
            wh100p
            relative
        >
            <View abs xx0 top0 borderBox w100p h={44} px={12} aCenter row jSpaceBetween>
                <View aCenter jStart flex1 hide={!tab}>
                    <WebviewTopBar
                        hideOpenInNew={true}
                        tab={{
                            ...tab!,
                            tabId
                        }}
                        currentUrl={url}
                    />
                </View>
            </View>

            {Boolean(showBlockViewer || orderComment) && (
                <View
                    opacity={showBlockViewer ? 1 : 0}
                    top={44}
                    w={360}
                    right={12}
                    abs
                    top0
                    bottom0
                    zIdx={showBlockViewer ? 1 : -1}
                >
                    <BalanceBackgroundPage />
                </View>
            )}

            <View
                abs
                borderRadius={8}
                overflowHidden
                right={showBlockViewer ? 400 : 8}
                left={8}
                bottom={0}
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
                                return;
                            }

                            const ws = new WebviewService(tabId);
                            ws.execJs(
                                `localStorage.setItem('__currentAccount', '${JSON.stringify(
                                    currentAccount
                                )}');`
                            );

                            setLoading(false);
                        }
                    }}
                />
                <LoadingView
                    loading={loading}
                    setLoading={(loading: boolean) => setLoading(loading)}
                />
            </View>
        </View>
    );
}
