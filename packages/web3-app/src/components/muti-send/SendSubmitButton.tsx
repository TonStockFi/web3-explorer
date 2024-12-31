import { Address } from '@ton/core';
import { TON_ASSET } from '@tonkeeper/core/dist/entries/crypto/asset/constants';
import { TonAsset } from '@tonkeeper/core/dist/entries/crypto/asset/ton-asset';
import { MAX_ALLOWED_WALLET_MSGS } from '@tonkeeper/core/dist/service/transfer/multiSendService';
import { shiftedDecimals } from '@tonkeeper/core/dist/utils/balance';
import { Button } from '@tonkeeper/uikit/dist/components/fields/Button';
import { SkeletonText } from '@tonkeeper/uikit/dist/components/shared/Skeleton';
import { Body2 } from '@tonkeeper/uikit/dist/components/Text';
import { formatter } from '@tonkeeper/uikit/dist/hooks/balance';
import { useAsyncValidationState } from '@tonkeeper/uikit/dist/hooks/useAsyncValidator';
import { useAssets } from '@tonkeeper/uikit/dist/state/home';
import { useIsActiveWalletLedger } from '@tonkeeper/uikit/dist/state/ledger';
import { MultiSendForm } from '@tonkeeper/uikit/dist/state/multiSend';
import { useRate } from '@tonkeeper/uikit/dist/state/rates';
import { useActiveStandardTonWallet } from '@tonkeeper/uikit/dist/state/wallet';
import { useTranslation } from '@web3-explorer/lib-translation';
import { View } from '@web3-explorer/uikit-view/dist/View';
import BigNumber from 'bignumber.js';
import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import styled, { useTheme } from 'styled-components';
import { useAccountInfo } from '../../hooks/wallets';
import { usePro } from '../../providers/ProProvider';
import ProService from '../../services/ProService';
import { getWillBeMultiSendValue } from './utils';

const FooterErrorMessage = styled(Body2)`
    color: ${p => p.theme.accentOrange};
    display: block;
    max-width: 350px;
`;

const SendSubmitButton: FC<{
    asset: TonAsset;
    showButton?: boolean;
    rowsValue: MultiSendForm['rows'];
}> = ({ showButton, asset, rowsValue }) => {
    const { t } = useTranslation();

    const { watch } = useFormContext();

    const { data: rate, isFetched: isRateFetched } = useRate(
        typeof asset.address === 'string' ? asset.address : asset.address.toRawString()
    );
    const { willBeSent, willBeSentBN } = getWillBeMultiSendValue(
        rowsValue,
        asset,
        rate || { prices: 0 }
    );

    const [balances] = useAssets();

    let selectedAssetBalance;

    if (asset.id === TON_ASSET.id) {
        selectedAssetBalance = shiftedDecimals(balances?.ton.info.balance || 0, TON_ASSET.decimals);
    } else {
        const jb = balances?.ton.jettons.balances.find(j =>
            Address.parse(j.jetton.address).equals(asset.address as Address)
        );

        selectedAssetBalance = shiftedDecimals(jb?.balance || 0, asset.decimals);
    }

    const remainingBalanceBN = selectedAssetBalance?.minus(willBeSentBN);
    const remainingBalance =
        formatter.format(remainingBalanceBN || new BigNumber(0), {
            decimals: asset.decimals
        }) +
        ' ' +
        asset.symbol;
    const balancesLoading = !balances || !isRateFetched;

    const { formState: formValidationState } = useAsyncValidationState();

    const wallet = useActiveStandardTonWallet();

    const maxMsgsNumberExceeded = watch('rows').length > MAX_ALLOWED_WALLET_MSGS[wallet.version];

    const isLedger = useIsActiveWalletLedger();
    const theme = useTheme();
    const { proInfoList, onShowProBuyDialog } = usePro();
    const { index, id } = useAccountInfo();
    const { isLongProLevel, plan } = ProService.getCurrentPlan(proInfoList, id, index);
    let showProButton = false;
    if (watch('rows').length > 2) {
        if (!isLongProLevel) {
            if (!plan) {
                showProButton = true;
            }
        }
    }
    return (
        <View row aCenter jEnd userSelectNone>
            <View aCenter h100p row mr12 hide={showButton}>
                {isLedger ? (
                    <FooterErrorMessage>{t('ledger_operation_not_supported')}</FooterErrorMessage>
                ) : maxMsgsNumberExceeded ? (
                    <FooterErrorMessage>{t('multi_send_maximum_reached')}</FooterErrorMessage>
                ) : (
                    <View>
                        <View hide={balancesLoading} row>
                            <View
                                textProps={{ fontSize: '0.8rem' }}
                                mr={8}
                                text={`${t('multi_send_will_be_sent')}: ${willBeSent}`}
                            />
                            <View
                                textProps={{ fontSize: '0.8rem' }}
                                hide={!Boolean(remainingBalanceBN?.gt(0))}
                                text={`${t('multi_send_remaining')}: ${remainingBalance}`}
                            />
                            <View
                                textProps={{ fontSize: '0.8rem', color: theme.accentRed }}
                                hide={Boolean(remainingBalanceBN?.gt(0))}
                                text={`${t('multi_send_insufficient_balance')}`}
                            />
                        </View>
                        <View hide={!balancesLoading}>
                            <SkeletonText width="180px" />
                        </View>
                    </View>
                )}
            </View>

            {showButton && (
                <>
                    {showProButton && (
                        <View mr12>
                            <View
                                onClick={() => {
                                    onShowProBuyDialog(true);
                                }}
                                buttonContained
                                button={'升级专业版一次发送超过两个地址的交易'}
                            />
                        </View>
                    )}
                    <Button
                        style={{ width: 120 }}
                        type="submit"
                        primary
                        disabled={
                            showProButton ||
                            remainingBalanceBN?.lt(0) ||
                            maxMsgsNumberExceeded ||
                            isLedger
                        }
                        loading={formValidationState === 'validating'}
                    >
                        {t('continue')}
                    </Button>
                </>
            )}
        </View>
    );
};
export default SendSubmitButton;
