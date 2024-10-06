import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import BugReportIcon from "@mui/icons-material/BugReport";
import DevicesIcon from "@mui/icons-material/Devices";
import LanguageIcon from "@mui/icons-material/Language";
import SettingsIcon from "@mui/icons-material/Settings";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { useTheme } from "@mui/material/styles";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import { View } from "@web3-explorer/uikit-view";
import * as React from "react";
import { useEffect } from "react";
import { AppOptions, MAIN_NAV_TYPE } from "../types";

declare const IS_DEV: string;

export default function VerticalToggleButtons({ options }: AppOptions) {
    const theme = useTheme();
    const [view, setView] = React.useState<MAIN_NAV_TYPE | 'LOGIN' | 'MENU'>(
        MAIN_NAV_TYPE.WALLET
    );

    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        nextView: MAIN_NAV_TYPE
    ) => {
        setView(nextView);
    };
    useEffect(() => {
        setView(options.mainNavType!);
    }, [options.mainNavType]);
    const items = [
        {
            tips: '钱包',
            value: MAIN_NAV_TYPE.WALLET,
            icon: <AccountBalanceWalletIcon />,
            onClick: () => {
                options?.setMainNavType(MAIN_NAV_TYPE.WALLET);
                setView(MAIN_NAV_TYPE.WALLET);
            }
        },
        {
            tips: '远程设备',
            value: MAIN_NAV_TYPE.MOBILE_MONITORS,
            icon: <DevicesIcon />,
            onClick: () => {
                options?.setMainNavType(MAIN_NAV_TYPE.MOBILE_MONITORS);
                setView(MAIN_NAV_TYPE.MOBILE_MONITORS);
            }
        },
        {
            tips: '发现',
            value: MAIN_NAV_TYPE.DISCOVERY,
            icon: <LanguageIcon />,
            onClick: () => {
                options?.setMainNavType(MAIN_NAV_TYPE.DISCOVERY);
                setView(MAIN_NAV_TYPE.DISCOVERY);
            }
        },
        {
            tips: '玩赚',
            value: MAIN_NAV_TYPE.GAME_FI,
            icon: <SportsEsportsIcon />,
            onClick: () => {
                options?.setMainNavType(MAIN_NAV_TYPE.GAME_FI);
                setView(MAIN_NAV_TYPE.GAME_FI);
            }
        },
        {
            bottom: true,
            hide: !IS_DEV,
            tips: 'Dev',
            value: MAIN_NAV_TYPE.DEV,
            icon: <BugReportIcon />,
            onClick: () => {
                options?.setMainNavType(MAIN_NAV_TYPE.DEV);
                setView(MAIN_NAV_TYPE.DEV);
            }
        },
        {
            bottom: true,
            hide: !IS_DEV,
            tips: 'Setting',
            value: MAIN_NAV_TYPE.SETTING,
            icon: <SettingsIcon />,
            onClick: () => {
                options?.setMainNavType(MAIN_NAV_TYPE.SETTING);
                setView(MAIN_NAV_TYPE.SETTING);
            }
        }
    ];

    return (
        <View
            absolute
            sx={{
                borderRight: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.default
            }}
            x={0}
            y={0}
            w={'63px'}
            h100p
        >
            <View column aCenter jStart w100p h100p>
                <ToggleButtonGroup
                    sx={{ width: '100%', height: '100%', justifyContent: 'space-between' }}
                    orientation="vertical"
                    value={view}
                    exclusive
                    onChange={handleChange}
                >
                    <View w100p>
                        {items
                            .filter(row => !row.bottom)
                            .map(({ onClick, value, tips, icon }: any) => {
                                return (
                                    <Tooltip key={value} placement={'right'} title={tips}>
                                        <ToggleButton
                                            disableRipple={true}
                                            sx={{
                                                width: '100%',
                                                py: 2,
                                                borderRadius: 0,
                                                border: 'none'
                                            }}
                                            onClick={
                                                onClick
                                                    ? onClick
                                                    : () => {
                                                        setView(value);
                                                    }
                                            }
                                            value={value}
                                            aria-label={value}
                                        >
                                            {icon}
                                        </ToggleButton>
                                    </Tooltip>
                                );
                            })}
                        s
                    </View>
                    <View w100p>
                        {items
                            .filter(row => row.bottom)
                            .map(({ onClick, value, tips, icon }: any) => {
                                return (
                                    <Tooltip key={value} placement={'right'} title={tips}>
                                        <ToggleButton
                                            disableRipple={true}
                                            sx={{
                                                width: '100%',
                                                py: 2,
                                                borderRadius: 0,
                                                border: 'none'
                                            }}
                                            onClick={
                                                onClick
                                                    ? onClick
                                                    : () => {
                                                        setView(value);
                                                    }
                                            }
                                            value={value}
                                            aria-label={value}
                                        >
                                            {icon}
                                        </ToggleButton>
                                    </Tooltip>
                                );
                            })}
                    </View>
                </ToggleButtonGroup>
            </View>
        </View>
    );
}
