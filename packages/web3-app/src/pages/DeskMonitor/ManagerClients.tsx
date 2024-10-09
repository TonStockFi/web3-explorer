import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import Table from '@web3-explorer/uikit-mui/dist/mui/Table';
import TableBody from '@web3-explorer/uikit-mui/dist/mui/TableBody';
import TableCell from '@web3-explorer/uikit-mui/dist/mui/TableCell';
import TableContainer from '@web3-explorer/uikit-mui/dist/mui/TableContainer';
import TableHead from '@web3-explorer/uikit-mui/dist/mui/TableHead';
import TableRow from '@web3-explorer/uikit-mui/dist/mui/TableRow';
import Paper from '@web3-explorer/uikit-mui/dist/mui/Paper';
import Chip from '@web3-explorer/uikit-mui/dist/mui/Chip';
import IconButton from '@web3-explorer/uikit-mui/dist/mui/IconButton';

import { View } from '@web3-explorer/uikit-view';
import { connectWebSocket, wsSendMessage } from '../../common/ws';
import { WS_URL } from '../../constant';
import { useInterval } from '@web3-explorer/uikit-mui';
import RefreshIcon from '@mui/icons-material/Refresh';

let ws: WebSocket;
export default function WsClients() {
    const [clients, setClients] = useState([]);
    useInterval(() => {
        wsSendMessage({ action: 'getClients' }, ws);
    });
    const onMessage = useCallback(async ({ action, payload  }: { action:string, payload:any  }, ws: WebSocket) => {
        if (action === 'getClients') {
            setClients(payload.clients);
        }
        if (action === 'logged') {
            wsSendMessage({ action: 'getClients' }, ws);
        }
    }, []);

    const onClose = useCallback(async ({ code, reason }: { code: number; reason: string }) => {
        console.log('onClose');
    }, []);

    useEffect(() => {
        connectWebSocket(WS_URL, {
            onMessage,
            onClose
        })
            .then((ws_: WebSocket) => {
                wsSendMessage({ action: 'registerManager' }, ws_);
                ws = ws_;
            })
            .catch(console.error);
    }, []);
    return (
        <View ml12 mr12>
            <View row ml12 mt12 mb12 sx={{ justifyContent: 'flex-end' }}>
                <IconButton
                    color="primary"
                    onClick={() => {
                        wsSendMessage({ action: 'getClients' }, ws);
                    }}
                >
                    <RefreshIcon />
                </IconButton>
            </View>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
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
    );
}
