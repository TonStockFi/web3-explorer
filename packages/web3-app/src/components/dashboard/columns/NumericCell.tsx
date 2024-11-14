import { Body2 } from '@tonkeeper/uikit/dist/components/Text';
import { FC } from 'react';
import { formatter } from '@tonkeeper/uikit/dist/hooks/balance';

export const NumericCell: FC<{ value: string; decimalPlaces?: number }> = ({
    value,
    decimalPlaces
}) => {
    const formatted = formatter.format(value, {
        ignoreZeroTruncate: false,
        decimals: decimalPlaces
    });
    return <Body2>{formatted}</Body2>;
};
