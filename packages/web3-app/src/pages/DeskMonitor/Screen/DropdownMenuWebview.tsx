import * as React from 'react';
import Menu from '@web3-explorer/uikit-mui/dist/mui/Menu';
import MenuItem from '@web3-explorer/uikit-mui/dist/mui/MenuItem';
import Fade from '@web3-explorer/uikit-mui/dist/mui/Fade';
import IconButton from '@web3-explorer/uikit-mui/dist/mui/IconButton';
import ListItemIcon from '@web3-explorer/uikit-mui/dist/mui/ListItemIcon';
import { useTranslation } from "@tonkeeper/uikit/dist/hooks/translation";
import { View } from '@web3-explorer/uikit-view';
import { DeviceOptions } from '../types';
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
    const {t} = useTranslation()
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
                  {t("reload")}
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
                  {t("devTools")}
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
                      {t("delete")}
                    </MenuItem>
                </View>
            </Menu>
        </View>
    );
}
