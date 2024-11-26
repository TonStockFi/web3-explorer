import { View } from '@web3-explorer/uikit-view';
import { useLocalStorageState } from '@web3-explorer/utils';
import { createRef, useEffect } from 'react';
import { AsideWidth } from '../../constant';
import { BrowserTab, useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { useScreenshotContext } from '../../providers/ScreenshotProvider';
import { MAIN_NAV_TYPE } from '../../types';
import { TabBar } from './TabBar';
import { WalletSide } from './WalletSide';
let totalItemsPrev = 0;

export const TopBar = () => {
    const ref = createRef<HTMLDivElement>();
    const { onCut } = useScreenshotContext();
    const { updateAt, currentTabId, tabs, addTab, closeTab, t, openTab } = useBrowserContext();

    const [minTabBar, setMinTabBar] = useLocalStorageState('minTabBar', false);
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

    useEffect(() => {
        if (!ref) return;
        if (!tabs.find(row => row.tabId === currentTabId)) {
            openTab(MAIN_NAV_TYPE.GAME_FI);
        }
        const totalItems = tabs.length;
        if (totalItems > totalItemsPrev) {
            ref.current!.scrollTo({
                left: 0
            });
        }
        totalItemsPrev = totalItems;
    }, [tabs, ref]);

    function handleMinBar() {
        const iconBarWidth = 36,
            barWdith = 136;
        const { clientWidth } = ref.current!;
        if ((tabs.length + 2) * barWdith + iconBarWidth + 10 > clientWidth) {
            setMinTabBar(true);
        } else {
            setMinTabBar(false);
        }
    }
    const mapFun = (row: BrowserTab) => {
        const tabId = row.tabId;
        return (
            <TabBar
                minTabBar={minTabBar}
                key={tabId}
                tabId={tabId}
                onClick={() => {
                    onCut(false);
                    handleMinBar();
                    openTab(tabId);
                }}
                onClose={() => {
                    handleMinBar();
                    closeTab(tabId);
                }}
            />
        );
    };

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
                <TabBar
                    tabId={MAIN_NAV_TYPE.GAME_FI}
                    minTabBar={minTabBar}
                    onClick={() => {
                        handleMinBar();
                        openTab(MAIN_NAV_TYPE.GAME_FI);
                    }}
                    onClose={() => {}}
                />
                {updateAt && tabs.filter(row => !row.tabId.startsWith('tab')).map(mapFun)}
                {updateAt && tabs.filter(row => row.tabId.startsWith('tab')).map(mapFun)}
                <View
                    mx={5}
                    px={3}
                    borderBox
                    onClick={() => {
                        handleMinBar();
                        addTab();
                    }}
                    icon={'Add'}
                    tips={t('NewTab')}
                    iconButtonSmall
                />
                <View sx={{ cursor: 'move' }} appRegionDrag flex1 h={36} />
            </View>
            <View abs h100p right={6} bottom0>
                <WalletSide />
            </View>
        </View>
    );
};
