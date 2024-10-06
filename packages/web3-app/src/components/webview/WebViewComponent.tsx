import * as React from 'react';
import { useCallback, useState } from 'react';
import { View } from '@web3-explorer/uikit-view';
import {
    CutAreaRect,
    DeviceInfo,
    DeviceOptions
} from '@web3-explorer/uikit-desk/dist/view/DeskMonitor/types';
import { DefaultCutRect } from '@web3-explorer/uikit-desk/dist/view/DeskMonitor/global';
import { useLocalStorageState } from '@web3-explorer/uikit-mui';
import ScreenView from '@web3-explorer/uikit-desk/dist/view/DeskMonitor/Screen/ScreenView';
import WebViewBrowser from './WebViewBrowser';
import { getDeviceIdFromUrl } from '../../common/utils';
import { PropTypes } from '@mui/material';
import { WebviewProps } from '../../types';

const WebViewComponent = ({
    setGlobalUpdatedAt,
    tgUserId,
    webviewProps,
    webviewTitle,
    deleteTgSite,
    topBar,
    canDelete,
    headerColor,
    canCut,
    webviewWidth,
    webviewHeight,
    topBarHeight,
    windowSize,
    partitionId,
    url,
    noInfo
}: {
    setGlobalUpdatedAt?: (v: number) => void;
    topBarHeight?: number;
    topBar?: boolean;
    webviewProps?: WebviewProps;
    tgUserId?: string;
    webviewTitle?: string;
    deleteTgSite?: (userId:string)=>void;
    canDelete?: boolean;
    headerColor?: PropTypes.Color | 'transparent' | 'error' | 'info' | 'success' | 'warning';
    canCut?: boolean;
    noInfo?: boolean;
    webviewWidth?: number;
    webviewHeight?: number;
    windowSize?: {
        height: number;
        width: number;
    };
    partitionId?: string;
    url: string;
}) => {
    if (topBar) {
        topBarHeight = 48;
    } else {
        if (!topBarHeight) {
            topBarHeight = 0;
        }
    }
    if (!partitionId) {
        partitionId = 'default';
    }
    const [webview, setWebview] = useState(null);
    const [snackbar, setSnackbar] = useState('');
    const deviceId = getDeviceIdFromUrl(url);
    const [optionsTab, setOptionsTab] = useState('');
    const [isCutEnable, setIsCutEnable] = useState(false);
    const [cutAreaRect, setCutAreaRect] = useState<CutAreaRect>(DefaultCutRect);
    const [recognitionAreaRect, setRecognitionAreaRect] = useState<CutAreaRect[]>([]);

    const [isInfoPanel, setIsInfoPanel] = useState(false);
    const [isSettingPanel, setIsSettingPanel] = useState(false);

    const [monitorScale, setMonitorScale] = useLocalStorageState('monitorScale2', 1);

    const getDeviceInfo = useCallback(
        (key?: keyof DeviceInfo, defaultValue?: any) => {
            return {
                width: webviewWidth,
                height: webviewHeight
            };
        },
        [deviceId]
    );

    const deviceOptions: DeviceOptions = {
        setGlobalUpdatedAt,
        headerColor,
        webviewTitle,
        tgUserId,
        setIsInfoPanel: noInfo ? undefined : setIsInfoPanel,
        setIsSettingPanel,
        canDelete,
        isInfoPanel,
        isSettingPanel,
        deleteTgSite,
        partitionId,
        optionsTab,
        canCut,
        setOptionsTab,
        isWebview: true,
        webview,
        logsUpdateAt: +new Date(),
        recognitionAreaRect,
        setRecognitionAreaRect,
        cutAreaRect,
        setMonitorScale,
        setCutAreaRect,
        setIsCutEnable,
        isCutEnable,
        monitorScale,
        setSnackbar,
        deviceId,
        getDeviceInfo
    };

    let sx = {};
    if (isCutEnable || isSettingPanel || isInfoPanel) {
        sx = {
            position: 'fixed',
            zIndex: 1000,
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            p: 2,
            backgroundColor: 'white'
        };
    }
    return (
        <View row sx={sx}>
            <View>
                <ScreenView
                    topBarHeight={topBarHeight}
                    windowSize={windowSize}
                    webviewWidth={webviewWidth}
                    webviewHeight={webviewHeight}
                    deviceOptions={deviceOptions}
                    imageSrc={""}
                    webview={
                        <WebViewBrowser
                            webviewProps={webviewProps}
                            webviewWidth={webviewWidth}
                            webviewHeight={webviewHeight}
                            topBarHeight={topBarHeight}
                            url={url}
                            partitionId={partitionId}
                            setWebview={setWebview}
                        />
                    }
                />
            </View>
            <View
                snackbar={{
                    open: !!snackbar,
                    message: snackbar,
                    onClose: () => {
                        setSnackbar('');
                    }
                }}
            />
        </View>
    );
};

export default WebViewComponent;
