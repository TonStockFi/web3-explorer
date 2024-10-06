import { View } from '@web3-explorer/uikit-view';
import { getDeviceSize, getMonitorImageId } from '../global';
import { wsSendClientClickEvent, wsSendClientEvent } from '../../../common/ws';
import CutAreaView from '../Recognition/CutAreaView';
import ControlAuth from '../Control/ControlAuth';
import * as React from 'react';
import { DeviceOptions } from '../types';
import DenseAppBar from './Topbar';
import { useTheme } from '@mui/material';

let onDragging = false;
let mouseDown = false;

let startX = 0;
let startY = 0;

export default function ScreenView({
    windowSize,
    webviewWidth,
    webviewHeight,
    imageSrc,
    topBarHeight,
    webview,
    deviceOptions
}: {
    windowSize?: {
        height: number;
        width: number;
    };
    webviewWidth?: number;
    webviewHeight?: number;
    webview?: JSX.Element;
    imageSrc: string;
    topBarHeight?: number;
    deviceOptions: DeviceOptions;
}) {
    const theme = useTheme();
    if (topBarHeight === undefined) {
        topBarHeight = 38;
    }
    const screen = getDeviceSize(deviceOptions);
    let width = screen.width;
    let height = screen.height;
    if (windowSize) {
        width = windowSize.width;
        height = windowSize.height;
    }
    if (webviewWidth) {
        width = webviewWidth;
    }

    if (webviewHeight) {
        height = webviewHeight;
    }

    let propsMonitor = {};
    const enableInput =
        deviceOptions.getDeviceInfo('inputIsOpen', false) &&
        !deviceOptions.isCutEnable &&
        deviceOptions.isLogged &&
        !webview;

    if (enableInput) {
        propsMonitor = {
            onMouseDown: (e: any) => {
                const { pageX, pageY } = e;
                startX = pageX;
                startY = pageY;
                onDragging = false;
                mouseDown = true;
            },
            onMouseMove: (e: any) => {
                if (!mouseDown) {
                    return;
                }
                const { x, y } = e.target.getBoundingClientRect();
                const { pageX, pageY } = e;
                const x1 = (pageX - x) * 2;
                const y1 = (pageY - y) * 2;
                const payload = {
                    eventType: 'dragMove',
                    x: x1,
                    y: y1
                };
                if (Math.abs(startX - pageX) > 10 || Math.abs(startY - pageY) > 10) {
                    if (!onDragging) {
                        payload.eventType = 'dragStart';
                        wsSendClientEvent(payload, deviceOptions.ws);
                        onDragging = true;
                    } else {
                        wsSendClientEvent(payload, deviceOptions.ws);
                    }
                }
            },
            onMouseUp: (e: any) => {
                const { buttons } = e;
                console.log('onMouseUp', { buttons });
                const { x, y } = e.target.getBoundingClientRect();
                const { pageX, pageY } = e;
                const scrollTop = document.documentElement.scrollTop;
                const x1 = (pageX - x) / deviceOptions.monitorScale;
                const y1 = (pageY - y - scrollTop) / deviceOptions.monitorScale;
                if (Math.abs(startX - pageX) > 10 || Math.abs(startY - pageY) > 10) {
                    const payload = {
                        eventType: 'dragEnd',
                        x: x1,
                        y: y1
                    };
                    wsSendClientEvent(payload, deviceOptions.ws);
                } else {
                    console.log('click', { scrollTop, x, y, x1, y1, pageX, pageY });
                    wsSendClientClickEvent(x1, y1, deviceOptions.ws);
                }
                onDragging = false;
                mouseDown = false;
            }
        };
    }

    return (
        <View
            row
            sx={{
                height: `${height + topBarHeight}px`,
                borderRadius: windowSize ? undefined : '10px',
                overflow: 'hidden',
                border: windowSize ? undefined : '1px solid rgba(0,0,0,0.9)',
                display: 'flex',
                alignItems: 'flex-start',
                bgcolor: theme.palette.background.default
            }}
        >
            <View>
                {topBarHeight > 0 && (
                    <View sx={{ width: `${width}px` }}>
                        <DenseAppBar deviceOptions={deviceOptions} />
                    </View>
                )}

                <View
                    sx={{
                        position: 'relative',
                        width: `${width}px`,
                        height: `${height}px`,
                        cursor: enableInput ? 'pointer' : undefined
                    }}
                    {...propsMonitor}
                >
                    <View
                        absolute
                        hide={!deviceOptions.isWebview}
                        sx={{
                            zIndex: 0,
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            opacity: 0,
                            display: 'flex',
                            pt: `${topBarHeight}px`
                        }}
                    >
                        {imageSrc && (
                            <img
                                id={getMonitorImageId(deviceOptions)}
                                draggable="false"
                                style={{
                                    width: `${width}px`,
                                    height: `${height}px`
                                }}
                                src={imageSrc}
                                alt=""
                            />
                        )}
                    </View>
                    {Boolean(!deviceOptions.isLogged && !webview) && (
                        <View
                            h100p
                            sx={{ p: 2, pt: 10, backgroundColor: theme.palette.background.default }}
                        >
                            <ControlAuth deviceOptions={deviceOptions} />
                        </View>
                    )}
                    {webview && webview}
                    {Boolean(deviceOptions.isLogged && imageSrc && !deviceOptions.isWebview) && (
                        <img
                            id={getMonitorImageId(deviceOptions)}
                            draggable="false"
                            style={{ width: '100%', height: '100%' }}
                            src={imageSrc}
                            alt=""
                        />
                    )}
                    {Boolean(deviceOptions.isLogged && imageSrc && !deviceOptions.isWebview) && (
                        <CutAreaView width={width} height={height} deviceOptions={deviceOptions} />
                    )}
                    {Boolean(
                        deviceOptions.isLogged &&
                            imageSrc &&
                            deviceOptions.isWebview &&
                            deviceOptions.isCutEnable
                    ) && (
                        <CutAreaView width={width} height={height} deviceOptions={deviceOptions} />
                    )}
                </View>
            </View>
        </View>
    );
}
