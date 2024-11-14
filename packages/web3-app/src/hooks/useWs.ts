import { useEffect, useState } from 'react';
import ServerApi from '../common/ServerApi';

import { WS_URL } from '../constant';
import { WsCloseCode } from '../types';

let CLOSE_CODE: WsCloseCode | null = null;

export function useWs<T>({
    enableWS,
    wsUrl,
    onMessage,
    onOpen,
    onClose
}: {
    wsUrl?: string;
    onMessage: any;
    onOpen: any;
    onClose: any;
    enableWS: boolean;
}) {
    const [ws, setWs] = useState<null | WebSocket>(null);
    const [wsConnected, setWsConnected] = useState(false);
    const [wsReady, setWsReady] = useState(false);
    const connectWebSocket = () => {
        const socket = new WebSocket(wsUrl || WS_URL);
        socket.binaryType = 'arraybuffer'; // Ensure binary data is handled as an ArrayBuffer
        socket.onopen = () => {
            const passwordHash = ServerApi.getPassword(true);
            const deviceId = ServerApi.getDeviceId();
            console.log('WebSocket connection opened', passwordHash, deviceId);
            if (CLOSE_CODE === WsCloseCode.CLOSE_AND_RECONNECT)
                socket.send(
                    JSON.stringify({
                        action: 'registerClient',
                        payload: {
                            deviceId,
                            password: passwordHash
                        }
                    })
                );
            setWsConnected(true);
            onOpen(socket);
        };

        socket.onmessage = event => {
            try {
                const { action, payload, errCode } = JSON.parse(event.data);
                if (action === 'logged') {
                    setWsReady(true);
                    socket?.send(
                        JSON.stringify({
                            action: 'clientMsg',
                            payload: {
                                eventType: 'deviceInfo'
                            }
                        })
                    );
                } else {
                    onMessage(action, payload, errCode);
                }
            } catch (error) {
                console.error(error);
            }
        };

        socket.onerror = error => {
            console.error('WebSocket error:', error);
        };

        socket.onclose = ({ code, reason }) => {
            setWsConnected(false);
            setWsReady(false);
            onClose();
            console.log('onClose', code, reason);
            CLOSE_CODE = code;
            setTimeout(connectWebSocket, 1000);
        };

        setWs(socket);
    };
    useEffect(() => {
        if (enableWS && !ws) {
            console.log('connectWebSocket...');
            connectWebSocket();
        }
        return () => {
            if (ws) {
                ws?.close();
            }
        };
    }, [enableWS, ws]);
    return {
        ws,
        wsReady,
        wsConnected
    };
}
