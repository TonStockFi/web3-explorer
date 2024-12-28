import { Network } from '@tonkeeper/core/dist/entries/network';
import { DevSettings } from '@tonkeeper/uikit/dist/pages/settings/Dev';
import { Localization } from '@tonkeeper/uikit/dist/pages/settings/Localization';
import { useActiveTonNetwork } from '@tonkeeper/uikit/dist/state/wallet';
import Fade from '@web3-explorer/uikit-mui/dist/mui/Fade';
import IconButton from '@web3-explorer/uikit-mui/dist/mui/IconButton';
import ListItemIcon from '@web3-explorer/uikit-mui/dist/mui/ListItemIcon';
import Menu from '@web3-explorer/uikit-mui/dist/mui/Menu';
import { View } from '@web3-explorer/uikit-view';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { MAIN_NAV_TYPE } from '../../types';

export default function SideSettings() {
    const { t } = useTranslation();
    const theme = useTheme();
    const { openTab } = useBrowserContext();
    const { env } = useIAppContext();
    const [showDialog, setShowDialog] = React.useState(false);
    const network = useActiveTonNetwork();

    const [dialogType, setDialogType] = React.useState<
        'Localization' | 'DevSettings' | 'FiatCurrency'
    >('Localization');
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const isLeft = false;
    const slotProps = isLeft
        ? {
              paper: {
                  elevation: 0,
                  sx: {
                      bgcolor: theme.backgroundContentAttention,
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      ml: -6.8,
                      mt: 1,
                      '&::before': {
                          bottom: 0,
                          right: -5,
                          width: 10,
                          height: 10,
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          bgcolor: theme.backgroundContentAttention,
                          transform: 'translateY(-150%) rotate(45deg)',
                          zIndex: 0
                      }
                  }
              }
          }
        : {
              paper: {
                  elevation: 0,
                  sx: {
                      bgcolor: theme.backgroundContentAttention,
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      ml: 5,
                      mt: 1,
                      '&::before': {
                          bottom: 0,
                          left: -5.5,
                          width: 10,
                          height: 10,
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          bgcolor: theme.backgroundContentAttention,
                          transform: 'translateY(-150%) rotate(45deg)',
                          zIndex: 0
                      }
                  }
              }
          };

    return (
        <View empty>
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
                <View icon="Settings" iconSmall />
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
                {/* <View
                    menuItem
                    sx={{ width: 300 }}
                    onClick={async () => {
                        openTab(MAIN_NAV_TYPE.BROWSER_HISTORY);
                        setAnchorEl(null);
                    }}
                >
                    <ListItemIcon>
                        <View icon="History" iconSmall />
                    </ListItemIcon>
                    <View text={t('BrowserHistory')} textFontSize="0.9rem" />
                </View> */}

                <View
                    menuItem
                    onClick={async () => {
                        openTab(MAIN_NAV_TYPE.CONNECTED_APPS);
                        setAnchorEl(null);
                    }}
                >
                    <ListItemIcon>
                        <View icon="Link" iconSmall />
                    </ListItemIcon>
                    <View text={t('apps_connect')} textFontSize="0.9rem" />
                </View>
                <View divider />
                <View
                    hide={!env.isDev}
                    menuItem
                    onClick={async () => {
                        openTab(MAIN_NAV_TYPE.MOBILE_MONITORS);
                        setAnchorEl(null);
                    }}
                >
                    <ListItemIcon>
                        <View icon="Devices" iconSmall />
                    </ListItemIcon>
                    <View text={t('MobileDevice')} textFontSize="0.9rem" />
                </View>
                <View hide={!env.isDev} divider />
                <View
                    menuItem
                    onClick={async () => {
                        setShowDialog(true);

                        setDialogType('FiatCurrency');
                        setAnchorEl(null);
                    }}
                >
                    <ListItemIcon>
                        <View icon="AccountBalance" iconSmall />
                    </ListItemIcon>
                    <View text={t('settings_primary_currency')} textFontSize="0.9rem" />
                </View>
                <View
                    menuItem
                    onClick={async () => {
                        setAnchorEl(null);
                        setDialogType('Localization');
                        setShowDialog(true);
                    }}
                >
                    <ListItemIcon>
                        <View icon="Language" iconSmall />
                    </ListItemIcon>
                    <View text={t('Localization')} textFontSize="0.9rem" />
                </View>

                <View divider hide />

                <View
                    hide
                    menuItem
                    onClick={async () => {
                        openTab(MAIN_NAV_TYPE.MULTI_SEND);
                        setAnchorEl(null);
                    }}
                >
                    <ListItemIcon>
                        <View icon="ShareTwoTone" iconSmall />
                    </ListItemIcon>
                    <View text={t('wallet_multi_send')} textFontSize="0.9rem" />
                </View>
                {/* <View
                    hide={!env.isDev}
                    menuItem
                    onClick={async () => {
                        openTab(MAIN_NAV_TYPE.DASHBOARD);
                        setAnchorEl(null);
                    }}
                >
                    <ListItemIcon>
                        <View icon="FormatListBulleted" iconSmall />
                    </ListItemIcon>
                    <View text={t('aside_dashboard')} textFontSize="0.9rem" />
                </View> */}
                <View
                    menuItem
                    hide
                    onClick={async () => {
                        openTab(MAIN_NAV_TYPE.ACCOUNTS_MANAGE);
                        setAnchorEl(null);
                    }}
                >
                    <ListItemIcon>
                        <View icon="Style" iconSmall />
                    </ListItemIcon>
                    <View text={t('AccountsManage')} textFontSize="0.9rem" />
                </View>

                <View divider hide={!env.isDev} />
                <View
                    menuItem
                    onClick={async () => {
                        setAnchorEl(null);
                        setDialogType('DevSettings');
                        setShowDialog(true);
                    }}
                >
                    <ListItemIcon>
                        <View icon="Code" iconSmall />
                    </ListItemIcon>

                    <View
                        text={network !== Network.TESTNET ? '切换到 测试网' : '切换到 主网'}
                        textFontSize="0.9rem"
                    />
                </View>

                <View hide={!env.isDev} divider />

                <View
                    hide={!env.isDev}
                    menuItem
                    onClick={async () => {
                        openTab(MAIN_NAV_TYPE.DEV);
                        setAnchorEl(null);
                    }}
                >
                    <ListItemIcon>
                        <View icon="BugReport" iconSmall />
                    </ListItemIcon>
                    <View text={'DEV'} textFontSize="0.9rem" />
                </View>
            </Menu>
            <View
                dialog={{
                    dialogProps: {
                        open: showDialog,

                        sx: {
                            '& .MuiDialog-paper': {
                                position: 'relative',
                                borderRadius: 3,
                                bgColo: theme.backgroundPage,
                                width: 440,
                                height: 680,
                                overflow: 'hidden'
                            }
                        }
                    },
                    content: (
                        <View userSelectNone wh100p bgColor={theme.backgroundPage}>
                            <View
                                zIdx={1}
                                right={0}
                                top={0}
                                abs
                                bgColor={theme.backgroundPage}
                                w100p
                                h={44}
                                jEnd
                                aCenter
                            >
                                <View
                                    mr12
                                    iconButton
                                    icon="Close"
                                    iconSmall
                                    iconButtonSmall
                                    onClick={() => setShowDialog(false)}
                                />
                            </View>
                            <View wh100p mt={44} pt={12} borderBox>
                                <View
                                    overflowYAuto
                                    miniScrollBar
                                    wh100p
                                    column
                                    aCenter
                                    sx={{
                                        '& > #body': { width: '95%' }
                                    }}
                                >
                                    <View empty hide={dialogType !== 'Localization'}>
                                        <Localization />
                                    </View>
                                    {/* <View empty hide={dialogType !== 'FiatCurrency'}>
                                        <FiatCurrency />
                                    </View> */}
                                    <View empty hide={dialogType !== 'DevSettings'}>
                                        <DevSettings />
                                    </View>
                                </View>
                            </View>
                        </View>
                    )
                }}
            />
        </View>
    );
}
