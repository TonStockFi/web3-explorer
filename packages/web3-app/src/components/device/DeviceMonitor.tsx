import { md5 } from '@web3-explorer/lib-crypto/dist/utils';
import { View } from '@web3-explorer/uikit-view';
import DESCrypto from '@web3-explorer/utils/dist/common/DESCrypto';
import { useCallback, useEffect, useState } from 'react';
import { connectWebSocket, wsSendClose, wsSendMessage } from '../../common/ws';
import { useDevice } from '../../providers/DevicesProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { ErrCodes, WsCloseCode } from '../../types';
import DeviceAuth from './components/DeviceAuth';
import { Devices } from './global';
import DeviceScreenView from './Screen/DeviceScreenView';

export default function DeviceMonitor({ deviceId }: { deviceId: string }) {
    const { handleClientDeviceInfo } = useDevice();

    const [errCode, setErrCode] = useState<ErrCodes | undefined>(undefined);
    const [isLogged, setIsLogged] = useState(true);
    const [ws, setWs] = useState<WebSocket | undefined>(undefined);

    const [firstLoad, setFirstLoad] = useState(true);

    const { showSnackbar } = useIAppContext();

    const [screenImageSrc, setScreenImageSrc] = useState('');

    const handleScreenImage = (deviceId: string, screenImageData: string, ts: number) => {
        if (!deviceId || !Devices.has(deviceId)) {
            return;
        }

        const device = Devices.get(deviceId);
        if (screenImageData.startsWith('data:jpeg;base64_')) {
            const { password } = device!;
            const crypto = new DESCrypto(password!);
            setScreenImageSrc(
                'data:jpeg;base64,' +
                    crypto.decrypt(screenImageData.substring('data:jpeg;base64_'.length + 5))
            );
        } else if (screenImageData.startsWith('data:jpeg;base64')) {
            setScreenImageSrc(screenImageData);
        }
    };
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
            setIsLogged(true);
            console.log('action', action, deviceId);
            if (action === 'deviceMsg') {
                const { screenImage, deviceInfo } = payload;
                if (screenImage) {
                    handleScreenImage(deviceId, screenImage.data, screenImage.ts);
                }
                if (deviceInfo) {
                    console.log('onMessage deviceInfo', deviceInfo);
                    handleClientDeviceInfo(deviceId!, deviceInfo);
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

    const auth = async (id: string, password: string, serverApi: string) => {
        try {
            setIsLogged(false);
            const ws = await connectWebSocket(serverApi, {
                onMessage,
                onClose,
                onLoginError: ({ errCode }: { errCode: ErrCodes }, ws: WebSocket) => {
                    setErrCode(errCode);
                    if (errCode === ErrCodes.DEVICE_NOT_EXISTS) {
                        showSnackbar({ message: '设备没有注册' });
                        wsSendClose(WsCloseCode.WS_CLOSE_STOP_RECONNECT, errCode, ws);
                    } else if (errCode === ErrCodes.PASSWORD_NOT_VALID) {
                        showSnackbar({ message: '密码不匹配' });
                        wsSendClose(WsCloseCode.WS_CLOSE_STOP_RECONNECT, errCode, ws);
                    } else {
                        showSnackbar({ message: errCode });
                    }
                },
                onLogged: {
                    action: 'registerClient',
                    payload: {
                        platform: 'WEB',
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
            localStorage.removeItem('disconnect_' + id);
            setFirstLoad(false);
            return true;
        } catch (e) {
            console.error(e);
            setFirstLoad(false);
            return false;
        }
    };

    useEffect(() => {
        if (deviceId && localStorage.getItem('disconnect_' + deviceId) !== '1') {
            const device = Devices.get(deviceId)!;
            if (device) {
                const { password, serverApi } = device;
                if (password && serverApi) {
                    auth(deviceId, password, serverApi).catch(console.error);
                    return;
                }
            }
        }
        setFirstLoad(false);
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

    if (firstLoad) {
        return null;
    }
    return (
        <View>
            <View hide={isLogged}>
                <DeviceAuth deviceId={deviceId} auth={auth} />
            </View>
            <View hide={!isLogged}>
                {ws && (
                    <DeviceScreenView deviceId={deviceId} ws={ws} screenImageSrc={screenImageSrc} />
                )}
            </View>
        </View>
    );
}
