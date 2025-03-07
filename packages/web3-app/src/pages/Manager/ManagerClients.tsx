import Chip from '@web3-explorer/uikit-mui/dist/mui/Chip';
import Paper from '@web3-explorer/uikit-mui/dist/mui/Paper';
import Table from '@web3-explorer/uikit-mui/dist/mui/Table';
import TableBody from '@web3-explorer/uikit-mui/dist/mui/TableBody';
import TableCell from '@web3-explorer/uikit-mui/dist/mui/TableCell';
import TableContainer from '@web3-explorer/uikit-mui/dist/mui/TableContainer';
import TableHead from '@web3-explorer/uikit-mui/dist/mui/TableHead';
import TableRow from '@web3-explorer/uikit-mui/dist/mui/TableRow';
import { useCallback, useEffect, useState } from 'react';

import { View } from '@web3-explorer/uikit-view';
import { useInterval } from '@web3-explorer/utils';
import { useTheme } from 'styled-components';
import { connectWebSocket, wsSendClose, wsSendMessage } from '../../common/ws';

import QRCode from 'react-qr-code';
import { showAlertMessage, showGlobalLoading } from '../../common/helpers';
import { isDesktop } from '../../common/utils';
import { WsCloseCode } from '../../types';

export default function ManagerClients({
    setServerIsReady
}: {
    serverIsReady: boolean;
    setServerIsReady: (v: boolean) => void;
}) {
    const serverIsReady = true;
    const port = 6788;
    const WS_URL = `wss://push.web3r.site`;

    const [clients, setClients] = useState([]);
    const theme = useTheme();
    const [ws, setWs] = useState<WebSocket | null>(null);
    useEffect(() => {
        function onServerIsReady(e: any) {
            console.log('serverIsReady', e.detail.serverIsReady);
            setServerIsReady(e.detail.serverIsReady);
            setClients([]);
            if (e.detail.serverIsReady) {
                setWs(null);
            }
        }

        window.addEventListener('onServerIsReady', onServerIsReady);
        return () => {
            window.removeEventListener('onServerIsReady', onServerIsReady);
        };
    }, []);
    useInterval(() => {
        if (ws && serverIsReady) wsSendMessage({ action: 'getClients' }, ws);
    });

    const onMessage = useCallback(
        async ({ action, payload }: { action: string; payload: any }, ws: WebSocket) => {
            if (action === 'getClients') {
                setClients(payload.clients);
            }
            if (action === 'logged') {
                wsSendMessage({ action: 'getClients' }, ws);
            }
        },
        []
    );

    const onClose = useCallback(async ({ code, reason }: { code: number; reason: string }) => {
        console.log('onClose');
    }, []);

    useEffect(() => {
        if (isDesktop()) {
            window.__appApi.message({
                action: 'checkServerIsReady',
                payload: {}
            });
        }
    }, []);
    useEffect(() => {
        if (!ws && serverIsReady)
            connectWebSocket(WS_URL, {
                onLogged: {
                    action: 'registerManager',
                    payload: { platform: 'WEB' }
                },
                onMessage,
                onClose
            })
                .then(ws => {
                    setWs(ws);
                })
                .catch(console.error);

        return () => {
            if (ws) wsSendClose(WsCloseCode.WS_CLOSE_STOP_RECONNECT, 'WS_CLOSE_STOP_RECONNECT', ws);
        };
    }, [ws, serverIsReady]);
    return (
        <View>
            <View row mx12 mb12 jSpaceBetween rowVCenter h={44} mt12>
                <View>
                    <View
                        chip="刷新客户端"
                        hide={!serverIsReady}
                        iconButtonSmall
                        onClick={() => {
                            showGlobalLoading(true, 2);
                            wsSendMessage({ action: 'getClients' }, ws!);
                        }}
                        icon={'Refresh'}
                    />
                </View>
                <View rowVCenter jEnd>
                    <View
                        hide={!serverIsReady}
                        drawer={{
                            anchor: 'right'
                        }}
                        mr12
                        buttonOutlined={`${WS_URL}`}
                        iconButtonSmall
                        onClick={() => {}}
                    >
                        <View p12 w={320} center column>
                            <View center my12>
                                <View>{WS_URL}</View>
                            </View>
                            <View borderRadius={8} center overflowHidden>
                                <QRCode size={128} value={WS_URL} />
                            </View>
                            <View center>
                                <View mt12 text={'请打开 Web3 Desk 扫描二维码'}></View>
                            </View>
                        </View>
                    </View>
                    <View
                        buttonContained={serverIsReady ? '停止服务' : '启动服务'}
                        iconButtonSmall
                        onClick={() => {
                            if (!isDesktop()) {
                                return showAlertMessage('您需要打开 Web3 Explorer');
                            }
                            window.__appApi.message({
                                action: serverIsReady ? 'onStopServer' : 'onStartServer',
                                payload: {
                                    port
                                }
                            });
                        }}
                    ></View>
                </View>
            </View>
            <View
                sx={{
                    '& .MuiPaper-root': {
                        bgcolor: theme.backgroundBrowser,
                        color: theme.textPrimary
                    }
                }}
            >
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>识别码</TableCell>
                                <TableCell align="right">类型</TableCell>
                                <TableCell align="right">平台</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {clients.map((session: any) => (
                                <TableRow
                                    key={session.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell>
                                        <View useSelectText>
                                            {session.manager && (
                                                <Chip
                                                    label="1001"
                                                    size={'small'}
                                                    variant="filled"
                                                />
                                            )}
                                            {session.device && `${session.device.deviceId}`}
                                            {session.client && `${session.client.deviceId}`}
                                        </View>
                                    </TableCell>
                                    {/* <TableCell scope="row">{session.id}</TableCell> */}
                                    <TableCell align="right">
                                        {session.device && (
                                            <Chip
                                                label="推送端"
                                                size={'small'}
                                                color="primary"
                                                variant="filled"
                                            />
                                        )}
                                        {session.client && (
                                            <Chip
                                                label="接收端"
                                                size={'small'}
                                                color="error"
                                                variant="filled"
                                            />
                                        )}

                                        {session.manager && (
                                            <Chip
                                                label="管理端"
                                                size={'small'}
                                                color="warning"
                                                variant="filled"
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        {session.device && `${session.device.platform}`}
                                        {session.client && `${session.client.platform}`}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </View>
        </View>
    );
}
