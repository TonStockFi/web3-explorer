import { createTheme, Theme,ThemeProvider } from '@mui/material/styles';

import React, { createContext, useContext, ReactNode } from 'react';

const AppContext = createContext<Theme | undefined>(undefined);

export const DarkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: 'rgb(16, 22, 31)',
            paper: 'rgb(16,24,40)'
        }
    }
});

export const _Provider = ({theme,children}:{ theme?:Theme, children: ReactNode }) => {
    if(!theme){
        theme = DarkTheme
    }
    return (
        <AppContext.Provider value={theme}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppTheme = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an Provider');
    }
    return context;
};

export const IThemeProvider = ({ theme,children }: {theme?:Theme, children: React.ReactNode }) => {
    return (
        <_Provider theme={theme}>
            <ThemeProvider theme={theme||DarkTheme}>
                {children}
            </ThemeProvider>
        </_Provider>
    );
};

