import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { View } from '@web3-explorer/uikit-view';

export interface HeaderActions {
    icon?: any;
    title: string;
    onClick: any;
    iconButton?: boolean;
    hide?: boolean;
    buttonColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

export default function Header({
    title,
    rightNode,
    actions
}: {
    rightNode?: React.ReactNode;
    title: string;
    actions: HeaderActions[];
}) {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" color={'primary'}>
                <Toolbar variant="dense">
                    <View
                        pl12
                        pr12
                        w100p
                        row
                        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        <Typography variant="h6" color="inherit" component="div">
                            {title}
                        </Typography>
                        <View row jEnd aCenter>
                            {rightNode}
                            {actions
                                .filter(action => !action.hide)
                                .map(
                                    (
                                        {
                                            title,
                                            iconButton,
                                            buttonColor,
                                            icon,
                                            onClick
                                        }: HeaderActions,
                                        index: number
                                    ) => {
                                        return (
                                            <View key={index} ml12>
                                                {iconButton ? (
                                                    <Tooltip placement={'bottom'} title={title}>
                                                        <IconButton
                                                            onClick={onClick}
                                                            edge="start"
                                                            color="inherit"
                                                            aria-label={title}
                                                        >
                                                            {icon}
                                                        </IconButton>
                                                    </Tooltip>
                                                ) : (
                                                    <View
                                                        onClick={onClick}
                                                        buttonProps={{
                                                            color: buttonColor,
                                                            size: 'small',
                                                            startIcon: icon || undefined
                                                        }}
                                                        button={title}
                                                    />
                                                )}
                                            </View>
                                        );
                                    }
                                )}
                        </View>
                    </View>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
