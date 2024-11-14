import { ConfirmDisconnectNotification } from '@tonkeeper/uikit/dist/components/connected-apps/ConfirmDisconnectNotification';
import { useDisclosure } from '@tonkeeper/uikit/dist/hooks/useDisclosure';
import {
    useActiveWalletTonConnectConnections,
    useDisconnectTonConnectApp
} from '@tonkeeper/uikit/dist/state/tonConnect';
import { View } from '@web3-explorer/uikit-view';
import { useTranslation } from 'react-i18next';
import { ConnectedAppsList } from '../../../components/connect-apps/ConnectedAppsList';
import { Page } from '../../../components/Page';
import { WalletHeaderAccount } from '../../../components/wallet/WalletHeaderAccount';

export const ConnectedAppsPage = () => {
    const { t } = useTranslation();
    const { isOpen, onClose, onOpen } = useDisclosure();
    const { data: connections } = useActiveWalletTonConnectConnections();
    const { mutate } = useDisconnectTonConnectApp();

    const onCloseNotification = (confirmed?: boolean) => {
        if (confirmed) {
            mutate('all');
        }
        onClose();
    };

    const showDisconnectAll = !!connections?.length && connections.length > 1;

    return (
        <Page
            header={
                <View jEnd aCenter>
                    {showDisconnectAll && (
                        <View mr12 button={t('disconnect_all_apps')} onClick={onOpen} />
                    )}
                    <WalletHeaderAccount />
                </View>
            }
        >
            <View h100p overflowYAuto>
                <View column pt12 width={800} sx={{ margin: '0 auto' }}>
                    <ConnectedAppsList />
                </View>
                <ConfirmDisconnectNotification
                    isOpen={isOpen}
                    onClose={onCloseNotification}
                    app="all"
                />
            </View>
        </Page>
    );
};
