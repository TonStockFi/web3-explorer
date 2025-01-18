import { md5 } from '@web3-explorer/lib-crypto/dist/utils';
import { View } from '@web3-explorer/uikit-view';
import { useLocalStorageState, useTimeoutLoop } from '@web3-explorer/utils';

import DESCrypto from '@web3-explorer/utils/dist/common/DESCrypto';
import { useCallback, useEffect, useState } from 'react';
import {
    connectWebSocket,
    wsSendClientClickEvent,
    wsSendClientEvent,
    wsSendClientEventAction,
    wsSendClose,
    wsSendMessage
} from '../../common/ws';
import { useDevice } from '../../providers/DevicesProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { ErrCodes, GLOBAL_ACTIONS, sendMessageParams, WsCloseCode } from '../../types';
import DeviceAuth from './components/DeviceAuth';
import { Devices } from './global';
import DeviceScreenView, { getMonitorImageId } from './Screen/DeviceScreenView';

let queue: ArrayBuffer[] = [];

export function pushQueue(screen: ArrayBuffer) {
    queue.unshift(screen);
}

let videoElement: null | HTMLVideoElement = null;
let peerConnection: null | RTCPeerConnection = null;
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
            // const { password } = device!;
            // const decrypt = await aesGcmDecryptToBuffer(
            //     screenImageData.substring('data:jpeg;base64_a'.length + 5),
            //     password!
            // );
            // async function webmToImageDataURL(blob: Blob) {
            //     return new Promise((resolve, reject) => {
            //         const video = document.createElement('video');
            //         video.src = URL.createObjectURL(blob);
            //         video.crossOrigin = 'anonymous';
            //         video.muted = true;
            //         video.playsInline = true;
            //         video.onloadeddata = () => {
            //             video.currentTime = 0.1; // Capture the first frame
            //         };
            //         video.onseeked = () => {
            //             const canvas = document.createElement('canvas');
            //             canvas.width = video.videoWidth;
            //             canvas.height = video.videoHeight;
            //             const ctx = canvas.getContext('2d');
            //             ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);
            //             URL.revokeObjectURL(video.src);
            //             resolve(canvas.toDataURL('image/png'));
            //         };
            //         video.onerror = e => reject(e);
            //     });
            // }
            // const dataUrl = await webmToImageDataURL(new Blob([decrypt], { type: "video/webm; codecs=vp8" }));
            // const base64String = await bufferToBlobToBase64(decrypt, 'image/jpeg');
            // setScreenImageSrc(dataUrl as string);
        } else if (screenImageData.startsWith('data:jpeg;base64')) {
            setScreenImageSrc(screenImageData);
        }
    };

    useTimeoutLoop(async () => {
        let q1 = [...queue];
        queue = [];
        const screen = q1.shift();
        if (screen) {
            const blob = new Blob([Buffer.from(screen)], { type: 'image/jpeg' });
            const url = URL.createObjectURL(blob);
            setScreenImageSrc(url);
        }
    }, 500);
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
                    peerConnection = new RTCPeerConnection();
                    peerConnection.ontrack = event => {
                        // const [remoteStream] = event.streams;

                        // // // 调整接收端清晰度
                        // const videoTrack = remoteStream.getVideoTracks()[0];
                        // const sender = peerConnection!
                        //     .getSenders()
                        //     .find(s => s.track === videoTrack);

                        // const params = sender!.getParameters();
                        // if (!params.encodings) params.encodings = [{}];

                        // params.encodings[0].maxBitrate = 5_000_000; // 提高观看端质量
                        // sender!.setParameters(params);

                        const videoElement = document.getElementById('video') as HTMLVideoElement;
                        if (videoElement) {
                            videoElement.srcObject = event.streams[0];

                            videoElement.controls = false;
                            videoElement.autoplay = true;
                            videoElement.style.display = 'flex';

                            videoElement.muted = true; // 避免音频不同步问题
                            videoElement.playsInline = true; // 适配移动端
                        }
                    };
                    console.log('onMessage deviceInfo', deviceInfo);
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
                onBufferMessage: async (arrayBuffer: ArrayBuffer, ws: WebSocket) => {
                    try {
                        // const videoData = event.data;

                        // 将收到的ArrayBuffer转换为Blob并创建URL
                        // const blob = new Blob([Buffer.from(arrayBuffer)], { type: 'video/webm' });
                        // const url = URL.createObjectURL(blob);

                        // // 将视频元素的源设置为Blob URL
                        // if (document.getElementById('video')) {
                        //     const v = document.getElementById('video') as HTMLVideoElement;
                        //     v.src = url;
                        // }

                        // const decoded = BufferProcessor.decodeBuffer(arrayBuffer);

                        // if (!decoded) {
                        //     console.warn('Invalid buffer, dropped.');
                        //     return;
                        // }
                        pushQueue(arrayBuffer);
                    } catch (error) {
                        console.error('Failed to decode buffer:', error);
                    }
                },
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
                switch (action) {
                    case 'GLOBAL_ACTION': {
                        wsSendClientEventAction(payload.action as GLOBAL_ACTIONS, ws);
                        break;
                    }
                    case 'PY_AUTO_GUI': {
                        const { pyAutoGuisScript } = payload;
                        const payload1 = {
                            eventType: 'pyautogui',
                            pyAutoGuisScript
                        };
                        wsSendClientEvent(payload1, ws);
                        break;
                    }
                    case 'CLICK': {
                        const { x, y } = payload;
                        wsSendClientClickEvent(x, y, ws);
                        break;
                    }
                    case 'EVENT': {
                        const { message } = payload as {
                            message: sendMessageParams;
                        };
                        wsSendClientEvent(message, ws);
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
            {/* {errCode && (
                <View abs bottom0 h={44} xx0 center>
                    {errCode}
                </View>
            )} */}
        </View>
    );
}
