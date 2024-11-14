import { Body2 } from '@tonkeeper/uikit/dist/components/Text';
import { FC } from 'react';
import BigNumber from 'bignumber.js';
import { useFormatCoinValue } from '@tonkeeper/uikit/dist/hooks/balance';

export const NumericCryptoCell: FC<{ value: BigNumber; decimals: number; symbol: string }> = ({
    value,
    decimals,
    symbol
}) => {
    const format = useFormatCoinValue();

    const formatted = format(value, decimals);

    return (
        <Body2>
            {formatted}&nbsp;{symbol}
        </Body2>
    );
};
