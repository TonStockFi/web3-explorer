import * as React from 'react';
import AppBar from '@web3-explorer/uikit-mui/dist/mui/AppBar';
import Box from '@web3-explorer/uikit-mui/dist/mui/Box';
import Toolbar from '@web3-explorer/uikit-mui/dist/mui/Toolbar';
import Typography from '@web3-explorer/uikit-mui/dist/mui/Typography';
import IconButton from '@web3-explorer/uikit-mui/dist/mui/IconButton';
import Tooltip from '@web3-explorer/uikit-mui/dist/mui/Tooltip';
import { useTranslation } from "@tonkeeper/uikit/dist/hooks/translation";
import CloseIcon from '@mui/icons-material/Close';
import { DeviceOptions } from '../types';
import { View } from '@web3-explorer/uikit-view';
import TopbarWebview from './TopbarWebview';
import DropdownMenu from './DropdownMenu';

export default function Topbar({ deviceOptions }: { deviceOptions: DeviceOptions }) {
    const {t} = useTranslation()

    if (deviceOptions.isWebview) {
        return <TopbarWebview deviceOptions={deviceOptions} />;
    }
    const { index,isCutEnable, isInfoPanel, setIsInfoPanel,setIsCutEnable,setIsSettingPanel,isSettingPanel, isAdding } = deviceOptions;
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
                                {`#${index! + 1} ${t("MobileDevice")}`}
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
