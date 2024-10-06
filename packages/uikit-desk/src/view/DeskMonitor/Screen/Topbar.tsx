import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { DeviceOptions } from '../types';
import Tooltip from '@mui/material/Tooltip';
import { View } from '@web3-explorer/uikit-view';
import TopbarWebview from './TopbarWebview';
import DropdownMenu from './DropdownMenu';

export default function Topbar({ deviceOptions }: { deviceOptions: DeviceOptions }) {
    if (deviceOptions.isWebview) {
        return <TopbarWebview deviceOptions={deviceOptions} />;
    }
    const { isCutEnable, isInfoPanel, setIsInfoPanel,setIsCutEnable,setIsSettingPanel,isSettingPanel, isAdding } = deviceOptions;
    const name = deviceOptions.getDeviceInfo('name', '未命名');

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" color={'success'}>
                <Toolbar variant="dense">
                    <View
                        pl12
                        w100p
                        row
                        sx={{
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <View empty hide={isAdding}>
                            <Typography variant="h6" color="inherit" component="div">
                                {isCutEnable ? '截取屏幕区域' : name}
                            </Typography>
                        </View>

                        <View empty hide={!isAdding}>
                            <Typography variant="h6" color="inherit" component="div">
                                添加远程新设备
                            </Typography>
                        </View>

                        <View row sx={{ justifyContent: 'flex-end' }}>
                            <View sx={{ mr: 0.5 }}>
                                <DropdownMenu deviceOptions={deviceOptions} />
                            </View>
                            <View
                                hide={!(isInfoPanel || isCutEnable || isSettingPanel)}
                                sx={{ mx: 0.5 }}
                            >
                                <Tooltip placement={'bottom'} title={'关闭'}>
                                    <IconButton
                                        onClick={() => {
                                            setIsInfoPanel && setIsInfoPanel(false);
                                            setIsSettingPanel && setIsSettingPanel(false);
                                            setIsCutEnable(false);
                                        }}
                                        edge="start"
                                        color="inherit"
                                        aria-label="menu"
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </Tooltip>
                            </View>
                        </View>
                    </View>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
