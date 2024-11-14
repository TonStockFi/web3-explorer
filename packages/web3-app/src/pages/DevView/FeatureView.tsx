import { TonKeychainRoot } from '@ton-keychain/core';
import { mnemonicNew } from '@ton/crypto';
import { WalletVersion } from '@tonkeeper/core/dist/entries/wallet';
import { useAppContext } from '@tonkeeper/uikit/dist/hooks/appContext';
import { useAppSdk } from '@tonkeeper/uikit/dist/hooks/appSdk';
import { useAccountsState } from '@tonkeeper/uikit/dist/state/accounts';
import {
    useActiveAccount,
    useCreateAccountMAM,
    useCreateAccountMnemonic,
    useMutateAccountActiveDerivation
} from '@tonkeeper/uikit/dist/state/wallet';
import { View } from '@web3-explorer/uikit-view';
import { useState } from 'react';
import { useProcessMnemonic } from '../../components/accounts/ImportExistingWallet';
import { useCreateMAMAccountDerivation } from '../../hooks/wallets';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';

const FeatureView = () => {
    const { newTab, openUrl } = useBrowserContext();
    const { defaultWalletVersion } = useAppContext();
    const { mutateAsync: createWalletsAsync } = useCreateAccountMnemonic();

    const account = useActiveAccount();

    const { mutate: createDerivation, isLoading: isCreatingDerivationLoading } =
        useCreateMAMAccountDerivation();

    const { mutateAsync: createAccountMam, isLoading: isCreatingAccountMam } =
        useCreateAccountMAM();
    const { mutateAsync: processMnemonic, isLoading: isProcessMnemonic } = useProcessMnemonic();

    const { mutateAsync: selectDerivation, isLoading: isSelectDerivationLoading } =
        useMutateAccountActiveDerivation();
    const accounts = useAccountsState();
    const context = useAppContext();
    const [debug, setDebug] = useState<any>(null);
    const sdk = useAppSdk();
    const { env } = useIAppContext();
    function createStandardTonAccountByMnemonic(
        context: any,
        storage: any,
        arg2: any,
        arg3: { auth: { kind: string }; versions: WalletVersion[] }
    ) {
        throw new Error('Function not implemented.');
    }

    return (
        <View>
            <View row mb12>
                <View
                    mr12
                    buttonVariant="contained"
                    onClick={() => {
                        openUrl('https://ton-connect.github.io/demo-dapp-with-react-ui/');
                    }}
                    button="ton-connect"
                />

                <View
                    mr12
                    buttonVariant="contained"
                    onClick={() => {
                        openUrl('https://www.ip133.com/');
                    }}
                    button="ip133"
                />

                <View
                    mr12
                    buttonVariant="contained"
                    onClick={() => {
                        openUrl('https://ifconfig.me/all.json');
                    }}
                    button="ifconfig"
                />
            </View>
            <View row>
                <View
                    mb12
                    mr12
                    buttonVariant="contained"
                    button="Gen Mnemonic"
                    onClick={async () => {
                        const m12 = await mnemonicNew(12);
                        const m24 = await mnemonicNew(24);
                        setDebug({
                            m12: m12.join(' '),
                            m24: m24.join(' ')
                        });
                    }}
                />
                <View
                    mb12
                    buttonVariant="contained"
                    mr12
                    button="Gen MAM Mnemonic"
                    onClick={async () => {
                        const m12 = await TonKeychainRoot.generate(12);
                        const m24 = await TonKeychainRoot.generate(24);
                        setDebug({
                            m12: m12.mnemonic.join(' '),
                            m24: m24.mnemonic.join(' ')
                        });
                    }}
                />
                <View
                    mb12
                    mr12
                    buttonVariant="contained"
                    button="storage-clear"
                    onClick={async () => {
                        if (env.isDev) {
                            await window.backgroundApi.message({
                                king: 'storage-clear'
                            });
                            location.reload();
                        }
                    }}
                />
            </View>

            <View wh100p>
                <View h={800} overflowYAuto>
                    <View hide={debug === null} useSelectText json={debug} />
                </View>
            </View>
        </View>
    );
};

export default FeatureView;
