import { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { IAppProvider } from './IAppProvider';
import { TaskProvider } from './TaskProvider';
import { defaultTheme } from './themes/defaultTheme';
import { TmaPageProvider } from './TmaPageProvider';
import { Web3AppThemeWrpper } from './Web3AppThemeWrpper';

export const Providers = ({ children }: { children: ReactNode }) => {
    return (
        <IAppProvider>
            <ThemeProvider theme={defaultTheme}>
                <Web3AppThemeWrpper>
                    <TaskProvider>
                        <TmaPageProvider>{children}</TmaPageProvider>
                    </TaskProvider>
                </Web3AppThemeWrpper>
            </ThemeProvider>
        </IAppProvider>
    );
};
