import { View } from '@web3-explorer/uikit-view';
import { useEffect, useState } from 'react';
import { useTheme } from 'styled-components';
import { wsSendClientClickEvent, wsSendClientEvent } from '../../../common/ws';
import { useDevice } from '../../../providers/DevicesProvider';

export function getMonitorImageId(deviceId: string): string | undefined {
    return `monitor_${deviceId}`;
}

export function getMonitorOutputId(deviceId: string): string | undefined {
    return `monitor_output_${deviceId}`;
}
let onDragging = false;
let mouseDown = false;

let startX = 0;
let startY = 0;
let isRightClick = false;
export default function DeviceScreenView({
    deviceId,
    ws,
    screenImageSrc
}: {
    ws: WebSocket;
    deviceId: string;
    screenImageSrc: string;
}) {
    const theme = useTheme();
    const { getDeviceInfo } = useDevice();
    const screen = getDeviceInfo(deviceId, 'screen', { height: 1600, width: 720 });

    const platform = getDeviceInfo(deviceId, 'platform', null);
    const width1 = window.innerWidth;
    let monitorScale1 = 0.5;
    if (platform === 'darwin' || platform === 'win32') {
        monitorScale1 = width1 / screen.width;
    }
    // debugger;
    const [monitorScale, setMonitorScale] = useState(monitorScale1);
    useEffect(() => {
        const handleResize = () => {
            const newWidth = window.innerWidth;
            let newMonitorScale = 0.5;
            if (platform === 'darwin' || platform === 'win32') {
                newMonitorScale = newWidth / screen.width;
            }
            setMonitorScale(newMonitorScale);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function to remove the event listener
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    const inputIsOpen = getDeviceInfo(deviceId, 'inputIsOpen', false);
    // console.log('inputIsOpen', screen, inputIsOpen);
    let width = screen.width * monitorScale;
    let height = screen.height * monitorScale;

    let propsMonitor = {};
    const enableInput = inputIsOpen;

    if (enableInput) {
        propsMonitor = {
            onKeyDown: (e: any) => {
                //code:"KeyS"
                //key:"s"
                //which or keyCode:83
                //type:"keydown"
                const { code, ctrlKey, altKeymetaKey, shiftKey, which, key, keyCode, type } = e;
                const payload = {
                    eventType: 'keyDown',
                    keyEvent: { code, ctrlKey, altKeymetaKey, shiftKey, which, key, keyCode, type }
                };
                wsSendClientEvent(payload, ws);

                e.stopPropagation();
                e.preventDefault();
            },
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
                        wsSendClientEvent(payload, ws);
                        onDragging = true;
                    } else {
                        wsSendClientEvent(payload, ws);
                    }
                }
            },

            onContextMenu: (e: any) => {
                isRightClick = true;
                const { buttons } = e;
                console.log('onContextMenu', { buttons });
                const { x, y } = e.target.getBoundingClientRect();
                const { pageX, pageY } = e;
                const scrollTop = document.documentElement.scrollTop;
                const x1 = (pageX - x) / monitorScale;
                const y1 = (pageY - y - scrollTop) / monitorScale;
                const payload = {
                    eventType: 'rightClick',
                    x: x1,
                    y: y1
                };
                // wsSendClientEvent(payload, ws);

                const payload1 = {
                    eventType: 'pyautogui',
                    pyAutoGuisScript: `pyautogui.rightClick(${x1},${y1})`
                };
                wsSendClientEvent(payload1, ws);
                e.stopPropagation();
                e.preventDefault();
            },
            onMouseUp: (e: any) => {
                if (isRightClick) {
                    isRightClick = false;
                    return;
                }
                const { buttons } = e;
                console.log('onMouseUp', { buttons });
                const { x, y } = e.target.getBoundingClientRect();
                const { pageX, pageY } = e;
                const scrollTop = document.documentElement.scrollTop;
                const x1 = (pageX - x) / monitorScale;
                const y1 = (pageY - y - scrollTop) / monitorScale;
                if (Math.abs(startX - pageX) > 10 || Math.abs(startY - pageY) > 10) {
                    const payload = {
                        eventType: 'dragEnd',
                        x: x1,
                        y: y1
                    };
                    wsSendClientEvent(payload, ws);
                } else {
                    console.log('click', { scrollTop, x, y, x1, y1, pageX, pageY });
                    wsSendClientClickEvent(x1, y1, ws);
                }
                onDragging = false;
                mouseDown = false;
            }
        };
        if (!(platform === 'darwin' || platform === 'win32')) {
            //@ts-ignore
            delete propsMonitor.onContextMenu;
        }
    }

    return (
        <View
            row
            sx={{
                height: `${height}px`,
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.9)',
                display: 'flex',
                alignItems: 'flex-start'
            }}
        >
            <View
                sx={{
                    position: 'relative',
                    width: `${width}px`,
                    height: `${height}px`,
                    bgcolor: theme.backgroundContent
                }}
            >
                {Boolean(screenImageSrc) && (
                    <img
                        id={getMonitorImageId(deviceId)}
                        draggable="false"
                        style={{ width: '100%', height: '100%' }}
                        src={screenImageSrc}
                    />
                )}
                <View
                    contentEditable
                    absFull
                    sx={{
                        cursor: enableInput ? 'move' : undefined
                    }}
                    {...propsMonitor}
                ></View>
            </View>
        </View>
    );
}
