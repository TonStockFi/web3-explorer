import { useMutation } from '@tanstack/react-query';
import { TonKeychainRoot } from '@ton-keychain/core';
import { Account, AccountMAM, getAccountByWalletById } from '@tonkeeper/core/dist/entries/account';
import { WalletId, WalletVersion } from '@tonkeeper/core/dist/entries/wallet';
import {
    mnemonicToKeypair,
    validateMnemonicStandardOrBip39Ton
} from '@tonkeeper/core/dist/service/mnemonicService';
import {
    createStandardTonAccountByMnemonic,
    getStandardTonWalletVersions
} from '@tonkeeper/core/dist/service/walletService';
import { ImportWords } from '@tonkeeper/uikit/dist/components/create/Words';
import { useAppContext } from '@tonkeeper/uikit/dist/hooks/appContext';
import { useAppSdk } from '@tonkeeper/uikit/dist/hooks/appSdk';
import { useUserFiat } from '@tonkeeper/uikit/dist/state/fiat';
import {
    useAccountsState,
    useActiveTonNetwork,
    useCreateAccountMAM,
    useCreateAccountMnemonic
} from '@tonkeeper/uikit/dist/state/wallet';
import { View } from '@web3-explorer/uikit-view';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import { useIAppContext } from '../../providers/IAppProvider';

export const useProcessMnemonic = () => {
    const { mutateAsync: createAccountMam } = useCreateAccountMAM();

    const context = useAppContext();
    const network = useActiveTonNetwork();
    const fiat = useUserFiat();
    const sdk = useAppSdk();
    const accounts = useAccountsState();

    return useMutation<
        | { type: 'exisiting'; account: Account; walletId: WalletId }
        | { type: 'created'; account: AccountMAM }
        | undefined,
        Error,
        string[]
    >(async mnemonic => {
        let isLegacyMAM = false;
        const mightBeLegacyMAM = await TonKeychainRoot.isValidMnemonicLegacy(mnemonic);
        const isValidForUsualWallet = await validateMnemonicStandardOrBip39Ton(mnemonic);
        if (mightBeLegacyMAM && isValidForUsualWallet) {
            const keyPair = await mnemonicToKeypair(mnemonic);
            const publicKey = keyPair.publicKey.toString('hex');
            const versions = await getStandardTonWalletVersions({
                publicKey,
                network,
                api: context.api,
                fiat
            });

            const walletWasInitialised = versions.some(v => v.tonBalance > 0 || v.hasJettons);
            isLegacyMAM = !walletWasInitialised;
        }

        const isMam = await TonKeychainRoot.isValidMnemonic(mnemonic);
        if (isMam || isLegacyMAM) {
            const newAccountMam = await createAccountMam({ mnemonic, selectAccount: true });
            const existingAcc = accounts.find(a => a.id === newAccountMam.id);
            if (existingAcc) {
                return {
                    type: 'exisiting',
                    account: existingAcc,
                    walletId: existingAcc.activeTonWallet.id
                } as const;
            }
            return {
                type: 'created',
                account: newAccountMam
            } as const;
        }

        const _account = await createStandardTonAccountByMnemonic(context, sdk.storage, mnemonic, {
            auth: {
                kind: 'keychain'
            },
            versions: [WalletVersion.V5R1]
        });

        for (const w of _account.allTonWallets) {
            const existingAcc = getAccountByWalletById(accounts, w.id);
            if (existingAcc) {
                return { type: 'exisiting', account: existingAcc, walletId: w.id };
            }
        }
    });
};

export const ImportExistingWallet: FC<{ onClose?: () => void; afterCompleted?: () => void }> = ({
    onClose,
    afterCompleted
}) => {
    const { mutateAsync: createWalletsAsync, isLoading: isCreatingWallets } =
        useCreateAccountMnemonic();
    const { showSnackbar } = useIAppContext();
    const { mutateAsync: processMnemonic, isLoading: isProcessMnemonic } = useProcessMnemonic();
    const { t } = useTranslation();
    const onMnemonic = async (m: string[]) => {
        const isMam = await TonKeychainRoot.isValidMnemonic(m);
        if (!isMam) {
            showSnackbar({
                message: t('需要支持多子帐户的助记词')
            });
            return;
        }

        const result = await processMnemonic(m);
        if (result?.type === 'exisiting') {
            showSnackbar({
                message: t('account_is_already_added')
            });
        } else {
            if (!result) {
                await createWalletsAsync({
                    mnemonic: m,
                    versions: [WalletVersion.V5R1],
                    selectAccount: true
                });
            }
            afterCompleted && afterCompleted();
        }
    };
    const theme = useTheme();
    const { env } = useIAppContext();
    return (
        <View wh100p>
            <View
                hide={!onClose}
                wh={32}
                zIdx={1}
                abs
                left={env.isMac ? undefined : 24}
                right={env.isMac ? 24 : undefined}
                top0
                mt12
            >
                <View
                    onClick={onClose}
                    iconColor={theme.textPrimary}
                    iconButton
                    icon={'Close'}
                    iconButtonSmall
                />
            </View>
            <ImportWords
                onMnemonic={onMnemonic}
                isLoading={isProcessMnemonic}
                onIsDirtyChange={() => {}}
            />
        </View>
    );
};
