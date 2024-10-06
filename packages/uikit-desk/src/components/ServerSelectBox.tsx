import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { IS_DEV, SERVER_URL } from '../constant';
import ServerApi from '../common/ServerApi';
import AddServerApiDialog from './AddServerApiDialog';
import { useLocalStorageState } from '@web3-explorer/uikit-mui';

export default function ServerSelectBox({ onChangeApi }: { onChangeApi: any }) {
    const [api, setApi] = React.useState(ServerApi.getServerApi);

    const handleChange = (event: SelectChangeEvent) => {
        const api = event.target.value as string;
        setApi(api);
        ServerApi.setServerApi(api);
        onChangeApi();
    };

    let defaultHosts = [SERVER_URL];
    if (IS_DEV) {
        defaultHosts = [
            ...defaultHosts,
            'http://192.168.43.244:3203/api',
            'ws://192.168.43.244:3204/api'
        ];
    }
    const [hosts, setHosts] = useLocalStorageState<string[]>('hosts', defaultHosts);

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ padding: 2 }}>
                <FormControl sx={{ width: '100%' }}>
                    <InputLabel id="demo-simple-select-label">Server API</InputLabel>
                    <Select
                        labelId="server_api-label"
                        id="server_api"
                        value={api}
                        label="Server API"
                        onChange={handleChange}
                    >
                        {hosts.map(host => {
                            return (
                                <MenuItem key={host} value={host}>
                                    {host}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
                <AddServerApiDialog setHosts={setHosts} hosts={hosts} defaultHosts={defaultHosts} />
            </Box>
        </Box>
    );
}
