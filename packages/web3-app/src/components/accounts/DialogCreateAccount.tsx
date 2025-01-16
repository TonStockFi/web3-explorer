import { TonKeychainRoot } from '@ton-keychain/core';
import { View } from '@web3-explorer/uikit-view';
import { useTheme } from 'styled-components';
import { useCreateAccountMAM, useCreateMAMAccountDerivation } from '../../hooks/wallets';
import { useIAppContext } from '../../providers/IAppProvider';
import { WalletBatchCreateNumber } from './WalletBatchCreateNumber';

export const DialogCreateAccount = ({
    onClose,
    onConfirm,
    open
}: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) => {
    const theme = useTheme();
    const { showBackdrop } = useIAppContext();
    const { mutateAsync: createDerivation } = useCreateMAMAccountDerivation();
    const { mutateAsync: createWalletsAsync } = useCreateAccountMAM();

    return (
        <View
            dialog={{
                dialogProps: {
                    fullScreen: true,
                    open
                },
                content: (
                    <View wh100p row center bgColor={theme.backgroundPage}>
                        <View sx={{ maxWidth: 800 }}>
                            <WalletBatchCreateNumber
                                onClose={onClose}
                                submitHandler={async ({ count }: { count: number }) => {
                                    showBackdrop(true);
                                    onClose();
                                    const { mnemonic } = await TonKeychainRoot.generate();
                                    const accountMAM = await createWalletsAsync({
                                        mnemonic,
                                        selectedDerivations: [0],
                                        selectAccount: true
                                    });
                                    if (count > 1) {
                                        const d = await createDerivation({
                                            accountId: accountMAM.id,
                                            count: count - 1
                                        });
                                    }
                                    onConfirm();
                                    showBackdrop(false);
                                }}
                            />
                        </View>
                    </View>
                )
            }}
        />
    );
};
