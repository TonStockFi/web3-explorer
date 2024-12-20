import { View } from '@web3-explorer/uikit-view';
import { createRef, useEffect } from 'react';
import { AsideWidth } from '../../constant';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { MAIN_NAV_TYPE } from '../../types';
import { TabBar } from './TabBar';

export const TopBar = () => {
    const ref = createRef<HTMLDivElement>();
    const { currentTabId, updateAt, t, browserTabs, closeTab, openTab } = useBrowserContext();
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
    const firstTabs = [MAIN_NAV_TYPE.GAME_FI, MAIN_NAV_TYPE.DISCOVERY] as string[];
    const tabs = Array.from(browserTabs).map(row => row[1]);
    const mainTabs = tabs.filter(row => !row.tabId.startsWith('tab_')).map(row => row.tabId);
    const currentTabs = tabs
        .filter(row => {
            return (
                row.tabId.startsWith('tab_') &&
                currentTabId === row.tabId &&
                mainTabs.indexOf(row.tabId) === -1 &&
                firstTabs.indexOf(row.tabId) === -1
            );
        })
        .map(row => row.tabId);
    const urlTabs = tabs
        .filter(row => {
            return (
                row.tabId.startsWith('tab_') &&
                // currentTabId !== row.tabId &&
                mainTabs.indexOf(row.tabId) === -1 &&
                firstTabs.indexOf(row.tabId) === -1
            );
        })
        .map(row => row.tabId);
    urlTabs.reverse();
    const showPlus = currentTabId !== MAIN_NAV_TYPE.DISCOVERY;
    return (
        <View borderBox relative flx rowVCenter m={8} borderRadius={8} mr={0}>
            <View
                flex1
                rowVCenter
                overflowXAuto
                ref={ref}
                mr={walletAside ? AsideWidth : 0}
                miniScrollBar
            >
                {[MAIN_NAV_TYPE.GAME_FI, MAIN_NAV_TYPE.DISCOVERY].map(row => {
                    return (
                        <TabBar
                            key={row}
                            tabId={row}
                            minTabBar={false}
                            onClick={() => {
                                openTab(row);
                            }}
                            onClose={() => {
                                closeTab(row);
                            }}
                        />
                    );
                })}
                {[...mainTabs].map(row => {
                    return (
                        <TabBar
                            key={row}
                            tabId={row}
                            minTabBar={false}
                            onClick={() => {
                                openTab(row);
                            }}
                            onClose={() => {
                                closeTab(row);
                            }}
                        />
                    );
                })}

                {[...urlTabs].map(row => {
                    return (
                        <TabBar
                            key={row}
                            tabId={row}
                            minTabBar={false}
                            onClick={() => {
                                openTab(row);
                            }}
                            onClose={() => {
                                closeTab(row);
                            }}
                        />
                    );
                })}
                {/* {[...currentTabs].map(row => {
                    return (
                        <TabBar
                            key={row}
                            tabId={row}
                            minTabBar={false}
                            onClick={() => {
                                openTab(row);
                            }}
                            onClose={() => {
                                closeTab(row);
                            }}
                        />
                    );
                })} */}
                <View appRegionDrag={!walletAside} flex1 h={36} mr={showPlus ? 44 : 0} />
                <View abs right={12} top={0} rowVCenter hide={!showPlus}>
                    <View
                        tips={t('AddTab')}
                        iconButtonSmall
                        icon={'Add'}
                        onClick={() => {
                            openTab(MAIN_NAV_TYPE.DISCOVERY);
                        }}
                    ></View>
                </View>
            </View>
        </View>
    );
};
