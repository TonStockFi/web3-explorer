import { useActiveTonNetwork } from '@tonkeeper/uikit/dist/state/wallet';
import { View } from '@web3-explorer/uikit-view';
import { useIAppContext } from '../../providers/IAppProvider';
import { usePro } from '../../providers/ProProvider';
import { Network } from '../../types';

export default function SideProIcon() {
    const { onShowProBuyDialog, proPlans } = usePro();
    const { env } = useIAppContext();
    const network = useActiveTonNetwork();
    if (network === Network.TESTNET) {
        return null;
    }
    return (
        <View
            hide={!proPlans || proPlans.length === 0}
            iconButton
            iconSmall
            icon={'Diamond'}
            onClick={() => {
                onShowProBuyDialog(true);
            }}
        />
    );
}
