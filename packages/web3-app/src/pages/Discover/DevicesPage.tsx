import { View } from '@web3-explorer/uikit-view';
import { WebviewTag } from 'electron';
import { useEffect, useState } from 'react';
import { useAccountInfo } from '../../hooks/wallets';
import { BrowserTab, useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';

import { getDiscoverHost } from '../../common/helpers';
import { currentTs } from '../../common/utils';
import { DEVICE_PID, START_URL } from '../../constant';
import WebviewService from '../../services/WebviewService';
import { MAIN_NAV_TYPE, SUB_WIN_ID, WebApp } from '../../types';

import { useTranslation } from '@web3-explorer/lib-translation';
import { onAction } from '../../common/electron';
import { LoadingView } from '../../components/LoadingView';
import ScreenshotView from '../../components/webview/ScreenshotView';
import WebViewBrowser from '../../components/webview/WebViewBrowser';
import { WebviewTopBar } from '../../components/webview/WebViewTopBar';
import { useScreenshotContext } from '../../providers/ScreenshotProvider';

const DevicesPage = () => {
    const { isCutEnable } = useScreenshotContext();
    const { env } = useIAppContext();
    const { theme, openUrl, openTabFromWebview, currentTabId, browserTabs } = useBrowserContext();
    const tabId = MAIN_NAV_TYPE.MOBILE_MONITORS;
    let tab: BrowserTab | undefined = browserTabs.get(tabId);

    if (!tab) {
        tab = { tabId: tabId, ts: currentTs() };
    }
    const isSelected = currentTabId === tabId;
    const [loading, setLoading] = useState<boolean>(true);

    const { index, id, address } = useAccountInfo();
    const [firstLoad, setFirstLoad] = useState(true);
    useEffect(() => {
        if (currentTabId === MAIN_NAV_TYPE.MOBILE_MONITORS) {
            setFirstLoad(false);
        }
    }, [currentTabId]);
    // let id1 = Buffer.from(id).toString('hex');

    const { i18n } = useTranslation();

    const currentLanguage = i18n.language;
    const url = `${getDiscoverHost(env.isDev, env.version)}&address=${address}&id=${id}&ip=${
        env.ip?.adr
    }&index=${index}&lang=${currentLanguage}#${SUB_WIN_ID.DEVICES}`;

    const onSiteMessage = async ({
        action,
        payload
    }: {
        action: string;
        payload?: Record<string, any> | undefined;
    }) => {
        console.log('ws server', action);

        if (action === 'onStopServer') {
            onAction('stopServer', {})?.then(res => {
                console.log('stopServer', res);
                onAction('serverIsReady')?.then(res => {
                    console.log('serverIsReady', res);
                    const ws = new WebviewService(tabId);
                    ws.execJs(`window.dispatchEvent(
                        new CustomEvent('onServerIsReady', {
                            detail: {
                                serverIsReady: false
                            }
                        })
                    );`);
                });
            });
        }

        if (action === 'onStartServer') {
            const { port } = payload as { port: number };
            onAction('startServer', { port })?.then(res => {
                console.log('startServer', res);
                onAction('serverIsReady')?.then(res => {
                    console.log('serverIsReady', res);
                    const ws = new WebviewService(tabId);

                    ws.execJs(`window.dispatchEvent(
                        new CustomEvent('onServerIsReady', {
                            detail: {
                                serverIsReady: true
                            }
                        })
                    );`);
                });
            });
        }

        if (action === 'checkServerIsReady') {
            onAction('serverIsReady')?.then(res => {
                console.log('serverIsReady', res);
                const ws = new WebviewService(tabId);
                ws.execJs(`window.dispatchEvent(
                    new CustomEvent('onServerIsReady', {
                        detail: {
                            serverIsReady: ${res ? 'true' : 'false'}
                        }
                    })
                );`);
            });
        }
        if (action === 'onOpenTab') {
            const { item } = payload as { item: WebApp };
            openTabFromWebview(item);
        }

        if (action === 'openMainTabUrl') {
            const { url } = payload as { url: string };
            openUrl(url);
        }
    };

    if (firstLoad || !env.ip?.adr) {
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
                    partitionId={DEVICE_PID}
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
};

export default DevicesPage;
