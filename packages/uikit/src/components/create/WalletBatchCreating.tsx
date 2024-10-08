import React, { FC, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from '../../hooks/translation';
import { CenterContainer } from '../Layout';
import { H2 } from '../Text';
import { mnemonicNew } from '@ton/crypto';
import { useAppContext } from '../../hooks/appContext';
import { useCreateAccountMnemonic } from '../../state/wallet';
import { View } from '@web3-explorer/uikit-view';
import { BackButtonBlock } from '../BackButton';
import { useNavigate } from 'react-router-dom';

const Block = styled.form`
    display: flex;
    text-align: center;
    gap: 1rem;
    flex-direction: column;
`;
let stop = false;
export const WalletBatchCreating: FC<{
    count: number;
    onFinish: () => void;
}> = ({ count, onFinish }) => {
    stop = false;
    const { t } = useTranslation();
    const { defaultWalletVersion } = useAppContext();
    const { mutateAsync: createWalletsAsync } = useCreateAccountMnemonic();
    const [progress, setProgress] = React.useState(0);

    useEffect(() => {
        (async () => {
            for (let i = 0; i < count; i++) {
                if (stop) {
                    break;
                }
                try {
                    const m = await mnemonicNew(24);
                    await createWalletsAsync({
                        mnemonic: m,
                        versions: [defaultWalletVersion],
                        selectAccount: i === 0
                    });
                    setProgress(i + 1);
                } catch (e) {
                    console.error('error create wallet account');
                }
            }
            onFinish();
        })();
        return () => {
            stop = true;
        };
    }, []);
    const navigate = useNavigate();
    const theme = useTheme();
    return (
        <CenterContainer>
            <BackButtonBlock
                onClick={() => {
                    stop = true;
                    setTimeout(() => {
                        navigate(-1);
                    }, 500);
                }}
            />
            <Block>
                <View mb12>
                    <View w100p center>
                        <View
                            text={`${progress} / ${count}`}
                            textProps={{
                                variant: 'caption',
                                component: 'div',
                                fontSize: '2rem',
                                sx: { color: theme.textSecondary }
                            }}
                        />
                    </View>
                </View>
                <View>
                    <H2>{t('正在创建...')}</H2>
                </View>
            </Block>
        </CenterContainer>
    );
};
