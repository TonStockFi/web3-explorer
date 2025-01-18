import Input from '@web3-explorer/uikit-mui/dist/mui/Input';
import InputAdornment from '@web3-explorer/uikit-mui/dist/mui/InputAdornment';
import { View } from '@web3-explorer/uikit-view';
import { createRef, useEffect } from 'react';
import { useTheme } from 'styled-components';
import { goToUrlFromInput } from '../../common/helpers';
import { WALLET_LIST_WIDTH } from '../../constant';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { MAIN_NAV_TYPE } from '../../types';
import { TabBar } from './TabBar';
import { WalletSide } from './WalletSide';

export const TopBar = () => {
    const ref = createRef<HTMLDivElement>();
    const {
        currentTabId,
        urlSearch,
        onChangeUrlSearch,
        updateAt,
        openTabFromWebview,
        t,
        browserTabs,
        closeTab,
        openTab
    } = useBrowserContext();
    const { walletAside, showWalletList } = useIAppContext();

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
    const theme = useTheme();
    const firstTabs = [MAIN_NAV_TYPE.GAME_FI, MAIN_NAV_TYPE.DISCOVERY] as string[];
    const tabs = Array.from(browserTabs).map(row => row[1]);
    const mainTabs = tabs.filter(row => !row.tabId.startsWith('tab_')).map(row => row.tabId);

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
    // urlTabs.reverse();
    const showPlus = currentTabId !== MAIN_NAV_TYPE.DISCOVERY;
    let mr = showPlus ? 44 : 0;
    if (showWalletList) {
        mr = WALLET_LIST_WIDTH;
    }
    return (
        <View borderBox relative h100p flx rowVCenter mt={4} borderRadius={8} mr={0}>
            <View
                rowVCenter
                overflowXAuto
                flx
                ref={ref}
                right={showWalletList ? WALLET_LIST_WIDTH : 12}
                abs
                left0
            >
                <View pl={0} pr={8} sx={{ minWidth: 120 }}>
                    <WalletSide />
                </View>
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
                <View
                    hide
                    tips={'添加网址'}
                    iconButtonSmall
                    icon={'Add'}
                    onClick={() => {
                        onChangeUrlSearch('');
                    }}
                ></View>
                <View appRegionDrag={true} flex1 h={36} />
            </View>
            <View
                hide={urlSearch === undefined}
                zIdx={10000}
                position={'fixed'}
                top0
                bottom0
                xx0
                center
            >
                <View
                    zIdx={0}
                    absFull
                    onClick={() => {
                        onChangeUrlSearch(undefined);
                    }}
                ></View>
                <View
                    onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    // abs
                    zIdx={1}
                    mt={-200}
                    px={24}
                    py={16}
                    borderRadius={8}
                    bgColor={theme.backgroundBrowser}
                    sx={{
                        border: `1px solid ${theme.separatorCommon}`,
                        minWidth: 450,
                        boxShadow: `0px 2px 19px 12px rgb(0 0 0 / 16%)s`
                    }}
                >
                    <View>
                        <Input
                            onKeyDown={(e: any) => {
                                if (e.key === 'Enter') {
                                    let newUrl = e.target.value;
                                    goToUrlFromInput(newUrl, openTabFromWebview, () => {
                                        onChangeUrlSearch(undefined);
                                    });
                                }
                            }}
                            type="text"
                            value={urlSearch}
                            onChange={e => {
                                onChangeUrlSearch(e.target.value.trim());
                            }}
                            placeholder="请输入网址,点击回车键继续"
                            sx={{ width: '100%' }}
                            startAdornment={
                                <InputAdornment position="start">
                                    <View icon="Search" iconSmall />
                                </InputAdornment>
                            }
                            autoFocus
                            disableUnderline
                        ></Input>
                    </View>
                </View>
            </View>
        </View>
    );
};
