import Avatar from '@web3-explorer/uikit-mui/dist/mui/Avatar';
import Box from '@web3-explorer/uikit-mui/dist/mui/Box';
import Button from '@web3-explorer/uikit-mui/dist/mui/Button';
import Card from '@web3-explorer/uikit-mui/dist/mui/Card';
import CardContent from '@web3-explorer/uikit-mui/dist/mui/CardContent';
import Chip from '@web3-explorer/uikit-mui/dist/mui/Chip';
import type { DividerProps } from '@web3-explorer/uikit-mui/dist/mui/Divider';
import Divider from '@web3-explorer/uikit-mui/dist/mui/Divider';
import Drawer from '@web3-explorer/uikit-mui/dist/mui/Drawer';
import type { IconButtonProps } from '@web3-explorer/uikit-mui/dist/mui/IconButton';
import IconButton from '@web3-explorer/uikit-mui/dist/mui/IconButton';
import { getIcon } from '@web3-explorer/uikit-mui/dist/mui/Icons';
import ListItem from '@web3-explorer/uikit-mui/dist/mui/ListItem';
import ListItemButton from '@web3-explorer/uikit-mui/dist/mui/ListItemButton';
import ListItemIcon from '@web3-explorer/uikit-mui/dist/mui/ListItemIcon';
import ListItemText from '@web3-explorer/uikit-mui/dist/mui/ListItemText';
import MenuItem from '@web3-explorer/uikit-mui/dist/mui/MenuItem';
import Skeleton from '@web3-explorer/uikit-mui/dist/mui/Skeleton';
import Snackbar from '@web3-explorer/uikit-mui/dist/mui/Snackbar';

import Loading from '@web3-explorer/uikit-mui/dist/components/Loading';
import Tooltip from '@web3-explorer/uikit-mui/dist/mui/Tooltip';
import Typography from '@web3-explorer/uikit-mui/dist/mui/Typography';
import React from 'react';
import ConfirmationDialog from '../components/ConfirmationDialog';
import DialogView from '../components/DialogView';
import Prompt from '../components/Prompt';
import { DebugView } from './DebugView';
import { ViewProps } from './types';
import { handleProps } from './utils';

declare const IS_DEV: string;

//@ts-ignore
export const View = React.forwardRef<HTMLElement, ViewProps>((props, ref) => {
    const {
        loading,
        card,
        cardProps,
        list,
        listItemRight,
        listSelected,
        listItemText,
        listItemIcon,
        menuItem,
        menuItemProps,
        skeletonProps,
        skeletonText,
        skeletonCircular,
        skeletonRectangular,
        skeletonRounded,
        divider,
        dividerProps,
        chip,
        chipProps,
        chipSize,
        chipColor,
        chipVariant,
        avatar,
        drawer,
        tipsPlacement,
        tips,
        text,
        textColor,
        textVariant,
        textFontSize,
        textBold,
        textProps,
        textEllipsis,
        icon,
        iconSmall,
        iconColor,
        iconProps,
        iconFontSize,
        _D,
        _D0,
        json,
        empty,
        dialog,
        confirm,
        prompt,
        snackbar,
        hide,
        button,
        buttonContained,
        buttonSize,
        buttonColor,
        buttonVariant,
        buttonEndIcon,
        buttonStartIcon,
        buttonProps,
        iconButton,
        iconButtonColor,
        iconButtonSmall,
        iconButtonProps,
        ...props_
    } = props;
    if (hide) return null;

    if (_D !== undefined && _D0 === undefined) {
        if (IS_DEV) {
            return (
                <>
                    <Box {...handleProps(props_)} />
                    <DebugView value={_D} />
                </>
            );
        }
        console.debug('_D', _D);
    }
    if (loading) {
        return (
            <Box {...handleProps(props_)}>
                <Loading />
            </Box>
        );
    }
    if (drawer) {
        return (
            <Drawer {...drawer}>
                <Box {...handleProps(props_)} />
            </Drawer>
        );
    }

    if (button) {
        const { onClick, ...p1 } = handleProps(props_);
        let buttonVariant1 = buttonVariant;
        if (buttonContained) {
            buttonVariant1 = 'contained';
        }
        const p2 = {
            onClick,
            variant: buttonVariant1 || 'text',
            size: buttonSize || 'small',
            color: buttonColor,
            startIcon: buttonStartIcon,
            endIcon: buttonEndIcon,
            ...p1,
            ...buttonProps
        };
        //@ts-ignore
        return <Button {...p2}>{button}</Button>;
    }

    if (iconButton || iconButtonSmall) {
        const { children, onClick, ...p1 } = handleProps(props_);
        const iconButtonProps1: IconButtonProps =
            iconButtonProps || (iconButton as IconButtonProps);
        const p2 = { onClick, size: iconButtonSmall ? 'small' : undefined, ...iconButtonProps1 };
        const node1 = icon
            ? getIcon(icon, iconProps, iconButtonSmall || iconSmall, iconColor, iconFontSize)
            : children;
        if (!p2.sx) {
            p2.sx = {};
        }
        if (iconButtonColor) {
            //@ts-ignore
            p2.sx.color = iconButtonColor;
        }

        //@ts-ignore
        const node = <IconButton {...p2}>{node1}</IconButton>;
        if (tips) {
            return (
                <Tooltip placement={tipsPlacement || 'bottom'} title={tips}>
                    <Box {...p1}>{node}</Box>
                </Tooltip>
            );
        }
        return <Box {...p1}>{node}</Box>;
    }
    if (icon) {
        if (tips) {
            return (
                <Tooltip placement={tipsPlacement || 'bottom'} title={tips}>
                    <>{getIcon(icon, iconProps, iconSmall, iconColor, iconFontSize)}</>
                </Tooltip>
            );
        }
        return getIcon(icon, iconProps, iconSmall, iconColor, iconFontSize);
    }

    if (text) {
        const p = handleProps(props_);
        const { children, ...p1 } = p;
        const { sx, ...p2 } = textProps || { sx: {} };
        return (
            <Box {...p1}>
                <Typography
                    sx={{
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        ...{
                            ...sx,
                            ...(textEllipsis
                                ? {
                                      overflow: 'hidden',
                                      whiteSpace: 'pre-wrap',
                                      textOverflow: 'ellipsis'
                                  }
                                : {})
                        }
                    }}
                    fontSize={textFontSize}
                    fontWeight={textBold ? 700 : undefined}
                    color={textColor || 'inherit'}
                    variant={textVariant}
                    component="div"
                    {...p2}
                >
                    {children || text}
                </Typography>
            </Box>
        );
    }

    if (snackbar) {
        const { message, open, onClose, ...p1 } = snackbar;
        return (
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                autoHideDuration={3000}
                onClose={onClose}
                message={message}
                open={open}
                {...p1}
            />
        );
    }

    if (tips) {
        return (
            <Tooltip placement={tipsPlacement || 'bottom'} title={tips}>
                <Box {...handleProps(props_)} />
            </Tooltip>
        );
    }

    if (avatar) {
        return (
            <Box {...handleProps(props_)}>
                <Avatar {...avatar} />
            </Box>
        );
    }
    if (menuItem) {
        const p = handleProps(props_);

        // @ts-ignore
        return <MenuItem {...p} {...menuItemProps}></MenuItem>;
    }
    if (listItemText) {
        const { children, onClick, ...p1 } = handleProps(props_);
        const p2 = { disablePadding: true, ...p1 };

        const node = (
            <ListItemButton onClick={onClick} selected={listSelected}>
                {listItemIcon && <ListItemIcon sx={{ minWidth: 36 }}>{listItemIcon}</ListItemIcon>}
                <ListItemText primary={listItemText} />
                {listItemRight && listItemRight}
            </ListItemButton>
        );

        // @ts-ignore
        return <ListItem {...p2}>{node}</ListItem>;
    }
    if (card) {
        const { children, ...p1 } = handleProps(props_);
        const p2 = { ...p1, ...cardProps };
        const node = <CardContent>{children}</CardContent>;
        // @ts-ignore
        return <Card {...p2}>{node}</Card>;
    }

    if (skeletonText || skeletonCircular || skeletonRectangular || skeletonRounded) {
        const p = handleProps(props_);
        const skeletonProps1: any = {};

        if (skeletonText) {
            skeletonProps1.variant = 'text';
        }

        if (skeletonCircular) {
            skeletonProps1.variant = 'circular';
        }

        if (skeletonRectangular) {
            skeletonProps1.variant = 'rectangular';
        }

        if (skeletonRounded) {
            skeletonProps1.variant = 'rounded';
        }
        // @ts-ignore
        return <Skeleton {...p} {...{ ...skeletonProps, ...skeletonProps1 }} />;
    }
    if (divider) {
        const p = handleProps(props_);
        if (!p.width) {
            p.width = '100%';
        }
        // @ts-ignore
        return <Divider {...p} {...(divider as DividerProps)} {...dividerProps} />;
    }
    if (chip) {
        return (
            <Box {...handleProps(props_)}>
                <Chip
                    variant={chipVariant || 'outlined'}
                    color={chipColor || 'warning'}
                    size={chipSize || 'small'}
                    {...chipProps}
                    label={chip}
                />
            </Box>
        );
    }
    if (dialog) {
        return <DialogView {...dialog} />;
    }
    if (prompt) {
        return <Prompt {...prompt} />;
    }

    if (confirm) {
        return <ConfirmationDialog {...confirm} />;
    }

    if (json !== undefined) {
        return (
            <Box {...handleProps(props_)}>
                <Typography
                    component="pre"
                    sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                >
                    {JSON.stringify(json, null, 2)}
                </Typography>
            </Box>
        );
    }
    if (empty) {
        return <>{props.children}</>;
    }
    // @ts-ignore
    return <Box {...handleProps(props_)} ref={ref} />;
});

View.displayName = 'View';