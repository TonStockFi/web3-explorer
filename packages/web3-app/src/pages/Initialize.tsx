import { TonKeychainRoot } from '@ton-keychain/core';
import { H1 } from '@tonkeeper/uikit/dist/components/Text';
import { Button } from '@tonkeeper/uikit/dist/components/fields/Button';
import { View } from '@web3-explorer/uikit-view';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ImportExistingWallet } from '../components/accounts/ImportExistingWallet';
import { WalletBatchCreateNumber } from '../components/accounts/WalletBatchCreateNumber';
import { useCreateAccountMAM, useCreateMAMAccountDerivation } from '../hooks/wallets';
const Accent = styled.span`
    color: ${props => props.theme.accentBlue};
`;

const Title = styled(H1)`
    margin-bottom: 2rem;
    user-select: none;
`;

const Initialize: FC = () => {
    const { t } = useTranslation();
    const [showCreate, setShowCreate] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const onClick = () => {
        setShowCreate(true);
    };
    const { mutateAsync: createDerivation } = useCreateMAMAccountDerivation();

    const { mutateAsync: createWalletsAsync, isLoading: isCreateWalletLoading } =
        useCreateAccountMAM();

    return (
        <View aCenter jCenter wh100p column>
            <View sx={{ maxWidth: 900 }} hide={showCreate || showImport}>
                <Title>
                    {t('intro_title')}
                    <Accent>Web3 Explorer</Accent>
                </Title>
                <Button size="large" fullWidth primary marginTop onClick={onClick}>
                    {t('intro_continue_btn')}
                </Button>
            </View>
            <View sx={{ maxWidth: 900 }} hide={!showCreate}>
                <WalletBatchCreateNumber
                    onImport={() => {
                        setShowCreate(false);
                        setShowImport(true);
                    }}
                    submitHandler={async ({ count }: { count: number }) => {
                        const { mnemonic } = await TonKeychainRoot.generate();
                        const accountMAM = await createWalletsAsync({
                            mnemonic,
                            selectedDerivations: [0],
                            selectAccount: true
                        });
                        if (count > 1) {
                            await createDerivation({
                                accountId: accountMAM.id,
                                count: count - 1
                            });
                        }
                    }}
                />
            </View>
            <View sx={{ maxWidth: 900 }} hide={!showImport}>
                <ImportExistingWallet
                    onClose={() => {
                        setShowImport(false);
                        setShowCreate(true);
                    }}
                />
            </View>
        </View>
    );
};

export default Initialize;
