import { View } from '@web3-explorer/uikit-view';
import { createRef, useEffect } from 'react';
import { AsideWidth } from '../../constant';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { MAIN_NAV_TYPE } from '../../types';
import { TabBar } from './TabBar';
import { WalletSide } from './WalletSide';

export const TopBar = () => {
    const ref = createRef<HTMLDivElement>();
    const { currentTabId, openTab } = useBrowserContext();
    const { walletAside } = useIAppContext();

    useEffect(() => {
        const handleKeyDown = (event: any) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 't') {
                event.preventDefault();
                openTab(MAIN_NAV_TYPE.GAME_FI);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <View borderBox relative flx rowVCenter m={8} borderRadius={8} mr={0}>
            <View
                flex1
                rowVCenter
                overflowXAuto
                ref={ref}
                mr={walletAside ? AsideWidth : 180}
                miniScrollBar
            >
                {[currentTabId].map(row => {
                    return (
                        <TabBar
                            key={row}
                            tabId={row}
                            minTabBar={false}
                            onClick={() => {}}
                            onClose={() => {}}
                        />
                    );
                })}
                <View appRegionDrag flex1 h={36} />
            </View>

            <View abs h100p right={6} bottom0 jEnd rowVCenter>
                <WalletSide />
            </View>
        </View>
    );
};
``;
