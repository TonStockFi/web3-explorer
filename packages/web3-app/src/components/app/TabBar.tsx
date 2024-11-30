import { md5 } from '@web3-explorer/lib-crypto/dist/utils';
import { ImageIcon } from '@web3-explorer/uikit-view/dist/icons/ImageIcon';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { useEffect, useState } from 'react';
import { hexToRGBA, isDesktop } from '../../common/utils';
import { MainNavList } from '../../constant';
import { useBrowserContext } from '../../providers/BrowserProvider';
import BrowserFavoricoService from '../../services/BrowserFavoricoService';
import BrowserHistoryService from '../../services/BrowserHistoryService';
import { MAIN_NAV_TYPE } from '../../types';
import { SpinnerIcon } from '../Spinner';

export function Corner({
    type,
    hover,
    width,
    isSelected
}: {
    width: number;
    type: 'left' | 'right';
    isSelected: boolean;
    hover: boolean;
}) {
    const { theme } = useBrowserContext();
    if (!isSelected) return null;
    return (
        <View w={width} h100p aEnd jEnd relative overflowHidden>
            <View zIdx={1} relative bottom0 wh={width} bgColor={theme.backgroundBrowserActive} />
            <View
                zIdx={2}
                abs
                bottom0
                wh={width}
                sx={
                    type === 'left'
                        ? {
                              borderBottomRightRadius: hover || isSelected ? 10 : 0
                          }
                        : {
                              borderBottomLeftRadius: hover || isSelected ? 10 : 0
                          }
                }
                bgColor={theme.backgroundBrowser}
            />
        </View>
    );
}
export function TabBar({
    minTabBar,
    tabId,
    onClose,
    onClick
}: {
    minTabBar: boolean;
    tabId: string;
    icon?: string;
    onClose?: () => void;
    onClick: () => void;
}) {
    const { browserTabs, currentTabId, t, theme } = useBrowserContext();
    const tab = browserTabs.get(tabId);
    let { name, discover, initUrl, icon } = tab! || {};
    const isSelected = currentTabId === tabId;

    const noClose = tabId === MAIN_NAV_TYPE.GAME_FI;
    let mainNav =
        !tabId.startsWith('tab') ||
        tabId === MAIN_NAV_TYPE.GAME_FI ||
        tabId === MAIN_NAV_TYPE.CHATGPT;

    if (mainNav) {
        const navTab = MainNavList.find(row => row.tabId === tabId)!;
        if (navTab) {
            name = navTab.name;
            icon = navTab.icon;
        }
    }
    const [loading, setLoading] = useState(false);
    const [hover, setHover] = useState(false);
    const [icon1, setIcon] = useState(icon);

    let d_title = name;
    if (!mainNav && !initUrl) {
        d_title = 'NewTab';
    }
    const [title1, setTitle] = useState(d_title);

    useEffect(() => {
        if (!mainNav && initUrl && !discover) {
            if (!icon1) {
                const { host } = new URL(initUrl);
                new BrowserFavoricoService(host).get().then((res: any) => {
                    if (res) {
                        setIcon(res.icon);
                    }
                });
            }
            if (!title1) {
                const hash = md5(initUrl);
                new BrowserHistoryService(hash).get().then((res: any) => {
                    if (res) {
                        setTitle(res.title);
                    }
                });
            }
        }
    }, [initUrl, icon1, title1, discover]);

    useEffect(() => {
        const handleSiteLoading = (event: any) => {
            const { detail } = event as any;
            isDesktop() && setLoading(detail.loading);
        };

        const handleSiteTitleUpated = (event: any) => {
            const { detail } = event as any;
            console.log('handleSite TitleUpated', detail);
            isDesktop() && setTitle(detail.title);
        };

        const handleSiteFavorUpdated = (event: any) => {
            const { detail } = event as any;
            console.log('handleSite FavorUpdated', detail);
            isDesktop() && setIcon(detail.icon);
        };

        if (!mainNav) {
            window.addEventListener(`siteLoading_${tabId}`, handleSiteLoading);
            window.addEventListener(`siteTitleUpated_${tabId}`, handleSiteTitleUpated);
            window.addEventListener(`siteFavorUpated_${tabId}`, handleSiteFavorUpdated);
        }
        return () => {
            if (!mainNav) {
                window.addEventListener(`siteLoading_${tabId}`, handleSiteLoading);
                window.addEventListener(`siteTitleUpated_${tabId}`, handleSiteTitleUpated);
                window.addEventListener(`siteFavorUpated_${tabId}`, handleSiteFavorUpdated);
            }
        };
    }, [mainNav, discover]);

    const IconNode = () => (
        <>
            <View w={20} center hide={mainNav}>
                <View empty hide={!tab?.initUrl}>
                    <View hide={!icon}>
                        <View wh={20} center>
                            <ImageIcon icon={icon!} size={16} />
                        </View>
                    </View>
                    <View hide={!!icon}>
                        <View wh={20} center hide={loading}>
                            {icon1 && <ImageIcon icon={discover ? icon! : icon1} size={16} />}
                            {!icon1 && <SpinnerIcon />}
                        </View>
                        <View wh={20} center hide={!loading}>
                            <SpinnerIcon />
                        </View>
                    </View>
                </View>
                <View empty hide={!!tab?.initUrl}>
                    <View wh={20} center>
                        <View
                            iconProps={{ sx: { width: 16, height: 16 } }}
                            iconSmall
                            icon={'Tab'}
                        />
                    </View>
                </View>
            </View>
            <View center hide={!mainNav}>
                <ImageIcon icon={icon1!} size={16} />
            </View>
        </>
    );
    const TitleNode = ({ w }: { w: number | string }) => {
        const { t } = useBrowserContext();
        const tt = Boolean(tab && tab.twa && tab.name) ? tab!.name! : title1!;
        return (
            <View
                w={w}
                h={24}
                textProps={{
                    sx: {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxHeight: 24,
                        width: '100%',
                        whiteSpace: 'nowrap'
                    }
                }}
                jStart
                aCenter
                textFontSize="small"
                text={t(tt)}
            />
        );
    };
    const CloseNode = () => (
        <View
            hide={noClose}
            onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                onClose && onClose();
                return false;
            }}
            iconButton={{ size: 'small' }}
            iconButtonColor={theme.textPrimary}
            icon={'Close'}
            iconButtonProps={{ sx: { p: '2px' } }}
            iconProps={{ sx: { p: '2px', fontSize: '0.8rem' } }}
        />
    );
    let borerRadius: any = {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
    };
    if (!isSelected) {
        borerRadius = {
            ...borerRadius,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8
        };
    }
    let hideTilte = true;
    let widthBar = 20;
    if (minTabBar) {
        if (isSelected || hover) {
            hideTilte = false;
            widthBar = 120;
        }
    } else {
        hideTilte = false;
        widthBar = 120;
    }
    if (tabId === MAIN_NAV_TYPE.GAME_FI || tabId === MAIN_NAV_TYPE.WALLET) {
        hideTilte = false;
        widthBar = 120;
    }

    return (
        <>
            <View h={!isSelected ? 30 : 36} mt={0} mx={0}>
                <View h100p relative rowVCenter jCenter px={isSelected ? 0 : 8}>
                    <Corner width={8} type={'left'} hover={false} isSelected={isSelected} />
                    <View
                        onClick={onClick}
                        rowVCenter
                        h100p
                        flex1
                        borderRadiusTop={8}
                        w={widthBar}
                        overflowHidden
                        pointer
                        // sx={{
                        //     transition: 'width 0.5s ease'
                        // }}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        borderRadiusBottom={isSelected ? 0 : 8}
                        hoverBgColor={
                            isSelected ? undefined : hexToRGBA(theme.backgroundBrowserActive, 0.5)
                        }
                        bgColor={isSelected ? theme.backgroundBrowserActive : undefined}
                    >
                        <View abs top0 w={20} center h100p pl={4}>
                            <IconNode />
                        </View>
                        <View pl={28} hide={hideTilte} w={'calc(100% - 48px)'}>
                            <TitleNode w={'100%'} />
                            <View
                                abs
                                opacity={hover ? 1 : 0}
                                sx={{
                                    transition: hover ? 'opacity 0.3s ease' : undefined
                                }}
                                top0
                                right={hover ? 10 : -10}
                                w={20}
                                center
                                h100p
                            >
                                <CloseNode />
                            </View>
                        </View>
                    </View>
                    <Corner width={8} type={'right'} hover={false} isSelected={isSelected} />
                </View>
            </View>
        </>
    );
}
