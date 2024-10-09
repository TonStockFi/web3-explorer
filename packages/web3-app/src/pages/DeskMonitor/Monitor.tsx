import Snackbar from '@web3-explorer/uikit-mui/dist/mui/Snackbar';
import { useLocalStorageState } from '@web3-explorer/uikit-mui';
import { View } from '@web3-explorer/uikit-view';
import { useCallback, useEffect, useState } from 'react';
import DESCrypto from '@web3-explorer/lib-crypto/dist/DESCrypto';
import  { md5 } from '@web3-explorer/lib-crypto/dist/utils';
import { connectWebSocket, wsSendClose, wsSendMessage } from '../../common/ws';
import { useLogs } from '../../hooks/useLogs';
import ControlAuth from './Control/ControlAuth';
import ControlOptions from './Control/ControlOptions';
import { DefaultCutRect, Devices, getDeviceSize } from './global';
import ControlRecognition from './Recognition/ControlRecognition';
import ScreenView from './Screen/ScreenView';
import { CutAreaRect, DeviceInfo, DeviceOptions, ErrCodes, WsCloseCode } from './types';

export default function ({
    customHosts,
    setCustomHosts,
    defaultDeviceId,
    isAdding,
    setGlobalUpdatedAt,
    walletAccountId,
  index
}: {
    index?:number;
    walletAccountId?: string;
    setGlobalUpdatedAt?: (v:number)=>void;
    isAdding?: boolean;
    customHosts?: { host: string }[];
    setCustomHosts?: (v:{host:string}[])=>void;
    defaultDeviceId: string;
}) {
    const [deviceId, setDeviceId] = useState(defaultDeviceId);
    const [snackbar, setSnackbar] = useState('');
    const [isCutEnable, setIsCutEnable] = useState(false);
    const [isInfoPanel, setIsInfoPanel] = useState(false);
    const [isSettingPanel, setIsSettingPanel] = useState(false);
    const [cutAreaRect, setCutAreaRect] = useState<CutAreaRect>(DefaultCutRect);
    const [recognitionAreaRect, setRecognitionAreaRect] = useState<CutAreaRect[]>([]);
    const [monitorScale, setMonitorScale] = useLocalStorageState('monitorScale', 0.45);
    const [updatedAt, setUpdatedAt] = useState(0);
    const [errCode, setErrCode] = useState<ErrCodes | undefined>(undefined);
    const [imageSrc, setImageSrc] = useState('');
    const [isLogged, setIsLogged] = useState(false);

    const [ws, setWs] = useState<WebSocket | undefined>(undefined);

    const [firstLoad, setFirstLoad] = useState(true);
    const update = () => {
        setUpdatedAt(+new Date());
    };

    const handleImage = (screenImageData: string, ts: number) => {
        const device = Devices.get(deviceId);
        if (!device) {
            return;
        }
        if (screenImageData.startsWith('data:jpeg;base64_')) {
            const { password } = device;
            const crypto = new DESCrypto(password!);
            setImageSrc(
                'data:jpeg;base64,' +
                    crypto.decrypt(screenImageData.substring('data:jpeg;base64_'.length + 5))
            );
        } else if (screenImageData.startsWith('data:jpeg;base64')) {
            setImageSrc(screenImageData);
        }
    };
    const onChangeDeviceInfo = useCallback(
        (key: keyof DeviceInfo, value: any) => {
            const device = Devices.get(deviceId);
            const newDevice = {
                ...device,
                deviceId,
                [key]: value
            };
            Devices.set(deviceId, newDevice);
            setUpdatedAt(+new Date());
        },
        [deviceId]
    );

    const handleDeviceInfo = (deviceInfo?: any) => {
        if (!deviceInfo) {
            return;
        }
        const device = Devices.get(deviceId);
        if (!device) {
            return;
        }
        const {
            screen,
            inputIsOpen,
            delayPullEventMs,
            delaySendImageDataMs,
            compressQuality,
            mediaIsStart
        } = deviceInfo;
        device.screen = screen;
        device.inputIsOpen = inputIsOpen;
        device.compressQuality = compressQuality;
        device.mediaIsStart = mediaIsStart;
        device.delaySendImageDataMs = delaySendImageDataMs;
        device.delayPullEventMs = delayPullEventMs;
        console.log({ device, deviceInfo });
        Devices.set(deviceId, device);
        update();
    };
    const getDeviceInfo = useCallback(
        (key?: keyof DeviceInfo, defaultValue?: any) => {
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
        },
        [deviceId]
    );

    const onMessage = useCallback(
        (
            {
                action,
                payload,
                errCode
            }: {
                action: string;
                payload: any;
                errCode: string;
            },
            ws: WebSocket
        ) => {
            if (action === 'deviceMsg') {
                const { screenImage, deviceInfo } = payload;
                if (screenImage) {
                    //console.log('onMessage deviceMsg screenImage', screenImage.ts);
                    handleImage(screenImage.data, screenImage.ts);
                }
                if (deviceInfo) {
                    console.log('onMessage deviceInfo', deviceInfo);
                    handleDeviceInfo(deviceInfo);
                }
            }
        },
        []
    );

    const onClose = async (
        { code, reason }: { code: WsCloseCode; reason: string },
        ws: WebSocket
    ) => {
        console.log('onClose', code, reason);
        setWs(undefined);
        if (code && code >= WsCloseCode.WS_CLOSE_STOP_RECONNECT) {
            setIsLogged(false);
        }
    };

    const auth = useCallback(
        async (id: string, password: string, serverApi: string) => {
            try {
                update();
                setIsLogged(false);
                const ws = await connectWebSocket(serverApi, {
                    onMessage,
                    onClose,
                    onLoginError: ({ errCode }:{ errCode: ErrCodes}, ws: WebSocket) => {
                        setErrCode(errCode);
                        if (errCode === ErrCodes.DEVICE_NOT_EXISTS) {
                            setSnackbar('设备没有注册');
                            wsSendClose(WsCloseCode.WS_CLOSE_STOP_RECONNECT, errCode, ws);
                        } else if (errCode === ErrCodes.PASSWORD_NOT_VALID) {
                            setSnackbar('密码不匹配');
                            wsSendClose(WsCloseCode.WS_CLOSE_STOP_RECONNECT, errCode, ws);
                        } else {
                            setSnackbar(errCode);
                        }
                    },
                    onLogged: {
                        action: 'registerClient',
                        payload: {
                            platform:"WEB",
                            deviceId: id,
                            password: md5(password)
                        }
                    }
                });
                setErrCode(undefined);
                wsSendMessage(
                    {
                        action: 'clientMsg',
                        payload: {
                            eventType: 'deviceInfo'
                        }
                    },
                    ws
                );
                setIsLogged(true);
                setWs(ws);
                update();
                localStorage.removeItem('disconnect_' + id);
                return true;
            } catch (e) {
                 console.error(e);
                return false;
            }
        },
        [isAdding]
    );

    useEffect(() => {
        if (Devices.size === 0) {
            const cachedDevices = localStorage.getItem('Devices');
            if (cachedDevices) {
                try {
                    const devicesArray: [string, DeviceInfo][] = JSON.parse(cachedDevices);
                    devicesArray.forEach(([key, deviceInfo]) => {
                        Devices.set(key, deviceInfo);
                    });
                    setUpdatedAt(+new Date());
                } catch (error) {
                    console.error('Error loading Devices from cache:', error);
                }
            }
        }
        if (firstLoad) {
            if (deviceId && localStorage.getItem('disconnect_' + deviceOptions.deviceId) !== '1') {
                const device = Devices.get(deviceId)!;
                if (device) {
                    const { password, serverApi } = device;
                    if (password && serverApi) {
                        auth(deviceId, password, serverApi).catch(console.error);
                    }
                }
            }
            console.log({ firstLoad, deviceId });
            setFirstLoad(false);
        }
    }, [firstLoad, deviceId]);

    useEffect(() => {
        return () => {
            console.log('ws destroy', ws && ws.readyState === WebSocket.OPEN);
            if (ws && ws.readyState === WebSocket.OPEN) {
                wsSendMessage(
                    {
                        action: 'close',
                        payload: {
                            code: WsCloseCode.WS_CLOSE_STOP_RECONNECT,
                            reason: 'WS_CLOSE_STOP_RECONNECT'
                        }
                    },
                    ws
                );
            }
        };
    }, [ws]);
    const { logsUpdateAt } = useLogs({});
    const deviceOptions: DeviceOptions = {
        walletAccountId,
        index,
        isLogged,
        customHosts,
        setCustomHosts,
        isInfoPanel,
        setIsInfoPanel,
        isSettingPanel,
        setIsSettingPanel,
        isAdding,
        setUpdatedAt,
        setGlobalUpdatedAt,
        logsUpdateAt,
        recognitionAreaRect,
        setRecognitionAreaRect,
        cutAreaRect,
        setMonitorScale,
        setCutAreaRect:(v:CutAreaRect)=>setCutAreaRect(v),
        setIsCutEnable,
        isCutEnable,
        monitorScale,
        setSnackbar,
        ws,
        errCode,
        auth,
        updatedAt,
        deviceId,
        setDeviceId,
        getDeviceInfo,
        onChangeDeviceInfo
    };
    let sx = {};
    if (isCutEnable || isSettingPanel || isInfoPanel) {
        sx = {
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            p: 2,
            backgroundColor: 'white'
        };
    }
    const screen = getDeviceSize(deviceOptions);
    return (
        <View row sx={sx}>
            <ScreenView deviceOptions={deviceOptions} imageSrc={imageSrc} />
            <View hide={!isCutEnable} sx={{ ...sx, left: screen.width + 24 }}>
                <View
                    sx={{
                        overflowY: 'auto',
                        border: '1px solid #e9e9e9',
                        overflow: 'hidden',
                        borderRadius: '12px',
                    }}
                    w100p
                    h100p
                >
                    <ControlRecognition deviceOptions={deviceOptions} />
                </View>
            </View>
            <View hide={!isInfoPanel} sx={{ ...sx, left: screen.width + 24 }}>
                <View
                    sx={{
                        overflowY: 'auto',
                        border: '1px solid #e9e9e9',
                        overflow: 'hidden',
                        borderRadius: '12px',
                    }}
                    w100p
                    h100p
                >
                    <ControlAuth deviceOptions={deviceOptions} />
                </View>
            </View>
            <View hide={!isSettingPanel} sx={{ ...sx, left: screen.width + 24 }}>
                <View
                    sx={{
                        overflowY: 'auto',
                        border: '1px solid #e9e9e9',
                        overflow: 'hidden',
                        borderRadius: '12px',
                    }}
                    w100p
                    h100p
                >
                    <ControlOptions deviceOptions={deviceOptions} />
                </View>
            </View>
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={!!snackbar}
                autoHideDuration={3000}
                onClose={() => setSnackbar('')}
                message={snackbar}
            />
        </View>
    );
}
