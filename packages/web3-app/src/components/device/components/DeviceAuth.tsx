import TextField from '@web3-explorer/uikit-mui/dist/mui/TextField';
import { View } from '@web3-explorer/uikit-view';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { md5 } from '@web3-explorer/lib-crypto/dist/utils';
import Divider from '@web3-explorer/uikit-mui/dist/mui/Divider';
import FormControl from '@web3-explorer/uikit-mui/dist/mui/FormControl';
import InputLabel from '@web3-explorer/uikit-mui/dist/mui/InputLabel';
import MenuItem from '@web3-explorer/uikit-mui/dist/mui/MenuItem';
import Select, { SelectChangeEvent } from '@web3-explorer/uikit-mui/dist/mui/Select';
import { useDevice } from '../../../providers/DevicesProvider';
import { useIAppContext } from '../../../providers/IAppProvider';
import DeviceService from '../../../services/DeviceService';
import { CustomDeviceWsServerHosts, DeviceInfo } from '../../../types';
import AddServerView from '../Control/AddServerView';
import { Devices, ServerHostList } from '../global';

export default function DeviceAuth({
    auth,
    deviceId
}: {
    deviceId: string;
    auth: (deviceId: string, password: string, serverApi: string) => Promise<any>;
}) {
    const { t } = useTranslation();
    const [connecting, setConnecting] = useState(false);
    const [showAddServer, setShowAddServer] = useState(false);
    const { customHosts, onSaveCustomHosts, updateGlobalDevice } = useDevice();
    const { showSnackbar } = useIAppContext();
    const [deviceId_, setDeviceId] = useState(deviceId || '');
    const device = Devices.get(deviceId);
    const [password, setPassword] = useState(device?.password || '');
    const [serverApi, setServerApi] = useState(device?.serverApi || '');

    const onAuth = async () => {
        if (deviceId === '' && Devices.has(deviceId_)) {
            showSnackbar({
                message: t('DeviceExists')
            });
            return;
        }
        if (!deviceId_) {
            showSnackbar({
                message: t('DeviceIdCannotBeNull')
            });
            return;
        }

        if (!password) {
            showSnackbar({
                message: t('IncorrectCurrentPassword')
            });
            return;
        }

        if (!serverApi) {
            showSnackbar({
                message: t('ServerCannotBeNull')
            });
            return;
        }
        setConnecting(true);

        const res = await auth(deviceId_, password, serverApi);
        if (res) {
            let newDevice: DeviceInfo = {
                deviceId: deviceId_,
                password,
                serverApi,
                passwordHash: md5(password)
            };
            if (Devices.has(deviceId_)) {
                newDevice = {
                    ...Devices.get(deviceId_),
                    ...newDevice
                };
            }
            Devices.set(deviceId, newDevice);
            await new DeviceService(deviceId).save(newDevice);
            if (!deviceId) {
                updateGlobalDevice();
            }
        }
        setConnecting(false);
    };
    return (
        <View center wh100p>
            <View column wh100p pt={24} px12>
                <View mb12>
                    <TextField
                        fullWidth
                        slotProps={{
                            input: {
                                readOnly: false
                            }
                        }}
                        value={deviceId_}
                        onChange={e => {
                            setDeviceId(e.target.value);
                        }}
                        size={'small'}
                        id="deviceId"
                        label={t('DeviceId')}
                        variant="outlined"
                    />
                </View>
                <View mb12>
                    <TextField
                        fullWidth
                        slotProps={{
                            input: {
                                readOnly: false
                            }
                        }}
                        onChange={e => {
                            setPassword(e.target.value.toLowerCase());
                        }}
                        value={password}
                        size={'small'}
                        type="text"
                        id="password"
                        label={t('Password')}
                        variant="outlined"
                    />
                </View>
                <View mt={6}>
                    <FormControl fullWidth size={'small'} sx={{ mb: 4 }}>
                        <InputLabel id="server-hosts-select-label">{t('Server')}</InputLabel>
                        <Select
                            inputProps={{ readOnly: false }}
                            labelId="server-hosts-select-label"
                            id="server-hosts-select"
                            value={serverApi}
                            label={t('Server')}
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
                </View>
                <Divider />
                <View mt={24} center>
                    <View
                        buttonProps={{
                            disabled: connecting
                        }}
                        buttonContained
                        w100p
                        button={t('ConnectDevice')}
                        onClick={onAuth}
                    />
                </View>
                <View mt={16} center>
                    <View
                        buttonProps={{
                            disabled: connecting
                        }}
                        buttonVariant="text"
                        w100p
                        button={t('AddServer')}
                        onClick={() => setShowAddServer(true)}
                    />
                </View>
            </View>
            <AddServerView
                setCustomHosts={(hsots: CustomDeviceWsServerHosts[]) => {
                    onSaveCustomHosts(hsots);
                }}
                serverHostList={ServerHostList}
                showAddServer={showAddServer}
                setAddServer={(v: boolean) => {
                    setShowAddServer(v);
                }}
            />
        </View>
    );
}
