import { CutAreaRect, DeviceInfo, DeviceOptions } from './types';

export const ServerHostList = [
    { host: 'ws://192.168.43.244:3204/api' },
    { host: 'ws://192.168.43.244:6788/api' },
    { host: 'ws://192.168.43.133:6788/api' },
    { host: 'ws://localhost:3204/api' },
    { host: 'http://192.168.43.244:3203/api' },
    { host: 'https://web3-desk-worker.barry-ptp.workers.dev/api' },
    { host: 'https://desk.web3r.site/api' }
];

export const Devices: Map<string, DeviceInfo> = new Map();

export const DefaultCutRect: CutAreaRect = {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 }
};

export function getDeviceSize(deviceOptions: DeviceOptions) {
    const width =
        deviceOptions.getDeviceInfo('screen', { width: 720 }).width * deviceOptions.monitorScale;

    const height =
        deviceOptions.getDeviceInfo('screen', { height: 1600 }).height * deviceOptions.monitorScale;
    return { width, height };
}

export function isCutAreaExists(cutAreaRect: CutAreaRect) {
    return (
        Math.abs(cutAreaRect.start.x - cutAreaRect.end.x) > 0 &&
        Math.abs(cutAreaRect.start.y - cutAreaRect.end.y) > 0
    );
}

export function getRoiRect(rect: CutAreaRect) {
    return {
        x: rect.start.x,
        y: rect.start.y,
        w: Math.abs(rect.start.x - rect.end.x),
        h: Math.abs(rect.start.y - rect.end.y)
    };
}

export function getMonitorImageId(deviceOptions: DeviceOptions): string | undefined {
    return `monitor_${deviceOptions.deviceId}`;
}

export function getMonitorOutputId(deviceOptions: DeviceOptions): string | undefined {
    return `monitor_output_${deviceOptions.deviceId}`;
}

export function getPositionFromRecognitionAreaRect(rect: CutAreaRect) {
    return {
        x: rect.start.x + Math.abs(rect.start.x - rect.end.x) / 2,
        y: rect.start.y + Math.abs(rect.start.y - rect.end.y) / 2
    };
}

export function getBorderWidthFromRect(width: number, height: number, rect: CutAreaRect) {
    if (!isCutAreaExists(rect)) {
        return {
            borderLeftWidth: 0,
            borderTopWidth: 0,
            borderRightWidth: 0,
            borderBottomWidth: 0
        };
    }
    const { start, end } = rect;
    const borderLeftWidth = `${start.x}px`;
    const borderTopWidth = `${start.y}px`;
    const borderRightWidth = `${width - end.x}px`;
    const borderBottomWidth = `${height - end.y}px`;

    return {
        borderLeftWidth,
        borderTopWidth,
        borderRightWidth,
        borderBottomWidth
    };
}
