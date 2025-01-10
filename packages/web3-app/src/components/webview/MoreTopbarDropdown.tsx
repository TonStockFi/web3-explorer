import { useTranslation } from '@web3-explorer/lib-translation';
import Fade from '@web3-explorer/uikit-mui/dist/mui/Fade';
import IconButton from '@web3-explorer/uikit-mui/dist/mui/IconButton';
import ListItemIcon from '@web3-explorer/uikit-mui/dist/mui/ListItemIcon';
import Menu from '@web3-explorer/uikit-mui/dist/mui/Menu';
import { View } from '@web3-explorer/uikit-view';
import { ImageIcon } from '@web3-explorer/uikit-view/dist/icons/ImageIcon';
import * as React from 'react';
import { useTheme } from 'styled-components';
import { isPlaygroundWebApp } from '../../common/helpers';
import { TWA_URL_PREFIX } from '../../constant';
import { BrowserTab } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { isDeviceMonitor, usePlayground } from '../../providers/PlaygroundProvider';
import TgAuthService from '../../services/TgAuthService';
import TgTwaIframeService from '../../services/TgTwaIframeService';
import WebviewMainEventService from '../../services/WebviewMainEventService';
import WebviewMuteService from '../../services/WebviewMuteService';
import WebviewService from '../../services/WebviewService';
import WebviewServiceTelegram from '../../services/WebviewServiceTelegram';
import { AccountPublic } from '../../types';

export default function MoreTopbarDropdown({
    currentAccount,
    tabId,
    tgUrl
}: {
    tab: Partial<BrowserTab>;
    enableGeminiTransScreen?: boolean;
    tgUrl?: string;
    currentAccount?: null | AccountPublic;
    tabId: string;
}) {
    const [isMute, setIsMute] = React.useState(false);
    const { tab } = usePlayground();
    const isTma = tab.url && tab.url.startsWith(TWA_URL_PREFIX);
    const [isIframe, setIsIframe] = React.useState(true);
    const [iframeUrl, setIframeUrl] = React.useState('');
    const [isTgLogged, setIsTgLogged] = React.useState(false);

    const { showConfirm } = useIAppContext();
    const theme = useTheme();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const { t } = useTranslation();
    const open = Boolean(anchorEl);
    const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        const ws = new WebviewServiceTelegram(tabId);
        const url = ws.getWebviewUrl();
        if (isTma) {
            const isLogged = await ws.isLogged();
            setIsTgLogged(isLogged);
            const iframeUrl = await ws.checkTgIframeUrl();
            setIsIframe(!!iframeUrl);
            if (currentAccount) {
                const url = await new TgTwaIframeService(currentAccount, tab.tabId).get();
                setIframeUrl(url || '');
            }
        }
        setTimeout(async () => {
            if (url) {
                const ms = new WebviewMuteService(url, ws.getAccountIndex());
                const mute = await ms.get();
                setIsMute(!!mute);
            }
        }, 200);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    if (!tab) {
        return null;
    }
    const slotProps = {
        paper: {
            elevation: 0,
            sx: {
                bgcolor: theme.backgroundContentAttention,
                overflow: 'visible',
                width: '280px',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 2.5,
                ml: 1,
                '& li': {
                    paddingTop: '0px!important',
                    paddingBottom: '0px!important',
                    minHeight: '36px'
                },
                '&::before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 12,
                    width: 10,
                    height: 10,
                    bgcolor: theme.backgroundContentAttention,
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0
                }
            }
        }
    };
    const isDevice = isDeviceMonitor(tab);
    const url = new WebviewService(tab.tabId).getWebviewUrl();
    return (
        <View empty>
            <IconButton
                size={'small'}
                sx={{ width: 28, height: 28, mr: 1 }}
                onClick={handleClick}
                edge="start"
                color="inherit"
                aria-label="menu"
                aria-controls={open ? 'fade-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
            >
                <View iconSmall icon={'MoreVert'} />
            </IconButton>
            <Menu
                slotProps={slotProps}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                id="top-menu"
                MenuListProps={{
                    'aria-labelledby': 'fade-button'
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                TransitionComponent={Fade}
            >
                <View
                    hide={!isPlaygroundWebApp() || isDevice}
                    menuItem
                    onClick={async () => {
                        setAnchorEl(null);
                        if (tab.url) {
                            new WebviewService(tab.tabId).goTo(tab.url);
                        }
                    }}
                >
                    <ListItemIcon>
                        <View icon={'Home'} iconSmall />
                    </ListItemIcon>
                    <View text={t(`主页`)} textFontSize="0.9rem" />
                </View>
                <View
                    hide={true}
                    menuItem
                    onClick={async () => {
                        setAnchorEl(null);
                        new WebviewMainEventService().openLLMWindow({
                            site: 'ChatGpt'
                        });
                    }}
                >
                    <ListItemIcon>
                        <View icon={<ImageIcon icon={'icon_chatgpt'} size={16} />} iconSmall />
                    </ListItemIcon>
                    <View text={t(`ChatGpt`)} textFontSize="0.9rem" />
                </View>
                {/* <View divider hide={!isPlaygroundWebApp()}></View> */}
                <View
                    menuItem
                    hide={!isTgLogged}
                    onClick={async () => {
                        setAnchorEl(null);
                        if (currentAccount) {
                            showConfirm({
                                id: 'logout',
                                title: '提示',
                                content: '确认要退出么？',
                                onCancel: () => {
                                    showConfirm(false);
                                },
                                onConfirm: async () => {
                                    const tgs = new TgAuthService(
                                        currentAccount.id,
                                        currentAccount.index
                                    );
                                    await tgs.remove();
                                    const ws = new WebviewServiceTelegram(tabId);
                                    await ws.removeAuthInfo();
                                    await new TgTwaIframeService(currentAccount, tabId).remove();
                                    ws.goTo(tgUrl!);
                                    showConfirm(false);
                                }
                            });
                        }
                    }}
                >
                    <ListItemIcon>
                        <View icon={'Logout'} iconSmall />
                    </ListItemIcon>
                    <View text={t(`退出Telegram账户`)} textFontSize="0.9rem" />
                </View>
                {Boolean(isTma && iframeUrl && currentAccount) && (
                    <View
                        menuItem
                        onClick={async () => {
                            setAnchorEl(null);
                            const ws = new WebviewServiceTelegram(tabId);
                            const ttis = new TgTwaIframeService(currentAccount!, tab.tabId);
                            if (isIframe) {
                                await ttis.enableIframe(true);
                                ws.goTo(iframeUrl);
                            } else {
                                await ttis.enableIframe(false);
                                ws.goTo(tab.url!);
                                setIframeUrl('');
                            }
                        }}
                    >
                        <ListItemIcon>
                            <View icon={'Public'} iconSmall />
                        </ListItemIcon>
                        <View
                            text={t(isIframe ? `使用系统浏览器` : '使用Telegram内置浏览器')}
                            textFontSize="0.9rem"
                        />
                    </View>
                )}

                <View
                    menuItem
                    onClick={async () => {
                        const ws = new WebviewService(tabId);
                        ws.reloadWebview();
                        setAnchorEl(null);
                    }}
                >
                    <ListItemIcon>
                        <View icon={'Refresh'} iconSmall />
                    </ListItemIcon>
                    <View text={t(`reload`)} textFontSize="0.9rem" />
                </View>

                <View
                    menuItem
                    hide={isDevice}
                    onClick={async () => {
                        setAnchorEl(null);
                        const ws = new WebviewService(tabId);
                        const url = ws.getWebviewUrl();
                        if (url) {
                            ws.setAudioMuted(!isMute);
                            setIsMute(!isMute);
                            const ms = new WebviewMuteService(url, ws.getAccountIndex());
                            ms.save(!isMute);
                        }
                    }}
                >
                    <ListItemIcon>
                        <View icon={!isMute ? 'VolumeUp' : 'VolumeOff'} iconSmall />
                    </ListItemIcon>
                    <View text={t(isMute ? `AudioUnMuted` : 'AudioMuted')} textFontSize="0.9rem" />
                </View>
                <View
                    menuItem
                    onClick={async () => {
                        const ws = new WebviewService(tabId);
                        if (ws.getWebview()) {
                            ws.getWebview()?.openDevTools();
                        }
                        setAnchorEl(null);
                    }}
                >
                    <ListItemIcon>
                        <View icon={'AdsClick'} iconSmall />
                    </ListItemIcon>
                    <View text={t('InspectElement')} textFontSize="0.9rem" />
                </View>
            </Menu>
        </View>
    );
}
