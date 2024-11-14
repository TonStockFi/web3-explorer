import { fallbackRenderOver } from '@tonkeeper/uikit/dist/components/Error';
import { View } from '@web3-explorer/uikit-view';
import { FC } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTheme } from 'styled-components';
import { AccountWalletsList } from './AccountWalletsList';

interface AsideMenuProps {
    hideClose?: boolean;
    asideWidth?: number;
}

export const AsideMenu: FC<AsideMenuProps> = ({ asideWidth, hideClose }) => {
    const theme = useTheme();
    return (
        <ErrorBoundary fallbackRender={fallbackRenderOver('Failed to load aside menu')}>
            <View
                borderBox
                userSelectNone
                h100p
                column
                w={asideWidth ? asideWidth : 250}
                sx={{
                    background: `${theme.backgroundContent}`,
                    borderRight: `1px solid ${theme.separatorCommon}`
                }}
            >
                <AccountWalletsList />
            </View>
        </ErrorBoundary>
    );
};
