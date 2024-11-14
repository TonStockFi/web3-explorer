import Chip from '@web3-explorer/uikit-mui/dist/mui/Chip';
import Paper from '@web3-explorer/uikit-mui/dist/mui/Paper';
import Table from '@web3-explorer/uikit-mui/dist/mui/Table';
import TableBody from '@web3-explorer/uikit-mui/dist/mui/TableBody';
import TableCell from '@web3-explorer/uikit-mui/dist/mui/TableCell';
import TableContainer from '@web3-explorer/uikit-mui/dist/mui/TableContainer';
import TableHead from '@web3-explorer/uikit-mui/dist/mui/TableHead';
import TableRow from '@web3-explorer/uikit-mui/dist/mui/TableRow';
import { useCallback, useEffect, useState } from 'react';

import RefreshIcon from '@mui/icons-material/Refresh';
import { View } from '@web3-explorer/uikit-view';
import { useInterval } from '@web3-explorer/utils';
import { useTheme } from 'styled-components';
import { onAction } from '../../common/electron';
import { connectWebSocket, wsSendClose, wsSendMessage } from '../../common/ws';

import { Page } from '../../components/Page';
import { useIAppContext } from '../../providers/IAppProvider';
import { WsCloseCode } from '../../types';

let ws: WebSocket;

export default function ManagerClients() {
    const [clients, setClients] = useState([]);
    const theme = useTheme();
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [serverIsReady, setServerIsReady] = useState<boolean>(false);

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
    const { env } = useIAppContext();
    const port = 6788;
    useEffect(() => {
        onAction('serverIsReady')?.then(res => {
            console.log('serverIsReady', res);
            setServerIsReady(res as boolean);
        });
    }, []);
    useEffect(() => {
        const WS_URL = `ws://${env.ip?.adr}:${port}/api`;
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
        <Page full>
            <View row mx12 mb12 jSpaceBetween rowVCenter h={44}>
                <View>
                    <View
                        hide={!serverIsReady}
                        iconButtonSmall
                        onClick={() => {
                            wsSendMessage({ action: 'getClients' }, ws!);
                        }}
                        icon={'Refresh'}
                    />
                </View>
                <View
                    buttonVariant="contained"
                    button={serverIsReady ? 'Stop Server' : 'Start Server'}
                    iconButtonSmall
                    onClick={() => {
                        onAction(
                            serverIsReady ? 'stopServer' : 'startServer',
                            serverIsReady ? {} : { port }
                        )?.then(res => {
                            console.log('ws server', res);
                            onAction('serverIsReady')?.then(res => {
                                setServerIsReady(res as boolean);
                                if (!res) {
                                    setClients([]);
                                    setWs(null);
                                }
                            });
                        });
                    }}
                >
                    <RefreshIcon />
                </View>
            </View>
            <View
                mx={12}
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
                                <TableCell>ID</TableCell>
                                <TableCell align="right">Type</TableCell>
                                <TableCell align="right">Platform</TableCell>
                                <TableCell align="right">DeviceId</TableCell>
                                <TableCell align="right">Password</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {clients.map((session: any) => (
                                <TableRow
                                    key={session.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {session.id}
                                    </TableCell>
                                    <TableCell align="right">
                                        {session.device && (
                                            <Chip
                                                label="D"
                                                size={'small'}
                                                color="primary"
                                                variant="filled"
                                            />
                                        )}
                                        {session.client && (
                                            <Chip
                                                label="C"
                                                size={'small'}
                                                color="error"
                                                variant="filled"
                                            />
                                        )}

                                        {session.manager && (
                                            <Chip
                                                label="M"
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
                                    <TableCell align="right">
                                        {session.device && `${session.device.deviceId}`}
                                        {session.client && `${session.client.deviceId}`}
                                    </TableCell>
                                    <TableCell align="right">
                                        {session.device && `${session.device.password}`}
                                        {session.client && `${session.client.password}`}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </View>
        </Page>
    );
}
