import { useTranslation } from '@web3-explorer/lib-translation';
import TextField from '@web3-explorer/uikit-mui/dist/mui/TextField';
import { View } from '@web3-explorer/uikit-view';
import { useState } from 'react';

import { md5 } from '@web3-explorer/lib-crypto/dist/utils';
import { useTheme } from 'styled-components';
import { useDevice } from '../../../providers/DevicesProvider';
import { useIAppContext } from '../../../providers/IAppProvider';
import DeviceService from '../../../services/DeviceService';
import { DeviceInfo } from '../../../types';
import { Devices } from '../global';

export default function DeviceAuth({
    auth,
    deviceId
}: {
    deviceId: string;
    auth: (deviceId: string, password: string, serverApi: string) => Promise<any>;
}) {
    const { t } = useTranslation();
    const [connecting, setConnecting] = useState(false);
    const { showSnackbar } = useIAppContext();
    const { updateGlobalDevice } = useDevice();

    const device = Devices.get(deviceId);
    const [password, setPassword] = useState(device?.password || '');

    const onAuth = async () => {
        if (deviceId === '' && Devices.has(deviceId)) {
            showSnackbar({
                message: t('DeviceExists')
            });
            return;
        }
        if (!deviceId) {
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

        setConnecting(true);

        const res = await auth(deviceId, password, device?.serverApi!);
        if (res) {
            let newDevice: Partial<DeviceInfo> = {
                deviceId,
                password,
                serverApi: device?.serverApi!,
                passwordHash: md5(password)
            };
            if (Devices.has(deviceId)) {
                newDevice = {
                    ...Devices.get(deviceId),
                    ...newDevice
                };
            }
            Devices.set(deviceId, newDevice as DeviceInfo);
            await new DeviceService(deviceId).save(newDevice as DeviceInfo);
            if (!deviceId) {
                updateGlobalDevice();
            }
        }
        setConnecting(false);
    };
    const theme = useTheme();
    return (
        <View center absFull column>
            <View center h={44} rowVCenter mb={12}>
                <View mr12 textColor={theme.textSecondary} text={'识别码'}></View>
                <View text={deviceId}></View>
            </View>
            <View column sx={{ width: 360 }} borderBox pt={12} px12>
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
                        type="text"
                        id="password"
                        label={t('Password')}
                        variant="outlined"
                    />
                </View>
                {/* <Divider /> */}
                <View mt={24} center>
                    <View
                        buttonProps={{
                            disabled: connecting,
                            size: 'large'
                        }}
                        buttonContained
                        w100p
                        button={t('ConnectDevice')}
                        onClick={onAuth}
                    />
                </View>
                {/* <View mt={16} center>
                    <View
                        buttonProps={{
                            disabled: connecting
                        }}
                        buttonVariant="text"
                        w100p
                        button={t('AddServer')}
                        onClick={() => setShowAddServer(true)}
                    />
                </View> */}
            </View>
            {/* <AddServerView
                setCustomHosts={(hsots: CustomDeviceWsServerHosts[]) => {
                    onSaveCustomHosts(hsots);
                }}
                serverHostList={ServerHostList}
                showAddServer={showAddServer}
                setAddServer={(v: boolean) => {
                    setShowAddServer(v);
                }}
            /> */}
        </View>
    );
}
