import * as React from 'react';
import Box from '@web3-explorer/uikit-mui/dist/mui/Box';
import InputLabel from '@web3-explorer/uikit-mui/dist/mui/InputLabel';
import MenuItem from '@web3-explorer/uikit-mui/dist/mui/MenuItem';
import FormControl from '@web3-explorer/uikit-mui/dist/mui/FormControl';
import Select, { SelectChangeEvent } from '@web3-explorer/uikit-mui/dist/mui/Select';
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
                        {hosts.map((host:string) => {
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
