import { View } from '@web3-explorer/uikit-view';
import { useEffect, useState } from 'react';
import { useTheme } from 'styled-components';
import { WebviewAppView } from '../../components/webview/WebviewAppView';
import { WebviewDiscoverApps } from '../../components/webview/WebviewDiscoverApps';
import { useAccountWallePartitionId } from '../../hooks/wallets';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { MAIN_NAV_TYPE } from '../../types';

export function WebviewPage() {
    const { browserTabs, currentTabId } = useBrowserContext();
    const partitionId = useAccountWallePartitionId();

    const [ready, setReady] = useState(false);
    const theme = useTheme();
    useEffect(() => {
        setReady(true);
    }, []);
    if (!ready) {
        return null;
    }
    return (
        <View wh100p userSelectNone flx row relative>
            <View flex1>
                {Array.from(browserTabs)
                    .map(row => row[0])
                    .filter(row => row.startsWith('tab'))
                    .filter(row => row !== MAIN_NAV_TYPE.DISCOVERY)
                    .filter(row => row !== MAIN_NAV_TYPE.GAME_FI)
                    .map(tabId => (
                        <View key={tabId} empty>
                            {[partitionId].map(pid => (
                                <WebviewAppView tabId={tabId} key={pid} />
                            ))}
                        </View>
                    ))}
                <View
                    bgColor={theme.backgroundBrowserActive}
                    absFull
                    bottom={8}
                    zIdx={currentTabId === MAIN_NAV_TYPE.DISCOVERY ? 1 : -1}
                    opacity={currentTabId === MAIN_NAV_TYPE.DISCOVERY ? 1 : 0}
                >
                    <WebviewDiscoverApps winId={'Discover'} tabId={MAIN_NAV_TYPE.DISCOVERY} />
                </View>
                <View
                    bgColor={theme.backgroundBrowserActive}
                    absFull
                    bottom={8}
                    zIdx={currentTabId == MAIN_NAV_TYPE.GAME_FI ? 1 : -1}
                    opacity={currentTabId == MAIN_NAV_TYPE.GAME_FI ? 1 : 0}
                >
                    <WebviewDiscoverApps winId={'Games'} tabId={MAIN_NAV_TYPE.GAME_FI} />
                </View>
            </View>
        </View>
    );
}
