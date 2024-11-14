import { Skeleton } from '@tonkeeper/uikit/dist/components/shared/Skeleton';
import { Num2 } from '@tonkeeper/uikit/dist/components/Text';
import { formatFiatCurrency } from '@tonkeeper/uikit/dist/hooks/balance';
import { useUserFiat } from '@tonkeeper/uikit/dist/state/fiat';
import BigNumber from 'bignumber.js';
import { FC } from 'react';
import styled from 'styled-components';

export const DesktopHeaderContainer = styled.div`
    padding-left: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid ${p => p.theme.backgroundContentAttention};
    background: ${p => p.theme.backgroundPage};

    * {
        user-select: none;
    }
`;

const BalanceContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

export const DesktopHeaderBalance: FC<{ isLoading: boolean; balance: BigNumber | undefined }> = ({
    isLoading,
    balance
}) => {
    const fiat = useUserFiat();

    return (
        <>
            {isLoading ? (
                <Skeleton width="100px" height="36px" />
            ) : (
                <BalanceContainer>
                    <Num2>{formatFiatCurrency(fiat, balance || 0)}</Num2>
                </BalanceContainer>
            )}
        </>
    );
};
