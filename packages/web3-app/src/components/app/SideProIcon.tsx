import { View } from '@web3-explorer/uikit-view';
import { usePro } from '../../providers/ProProvider';

export default function SideProIcon() {
    const { onShowProBuyDialog, proPlans } = usePro();
    return (
        <View
            hide={!proPlans || proPlans.length === 0}
            mb={6}
            iconButton
            iconSmall
            icon={'Diamond'}
            onClick={() => {
                onShowProBuyDialog(true);
            }}
        ></View>
    );
}
