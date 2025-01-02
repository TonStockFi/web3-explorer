import { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { IAppProvider } from './IAppProvider';
import { defaultTheme } from './themes/defaultTheme';
import { TmaPageProvider } from './TmaPageProvider';
import { Web3AppThemeWrpper } from './Web3AppThemeWrpper';

export const Providers = ({ children }: { children: ReactNode }) => {
    return (
        <IAppProvider>
            <ThemeProvider theme={defaultTheme}>
                <Web3AppThemeWrpper>
                    <TmaPageProvider>{children}</TmaPageProvider>
                </Web3AppThemeWrpper>
            </ThemeProvider>
        </IAppProvider>
    );
};
