import { AccountMAM } from '@tonkeeper/core/dist/entries/account';
import { CryptoCurrency } from '@tonkeeper/core/dist/entries/crypto';

import { ProServiceTier } from '@tonkeeper/core/src/tonConsoleApi';
import { ColumnText } from '@tonkeeper/uikit/dist/components/Layout';
import { ListBlock, ListItem, ListItemPayload } from '@tonkeeper/uikit/dist/components/List';
import { Body1, Title } from '@tonkeeper/uikit/dist/components/Text';
import { Button } from '@tonkeeper/uikit/dist/components/fields/Button';
import { Radio } from '@tonkeeper/uikit/dist/components/fields/Checkbox';
import { useSendTransferNotification } from '@tonkeeper/uikit/dist/components/modals/useSendTransferNotification';
import { useFormatCoinValue } from '@tonkeeper/uikit/dist/hooks/balance';
import { useTranslation } from '@tonkeeper/uikit/dist/hooks/translation';
import { useActiveAccount } from '@tonkeeper/uikit/dist/state/wallet';
import { View } from '@web3-explorer/uikit-view';
import { FC, useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { PRO_RECV_ADDRESS } from '../../constant';
import { getProLevelText } from '../../providers/ProProvider';
import { PRO_LEVEL } from '../../types';

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
    plans: ProServiceTier[];
    selected: number | null;
    setPlan: (id: number) => void;
    disabled?: boolean;
}> = ({ plans, selected, setPlan, disabled }) => {
    const format = useFormatCoinValue();
    return (
        <>
            <ListBlock>
                {plans.map((plan, index) => (
                    <ListItem key={plan.id} onClick={() => !disabled && setPlan(index)}>
                        <ListItemPayload>
                            <ColumnText
                                noWrap
                                text={plan.name}
                                secondary={
                                    <>
                                        {format(plan.amount)} {CryptoCurrency.TON}
                                    </>
                                }
                            />
                            <RadioStyled
                                disabled={disabled}
                                checked={selected === index}
                                onChange={() => setPlan(index)}
                            />
                        </ListItemPayload>
                    </ListItem>
                ))}
            </ListBlock>
        </>
    );
};

export const ProSettings: FC = () => {
    const { t } = useTranslation();

    const account = useActiveAccount() as AccountMAM;
    const wallet = account.activeTonWallet;

    const walletAccount = account.derivations.find(d => d.index === account.activeDerivationIndex)!;

    const [selectedPlan, setPlan] = useState<number>(0);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { onOpen: sendTransfer } = useSendTransferNotification();

    const plans: ProServiceTier[] = [
        {
            id: PRO_LEVEL.LONG,
            name: t('永久至尊'),
            description: `提供 ${account.emoji} ${account.name} 下的n个钱包帐号的无限制无期限使用功能。包括不限于:一对多转帐、超级智能机器识别辅助`,
            amount: '99990000000'
        },
        {
            id: PRO_LEVEL.MONTH,
            name: t('月付'),
            description: `提供 ${walletAccount.emoji} ${walletAccount.name} 无限制功能,使用期限一个月。包括不限于:一对多转帐、超级智能机器识别辅助`,
            amount: '999000000'
        },
        {
            id: PRO_LEVEL.YEAR,
            name: t('年付'),
            description: `提供 ${walletAccount.emoji} ${walletAccount.name} 无限制功能,使用期限一年。包括不限于:一对多转帐、超级智能机器识别辅助`,
            amount: '9999000000'
        }
    ];
    const theme = useTheme();
    const format = useFormatCoinValue();
    const onSubmit = async () => {
        const { id, amount } = plans[selectedPlan];
        const text = getProLevelText(id as PRO_LEVEL);
        setIsLoading(true);
        sendTransfer({
            transfer: {
                address: PRO_RECV_ADDRESS,
                amount: String(format(amount)),
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
    return (
        <View px={24} py12>
            <View>
                <Block>
                    <Icon src="https://explorer.web3r.site/logo-128x128.png" />
                    <Title>{t('Web3 Explorer')}</Title>
                    <Description>{plans[selectedPlan].description}</Description>
                </Block>
                <SelectProPlans
                    plans={plans ?? []}
                    setPlan={setPlan}
                    selected={selectedPlan}
                    disabled={isLoading}
                />
                <Line>
                    <Button
                        primary={!isLoading}
                        size="large"
                        fullWidth
                        loading={isLoading}
                        onClick={onSubmit}
                    >
                        {t('wallet_buy')}
                    </Button>
                </Line>
            </View>
        </View>
    );
};
