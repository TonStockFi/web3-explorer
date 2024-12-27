import { formatDecimals } from '@tonkeeper/core/dist/utils/balance';
import { Skeleton } from '@tonkeeper/uikit/dist/components/shared/Skeleton';
import { Num2 } from '@tonkeeper/uikit/dist/components/Text';
import { formatFiatCurrency } from '@tonkeeper/uikit/dist/hooks/balance';
import { useUserFiat } from '@tonkeeper/uikit/dist/state/fiat';
import { useAssets } from '@tonkeeper/uikit/dist/state/home';
import BigNumber from 'bignumber.js';
import { FC } from 'react';
import styled from 'styled-components';
import { formatNumberWithComma } from '../../common/utils';

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
    const [assets] = useAssets();

    let amount = formatFiatCurrency(fiat, balance || 0);
    if (assets && assets.ton.jettons.balances.length > 0) {
        const w3c = assets.ton.jettons.balances.find(row => row.jetton.symbol === 'W3C');
        if (w3c) {
            const w3cBalance = formatDecimals(w3c.balance, w3c.jetton.decimals) / 10;
            const amount1 = Number(String(amount).substring(1).replace(/,/g, ''));
            amount = '$' + formatNumberWithComma(Math.round((amount1 + w3cBalance) * 100) / 100);
        }
    }
    return (
        <>
            {isLoading ? (
                <Skeleton width="100px" height="36px" />
            ) : (
                <BalanceContainer>
                    <Num2>{amount}</Num2>
                </BalanceContainer>
            )}
        </>
    );
};
