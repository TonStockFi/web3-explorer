import * as React from 'react';
import Box from '@mui/material/Box';

import DeviceCard from './DeviceCard';
import PermissionsCard from './PermissionsCard';
import ServiceStartCard from './ServiceStartCard';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import AppAPI from '../../common/AppApi';
import { formatNumber } from '../../common/utils';
import { IS_DEV } from '../../constant';
import ServerSelectBox from '../../components/ServerSelectBox';
import BottomNavigationView from '../../components/BottomNavigationView';
import { useLocalStorageState } from '@web3-explorer/uikit-mui';
import Typography from '@mui/material/Typography';

export default function MobileDeviceHome({
    confirming,
    appAPI,
    onChangeApi,
    setState,
    state,
    connected,
    deviceId,
    password,
    // onRefreshPassword,
    serviceInputIsOpen,
    serviceMediaIsRunning,
    onConfirmInitService
}: {
    confirming: boolean;
    onChangeApi: any;
    connected: number;
    setState: any;
    state: any;
    onConfirmInitService: any;
    deviceId: string;
    // onRefreshPassword: any;
    password: string;
    appAPI: AppAPI;
    serviceInputIsOpen: boolean;
    serviceMediaIsRunning: boolean;
}) {
    const [tabId, setTabId] = useLocalStorageState('tabId', 'link');

    const handleInputService = React.useCallback(
        (event: any) => {
            event.stopPropagation();
            event.preventDefault();
            if (!serviceInputIsOpen) {
                setState({
                    ...state,
                    serviceInputDialogShow: true
                });
            } else {
                appAPI.stop_input();
            }
            return false;
        },
        [serviceInputIsOpen]
    );

    const handleMediaService = React.useCallback(
        (event: any) => {
            event.stopPropagation();
            event.preventDefault();
            if (!serviceMediaIsRunning) {
                setState({
                    ...state,
                    serviceMediaDialogShow: true
                });
            } else {
                setState({
                    ...state,
                    serviceMediaStopDialogShow: true
                });
            }
            return false;
        },
        [serviceMediaIsRunning]
    );
    // @ts-ignore
    return (
        <Box sx={{ width: '100vw', maxWidth: 720, paddingBottom: '64px' }}>
            {tabId === 'link' && (
                <>
                    <Box
                        sx={{
                            pt: 4,
                            height: 100,
                            fontSize: 32,
                            fontWeight: 700,
                            justifyContent: 'center',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        onClick={
                            IS_DEV
                                ? () => {
                                      location.reload();
                                  }
                                : undefined
                        }
                    >
                        Web3 Desk
                    </Box>
                    <Box sx={{ m: 1 }}>
                        <Box sx={{ mb: 2 }}>
                            {serviceMediaIsRunning ? (
                                <DeviceCard
                                    connected={connected}
                                    // onRefreshPassword={onRefreshPassword}
                                    password={password}
                                    deviceId={deviceId ? formatNumber(Number(deviceId)) : ''}
                                />
                            ) : (
                                <ServiceStartCard handleMediaService={handleMediaService} />
                            )}
                        </Box>
                        <Box>
                            <PermissionsCard
                                handleInputService={handleInputService}
                                handleMediaService={handleMediaService}
                                serviceInputIsOpen={serviceInputIsOpen}
                                serviceMediaIsRunning={serviceMediaIsRunning}
                            />
                        </Box>
                        <ConfirmationDialog
                            {...{
                                id: 'stop_service',
                                title: '警告',
                                titleIcon: <WarningAmberIcon sx={{ color: 'red' }} />,
                                content: '关闭服务将自动关闭所有已建立的连接',
                                keepMounted: true,
                                open: state.serviceMediaStopDialogShow,
                                onConfirm: () => {
                                    setState({
                                        ...state,
                                        serviceMediaStopDialogShow: false
                                    });
                                    appAPI.stop_service();
                                },
                                onCancel: () => {
                                    setState({
                                        ...state,
                                        serviceMediaStopDialogShow: false
                                    });
                                }
                            }}
                        />
                        <ConfirmationDialog
                            {...{
                                confirming,
                                id: 'start_service',
                                title: '警告',
                                titleIcon: <WarningAmberIcon sx={{ color: 'red' }} />,
                                content:
                                    '开启录屏权限将自动开启服务，允许其他设备向此设备清求建立连接',
                                keepMounted: true,
                                open: state.serviceMediaDialogShow,
                                onConfirm: async () => {
                                    onConfirmInitService();
                                },
                                onCancel: () => {
                                    setState({
                                        ...state,
                                        serviceMediaDialogShow: false
                                    });
                                }
                            }}
                        />
                        <ConfirmationDialog
                            {...{
                                id: 'input_service',
                                title: '如何获取安桌的输入权限',
                                confirmTxt: '打开系统设置',
                                content: (
                                    <>
                                        <Typography sx={{ mb: 1 }}>
                                            为了让远程设备通过鼠标或触屏控制您的安卓设备，你需要允许使用"无障碍"服务。
                                        </Typography>
                                        <Typography>
                                            请在接下来的系统设置页面里，找到并进入【已安装的服务】页面，交服务开启
                                        </Typography>
                                    </>
                                ),
                                keepMounted: true,
                                open: state.serviceInputDialogShow,
                                onConfirm: () => {
                                    appAPI.start_action('android.settings.ACCESSIBILITY_SETTINGS');
                                    setState({
                                        ...state,
                                        serviceInputDialogShow: false
                                    });
                                },
                                onCancel: () => {
                                    setState({
                                        ...state,
                                        serviceInputDialogShow: false
                                    });
                                }
                            }}
                        />
                    </Box>
                </>
            )}

            {tabId === 'setting' && (
                <Box sx={{ maxWidth: 720, pt: 2 }}>
                    <ServerSelectBox onChangeApi={onChangeApi} />
                </Box>
            )}
            <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
                <BottomNavigationView tabId={tabId} setTabId={setTabId} />
            </Box>
        </Box>
    );
}
