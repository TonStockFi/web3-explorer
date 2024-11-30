import { ColumnText } from '@tonkeeper/uikit/dist/components/Layout';
import { ListBlock, ListItem, ListItemPayload } from '@tonkeeper/uikit/dist/components/List';
import { Body1, Title } from '@tonkeeper/uikit/dist/components/Text';
import { Button } from '@tonkeeper/uikit/dist/components/fields/Button';
import { Radio } from '@tonkeeper/uikit/dist/components/fields/Checkbox';
import { useSendTransferNotification } from '@tonkeeper/uikit/dist/components/modals/useSendTransferNotification';
import { useFormatCoinValue } from '@tonkeeper/uikit/dist/hooks/balance';
import { useTranslation } from '@tonkeeper/uikit/dist/hooks/translation';
import { View } from '@web3-explorer/uikit-view';
import { FC, useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { currentTs } from '../../common/utils';
import { usePro } from '../../providers/ProProvider';

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
    const format = useFormatCoinValue();
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
                                secondary={<>{format(plan.amount)} TON</>}
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
    currentProInfo: ProInfoProps | null;
    isLongProLevel: boolean;
    walletTitle: string;
}> = ({ accountId, accountIndex, accountTitle, walletTitle }) => {
    const { t } = useTranslation();
    const { proPlans, proInfoList, proRecvAddress, updateOrderComment } = usePro();
    let plans: ProPlan[] = proPlans.map(proPlan => {
        let { description } = proPlan;
        description = description?.replace('{accountTitle}', accountTitle);
        description = description?.replace('{walletTitle}', walletTitle);
        return { ...proPlan, description };
    });
    const currentPlan = ProService.getCurrentPlan(proInfoList, accountId, accountIndex);
    console.log({ currentPlan });
    const isLongProLevel = currentPlan.isLongProLevel;
    const currentProInfo = currentPlan.plan;
    if (currentPlan && currentPlan.isLongProLevel) {
        plans = plans.filter(row => row.level === 'LONG');
    }

    if (currentPlan && currentPlan.plan && currentPlan.plan.level === 'YEAR') {
        plans = plans.filter(row => row.level !== 'MONTH');
    }

    const [selectedPlan, setPlan] = useState<ProPlan>(plans[0]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [_, setOrderComment] = useState<string>('');

    const { onOpen: sendTransfer } = useSendTransferNotification();
    const format = useFormatCoinValue();
    useEffect(() => {
        function finishPay(e: any) {
            console.log(e.detail);
            setOrderComment(text => {
                updateOrderComment(text);
                return '';
            });
        }
        window.addEventListener('finishPay', finishPay);
        return () => {
            window.removeEventListener('finishPay', finishPay);
        };
    }, []);
    const onSubmit = async () => {
        if (!selectedPlan) {
            return;
        }
        const { level, amount } = selectedPlan;
        const amount1 = String(format(amount));
        const text = `${level}/${amount1}/${accountIndex}/${currentTs()}/${accountId}`;
        setOrderComment(text);
        setIsLoading(true);
        sendTransfer({
            transfer: {
                address: proRecvAddress,
                amount: amount1,
                text,
                jetton: 'TON'
            },
            asset: 'TON'
        });
    };
    useEffect(() => {
        function onCloseNotify() {
            setIsLoading(false);
        }
        window.addEventListener('onCloseNotify', onCloseNotify);
        return () => {
            window.removeEventListener('onCloseNotify', onCloseNotify);
        };
    }, []);

    const theme = useTheme();
    return (
        <View px={24} py12 relative userSelectNone>
            <View abs xx0 center bottom={8}>
                <View
                    useSelectText
                    textFontSize="0.8rem"
                    textColor={theme.textSecondary}
                    text={`${accountId},${accountIndex}`}
                />
            </View>
            <View>
                <Block>
                    <Icon
                        style={{ marginBottom: 1, paddingBottom: 0 }}
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
                {!isLongProLevel && (
                    <Line>
                        <Button
                            primary={!isLoading}
                            size="large"
                            fullWidth
                            loading={isLoading}
                            onClick={onSubmit}
                        >
                            {currentProInfo ? t('升级') : t('wallet_buy')}
                        </Button>
                    </Line>
                )}
            </View>
        </View>
    );
};
