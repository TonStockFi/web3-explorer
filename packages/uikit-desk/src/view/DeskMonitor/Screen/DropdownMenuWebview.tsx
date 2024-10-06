import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import { View } from '@web3-explorer/uikit-view';
import { DeviceOptions } from '../types';
import ListItemIcon from '@mui/material/ListItemIcon';
import RefreshIcon from '@mui/icons-material/Refresh';
import HealingIcon from '@mui/icons-material/Healing';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

export const slotProps = {
    paper: {
        elevation: 0,
        sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0
            }
        }
    }
};
export default function DropdownMenu({
    canGoForward,
    deviceOptions
}: {
    canGoForward: boolean;
    deviceOptions: DeviceOptions;
}) {
    const {
        tgUserId,
        webview,
        canDelete,
        deleteTgSite,
        canCut,
        setGlobalUpdatedAt
    } = deviceOptions;
    const [deleteConfirm, setDeleteConfirm] = React.useState(false);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <View>
            <View
                confirm={{
                    id: 'delete_confirm',
                    content: '确认删除？',
                    open: deleteConfirm,
                    onConfirm: async () => {
                        if (deleteTgSite && tgUserId) {
                            deleteTgSite(tgUserId);
                        }
                        // if (deleteSite) {
                        //     deleteSite(deviceId);
                        // }
                        setGlobalUpdatedAt && setGlobalUpdatedAt(+new Date);
                        setDeleteConfirm(false);
                    },
                    onCancel: () => setDeleteConfirm(false)
                }}
            />
            <IconButton
                onClick={handleClick}
                edge="start"
                color="inherit"
                aria-label="menu"
                aria-controls={open ? 'fade-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
            >
                <MoreHorizIcon />
            </IconButton>
            <Menu
                slotProps={slotProps}
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
                {Boolean(canGoForward) && (
                    <MenuItem
                        onClick={() => {
                            webview.goForward();
                            handleClose();
                        }}
                    >
                        <ListItemIcon>
                            <ArrowForwardIcon />
                        </ListItemIcon>
                        前进
                    </MenuItem>
                )}
                <MenuItem
                    onClick={() => {
                        webview.reload();
                        handleClose();
                    }}
                >
                    <ListItemIcon>
                        <RefreshIcon />
                    </ListItemIcon>
                    刷新
                </MenuItem>
                <View hide={!canCut} empty>
                    <MenuItem
                        onClick={async () => {
                            deviceOptions.setIsCutEnable(true);
                            deviceOptions?.setIsInfoPanel && deviceOptions?.setIsInfoPanel(false);
                            deviceOptions?.setIsSettingPanel &&
                                deviceOptions?.setIsSettingPanel(false);
                            setAnchorEl(null);
                        }}
                    >
                        <ListItemIcon>
                            <HighlightAltIcon />
                        </ListItemIcon>
                        屏幕截取
                    </MenuItem>
                </View>

                <MenuItem
                    onClick={() => {
                        webview.openDevTools();
                        handleClose();
                    }}
                >
                    <ListItemIcon>
                        <HealingIcon />
                    </ListItemIcon>
                    开发面板
                </MenuItem>
                <View empty hide={!canDelete}>
                    <MenuItem
                        onClick={async () => {
                            setDeleteConfirm(true);
                            setAnchorEl(null);
                        }}
                    >
                        <ListItemIcon>
                            <DeleteIcon color={'error'} />
                        </ListItemIcon>
                        删除
                    </MenuItem>
                </View>
            </Menu>
        </View>
    );
}
