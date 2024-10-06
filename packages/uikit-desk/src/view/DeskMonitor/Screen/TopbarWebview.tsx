import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { DeviceOptions } from '../types';
import Tooltip from '@mui/material/Tooltip';
import { View } from '@web3-explorer/uikit-view';
import DropdownMenuWebview from './DropdownMenuWebview';
import { DefaultCutRect } from '../global';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AvatarView from '../../../components/AvatarView';

export default function TopbarWebview({ deviceOptions }: { deviceOptions: DeviceOptions }) {
    const {
        setIsCutEnable,
        webviewTitle,
        isInfoPanel,
        tgUserId,
        isSettingPanel,
        headerColor,
        isCutEnable,
        webview
    } = deviceOptions;
    const [canGoBack, setCanGoBack] = React.useState(false);
    const [canGoForward, setCanGoForward] = React.useState(false);
    const [siteTitle, setSiteTitle] = React.useState('');
    const [isReady, setIsReady] = React.useState(false);
    React.useEffect(() => {
        if (!webview) return;

        const updateSiteTitle = () => {
            setSiteTitle(webview.getTitle().substring(0, 10));
        };
        const onReady = () => {
            setIsReady(true);
            setCanGoBack(webview.canGoBack());
            setCanGoForward(webview.canGoForward());
        };

        webview.addEventListener('dom-ready', onReady);
        webview.addEventListener('page-title-updated', updateSiteTitle);
        return () => {
            webview.removeEventListener('page-title-updated', updateSiteTitle);
            webview.removeEventListener('dom-ready', onReady);
        };
    }, [webview, webviewTitle]);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" color={headerColor || 'secondary'}>
                <Toolbar variant="dense">
                    <View
                        ml12
                        w100p
                        row
                        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        <View row jStart aCenter hide={!deviceOptions.isCutEnable}>
                            <Typography variant="h6" color="inherit" component="div">
                                正在截屏
                            </Typography>
                        </View>

                        <View row jStart aCenter hide={deviceOptions.isCutEnable}>
                            {Boolean(tgUserId) && (
                                <AvatarView name={webviewTitle!} full userId={tgUserId!} />
                            )}
                            {!tgUserId && (
                                <Typography variant="h6" color="inherit" component="div">
                                    {deviceOptions.isCutEnable
                                        ? '正在截屏'
                                        : webviewTitle
                                        ? webviewTitle
                                        : siteTitle}
                                </Typography>
                            )}
                        </View>
                        <View row jStart aCenter></View>
                        <View row sx={{ justifyContent: 'flex-end' }}>
                            <View hide={!canGoBack} sx={{ ml: 1 }}>
                                <Tooltip placement={'bottom'} title="后退">
                                    <IconButton
                                        onClick={() => {
                                            webview && webview.goBack();
                                        }}
                                        edge="start"
                                        color="inherit"
                                        aria-label="menu"
                                    >
                                        <ArrowBackIcon />
                                    </IconButton>
                                </Tooltip>
                            </View>

                            <View sx={{ mr: 0.5 }} hide={!isReady}>
                                <DropdownMenuWebview
                                    canGoForward={canGoForward}
                                    deviceOptions={deviceOptions}
                                />
                            </View>

                            <View
                                hide={!(isInfoPanel || isCutEnable || isSettingPanel)}
                                sx={{ mx: 0.5 }}
                            >
                                <Tooltip placement={'bottom'} title={'关闭'}>
                                    <IconButton
                                        onClick={() => {
                                            deviceOptions?.setIsInfoPanel &&
                                                deviceOptions?.setIsInfoPanel(false);
                                            deviceOptions?.setIsSettingPanel &&
                                                deviceOptions?.setIsSettingPanel(false);
                                            deviceOptions.setRecognitionAreaRect([]);
                                            deviceOptions.setCutAreaRect(DefaultCutRect);
                                            setIsCutEnable(false);
                                        }}
                                        edge="start"
                                        color="inherit"
                                        aria-label="menu"
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </Tooltip>
                            </View>
                        </View>
                    </View>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
