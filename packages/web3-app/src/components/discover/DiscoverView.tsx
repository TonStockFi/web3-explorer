import { View } from '@web3-explorer/uikit-view';

import { Loading } from '@web3-explorer/uikit-mui';
import { WebviewTag } from 'electron';
import { useEffect, useState } from 'react';
import { onAction } from '../../common/electron';
import { getDiscoverHost } from '../../common/helpers';
import { currentTs, hexToRGBA } from '../../common/utils';

import { DISCOVER_PID, START_URL } from '../../constant';
import { useAccountInfo } from '../../hooks/wallets';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import WebviewService from '../../services/WebviewService';
import WebViewBrowser from '../webview/WebViewBrowser';

let _tabId = '';

export const onOpenTab = ({
    _tabId,
    payload,
    editTab,
    openTab,
    closeTab,
    newTab,
    browserTabs
}: {
    _tabId: string;
    payload: any;
    editTab: any;
    openTab: any;
    closeTab: any;
    newTab: any;
    browserTabs: any;
}) => {
    const { item, tabId } = payload as any;
    const ts = currentTs();
    if (payload?.url) {
        const tab = browserTabs.get(_tabId)!;
        editTab({
            ...tab,
            tabId: _tabId,
            initUrl: payload?.url
        });
        openTab(_tabId);
    }
    if (tabId) {
        openTab(tabId);
    }
    if (item) {
        let { mobile, url, id, name, icon } = item;

        if (!mobile && url.indexOf('https://t.me') > -1) {
            mobile = true;
        }
        const ttt = {
            name,
            icon,
            initUrl: url,
            url,
            ts1: ts,
            discover: true,
            mobile
        };
        if (id) {
            closeTab(_tabId);
            newTab({
                ...ttt,
                ts,
                tabId: `tab_${id}`
            });
            return;
        }
        if (_tabId) {
            const tab = browserTabs.get(_tabId)!;
            editTab({
                ...tab,
                ...ttt,
                tabId: _tabId
            });
            openTab(_tabId);
        } else {
            newTab({
                ...ttt,
                ts,
                tabId: `${ts}`
            });
        }
    }
};
export function DiscoverView({ showDiscover, tabId }: { showDiscover: boolean; tabId: string }) {
    const { t, theme } = useBrowserContext();

    const [loading, setLoading] = useState<boolean>(true);
    const { env } = useIAppContext();
    const { newTab, closeTab, openTab, browserTabs, editTab } = useBrowserContext();
    const { name, emoji, address, id, index } = useAccountInfo();
    const url = `${getDiscoverHost(env.isDev)}#Discover`;

    const [firstLoad, setFirstLoad] = useState(true);
    useEffect(() => {
        if (showDiscover) {
            setFirstLoad(false);
        }
    }, [showDiscover]);
    useEffect(() => {
        _tabId = tabId;
    }, [tabId]);
    const onSiteMessage = async ({
        action,
        payload
    }: {
        action: string;
        payload?: Record<string, any> | undefined;
    }) => {
        if (action === 'onOpenTab') {
            onOpenTab({ _tabId, payload, editTab, openTab, closeTab, newTab, browserTabs });
        }
    };

    return (
        <View borderBox wh100p relative transitionEase="width 0.3s" pr={8} pb={0} overflowHidden>
            {!firstLoad && (
                <WebViewBrowser
                    url={START_URL}
                    hideBoxShadow
                    tabId={'discover_apps'}
                    partitionId={DISCOVER_PID}
                    webviewProps={{
                        onSiteMessage,
                        onStopLoading: () => {},
                        onReady: (webview: WebviewTag) => {
                            if (webview.getURL() === START_URL) {
                                new WebviewService('discover_apps').goTo(url);
                                return;
                            }
                            setLoading(false);
                            onAction(
                                'sendToSite',
                                {
                                    action: 'currentAccount',
                                    payload: {
                                        account: { name, emoji, index, id, address }
                                    }
                                },
                                webview.getWebContentsId()
                            );
                        }
                    }}
                />
            )}

            {loading && (
                <View
                    column
                    zIdx={1}
                    bgColor={hexToRGBA(theme.backgroundContent, 0.9)}
                    absFull
                    center
                >
                    <Loading />
                    <View
                        mt={24}
                        onClick={async () => {
                            const ws = new WebviewService('discover_apps');
                            ws.reloadWebview();
                        }}
                        button={t('reload')}
                        buttonVariant="outlined"
                    />
                </View>
            )}
        </View>
    );
}
