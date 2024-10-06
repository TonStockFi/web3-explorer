import * as React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Box } from '@mui/material';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { DeviceOptions } from '../types';
import HostListView from '../../../components/HostListView';
import { View } from '@web3-explorer/uikit-view';

export default function AddServerView({
    deviceOptions,
    setCustomHosts,
    customHosts,
    serverHostList,
    showAddServer,
    setAddServer
}: {
    deviceOptions: DeviceOptions;
    setCustomHosts: any;
    customHosts?: { host: string }[];
    serverHostList: { host: string }[];
    showAddServer: boolean;
    setAddServer: any;
}) {
    const [value, setValue] = React.useState('');
    return (
        <Dialog
            open={showAddServer}
            maxWidth={'md'}
            onClose={() => setAddServer(false)}
            PaperProps={{
                component: 'form',
                onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    const formJson = Object.fromEntries((formData as any).entries());
                    const api = formJson.api;
                    if (api) {
                        if (api.startsWith('ws') || api.startsWith('http')) {
                            if ([...(customHosts || []), ...serverHostList].indexOf(api) === -1) {
                                setCustomHosts([{ host: api }, ...(customHosts || [])]);
                                deviceOptions.setSnackbar('添加成功');
                            } else {
                                deviceOptions.setSnackbar('服务器已存在');
                            }
                        }
                    }
                    setAddServer(false);
                }
            }}
        >
            <DialogTitle>添加服务器</DialogTitle>
            <DialogContent sx={{ minWidth: '360px' }}>
                <Box>
                    <TextField
                        autoFocus
                        required
                        value={value}
                        margin="dense"
                        id="api"
                        name="api"
                        label="服务器地址"
                        type="url"
                        fullWidth
                        onChange={e => {
                            setValue(e.target.value);
                        }}
                        variant="standard"
                    />
                    <View hide={!customHosts || customHosts.length === 0}>
                        <HostListView
                            defaultHosts={[]}
                            hosts={customHosts ? customHosts.map(server => server.host) : []}
                            setHost={setCustomHosts}
                        />
                    </View>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setAddServer(false)}>取消</Button>
                <Button type="submit">添加</Button>
            </DialogActions>
        </Dialog>
    );
}
