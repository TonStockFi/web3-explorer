import { View } from '@web3-explorer/uikit-view';
import { useEffect, useState } from 'react';
import { DiscoverView } from '../../components/discover/DiscoverView';
import { WebviewAppView } from '../../components/webview/WebviewAppView';
import { WebviewTwa } from '../../components/webview/WebviewTwa';
import { useAccountWallePartitionId } from '../../hooks/wallets';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { MAIN_NAV_TYPE } from '../../types';

export function WebviewPage() {
    const { browserTabs, currentTabId } = useBrowserContext();
    const partitionId = useAccountWallePartitionId();
    const tab = browserTabs.get(currentTabId);
    const [ready, setReady] = useState(false);
    const showDiscover = currentTabId.startsWith('tab') && !tab?.initUrl;

    useEffect(() => {
        setReady(true);
    }, []);
    if (!ready && showDiscover) {
        return null;
    }

    return (
        <View wh100p userSelectNone flx row relative>
            <View flex1>
                {Array.from(browserTabs)
                    .map(row => row[0])
                    .filter(row => row.startsWith('tab'))
                    .map(tabId => (
                        <View key={tabId} empty>
                            {[partitionId].map(pid => (
                                <WebviewAppView tabId={tabId} key={pid} />
                            ))}
                        </View>
                    ))}
                <View
                    absFull
                    left={8}
                    bottom={8}
                    top={8}
                    right={8}
                    zIdx={showDiscover ? 1 : -1}
                    opacity={showDiscover ? 1 : 0}
                >
                    <DiscoverView showDiscover={showDiscover} tabId={'assets_ana'} />
                </View>
                <View
                    absFull
                    left={0}
                    bottom={8}
                    top={0}
                    right={0}
                    zIdx={currentTabId == MAIN_NAV_TYPE.GAME_FI ? 1 : -1}
                    opacity={currentTabId == MAIN_NAV_TYPE.GAME_FI ? 1 : 0}
                >
                    <WebviewTwa />
                </View>
            </View>
        </View>
    );
}
