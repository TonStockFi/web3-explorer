import { useActiveTonNetwork } from '@tonkeeper/uikit/dist/state/wallet';

import { Network, switchNetwork } from '@tonkeeper/core/dist/entries/network';
import { useMutateDevSettings } from '@tonkeeper/uikit/dist/state/dev';
import { View } from '@web3-explorer/uikit-view';

export const NetworkView = () => {
    const network = useActiveTonNetwork();
    const { mutate: mutateDevSettings } = useMutateDevSettings();

    return (
        <View
            onClick={() => {
                mutateDevSettings({ tonNetwork: switchNetwork(network) });
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
