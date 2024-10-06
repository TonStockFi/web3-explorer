import { View } from '@web3-explorer/uikit-view';
import * as React from 'react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { Devices, ServerHostList } from '../global';
import Divider from '@mui/material/Divider';
import { DeviceInfo, DeviceOptions } from '../types';
import { Checkbox } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import AddServerView from './AddServerView';
import { md5 } from '../../../common/DESCrypto';

export default function ControlAuth({ deviceOptions }: { deviceOptions: DeviceOptions }) {
    const { isLogged, isAdding,walletAccountId, auth,monitorScale, setCustomHosts, customHosts } = deviceOptions;
    const { width, scale, height, dpi } = deviceOptions.getDeviceInfo('screen', {});
    const inputIsOpen = deviceOptions.getDeviceInfo('inputIsOpen', false);
    const [showAddServer, setShowAddServer] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [password, setPassword] = useState(
        isAdding ? '' : deviceOptions.getDeviceInfo('password', '')
    );
    const [deviceId, setDeviceId] = useState(isAdding ? '' : deviceOptions.deviceId);
    const [serverApi, setServerApi] = useState(
        isAdding ? '' : deviceOptions.getDeviceInfo('serverApi', '')
    );

    return (
        <View sx={{ p: 2 }} mb12>
            <View
                pl12
                hide={!isLogged}
                sx={{ mb: 2 }}
                text={'设备信息'}
                textProps={{ variant: 'h6' }}
            />
            <View sx={{ mb: 4 }}>
                <TextField
                    fullWidth
                    slotProps={{
                        input: {
                            readOnly: isLogged || !isAdding
                        }
                    }}
                    value={deviceId}
                    onChange={e => {
                        setDeviceId(e.target.value);
                    }}
                    size={'small'}
                    id="deviceId"
                    label="设备ID"
                    variant="outlined"
                />
            </View>
            <View sx={{ mb: 4 }}>
                <TextField
                    fullWidth
                    slotProps={{
                        input: {
                            readOnly: isLogged
                        }
                    }}
                    onChange={e => {
                        setPassword(e.target.value.toLowerCase());
                    }}
                    value={password}
                    size={'small'}
                    type="text"
                    id="password"
                    label="密码"
                    variant="outlined"
                />
            </View>

            <FormControl fullWidth size={'small'} sx={{ mb: 4 }}>
                <InputLabel id="server-hosts-select-label">服务器</InputLabel>
                <Select
                    inputProps={{ readOnly: isLogged }}
                    labelId="server-hosts-select-label"
                    id="server-hosts-select"
                    value={serverApi}
                    label="Age"
                    onChange={(e: SelectChangeEvent) => {
                        setServerApi(e.target.value);
                    }}
                >
                    {[...ServerHostList, ...(customHosts || [])].map(
                        ({ host }: { host: string }) => (
                            <MenuItem key={host} value={host}>
                                {host}
                            </MenuItem>
                        )
                    )}
                </Select>
            </FormControl>
            <Divider />
            <View hide={deviceOptions.isLogged} mt12 center>
                <Button
                    fullWidth
                    disabled={connecting}
                    onClick={async () => {
                        if(!auth){
                            return;
                        }
                        if (!deviceId) {
                            deviceOptions.setSnackbar('设备ID不能为空');
                            return;
                        }
                        if (isAdding && Devices.has(deviceId)) {
                            deviceOptions.setSnackbar('设备已存在');
                            return;
                        }
                        if (!password) {
                            deviceOptions.setSnackbar('密码不能为空');
                            return;
                        }
                        if (!serverApi) {
                            deviceOptions.setSnackbar('服务器不能为空');
                            return;
                        }
                        setConnecting(true);
                        const res = await auth(deviceId, password, serverApi);
                        setConnecting(false);
                        if (res) {
                            let newDevice: DeviceInfo = {
                                walletAccountId,
                                deviceId,
                                password,
                                serverApi,
                                passwordHash: md5(password)
                            };
                            if (!isAdding) {
                                const device = Devices.get(deviceId);
                                newDevice = {
                                    ...device,
                                    ...newDevice
                                };
                            } else {
                                newDevice = {
                                    ...newDevice,
                                    name: `#${Devices.size} 未命名`
                                };
                            }

                            Devices.set(deviceId, newDevice);
                            const devicesArray = Array.from(Devices.entries());
                            localStorage.setItem('Devices', JSON.stringify(devicesArray));
                            if (isAdding && deviceOptions.setGlobalUpdatedAt) {
                                deviceOptions.setGlobalUpdatedAt(+new Date);
                            }
                        }
                    }}
                    variant="contained"
                >
                    连接设备
                </Button>
            </View>
            <View center hide={deviceOptions.isLogged} abs bottom={20} left={24} right={24}>
                <Button
                    variant="text"
                    fullWidth
                    onClick={() => {
                        setShowAddServer(true);
                    }}
                >
                    添加服务器
                </Button>
            </View>
            <Divider />
            {isLogged && (
                <>
                    <View sx={{ mt: 4 }}>
                        <TextField
                            slotProps={{
                                input: {
                                    readOnly: isLogged
                                }
                            }}
                            fullWidth
                            value={`${width}/${height} DPI: ${dpi} Scale: ${scale}`}
                            size={'small'}
                            id="sreen"
                            label="屏幕尺寸"
                            variant="outlined"
                        />
                    </View>
                    <View sx={{ mt: 4 }}>
                        <TextField
                            slotProps={{
                                input: {
                                    readOnly: isLogged
                                }
                            }}
                            fullWidth
                            value={`${width * monitorScale}/${
                                height * monitorScale
                            } Scale: ${monitorScale}`}
                            size={'small'}
                            id="sreen"
                            label="当前监控屏幕尺寸"
                            variant="outlined"
                        />
                    </View>
                    <View sx={{ mt: 4 }}>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        inputProps={{ readOnly: true }}
                                        checked={inputIsOpen}
                                    />
                                }
                                label={inputIsOpen ? '输入控制已开启' : '输入控制未开启'}
                            />
                        </FormGroup>
                    </View>
                </>
            )}
            <AddServerView
                setCustomHosts={setCustomHosts}
                serverHostList={ServerHostList}
                customHosts={customHosts}
                showAddServer={showAddServer}
                setAddServer={setShowAddServer}
                deviceOptions={deviceOptions}
            />
        </View>
    );
}
