import {
    AccountBalanceWalletIcon,BugReportIcon,DevicesIcon,LanguageIcon,SettingsIcon,SportsEsportsIcon
} from "@web3-explorer/uikit-mui/dist/mui/Icons"
import ToggleButton from '@web3-explorer/uikit-mui/dist/mui/ToggleButton';
import ToggleButtonGroup from '@web3-explorer/uikit-mui/dist/mui/ToggleButtonGroup';
import { useColorScheme } from '@web3-explorer/uikit-mui/dist/mui/styles';
import Tooltip from '@web3-explorer/uikit-mui/dist/mui/Tooltip';
import { View } from '@web3-explorer/uikit-view';
import * as React from 'react';
import { useEffect } from 'react';
import { AppOptions, MAIN_NAV_TYPE } from '../types';
import {useTranslation} from "@tonkeeper/uikit/dist/hooks/translation"
export default function VerticalToggleButtons({ IS_DEV, options }: AppOptions) {
    const {t} = useTranslation();
    const [view, setView] = React.useState<MAIN_NAV_TYPE | 'LOGIN' | 'MENU'>(MAIN_NAV_TYPE.WALLET);
    const handleChange = (event: React.MouseEvent<HTMLElement>, nextView: MAIN_NAV_TYPE) => {
        nextView && setView(nextView);
    };
    useEffect(() => {
        setView(options.mainNavType!);
    }, [options.mainNavType]);

    const items = [
        {
            tips: t("wallet_title"),
            value: MAIN_NAV_TYPE.WALLET,
            icon: <AccountBalanceWalletIcon />,
            onClick: () => {
                options?.setMainNavType(MAIN_NAV_TYPE.WALLET);
                setView(MAIN_NAV_TYPE.WALLET);
            }
        },
        {
            tips: t('apps_connect'),
            value: MAIN_NAV_TYPE.MOBILE_MONITORS,
            icon: <DevicesIcon />,
            onClick: () => {
                options?.setMainNavType(MAIN_NAV_TYPE.MOBILE_MONITORS);
                setView(MAIN_NAV_TYPE.MOBILE_MONITORS);
            }
        },
        {
            tips: t('aside_discover'),
            value: MAIN_NAV_TYPE.DISCOVERY,
            icon: <LanguageIcon />,
            onClick: () => {
                options?.setMainNavType(MAIN_NAV_TYPE.DISCOVERY);
                setView(MAIN_NAV_TYPE.DISCOVERY);
            }
        },
        {
            tips: t('game_fi'),
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
            tips: t('aside_settings'),
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
            x={0}
            y={0}
            w={'64px'}
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
                                                border: 'none',

                                                '&.Mui-selected': {
                                                    bgcolor: '#1D2633',
                                                },
                                                '&.Mui-selected:hover': {
                                                    bgcolor: '#1D2633',
                                                },
                                            }}
                                            onClick={onClick}
                                            value={value}
                                            aria-label={value}
                                        >
                                            {icon}
                                        </ToggleButton>
                                    </Tooltip>
                                );
                            })}
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
                                                border: 'none',
                                                '&.Mui-selected': {
                                                    bgcolor: '#1D2633',
                                                    color:"white"
                                                },
                                                '&.Mui-selected:hover': {
                                                    bgcolor: '#1D2633',
                                                },
                                                color:"white"
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
