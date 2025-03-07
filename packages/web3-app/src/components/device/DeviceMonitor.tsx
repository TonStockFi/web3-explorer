import { md5 } from '@web3-explorer/lib-crypto/dist/utils';
import { View } from '@web3-explorer/uikit-view';
import { useLocalStorageState } from '@web3-explorer/utils';

import DESCrypto from '@web3-explorer/utils/dist/common/DESCrypto';
import { useCallback, useEffect, useState } from 'react';
import { connectWebSocket, wsSendClose, wsSendMessage } from '../../common/ws';
import { useDevice } from '../../providers/DevicesProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { ErrCodes, GLOBAL_ACTIONS, sendMessageParams, WsCloseCode } from '../../types';
import DeviceAuth from './components/DeviceAuth';
import { Devices } from './global';
import DeviceScreenView, { getMonitorImageId } from './Screen/DeviceScreenView';
import { WebRtcControl } from './WebRtcControl';

export default function DeviceMonitor({ deviceId }: { deviceId: string }) {
    const { handleClientDeviceInfo } = useDevice();

    const [errCode, setErrCode] = useLocalStorageState<ErrCodes | undefined>('errCode', undefined);
    const [isLogged, setIsLogged] = useState(true);
    const [ws, setWs] = useState<WebSocket | undefined>(undefined);

    const [firstLoad, setFirstLoad] = useState(true);

    const { showSnackbar } = useIAppContext();

    const [screenImageSrc, setScreenImageSrc] = useState('');

    const handleScreenImage = async (deviceId: string, screenImageData: string, ts: number) => {
        if (!deviceId || !Devices.has(deviceId)) {
            return;
        }

        const device = Devices.get(deviceId);
        if (screenImageData.startsWith('data:jpeg;base64_d')) {
            const { password } = device!;
            const crypto = new DESCrypto(password!);

            const imgId = getMonitorImageId(deviceId);
            if (imgId) {
                const img = document.getElementById(imgId);
                if (img) {
                    const { width, height } = img.getBoundingClientRect();
                    const device = Devices.get(deviceId);
                    if (device && device.screen) {
                        const { screen } = device;
                        if (width / height > 1) {
                            device.screen = {
                                ...screen,
                                height: screen.width,
                                width: screen.height
                            };
                            Devices.set(deviceId, device);
                        }
                    }
                }
            }
            const imageDagta = crypto.decrypt(
                screenImageData.substring('data:jpeg;base64_d'.length + 5)
            );
            const img = 'data:jpeg;base64,' + imageDagta;
            setScreenImageSrc(img);
        } else if (screenImageData.startsWith('data:jpeg;base64_a')) {
        } else if (screenImageData.startsWith('data:jpeg;base64')) {
            setScreenImageSrc(screenImageData);
        }
    };

    const onMessage = useCallback(
        async (
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
            const peerConnection = WebRtcControl.getInstance().getPeerConnection();

            setIsLogged(true);
            if (action === 'deviceMsg') {
                const { screenImage, offer, candidate, deviceInfo } = payload;
                if (offer && peerConnection) {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    wsSendMessage(
                        {
                            action: 'clientMsg',
                            payload: {
                                eventType: 'answer',
                                answer
                            }
                        },
                        ws
                    );
                }

                if (candidate && peerConnection) {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                }
                if (screenImage) {
                    handleScreenImage(deviceId, screenImage.data, screenImage.ts);
                }
                if (deviceInfo) {
                    WebRtcControl.getInstance().start({
                        handleDeviceInfo: (info: any) => {
                            handleClientDeviceInfo(deviceId!, info);
                        },
                        setScreenImageSrc: url => {
                            setScreenImageSrc(url);
                        }
                    });
                    handleClientDeviceInfo(deviceId!, deviceInfo);
                }
            }
        },
        []
    );

    const onClose = async (
        { code, reason }: { code: WsCloseCode | number; reason: string },
        ws: WebSocket
    ) => {
        console.log('onClose', code, reason);
        setScreenImageSrc('');
        setWs(undefined);
        if ((code && code >= WsCloseCode.WS_CLOSE_STOP_RECONNECT) || code === 1006) {
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
            //@ts-ignore
            if (e.error) {
                showSnackbar({ message: '连接失败!请检查服务端是否启动或者服务端是址是不是正确' });
            }

            setErrCode(ErrCodes.CONNECT_ERROR);
            //@ts-ignore
            console.error('auth error', e.error);
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
                    setFirstLoad(r => {
                        if (r) {
                            auth(deviceId, password, serverApi).catch(console.error);
                        }
                        return r;
                    });
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
    useEffect(() => {
        function onWsAction(e: any) {
            setWs(ws => {
                const { action, payload } = e.detail as any;
                if (!ws) {
                    return ws;
                }
                switch (action) {
                    case 'GLOBAL_ACTION': {
                        WebRtcControl.getInstance().wsSendClientEventAction(
                            payload.action as GLOBAL_ACTIONS,
                            ws
                        );
                        break;
                    }
                    case 'PY_AUTO_GUI': {
                        const { pyAutoGuisScript } = payload;
                        const payload1 = {
                            eventType: 'pyautogui',
                            pyAutoGuisScript
                        };
                        WebRtcControl.getInstance().wsSendClientEvent(payload1, ws!);
                        break;
                    }
                    case 'CLICK': {
                        const { x, y } = payload;
                        WebRtcControl.getInstance().wsSendClientClickEvent(x, y, ws!);
                        break;
                    }
                    case 'EVENT': {
                        const { message } = payload as {
                            message: sendMessageParams;
                        };
                        WebRtcControl.getInstance().wsSendClientEvent(message, ws!);
                        break;
                    }
                }
                return ws;
            });
        }
        window.addEventListener('onWsAction', onWsAction);

        return () => {
            window.removeEventListener('onWsAction', onWsAction);
        };
    }, []);

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
