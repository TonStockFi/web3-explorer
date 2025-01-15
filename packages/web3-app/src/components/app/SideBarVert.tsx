import { View } from '@web3-explorer/uikit-view';
import { ImageIcon } from '@web3-explorer/uikit-view/dist/icons/ImageIcon';
import { HomHeaderHeight, MainNavList } from '../../constant';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import SideProIcon from './SideProIcon';
import SideSettings from './SideSettings';

export const SideBarVert = ({ isMiniSideBar, left }: { isMiniSideBar: boolean; left: number }) => {
    const { env, isFullScreen } = useIAppContext();

    const { t, theme, leftSideActions, openTab, currentTabId } = useBrowserContext();
    const actions = MainNavList.filter(row => row.side);

    const currentTabNav = currentTabId;
    let top = HomHeaderHeight;
    if (env.isMac && isFullScreen) {
        top = 0;
    }
    const actionsSide = [
        ...actions,
        ...leftSideActions.map(row => {
            return row;
        })
    ].filter(row => row && !row.hide);
    return (
        <View
            userSelectNone
            absFull
            top={top}
            zIdx={1}
            width={left}
            borderBox
            column
            aCenter
            jSpaceBetween
            // bgColor={theme.backgroundBrowserSide}
            sx={{
                boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.9)'
            }}
        >
            <View w100p column jStart aCenter pt12 px12={!isMiniSideBar} borderBox>
                {/* <View pb={16} h={44} center>
                </View> */}
                <View
                    list
                    hide={isMiniSideBar}
                    sx={{
                        '& .MuiListItem-root': { mb: 1 },
                        '& .MuiListItemButton-root': { borderRadius: 2, py: 0.5 },
                        '& .MuiTypography-root': { fontSize: '1rem' },
                        '& .Mui-selected': {
                            borderTopLeftRadius: 4,
                            borderBottomLeftRadius: 4,
                            borderLeft: `3px solid ${theme.buttonPrimaryBackgroundDisabled}`,
                            bgcolor: theme.backgroundPage
                        }
                    }}
                    w100p
                >
                    {actionsSide.map(action => {
                        return (
                            <View
                                onClick={() => {
                                    openTab(action.tabId, action.url, action.icon);
                                }}
                                listSelected={action.tabId === currentTabNav}
                                key={action.name}
                                listItemIcon={
                                    <View icon={<ImageIcon icon={action.icon!} size={20} />}></View>
                                }
                                listItemText={t(action.name)}
                            ></View>
                        );
                    })}
                </View>
                {isMiniSideBar &&
                    actionsSide.map(action => {
                        return (
                            <View
                                py={4}
                                pointer
                                borderBox
                                height={48}
                                onClick={() => {
                                    openTab(action.tabId, action.url, action.icon);
                                }}
                                tips={t(action.name)}
                                tipsPlacement="right"
                                key={action.name}
                                w100p
                                hoverBgColor={theme.backgroundContentTint}
                                center
                            >
                                <View
                                    pl={action.tabId === currentTabNav ? 0 : 3}
                                    sx={{
                                        borderLeft:
                                            action.tabId === currentTabNav
                                                ? `3px solid ${theme.buttonPrimaryBackgroundDisabled}`
                                                : undefined
                                    }}
                                    height={32}
                                    center
                                    borderBox
                                    wh100p
                                >
                                    <ImageIcon icon={action.icon!} size={28} />
                                </View>
                            </View>
                        );
                    })}
            </View>
            <View pb={6} w100p>
                <View w100p center column hide={!isMiniSideBar}>
                    <SideProIcon />
                    <SideSettings />
                </View>

                <View w100p borderBox rowVCenter px12 jSpaceBetween hide={isMiniSideBar}>
                    <SideProIcon />
                    <SideSettings />
                </View>
            </View>
        </View>
    );
};
