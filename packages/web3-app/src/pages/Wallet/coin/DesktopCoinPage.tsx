import { BLOCKCHAIN_NAME, CryptoCurrency } from '@tonkeeper/core/dist/entries/crypto';
import { tonAssetAddressFromString } from '@tonkeeper/core/dist/entries/crypto/asset/ton-asset';
import { eqAddresses } from '@tonkeeper/core/dist/utils/address';
import { shiftedDecimals } from '@tonkeeper/core/dist/utils/balance';
import { ArrowDownIcon, ArrowUpIcon } from '@tonkeeper/uikit/dist/components/Icon';
import { Body2, Label2, Num3 } from '@tonkeeper/uikit/dist/components/Text';
import { DesktopViewPageLayout } from '@tonkeeper/uikit/dist/components/desktop/DesktopViewLayout';
import { OtherHistoryFilters } from '@tonkeeper/uikit/dist/components/desktop/history/DesktopHistoryFilters';
import { Button } from '@tonkeeper/uikit/dist/components/fields/Button';
import { BuyNotification } from '@tonkeeper/uikit/dist/components/home/BuyAction';
import { useAppContext } from '@tonkeeper/uikit/dist/hooks/appContext';
import { useAppSdk } from '@tonkeeper/uikit/dist/hooks/appSdk';
import { formatFiatCurrency, useFormatCoinValue } from '@tonkeeper/uikit/dist/hooks/balance';
import { useDisclosure } from '@tonkeeper/uikit/dist/hooks/useDisclosure';
import { useFetchNext } from '@tonkeeper/uikit/dist/hooks/useFetchNext';
import { AppRoute } from '@tonkeeper/uikit/dist/libs/routes';
import { useFetchFilteredActivity } from '@tonkeeper/uikit/dist/state/activity';
import { useAssets } from '@tonkeeper/uikit/dist/state/home';
import { getMixedActivity } from '@tonkeeper/uikit/dist/state/mixedActivity';
import { toTokenRate, useRate } from '@tonkeeper/uikit/dist/state/rates';
import { useAllSwapAssets } from '@tonkeeper/uikit/dist/state/swap/useSwapAssets';
import { useSwapFromAsset } from '@tonkeeper/uikit/dist/state/swap/useSwapForm';
import { useTonendpointBuyMethods } from '@tonkeeper/uikit/dist/state/tonendpoint';
import { useIsActiveWalletWatchOnly } from '@tonkeeper/uikit/dist/state/wallet';
import { View } from '@web3-explorer/uikit-view';
import BigNumber from 'bignumber.js';
import { FC, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { DesktopHistory } from '../../../components/history/DesktopHistory';
import { W3C_JETTON_CONTRACT } from '../../../constant';

const CoinHeaderStyled = styled.div`
    padding: 0 1rem;
    border-bottom: 1px solid ${p => p.theme.separatorCommon};
`;

const HeaderButtonsContainer = styled.div`
    padding-bottom: 1rem;
    display: flex;
    gap: 0.5rem;
`;

const ButtonStyled = styled(Button)`
    display: flex;
    gap: 6px;

    > svg {
        color: ${p => p.theme.buttonTertiaryForeground};
    }
`;

const CoinHeader: FC<{ token: string }> = ({ token }) => {
    const { t } = useTranslation();
    const { isOpen, onClose, onOpen } = useDisclosure();
    const isReadOnly = useIsActiveWalletWatchOnly();
    const { data: buy } = useTonendpointBuyMethods();
    const canBuy = token === CryptoCurrency.TON;
    const { data: swapAssets } = useAllSwapAssets();

    const currentAssetAddress = tonAssetAddressFromString(token);
    const swapAsset = isReadOnly
        ? undefined
        : swapAssets?.find(a => eqAddresses(a.address, currentAssetAddress));

    const [_, setSwapFromAsset] = useSwapFromAsset();
    const navigate = useNavigate();

    const onSwap = () => {
        setSwapFromAsset(swapAsset!);
        navigate(AppRoute.swap);
    };

    const sdk = useAppSdk();
    return (
        <CoinHeaderStyled>
            <CoinInfo token={token} />
            <HeaderButtonsContainer>
                {!isReadOnly && (
                    <ButtonStyled
                        size="small"
                        onClick={() =>
                            sdk.uiEvents.emit('transfer', {
                                method: 'transfer',
                                id: Date.now(),
                                params: { asset: token, chain: BLOCKCHAIN_NAME.TON }
                            })
                        }
                    >
                        <ArrowUpIcon />
                        {t('wallet_send')}
                    </ButtonStyled>
                )}
                <ButtonStyled
                    size="small"
                    onClick={() => {
                        sdk.uiEvents.emit('receive', {
                            method: 'receive',
                            params:
                                token === CryptoCurrency.TON
                                    ? {}
                                    : {
                                          chain: BLOCKCHAIN_NAME.TON,
                                          jetton: token
                                      }
                        });
                    }}
                >
                    <ArrowDownIcon />
                    {t('wallet_receive')}
                </ButtonStyled>
                {/* {swapAsset && (
                    <ButtonStyled size="small" onClick={onSwap}>
                        <SwapIcon />
                        {t('wallet_swap')}
                    </ButtonStyled>
                )} */}
                {/* {canBuy && (
                    <ButtonStyled size="small" onClick={onOpen}>
                        <PlusIcon />
                        {t('wallet_buy')}
                    </ButtonStyled>
                )} */}
            </HeaderButtonsContainer>
            <BuyNotification buy={buy} open={isOpen} handleClose={onClose} />
        </CoinHeaderStyled>
    );
};

const CoinInfoWrapper = styled.div`
    padding: 1rem 0;
    display: flex;

    gap: 1rem;

    > img {
        width: 56px;
        height: 56px;
        border-radius: 50%;
    }
`;

const CoinInfoAmounts = styled.div`
    > * {
        display: block;
    }

    > ${Body2} {
        color: ${p => p.theme.textSecondary};
    }
`;

const CoinInfo: FC<{ token: string }> = ({ token }) => {
    const [assets] = useAssets();
    const format = useFormatCoinValue();
    const { data: rate } = useRate(token);
    const { fiat } = useAppContext();

    const asset: { symbol: string; image: string; amount: string; fiatAmount: string } | undefined =
        useMemo(() => {
            if (!assets) {
                return undefined;
            }

            if (token === CryptoCurrency.TON) {
                const amount = assets.ton.info.balance;
                return {
                    image: 'https://wallet.tonkeeper.com/img/toncoin.svg',
                    symbol: 'TON',
                    amount: format(amount),
                    fiatAmount: formatFiatCurrency(
                        fiat,
                        rate ? new BigNumber(rate.prices).multipliedBy(shiftedDecimals(amount)) : 0
                    )
                };
            }

            const jettonBalance = assets.ton.jettons.balances.find(b =>
                eqAddresses(b.jetton.address, token)
            );

            if (!jettonBalance) {
                return undefined;
            }

            const amount = jettonBalance.balance;
            // console.log(jettonBalance);
            let fiatAmount =
                jettonBalance.jetton.symbol === 'W3C'
                    ? '$' + format(String(Number(amount) / 10), jettonBalance.jetton.decimals)
                    : formatFiatCurrency(
                          fiat,
                          jettonBalance.price
                              ? shiftedDecimals(
                                    jettonBalance.balance,
                                    jettonBalance.jetton.decimals
                                ).multipliedBy(toTokenRate(jettonBalance.price, fiat).prices)
                              : 0
                      );
            return {
                image: jettonBalance.jetton.image,
                symbol: jettonBalance.jetton.symbol,
                amount: format(amount, jettonBalance.jetton.decimals),
                fiatAmount
            };
        }, [assets, format, rate, fiat]);

    if (!asset) {
        return <></>;
    }

    return (
        <CoinInfoWrapper>
            <img src={asset.image} alt={asset.symbol} />
            <CoinInfoAmounts>
                <Num3>
                    {asset.amount}&nbsp;{asset.symbol}
                </Num3>
                <Body2>{asset.fiatAmount}</Body2>
            </CoinInfoAmounts>
        </CoinInfoWrapper>
    );
};

const HistorySubheader = styled(Label2)`
    display: block;
    padding: 0.5rem 1rem;
    margin-top: 0.5rem;
`;

const HistoryContainer = styled.div`
    overflow-x: auto;
    overflow-y: hidden;
`;

export const CoinPage: FC<{ justHistory?: boolean; token: string; onClose?: () => void }> = ({
    justHistory,
    token
}) => {
    const { t } = useTranslation();
    const ref = useRef<HTMLDivElement>(null);
    const { fetchNextPage, hasNextPage, isFetchingNextPage, data } =
        useFetchFilteredActivity(token);

    useFetchNext(hasNextPage, isFetchingNextPage, fetchNextPage, true, ref);

    const activity = useMemo(() => {
        const isW3CToken = token === W3C_JETTON_CONTRACT;
        const rows = getMixedActivity(data, undefined);

        return rows.map(row => {
            if (isW3CToken) {
                //@ts-ignore
                return {
                    ...row,
                    event: {
                        ...row.event,
                        event: {
                            ...row.event.event,
                            isScam: false
                        }
                    }
                } as any;
            }
            return row;
        });
    }, [data, token]);

    const [assets] = useAssets();
    const assetSymbol = useMemo(() => {
        if (!assets) {
            return undefined;
        }
        if (token === CryptoCurrency.TON) {
            return t('Toncoin');
        }

        return assets.ton.jettons.balances.find(b => eqAddresses(b.jetton.address, token))?.jetton
            .symbol;
    }, [assets, t, token]);

    if (justHistory) {
        return (
            <DesktopViewPageLayout ref={ref}>
                <View empty hide={!activity || activity.length === 0}>
                    <View w100p row jSpaceBetween>
                        <View row jStart>
                            <HistorySubheader>{t('page_header_history')}</HistorySubheader>
                        </View>
                        <View wh={36} center>
                            <OtherHistoryFilters
                                disableInitiatorFilter={token !== CryptoCurrency.TON}
                            />
                        </View>
                    </View>
                    <HistoryContainer>
                        <DesktopHistory
                            isFetchingNextPage={isFetchingNextPage}
                            activity={activity}
                        />
                    </HistoryContainer>
                </View>
            </DesktopViewPageLayout>
        );
    }
    return (
        <View w100p ref={ref}>
            <View hide={!assetSymbol} w100p>
                <CoinHeader token={token} />
            </View>
            <View empty hide={!activity || activity.length === 0}>
                <View w100p row jSpaceBetween>
                    <View row jStart>
                        <HistorySubheader>{t('page_header_history')}</HistorySubheader>
                    </View>
                    <View wh={36} center>
                        <OtherHistoryFilters
                            disableInitiatorFilter={token !== CryptoCurrency.TON}
                        />
                    </View>
                </View>
                <HistoryContainer>
                    <DesktopHistory isFetchingNextPage={isFetchingNextPage} activity={activity} />
                </HistoryContainer>
            </View>
        </View>
    );
};
