import { Body2 } from '@tonkeeper/uikit/dist/components/Text';
import { FC } from 'react';
import BigNumber from 'bignumber.js';
import { formatFiatCurrency } from '@tonkeeper/uikit/dist/hooks/balance';
import { FiatCurrencies } from '@tonkeeper/core/dist/entries/fiat';

export const NumericFiatCell: FC<{ value: BigNumber; fiat: FiatCurrencies }> = ({
    value,
    fiat
}) => {
    const formatted = formatFiatCurrency(fiat, value);

    return <Body2>{formatted}</Body2>;
};
