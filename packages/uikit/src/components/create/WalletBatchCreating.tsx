import React, { FC, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/translation';
import { CenterContainer } from '../Layout';
import { H2 } from '../Text';
import { useCreateAccountMAM } from '../../state/wallet';
import { View } from '@web3-explorer/uikit-view';
import { BackButtonBlock } from '../BackButton';
import { useNavigate } from 'react-router-dom';
import { TonKeychainRoot } from '@ton-keychain/core';

const Block = styled.form`
    display: flex;
    text-align: center;
    gap: 1rem;
    flex-direction: column;
`;
export const WalletBatchCreating: FC<{
    count: number;
    onFinish: () => void;
}> = ({ count, onFinish }) => {
    const { t } = useTranslation();

    const { mutateAsync: createAccountMam } = useCreateAccountMAM();

    useEffect(() => {
        (async () => {
            const { mnemonic } = await TonKeychainRoot.generate(24);
            await createAccountMam({
                mnemonic,
                selectedDerivations: Array.from({ length: count }, (_, i) => i),
                selectAccount: true
            });
            onFinish();
        })();
    }, []);
    const navigate = useNavigate();
    return (
        <CenterContainer>
            <BackButtonBlock
                onClick={() => {
                    setTimeout(() => {
                        navigate(-1);
                    }, 500);
                }}
            />
            <Block>
                <View>
                    <H2>{t('正在创建...')}</H2>
                </View>
            </Block>
        </CenterContainer>
    );
};
