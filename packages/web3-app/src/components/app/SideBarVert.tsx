import { View } from '@web3-explorer/uikit-view';
import { ImageIcon } from '@web3-explorer/uikit-view/dist/icons/ImageIcon';
import { HomHeaderHeight, MainNavList, SiderBarWidth } from '../../constant';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import SideProIcon from './SideProIcon';
import SideSettingIcon from './SideSettingIcon';

export const SideBarVert = () => {
    const { env, isFullScreen } = useIAppContext();

    const { t, theme, leftSideActions, openTab, currentTabId } = useBrowserContext();
    const actions = MainNavList.filter(row => row.side);

    const currentTabNav = currentTabId;
    let top = HomHeaderHeight;
    if (env.isMac && isFullScreen) {
        top = 0;
    }
    return (
        <View
            userSelectNone
            absFull
            top={top}
            zIdx={1}
            width={SiderBarWidth}
            borderBox
            column
            aCenter
            jSpaceBetween
            // bgColor={theme.backgroundBrowserSide}
            sx={{
                boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.9)'
            }}
        >
            <View w100p column jStart aCenter pt12>
                {[
                    ...actions,
                    ...leftSideActions.map(row => {
                        return row;
                    })
                ]
                    .filter(row => !row.hide)
                    .map(action => {
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
            <View pb12 w100p>
                <View w100p center column>
                    <SideProIcon />
                    <SideSettingIcon />
                </View>
            </View>
        </View>
    );
};
