import { View } from '@web3-explorer/uikit-view';
import { ImageIcon } from '@web3-explorer/uikit-view/dist/icons/ImageIcon';
import { HomHeaderHeight, MainNavList, SiderBarWidth } from '../../constant';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { usePro } from '../../providers/ProProvider';
import WebviewMainEventService from '../../services/WebviewMainEventService';
import { MAIN_NAV_TYPE } from '../../types';
import SettingItems from '../SettingItems';

export const SideBarVert = () => {
    const { env, isFullScreen } = useIAppContext();
    const { onShowProBuyDialog } = usePro();
    const { t, theme, openTab, currentTabId } = useBrowserContext();
    const actions = MainNavList.filter(row => row.side);
    const currentTabNav = currentTabId;
    let top = HomHeaderHeight;
    if (env.isMac && isFullScreen) {
        top = 0;
    }
    if (env.isWin) {
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
            bgColor={theme.backgroundBrowserSide}
            sx={{
                boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.9)'
            }}
        >
            <View w100p column jStart aCenter pt12>
                {actions.map(action => {
                    return (
                        <View
                            py={4}
                            pointer
                            borderBox
                            height={48}
                            onClick={() => {
                                if (
                                    action.tabId === MAIN_NAV_TYPE.CHATGPT ||
                                    action.tabId === MAIN_NAV_TYPE.GENIMI
                                ) {
                                    new WebviewMainEventService().openLLMWindow(env, {
                                        type: 'COMMON',
                                        site:
                                            action.tabId === MAIN_NAV_TYPE.CHATGPT
                                                ? 'ChatGpt'
                                                : 'Gemini'
                                    });
                                } else {
                                    openTab(action.tabId);
                                }
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
                    <View
                        mb={6}
                        iconButton
                        iconSmall
                        icon={'Diamond'}
                        onClick={() => {
                            onShowProBuyDialog(true);
                        }}
                    ></View>
                    <SettingItems />
                </View>
            </View>
        </View>
    );
};
