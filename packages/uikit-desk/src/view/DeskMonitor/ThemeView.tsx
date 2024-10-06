import { createTheme, ThemeProvider } from '@mui/material';
import { View } from '@web3-explorer/uikit-view';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: 'rgb(16, 22, 31)',
            paper: 'rgb(16,24,40)'
        }
    }
});

function ThemeViewInner({ children }: { children: React.ReactNode }) {
    const theme = useTheme();
    return (
        <View h100vh w100vw overflowHidden relative bgColor={theme.palette.background.default}>
            {children}
        </View>
    );
}

const ThemeView = ({ children }: { children: React.ReactNode }) => {
    return (
        <ThemeProvider theme={darkTheme}>
            <ThemeViewInner>{children}</ThemeViewInner>
        </ThemeProvider>
    );
};

export default ThemeView;
