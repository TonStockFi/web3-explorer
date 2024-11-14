import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import GridViewIcon from '@mui/icons-material/GridView';
import PhonelinkEraseIcon from '@mui/icons-material/PhonelinkErase';
import Divider from '@web3-explorer/uikit-mui/dist/mui/Divider';
import Fade from '@web3-explorer/uikit-mui/dist/mui/Fade';
import IconButton from '@web3-explorer/uikit-mui/dist/mui/IconButton';
import ListItemIcon from '@web3-explorer/uikit-mui/dist/mui/ListItemIcon';
import Menu from '@web3-explorer/uikit-mui/dist/mui/Menu';
import MenuItem from '@web3-explorer/uikit-mui/dist/mui/MenuItem';
import { View } from '@web3-explorer/uikit-view';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { wsSendClientEventAction, wsSendMessage } from '../../../common/ws';
import { useDevice } from '../../../providers/DevicesProvider';
import DeviceService from '../../../services/DeviceService';
import { GLOBAL_ACTIONS, WsCloseCode } from '../../../types';
import { Devices } from '../global';

export default function DeviceScreenDropdownMenu({
    ws,
    deviceId
}: {
    ws: WebSocket;
    deviceId: string;
}) {
    const { t } = useTranslation();

    const [disconnectConfirm, setDisconnectConfirm] = React.useState(false);
    const [deleteConfirm, setDeleteConfirm] = React.useState(false);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const { getDeviceInfo, updateGlobalDevice } = useDevice();
    const inputIsOpen = getDeviceInfo(deviceId, 'inputIsOpen', false);

    return (
        <View>
            <IconButton
                size={'small'}
                onClick={handleClick}
                edge="start"
                color="inherit"
                aria-label="menu"
                aria-controls={open ? 'fade-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
            >
                <View icon="MoreHoriz" iconSmall />
            </IconButton>
            <Menu
                // slotProps={slotProps}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                id="fade-menu"
                MenuListProps={{
                    'aria-labelledby': 'fade-button'
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                TransitionComponent={Fade}
            >
                <View empty hide={!inputIsOpen}>
                    <MenuItem
                        onClick={async () => {
                            wsSendClientEventAction(GLOBAL_ACTIONS.GLOBAL_ACTION_BACK, ws);
                            setAnchorEl(null);
                        }}
                    >
                        <ListItemIcon>
                            <ArrowCircleLeftIcon />
                        </ListItemIcon>
                        {t('back')}
                    </MenuItem>
                </View>
                <View empty hide={!inputIsOpen}>
                    <MenuItem
                        onClick={async () => {
                            wsSendClientEventAction(GLOBAL_ACTIONS.GLOBAL_ACTION_HOME, ws);
                            setAnchorEl(null);
                        }}
                    >
                        <ListItemIcon>
                            <View icon={'Home'}></View>
                        </ListItemIcon>
                        {t('home')}
                    </MenuItem>
                </View>
                <View empty hide={!inputIsOpen}>
                    <MenuItem
                        onClick={async () => {
                            wsSendClientEventAction(GLOBAL_ACTIONS.GLOBAL_ACTION_RECENTS, ws);
                            setAnchorEl(null);
                        }}
                    >
                        <ListItemIcon>
                            <GridViewIcon />
                            <View icon="GridView"></View>
                        </ListItemIcon>
                        {t('Recent')}
                    </MenuItem>
                    <Divider />
                </View>

                <MenuItem
                    onClick={() => {
                        setDisconnectConfirm(true);
                        setAnchorEl(null);
                    }}
                >
                    <ListItemIcon>
                        <PhonelinkEraseIcon />
                    </ListItemIcon>
                    {t('disconnect')}
                </MenuItem>
                <MenuItem
                    onClick={async () => {
                        setDeleteConfirm(true);
                        setAnchorEl(null);
                    }}
                >
                    <ListItemIcon>
                        <View iconProps={{ color: 'error' }} icon="Delete"></View>
                    </ListItemIcon>
                    {t('delete')}
                </MenuItem>
            </Menu>

            <View
                confirm={{
                    cancelTxt: t('cancel'),
                    confirmTxt: t('ok'),
                    id: 'disconnect_confirm',
                    content: t('ConfirmDisconnection'),
                    open: disconnectConfirm,
                    onConfirm: async () => {
                        localStorage.setItem('disconnect_' + deviceId, '1');
                        wsSendMessage(
                            {
                                action: 'close',
                                payload: {
                                    code: WsCloseCode.WS_CLOSE_STOP_RECONNECT,
                                    reason: 'WS_CLOSE_STOP_RECONNECT'
                                }
                            },
                            ws
                        );
                        setDisconnectConfirm(false);
                    },
                    onCancel: () => setDisconnectConfirm(false)
                }}
            />
            <View
                confirm={{
                    cancelTxt: t('cancel'),
                    confirmTxt: t('ok'),
                    id: 'delete_confirm',
                    content: t('ConfirmDelete'),
                    open: deleteConfirm,
                    onConfirm: async () => {
                        wsSendMessage(
                            {
                                action: 'close',
                                payload: {
                                    code: WsCloseCode.WS_CLOSE_STOP_RECONNECT,
                                    reason: 'WS_CLOSE_STOP_RECONNECT'
                                }
                            },
                            ws
                        );

                        Devices.delete(deviceId);
                        await new DeviceService(deviceId).remove();
                        updateGlobalDevice();
                        setDeleteConfirm(false);
                    },
                    onCancel: () => setDeleteConfirm(false)
                }}
            />
        </View>
    );
}
