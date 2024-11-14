import Fade from '@web3-explorer/uikit-mui/dist/mui/Fade';
import IconButton from '@web3-explorer/uikit-mui/dist/mui/IconButton';
import ListItemIcon from '@web3-explorer/uikit-mui/dist/mui/ListItemIcon';
import Menu from '@web3-explorer/uikit-mui/dist/mui/Menu';
import { View } from '@web3-explorer/uikit-view';
import * as React from 'react';
import { useTheme } from 'styled-components';

import { IconList } from '@web3-explorer/uikit-mui/dist/mui/Icons';

export interface DropDownIconButtonItem {
    text: string;
    icon: IconList;
    onClick: (id: string) => void;
}
export default function DropDownIconButton({
    items,
    small,
    id,
    icon
}: {
    small?: boolean;
    id: string;
    items: DropDownIconButtonItem[];
    icon?: IconList;
}) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const open = Boolean(anchorEl);
    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(e.currentTarget);
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
    const handleClose = () => {
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
                {items.map((item: DropDownIconButtonItem, index: number) => {
                    return (
                        <View
                            pr={24}
                            key={index}
                            menuItem
                            onClick={e => {
                                item.onClick(id);
                                setAnchorEl(null);
                                e.preventDefault();
                                e.stopPropagation();
                                return false;
                            }}
                        >
                            <ListItemIcon>
                                <View icon={item.icon} iconSmall />
                            </ListItemIcon>
                            <View
                                text={item.text}
                                textColor={theme.textPrimary}
                                textFontSize="0.9rem"
                            />
                        </View>
                    );
                })}
            </Menu>
        </View>
    );
}
