import Fade from '@web3-explorer/uikit-mui/dist/mui/Fade';
import ListItemIcon from '@web3-explorer/uikit-mui/dist/mui/ListItemIcon';
import Menu from '@web3-explorer/uikit-mui/dist/mui/Menu';
import { View } from '@web3-explorer/uikit-view/dist/View';
import React, { createRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import { useIAppContext } from '../../providers/IAppProvider';
import { useScreenshotContext } from '../../providers/ScreenshotProvider';
import WebviewMainEventService from '../../services/WebviewMainEventService';
import WebviewMuteService from '../../services/WebviewMuteService';
import WebviewService from '../../services/WebviewService';
import { ContextMenuProps } from '../../types';
import { getFocusWebview, getTabIdByWebviewContentsId } from './WebViewBrowser';

export default function ContextMenu({
    onHide,
    contextMenu,
    isMute,
    setIsMute
}: {
    isMute: boolean;
    setIsMute: (v: boolean) => void;
    contextMenu: ContextMenuProps;
    onHide: () => void;
}) {
    const { onCut, isCutEnable } = useScreenshotContext();
    const { showSnackbar, env } = useIAppContext();
    const { webContentsId } = contextMenu;
    const tabId = getTabIdByWebviewContentsId(webContentsId);

    const { x, y, selectionText } = contextMenu.params;
    const theme = useTheme();
    const { t } = useTranslation();
    const webview = getFocusWebview(webContentsId);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const ref = createRef<HTMLDivElement>();
    const handleClose = () => {
        setAnchorEl(null);
        onHide();
    };

    useEffect(() => {
        if (ref) {
            setAnchorEl(ref.current);
        }
    }, [ref]);
    const isSideWeb = tabId?.startsWith('side_');
    const slotProps = {
        paper: {
            elevation: 0,
            sx: {
                bgcolor: theme.backgroundContentAttention,
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))'
            }
        }
    };
    console.log('contextMenu >>', contextMenu, tabId, selectionText);
    if (!env.isDev) {
        if (!tabId) {
            return null;
        }
        if (tabId === 'game_center' || tabId === 'discover_apps') {
            return null;
        }
    }

    if (!tabId || isCutEnable) {
        return null;
    }

    return (
        <View position={'fixed'} zIdx={10000} top={y} left={x} red>
            <View ref={ref} />
            <Menu
                slotProps={slotProps}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left'
                }}
                id="top-menu"
                MenuListProps={{
                    'aria-labelledby': 'fade-button'
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                TransitionComponent={Fade}
                sx={{
                    '& .MuiListItemIcon-root': {
                        ml: 0.5,
                        mr: -0.95,
                        width: '24px'
                    },
                    '& .MuiMenuItem-root': {
                        pt: '0px',
                        pb: '0px',
                        pl: '12px',
                        pr: '32px',
                        minHeight: '26px'
                    }
                }}
            >
                <View
                    menuItem
                    onClick={() => {
                        if (webview) {
                            webview.reload();
                        }
                        handleClose();
                    }}
                >
                    <ListItemIcon>
                        <View icon={'Refresh'} iconFontSize="1rem" />
                    </ListItemIcon>
                    <View text={t(`reload`)} aCenter textFontSize="0.9rem" />
                </View>
                <View
                    menuItem
                    onClick={() => {
                        if (webview && webview.canGoBack()) {
                            webview.goBack();
                        }
                        handleClose();
                    }}
                >
                    <ListItemIcon>
                        <View icon={'KeyboardArrowLeft'} iconFontSize="1rem" />
                    </ListItemIcon>
                    <View text={t(`back`)} aCenter textFontSize="0.9rem" />
                </View>
                <View divider />
                <View
                    hide={!selectionText || isSideWeb}
                    menuItem
                    onClick={() => {
                        handleClose();

                        new WebviewMainEventService().openLLMWindow(env, {
                            site: 'ChatGpt',
                            type: 'TRANS_CHATGPT',
                            value: selectionText
                        });
                    }}
                >
                    <ListItemIcon>
                        <View icon={'Translate'} iconFontSize="0.8rem" />
                    </ListItemIcon>
                    <View
                        sx={{ maxWidth: 240 }}
                        textProps={{
                            sx: {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxHeight: 24,
                                width: '100%',
                                whiteSpace: 'nowrap'
                            }
                        }}
                        aCenter
                        text={`${t('TranslateInChatGpt')}: ${selectionText}`}
                        textFontSize="0.9rem"
                    />
                </View>
                <View
                    hide={isSideWeb}
                    menuItem
                    onClick={() => {
                        onCut(true);
                        handleClose();
                    }}
                >
                    <ListItemIcon>
                        <View icon={'Screenshot'} iconFontSize="0.8rem" />
                    </ListItemIcon>
                    <View text={t(`Screenshot`)} aCenter textFontSize="0.9rem" />
                </View>
                <View hide={isSideWeb} divider />

                <View
                    menuItem
                    onClick={() => {
                        handleClose();
                        const ws = WebviewService.getServiceByWebContentsId(webContentsId);
                        const url = ws?.getWebviewUrl();
                        if (ws && url) {
                            setIsMute(!isMute);
                            ws.setAudioMuted(!isMute);
                            new WebviewMuteService(url, ws.getAccountIndex()).save(!isMute);
                        }
                    }}
                    rowVCenter
                >
                    <ListItemIcon>
                        <View iconFontSize="0.8rem" icon={isMute ? 'VolumeUp' : 'VolumeOff'} />
                    </ListItemIcon>
                    <View
                        text={t(isMute ? `AudioUnMuted` : 'AudioMuted')}
                        aCenter
                        textFontSize="0.9rem"
                    />
                </View>
                <View
                    menuItem
                    onClick={() => {
                        if (webview) {
                            webview.openDevTools();
                            webview.inspectElement(x, y);
                        } else {
                            showSnackbar({ message: t('WaitingForWebviewReady') });
                        }
                        handleClose();
                    }}
                >
                    <ListItemIcon>
                        <View icon={'AdsClick'} iconFontSize="0.8rem" />
                    </ListItemIcon>
                    <View text={t(`InspectElement`)} aCenter textFontSize="0.9rem" />
                </View>
            </Menu>
        </View>
    );
}
