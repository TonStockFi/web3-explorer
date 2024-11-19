import Fade from '@web3-explorer/uikit-mui/dist/mui/Fade';
import IconButton from '@web3-explorer/uikit-mui/dist/mui/IconButton';
import ListItemIcon from '@web3-explorer/uikit-mui/dist/mui/ListItemIcon';
import Menu from '@web3-explorer/uikit-mui/dist/mui/Menu';
import { View } from '@web3-explorer/uikit-view';
import { ImageIcon } from '@web3-explorer/uikit-view/dist/icons/ImageIcon';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import { copyImageToClipboard } from '../../common/image';
import { urlToDataUri } from '../../common/opencv';
import { currentTs } from '../../common/utils';
import { BrowserTab } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { useScreenshotContext } from '../../providers/ScreenshotProvider';
import TgTwaIframeService from '../../services/TgTwaIframeService';
import WebviewMainEventService from '../../services/WebviewMainEventService';
import WebviewMuteService from '../../services/WebviewMuteService';
import WebviewService from '../../services/WebviewService';
import { AccountPublic } from '../../types';

export default function MoreTopbarDropdown({
    currentAccount,
    tabId,
    tab,
    enableGeminiTransScreen,
    tgUrl
}: {
    tab: Partial<BrowserTab>;
    enableGeminiTransScreen?: boolean;
    tgUrl?: string;
    currentAccount?: null | AccountPublic;
    tabId: string;
}) {
    const [isMute, setIsMute] = React.useState(false);
    const { isCutEnable, onCut } = useScreenshotContext();
    const { showBackdrop, showSnackbar, env } = useIAppContext();
    const { t } = useTranslation();
    const theme = useTheme();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const open = Boolean(anchorEl);

    const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        setTimeout(async () => {
            const ws = new WebviewService(tabId);
            const url = ws.getWebviewUrl();
            if (url) {
                const ms = new WebviewMuteService(url, ws.getAccountIndex());
                const mute = await ms.get();
                setIsMute(!!mute);
            }
        }, 800);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const slotProps = {
        paper: {
            elevation: 0,
            sx: {
                bgcolor: theme.backgroundContentAttention,
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 2.5,
                ml: 1.6,
                '&::before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 10,
                    width: 10,
                    height: 10,
                    bgcolor: theme.backgroundContentAttention,
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0
                }
            }
        }
    };

    return (
        <View empty>
            <IconButton
                size={'small'}
                sx={{ width: 28, height: 28 }}
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
                    hide={tab.twa}
                    menuItem
                    onClick={async () => {
                        setAnchorEl(null);
                        onCut(!isCutEnable);
                    }}
                >
                    <ListItemIcon>
                        <View icon={'ContentCut'} iconSmall />
                    </ListItemIcon>
                    <View text={t(`区域截图`)} textFontSize="0.9rem" />
                </View>
                <View
                    hide={!enableGeminiTransScreen}
                    menuItem
                    onClick={async () => {
                        setAnchorEl(null);
                        const ws = new WebviewService(tabId);
                        if (!ws.webviewIsReady()) {
                            showSnackbar({ message: '截取屏幕失败，请等等网页加载完成再试' });
                            new WebviewMainEventService().openLLMWindow(env, {
                                type: 'COMMON',
                                site: 'Gemini'
                            });
                        } else {
                            showBackdrop(true);
                            try {
                                const screenBlob = await ws.getScreenImageBlob();
                                if (screenBlob) {
                                    await copyImageToClipboard(screenBlob);
                                    const imgData = await urlToDataUri(
                                        URL.createObjectURL(screenBlob)
                                    );
                                    new WebviewMainEventService().openLLMWindow(env, {
                                        site: 'Gemini',
                                        type: 'TRANS_IMG_GEMINI',
                                        ts: currentTs(),
                                        imgData
                                    });
                                }
                            } catch (error) {
                                console.error(error);
                            } finally {
                                showBackdrop(false);
                            }
                        }
                    }}
                >
                    <ListItemIcon>
                        <View
                            iconColor="red"
                            icon={<ImageIcon icon={'icon_gemini'} size={18} />}
                            iconSmall
                        />
                    </ListItemIcon>
                    <View text={t(`用Gemini识别并翻译屏幕`)} textFontSize="0.9rem" />
                </View>

                <View
                    menuItem
                    hide={!tgUrl || !currentAccount}
                    onClick={async () => {
                        setAnchorEl(null);
                        if (currentAccount) {
                            const ws = new WebviewService(tabId);
                            await new TgTwaIframeService(currentAccount, tabId).remove();
                            ws.goTo(tgUrl!);
                        }
                    }}
                >
                    <ListItemIcon>
                        <View icon={'Logout'} iconSmall />
                    </ListItemIcon>
                    <View text={t(`从Telegram重新登录`)} textFontSize="0.9rem" />
                </View>
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
