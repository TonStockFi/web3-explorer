import { useLocalStorageState } from '@web3-explorer/utils';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { currentTs } from '../common/utils';
import { Devices } from '../components/device/global';

import DeviceService from '../services/DeviceService';
import { CustomDeviceWsServerHosts, DeviceInfo } from '../types';

interface AppContextType {
    isReady: boolean;
    updatedAt: number;
    customHosts: CustomDeviceWsServerHosts[];
    updateGlobalDevice: () => void;
    onSaveCustomHosts: (h: CustomDeviceWsServerHosts[]) => void;
    handleClientDeviceInfo: (devideId: string, deviceInfo: DeviceInfo) => void;
    getDeviceInfo: (deviceId: string, key?: keyof DeviceInfo, defaultValue?: any) => any;
    onChangeDeviceInfo: (deviceId: string, key: keyof DeviceInfo, value: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const DevicesProvider = (props: { children: ReactNode }) => {
    const { children } = props || {};
    const [updatedAt, setUpdatedAt] = useState(1);

    const [customHosts, setCustomHosts] = useLocalStorageState<CustomDeviceWsServerHosts[]>(
        'customHosts,',
        []
    );
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        (async () => {
            const cachedDevices = await DeviceService.getAll();
            if (cachedDevices) {
                cachedDevices.forEach((deviceInfo: DeviceInfo) => {
                    Devices.set(deviceInfo.deviceId, deviceInfo);
                });
            }
            setIsReady(true);
        })();
    }, []);

    const onSaveCustomHosts = (hosts: CustomDeviceWsServerHosts[]) => {
        //@ts-ignore
        setCustomHosts(() => {
            return hosts;
        });
    };
    const onChangeDeviceInfo = (deviceId: string, key: keyof DeviceInfo, value: any) => {
        const device = Devices.get(deviceId);
        const newDevice = {
            ...device,
            deviceId,
            [key]: value
        };
        Devices.set(deviceId, newDevice as DeviceInfo);
    };
    const handleClientDeviceInfo = (deviceId: string, deviceInfo: DeviceInfo) => {
        const {
            screen,
            inputIsOpen,
            delayPullEventMs,
            delaySendImageDataMs,
            compressQuality,
            mediaIsStart
        } = deviceInfo;
        const device = Devices.get(deviceId)!;
        device.screen = screen;
        device.inputIsOpen = inputIsOpen;
        device.compressQuality = compressQuality;
        device.mediaIsStart = mediaIsStart;
        device.delaySendImageDataMs = delaySendImageDataMs;
        device.delayPullEventMs = delayPullEventMs;
        Devices.set(deviceId, device);
    };
    const getDeviceInfo = (deviceId: string, key?: keyof DeviceInfo, defaultValue?: any) => {
        const device = Devices.get(deviceId);
        if (!defaultValue) {
            defaultValue = '';
        }
        if (!device) {
            return defaultValue;
        }
        if (!key) {
            return device;
        }
        if (!Devices.has(deviceId) || !device[key]) {
            return defaultValue;
        } else {
            return device ? device[key] : defaultValue;
        }
    };

    const updateGlobalDevice = () => {
        setUpdatedAt(currentTs());
    };

    return (
        <AppContext.Provider
            value={{
                updateGlobalDevice,
                updatedAt,
                getDeviceInfo,
                handleClientDeviceInfo,
                onChangeDeviceInfo,
                isReady,
                customHosts,
                onSaveCustomHosts
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useDevice = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useDevice must be used within an DevicesProvider');
    }
    return context;
};
