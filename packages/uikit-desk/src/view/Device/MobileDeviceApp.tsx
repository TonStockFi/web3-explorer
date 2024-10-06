import AppAPI from '../../common/AppApi';
import { DeskHome } from '../../index';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { deepDiff, generateDeviceId, generateRandomPassword } from '../../common/utils';
import ServerApi from '../../common/ServerApi';
import { IS_DEV } from '../../constant';
import { md5 } from '../../common/DESCrypto';
import { useLocalStorageState } from '@web3-explorer/uikit-mui';
import { Snackbar } from '@mui/material';

let DeviceInfo = {};
const KEY_DEVICE_ID = IS_DEV ? 'device_device_id_dev_1' : 'device_device_id_1';
const KEY_PASSWORD = 'device_password';

export default function MobileDeviceApp() {
    const appAPI = new AppAPI();
    const [state, setState] = React.useState({
        serviceMediaDialogShow: false,
        serviceInputDialogShow: false,
        serviceMediaStopDialogShow: false
    });

    const [deviceId, setDeviceId] = useLocalStorageState(KEY_DEVICE_ID, '');
    const [password, setPassword] = useLocalStorageState(KEY_PASSWORD, '');
    const [connected, setConnected] = useState(0);
    const [serviceInputIsOpen, setServiceInputIsOpen] = useState(false);
    const [serviceMediaIsRunning, setServiceMediaIsRunning] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const onConfirmInitService = useCallback(async () => {
        setConfirming(true);
        const password = generateRandomPassword(IS_DEV);
        setPassword(password);
        const passwordHash = md5(password);
        appAPI.init_service(ServerApi.getServerApi(), password, passwordHash);
    }, []);

    const onChangeApi = () => {
        appAPI.stop_service();
    };

    const auth = async (passwordHash: string, deviceId: string) => {
        if (ServerApi.useWs()) {
            return;
        }
        try {
            setConnected(0);
            const res = await fetch(ServerApi.url('desk/auth'), {
                method: 'POST',
                body: JSON.stringify({ password: passwordHash, deviceId })
            });
            console.log('on_state_changed auth', await res.text());
            setConnected(1);
        } catch (e) {
            setConnected(-1);
            console.error(e);
        }
    };

    useEffect(() => {
        if (!deviceId) {
            const deviceId = generateDeviceId(IS_DEV);
            setDeviceId(deviceId);
        }
    }, [deviceId]);
    useEffect(() => {
        if (!deviceId) {
            return;
        }
        const updateDeviceInfo = async (deviceInfo: any, password: string, deviceId: string) => {
            if (!deepDiff(DeviceInfo, deviceInfo)) {
                console.log('DeviceInfo not change');
                return;
            }
            DeviceInfo = deviceInfo;
            try {
                const res = await fetch(ServerApi.url('desk/update/device/info'), {
                    method: 'POST',
                    body: JSON.stringify({ password, deviceId, ...deviceInfo })
                });
                const json = await res.json();
                console.log(
                    'on_state_changed updateDeviceInfo',
                    JSON.stringify(deviceInfo),
                    JSON.stringify(json)
                );
            } catch (e) {
                console.error(e);
            }
        };
        const on_state_changed = async () => {
            const res = appAPI.check_service();
            const deviceInfo = JSON.parse(res);
            const { mediaIsStart, isWsConnected, isWsReady, inputIsOpen } = deviceInfo;
            setServiceInputIsOpen(inputIsOpen);
            setServiceMediaIsRunning(mediaIsStart);
            const password = localStorage.getItem(KEY_PASSWORD);
            const deviceId = localStorage.getItem(KEY_DEVICE_ID);
            console.log('on_state_changed', res, deviceId);
            if (ServerApi.useWs()) {
                if (isWsReady) {
                    setConnected(1);
                } else {
                    if (!isWsConnected) {
                        setConnected(0);
                    }
                }
            }

            let passwordHash;
            if (mediaIsStart) {
                setConfirming(false);
                setState({
                    serviceMediaDialogShow: false,
                    serviceInputDialogShow: false,
                    serviceMediaStopDialogShow: false
                });

                if (password && deviceId) {
                    passwordHash = md5(password);
                    await auth(passwordHash, deviceId);
                }
            }

            if (!ServerApi.useWs() && password && deviceId) {
                if (!passwordHash) {
                    passwordHash = md5(password);
                }
                await updateDeviceInfo(deviceInfo, passwordHash, deviceId);
            }
        };
        appAPI.webview_is_ready(ServerApi.getServerApi(), deviceId);
        console.log('on_state_changed ...');
        on_state_changed().catch(console.error);

        // @ts-ignore
        window['AppCallback'] = async (message: string) => {
            try {
                const { action, payload } = JSON.parse(message) as {
                    action: string;
                    payload: any;
                };
                console.log('AppCallback action', action);
                switch (action) {
                    case 'on_media_projection_canceled':
                        setConfirming(false);
                        setState({
                            serviceMediaDialogShow: false,
                            serviceInputDialogShow: false,
                            serviceMediaStopDialogShow: false
                        });
                        break;
                    case 'on_state_changed':
                        on_state_changed();
                        if (
                            payload &&
                            undefined !== payload['startPushingImage'] &&
                            payload['startPushingImage']
                        ) {
                            appAPI.show_toast('Client Connected!');
                        }
                        break;
                }
            } catch (e) {
                console.error(e);
            }
        };
    }, [deviceId]);

    const [snackbar, setSnackbar] = useState('');
    return (
        <>
            <DeskHome
                confirming={confirming}
                onChangeApi={onChangeApi}
                connected={connected}
                state={state}
                setState={setState}
                deviceId={deviceId}
                onConfirmInitService={onConfirmInitService}
                password={password}
                appAPI={appAPI}
                serviceMediaIsRunning={serviceMediaIsRunning}
                serviceInputIsOpen={serviceInputIsOpen}
            />
            <Snackbar
                open={!!snackbar}
                autoHideDuration={3000}
                onClose={() => {
                    setSnackbar('');
                }}
                message={snackbar}
            />
        </>
    );
}
