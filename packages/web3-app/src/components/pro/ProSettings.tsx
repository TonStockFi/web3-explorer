import { Network, switchNetwork } from '@tonkeeper/core/dist/entries/network';
import { formatDecimals } from '@tonkeeper/core/dist/utils/balance';
import { ColumnText } from '@tonkeeper/uikit/dist/components/Layout';
import { ListBlock, ListItem, ListItemPayload } from '@tonkeeper/uikit/dist/components/List';
import { Body1, Title } from '@tonkeeper/uikit/dist/components/Text';
import { Button } from '@tonkeeper/uikit/dist/components/fields/Button';
import { Radio } from '@tonkeeper/uikit/dist/components/fields/Checkbox';
import { Input } from '@tonkeeper/uikit/dist/components/fields/Input';
import { useSendTransferNotification } from '@tonkeeper/uikit/dist/components/modals/useSendTransferNotification';
import { useFormatCoinValue } from '@tonkeeper/uikit/dist/hooks/balance';
import { useTranslation } from '@tonkeeper/uikit/dist/hooks/translation';
import { useMutateDevSettings } from '@tonkeeper/uikit/dist/state/dev';
import { useAssets } from '@tonkeeper/uikit/dist/state/home';
import { useActiveTonNetwork } from '@tonkeeper/uikit/dist/state/wallet';
import { View } from '@web3-explorer/uikit-view';
import { FC, useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { genId, getAccountIdFromAccount, getTelegramChatUrl } from '../../common/helpers';
import { currentTs, formatNumberWithComma } from '../../common/utils';
import { SWAP_ChatId, W3C_JETTON_CONTRACT } from '../../constant';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { usePro } from '../../providers/ProProvider';
import PayCommentOrderService from '../../services/PayCommentOrderService';
import ProService from '../../services/ProService';
import { ProInfoProps, ProPlan } from '../../types';

const Block = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
`;

const Line = styled.div`
    margin-bottom: 32px;
`;

const Icon = styled.img`
    width: 144px;
    height: 144px;
    margin-bottom: 16px;
`;

const Description = styled(Body1)`
    width: 480px;
    color: ${props => props.theme.textSecondary};
    margin-bottom: 16px;
`;

const RadioStyled = styled(Radio)`
    &:before {
        border-color: ${props => props.theme.separatorCommon};
    }
`;
const SelectProPlans: FC<{
    plans: ProPlan[];
    isLongProLevel: boolean;
    currentProInfo: ProInfoProps | null;

    selected: ProPlan;
    setPlan: (plan: ProPlan) => void;
    disabled?: boolean;
}> = ({ plans, isLongProLevel, currentProInfo, selected, setPlan, disabled }) => {
    if (isLongProLevel) {
        disabled = true;
    }
    return (
        <>
            <ListBlock>
                {plans.map(plan => (
                    <ListItem
                        key={plan.level}
                        onClick={() => {
                            if (!disabled && currentProInfo?.level !== plan.level) {
                                setPlan(plan);
                            }
                        }}
                    >
                        <ListItemPayload>
                            <ColumnText
                                noWrap
                                text={plan.name}
                                secondary={<>{formatNumberWithComma(Number(plan.amount))} W3C</>}
                            />
                            {currentProInfo?.level === plan.level && (
                                <View
                                    pr12
                                    textBold
                                    textFontSize="0.8rem"
                                    textColor={'green'}
                                    text={'当前'}
                                />
                            )}

                            {currentProInfo?.level !== plan.level && (
                                <RadioStyled
                                    disabled={disabled}
                                    checked={selected.level === plan.level}
                                    onChange={() => setPlan(plan)}
                                />
                            )}
                        </ListItemPayload>
                    </ListItem>
                ))}
            </ListBlock>
        </>
    );
};

export const ProSettings: FC<{
    accountId: string;
    accountIndex: number;
    accountTitle: string;
    walletTitle: string;
}> = ({ accountId, accountIndex, accountTitle, walletTitle }) => {
    const { t } = useTranslation();
    const { openTabFromWebview } = useBrowserContext();
    const { env } = useIAppContext();
    const network = useActiveTonNetwork();
    const { mutate: mutateDevSettings } = useMutateDevSettings();
    const theme = useTheme();
    useEffect(() => {
        if (network === Network.TESTNET && !env.isDev) {
            mutateDevSettings({ tonNetwork: switchNetwork(network) });
        }
    }, [network]);

    const { proPlans, onCheckPayCommentOrder, proInfoList, proRecvAddress } = usePro();
    let plans: ProPlan[] = proPlans.map(proPlan => {
        let { description } = proPlan;
        description = description?.replace('{accountTitle}', accountTitle);
        description = description?.replace('{walletTitle}', walletTitle);
        return { ...proPlan, description };
    });
    const currentPlan = ProService.getCurrentPlan(proInfoList, accountId, accountIndex);
    const isLongProLevel = currentPlan.isLongProLevel;
    const currentProInfo = currentPlan.plan;
    // console.log({ proInfoList, proPlans, currentPlan });

    if (currentPlan && currentPlan.isLongProLevel) {
        plans = plans.filter(row => row.level === 'LONG');
    }
    const [assets] = useAssets();
    // console.log({ assets });
    let gasIsEnough = false;
    let w3cIsEnough = false;
    const [selectedPlan, setPlan] = useState<ProPlan>(plans[0]);

    if (assets) {
        if (assets.ton && assets.ton.info.balance > 100000000) {
            gasIsEnough = true;
        }
        if (assets.ton && assets.ton.jettons.balances.find(row => row.jetton.symbol === 'W3C')) {
            const w3c = assets.ton.jettons.balances.find(row => row.jetton.symbol === 'W3C')!;
            const { amount } = selectedPlan;

            if (formatDecimals(w3c.balance, w3c.jetton.decimals) >= Number(amount)) {
                w3cIsEnough = true;
            }
        }
    }
    // console.log({ w3cIsEnough, gasIsEnough });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [_, setOrderComment] = useState<string>('');

    const { onOpen: sendTransfer } = useSendTransferNotification();
    const format = useFormatCoinValue();
    useEffect(() => {
        function finishPay(e: any) {
            onCheckPayCommentOrder(true);
            setOrderComment(text => {
                const amount = text.split('/')[0];
                const id = genId();
                new PayCommentOrderService().save(genId(), {
                    id,
                    symbol: 'W3C',
                    checkProLevel: true,
                    amount: amount,
                    address: proRecvAddress,
                    ts: currentTs(),
                    comment: text
                });
                return '';
            });
        }
        window.addEventListener('finishPay', finishPay);
        return () => {
            window.removeEventListener('finishPay', finishPay);
        };
    }, []);
    const [promo, setPromo] = useState('');
    const onSubmit = async () => {
        if (!selectedPlan) {
            return;
        }
        const { level, amount } = selectedPlan;
        const amount1 = String(format(String(Number(amount) * 1000000000)));
        const id = getAccountIdFromAccount({ id: accountId, index: accountIndex });
        const text = `${amount1}/${level}/${Math.floor(currentTs() / 1000)}/${promo || '-'}/${id}`;
        setOrderComment(text);
        setIsLoading(true);
        sendTransfer({
            transfer: {
                address: proRecvAddress,
                amount: amount1,
                text,
                jetton: W3C_JETTON_CONTRACT
            },
            asset: 'W3C'
        });
    };
    useEffect(() => {
        function onCloseNotify() {
            setIsLoading(false);
        }

        function updatePayPlan() {
            setIsLoading(false);
            setPlan(plans[0]);
        }

        window.addEventListener('updatePayPlan', updatePayPlan);
        window.addEventListener('onCloseNotify', onCloseNotify);
        return () => {
            window.removeEventListener('updatePayPlan', updatePayPlan);
            window.removeEventListener('onCloseNotify', onCloseNotify);
        };
    }, []);

    return (
        <View px={24} py12 relative userSelectNone>
            <View>
                <Block>
                    <Icon
                        style={{ marginBottom: 1, paddingBottom: 0, width: 100, height: 100 }}
                        src="https://explorer.web3r.site/logo-128x128.png"
                    />
                    <Title style={{ marginTop: 0, paddingTop: 0 }}>{t('Web3 Explorer')}</Title>
                    <Description>{selectedPlan.description}</Description>
                </Block>
                <SelectProPlans
                    isLongProLevel={isLongProLevel}
                    currentProInfo={currentProInfo}
                    plans={plans ?? []}
                    setPlan={setPlan}
                    selected={selectedPlan}
                    disabled={isLongProLevel ? true : isLoading}
                />
                <Line>
                    <Input
                        disabled={isLoading}
                        value={promo}
                        onChange={setPromo}
                        label={t('推荐码')}
                        clearButton
                    />
                </Line>
                <View
                    mb={20}
                    pl12
                    mt={-16}
                    textColor={theme.textSecondary}
                    textFontSize="0.8rem"
                    text={'如果推荐码有效，您和推荐人会分别获得 0.5% W3C 空投'}
                ></View>
                {!isLongProLevel && (
                    <Line>
                        <Button
                            primary={!isLoading}
                            size="large"
                            fullWidth
                            disabled={!(gasIsEnough && w3cIsEnough)}
                            loading={isLoading}
                            onClick={onSubmit}
                        >
                            {gasIsEnough && w3cIsEnough ? (
                                <View>{currentProInfo ? t('升级') : t('wallet_buy')}</View>
                            ) : (
                                <View>{t('Ton Gas费 或者 W3C 余额不足')}</View>
                            )}
                        </Button>
                    </Line>
                )}

                <View center mb={6} hide={gasIsEnough && w3cIsEnough}>
                    <View
                        onClick={() => {
                            openTabFromWebview({
                                icon: '',
                                name: 'W3C 兑换中心',
                                description: '',
                                url: getTelegramChatUrl(SWAP_ChatId),
                                mobile: true
                            });
                        }}
                        buttonOutlined={'兑换 Ton Gas费 或者 W3C'}
                    ></View>
                </View>
            </View>
        </View>
    );
};
