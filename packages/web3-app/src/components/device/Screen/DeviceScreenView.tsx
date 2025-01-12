import { View } from '@web3-explorer/uikit-view';
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
    const platform = getDeviceInfo(deviceId, 'platform', null);
    const monitorScale = platform === 'darwin' ? 0.8 : 0.5;
    const screen = getDeviceInfo(deviceId, 'screen', { height: 1600, width: 720 });
    const inputIsOpen = getDeviceInfo(deviceId, 'inputIsOpen', false);
    // console.log('inputIsOpen', screen, inputIsOpen);
    let width = screen.width * monitorScale;
    let height = screen.height * monitorScale;

    let propsMonitor = {};
    const enableInput = inputIsOpen;

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
                wsSendClientEvent(payload, ws);
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
        if (platform === 'darwin') {
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
            <View>
                <View
                    sx={{
                        position: 'relative',
                        width: `${width}px`,
                        height: `${height}px`,
                        bgcolor: theme.backgroundContent,
                        cursor: enableInput ? 'pointer' : undefined
                    }}
                    {...propsMonitor}
                >
                    {Boolean(screenImageSrc) && (
                        <img
                            id={getMonitorImageId(deviceId)}
                            draggable="false"
                            style={{ width: '100%', height: '100%' }}
                            src={screenImageSrc}
                            alt=""
                        />
                    )}
                </View>
            </View>
        </View>
    );
}
