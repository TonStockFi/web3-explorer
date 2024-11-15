import { View } from '@web3-explorer/uikit-view/dist/View';
import { WebviewTag } from 'electron';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDiscoverHost } from '../../common/helpers';
import { currentTs } from '../../common/utils';
import { LoadingView } from '../../components/LoadingView';
import WebViewBrowser from '../../components/webview/WebViewBrowser';
import { WebviewTopBar } from '../../components/webview/WebViewTopBar';
import { DISCOVER_PID, START_URL } from '../../constant';
import { useAccountInfo, usePublicAccountsInfo } from '../../hooks/wallets';
import { BrowserTab, useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import WebviewService from '../../services/WebviewService';
import { MAIN_NAV_TYPE, SUB_WIN_ID } from '../../types';

const DashboardPage = () => {
    const { t } = useTranslation();
    const currentAccount = useAccountInfo();
    const accounts = usePublicAccountsInfo();
    const { theme, browserTabs } = useBrowserContext();
    const [loading, setLoading] = useState<boolean>(true);
    let tab: BrowserTab | undefined = browserTabs.get(MAIN_NAV_TYPE.DASHBOARD);

    const tabId = MAIN_NAV_TYPE.DASHBOARD;

    if (!tab) {
        tab = { tabId: tabId, ts: currentTs(), ts1: currentTs() };
    }
    const { env } = useIAppContext();
    const url = `${getDiscoverHost(env.isDev)}#${SUB_WIN_ID.ASSETS}`;

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
                    <WebviewTopBar urlReadOnly hideOpenInNew={true} tab={tab!} currentUrl={url} />
                </View>
            </View>

            <View
                abs
                borderRadius={8}
                overflowHidden
                right={8}
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
                            ws.execJs(
                                `localStorage.setItem('__accounts', '${JSON.stringify(accounts)}');`
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
};

export default DashboardPage;
