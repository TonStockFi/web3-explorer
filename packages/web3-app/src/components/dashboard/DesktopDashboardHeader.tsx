import { fallbackRenderOver } from '@tonkeeper/uikit/dist/components/Error';
import { useAllWalletsTotalBalance } from '@tonkeeper/uikit/dist/state/asset';
import { useTranslation } from '@web3-explorer/lib-translation';
import { ErrorBoundary } from 'react-error-boundary';

import { View } from '@web3-explorer/uikit-view';
import { useTheme } from 'styled-components';
import { HeaderHeight } from '../../constant';
import { DesktopHeaderBalance } from './DesktopHeaderElements';

const DesktopDashboardHeaderPayload = () => {
    const { data: balance, isLoading } = useAllWalletsTotalBalance();
    const { t } = useTranslation();
    const theme = useTheme();
    return (
        <View
            borderBox
            h={HeaderHeight}
            jSpaceBetween
            aCenter
            w100p
            px={12}
            borderBottomColor={theme.separatorCommon}
        >
            <DesktopHeaderBalance isLoading={isLoading} balance={balance} />
        </View>
    );
};

export const DesktopDashboardHeader = () => {
    return (
        <ErrorBoundary fallbackRender={fallbackRenderOver('Failed to display desktop header')}>
            <DesktopDashboardHeaderPayload />
        </ErrorBoundary>
    );
};
