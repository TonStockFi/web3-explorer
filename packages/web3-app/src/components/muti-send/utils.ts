import { getDecimalSeparator } from '@tonkeeper/core/dist/utils/formatting';
import { removeGroupSeparator } from '@tonkeeper/core/dist/utils/send';
import { formatter } from '@tonkeeper/uikit/dist/hooks/balance';
import { MultiSendForm } from '@tonkeeper/uikit/dist/state/multiSend';
import BigNumber from 'bignumber.js';

export function getWillBeMultiSendValue(
    rowsValue: MultiSendForm['rows'],
    asset: { decimals: number; symbol: string },
    rate: { prices: number } | undefined
) {
    const bnAmounts = rowsValue.map(item => {
        if (!item.amount?.value) {
            return BigNumber(0);
        }

        const bnInput = new BigNumber(
            removeGroupSeparator(item.amount.value).replace(getDecimalSeparator(), '.')
        );
        let inToken = bnInput;
        if (item.amount.inFiat) {
            inToken = rate?.prices ? new BigNumber(bnInput).div(rate.prices) : new BigNumber(0);
        }

        return new BigNumber(inToken);
    });

    const willBeSentBN = bnAmounts.reduce((acc, item) => {
        return acc.plus(new BigNumber(item));
    }, new BigNumber(0));

    const willBeSent =
        formatter.format(willBeSentBN, {
            decimals: asset.decimals
        }) +
        ' ' +
        asset.symbol;

    return { willBeSent, willBeSentBN, bnAmounts };
}
