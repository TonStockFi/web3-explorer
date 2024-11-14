import Fade from '@web3-explorer/uikit-mui/dist/mui/Fade';
import IconButton from '@web3-explorer/uikit-mui/dist/mui/IconButton';
import Menu from '@web3-explorer/uikit-mui/dist/mui/Menu';
import { View } from '@web3-explorer/uikit-view';
import * as React from 'react';
import { useTheme } from 'styled-components';

import { IconList } from '@web3-explorer/uikit-mui/dist/mui/Icons';
import { VoidFun } from '../types';

export interface DropdownBoxProps {
    children: React.ReactNode;
    small?: boolean;
    icon?: IconList;
    onClick?: () => VoidFun;
    onClose?: () => VoidFun;
}

export default function DropdownBox({ onClose, onClick, icon, children, small }: DropdownBoxProps) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const open = Boolean(anchorEl);
    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        onClick && onClick();
        setAnchorEl(e.currentTarget);
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
    const handleClose = () => {
        onClose && onClose();
        setAnchorEl(null);
    };

    const slotProps = {
        paper: {
            elevation: 0,
            sx: {
                bgcolor: theme.backgroundContentAttention,
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
                    bgcolor: theme.backgroundContentAttention,
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0
                }
            }
        }
    };

    return (
        <View empty>
            <IconButton
                sx={{ width: 26, height: 26 }}
                size={small ? 'small' : undefined}
                onClick={handleClick}
                edge="start"
                color="inherit"
                aria-label="menu"
                aria-controls={open ? 'fade-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
            >
                <View iconSmall={small ? true : undefined} icon={icon || 'MoreVert'} />
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
                id="top-menu"
                MenuListProps={{
                    'aria-labelledby': 'fade-button'
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                TransitionComponent={Fade}
            >
                <View>{children}</View>
            </Menu>
        </View>
    );
}
