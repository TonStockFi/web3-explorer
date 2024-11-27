import { IThemeProvider } from '@web3-explorer/uikit-mui';
import { createTheme } from '@web3-explorer/uikit-mui/dist/mui/styles';
import { ReactNode } from 'react';
import { useTheme } from 'styled-components';
import { hexToRGBA } from '../common/utils';

export const Web3AppThemeWrpper = ({ children }: { children: ReactNode }) => {
    const theme = useTheme();
    const DarkTheme = createTheme({
        palette: {
            mode: 'dark',
            background: {
                default: theme.backgroundPage,
                paper: theme.backgroundContent
            },
            text: {
                primary: theme.textPrimary
            }
        },
        components: {
            MuiAlert: {
                styleOverrides: {
                    root: {
                        backgroundColor: hexToRGBA(theme.backgroundPage, 0.1),
                        letterSpacing: '1px'
                    }
                }
            },
            MuiSvgIcon: {
                styleOverrides: {
                    root: {
                        color: theme.textPrimary
                    }
                }
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        backgroundColor: theme.backgroundPage,
                        color: theme.textPrimary
                    }
                }
            },
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        '&.MuiButtonBase-root': {
                            paddingTop: 0,
                            paddingBottom: 0,
                            minHeight: '30px!important'
                        }
                    }
                }
            },

            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        '&.Mui-selected': {
                            backgroundColor: theme.backgroundContentTint,
                            '&:hover': {
                                backgroundColor: theme.backgroundContentTint
                            }
                        }
                    }
                }
            },
            MuiTypography: {
                styleOverrides: {
                    h1: {
                        color: theme.textPrimary
                    },
                    h2: {
                        color: theme.textPrimary
                    },
                    body1: {
                        color: theme.textPrimary,
                        paddingTop: '2px'
                    }
                }
            },
            MuiButtonBase: {
                styleOverrides: {
                    root: {
                        lineHeight: 'normal!important',
                        '& .MuiButtonBase-root': {
                            transition: 'background-color 0.15s ease-in-out'
                        },
                        '& .MuiButtonBase-root:hover': {
                            backgroundColor: theme.backgroundHighlighted
                        }
                    }
                }
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'unset'
                    },
                    outlined: {
                        color: theme.textPrimary
                    },
                    contained: {
                        backgroundColor: '#45AEF5',
                        color: theme.textPrimary
                    },
                    text: {
                        paddingLeft: 12,
                        paddingRight: 12,
                        color: theme.textPrimary
                    }
                }
            }
        }
    });
    return <IThemeProvider theme={DarkTheme}>{children}</IThemeProvider>;
};
