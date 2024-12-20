import { useActiveTonNetwork } from '@tonkeeper/uikit/dist/state/wallet';

import { Network, switchNetwork } from '@tonkeeper/core/dist/entries/network';
import { useMutateDevSettings } from '@tonkeeper/uikit/dist/state/dev';
import { View } from '@web3-explorer/uikit-view';
import { useIAppContext } from '../../providers/IAppProvider';

export const NetworkView = () => {
    const network = useActiveTonNetwork();
    const { mutate: mutateDevSettings } = useMutateDevSettings();
    const { showWalletAside } = useIAppContext();
    const { showConfirm } = useIAppContext();

    return (
        <View
            onClick={() => {
                showConfirm({
                    id: 'confirm',
                    title: '切换网络',
                    content:
                        network === Network.MAINNET
                            ? '确认要切换到测试网么?'
                            : '确认要切换到主网么?',
                    onConfirm: () => {
                        mutateDevSettings({ tonNetwork: switchNetwork(network) });
                        showWalletAside(false);
                    },
                    onCancel: () => {
                        showConfirm(false);
                    }
                });
            }}
            pointer
            tips={network === Network.TESTNET ? '切换到主网' : '切换到测试网'}
        >
            {network === Network.TESTNET ? (
                <View mr={8} chip={'测试网'} />
            ) : (
                <View mr={8} chip={'主网'} />
            )}
        </View>
    );
};
