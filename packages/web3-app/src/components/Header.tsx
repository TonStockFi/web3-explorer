import AppBar from '@web3-explorer/uikit-mui/dist/mui/AppBar';
import Box from '@web3-explorer/uikit-mui/dist/mui/Box';
import IconButton from '@web3-explorer/uikit-mui/dist/mui/IconButton';
import Toolbar from '@web3-explorer/uikit-mui/dist/mui/Toolbar';
import Tooltip from '@web3-explorer/uikit-mui/dist/mui/Tooltip';
import Typography from '@web3-explorer/uikit-mui/dist/mui/Typography';
import { View } from '@web3-explorer/uikit-view';
import * as React from 'react';

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
                                                        buttonColor={buttonColor}
                                                        buttonSize="small"
                                                        buttonStartIcon={icon || undefined}
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
