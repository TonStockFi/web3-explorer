import { IconButton } from '@mui/material';
import { formatAddress } from '@tonkeeper/core/dist/utils/common';

import { useSendTransferNotification } from '@tonkeeper/uikit/dist/components/modals/useSendTransferNotification';
import { useAppSdk } from '@tonkeeper/uikit/dist/hooks/appSdk';
import { useWalletTotalBalance } from '@tonkeeper/uikit/dist/state/asset';
import { useActiveAccount } from '@tonkeeper/uikit/dist/state/wallet';
import { QrCodeIcon, SendIcon, ShareTwoToneIcon } from '@web3-explorer/uikit-mui/dist/mui/Icons';
import { View } from '@web3-explorer/uikit-view';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { MAIN_NAV_TYPE } from '../../types';
import { DesktopHeaderBalance } from '../dashboard/DesktopHeaderElements';
import { AddressWithCopy } from './AddressWithCopy';

export function WalletTop() {
    const { t } = useTranslation();
    const { openTab } = useBrowserContext();
    const theme = useTheme();

    const account = useActiveAccount();
    const activeWallet = account.activeTonWallet;

    const address = formatAddress(activeWallet.rawAddress);

    const sdk = useAppSdk();
    const { onOpen: sendTransfer } = useSendTransferNotification();

    const { data: balance, isLoading } = useWalletTotalBalance();

    const actions = [
        {
            title: t('wallet_send'),
            icon: <SendIcon />,
            onClick: () => {
                sendTransfer();
            }
        },
        ,
        {
            title: t('wallet_multi_send'),
            icon: <ShareTwoToneIcon />,
            onClick: () => {
                openTab(MAIN_NAV_TYPE.MULTI_SEND);
            }
        },
        {
            title: t('wallet_receive'),
            icon: <QrCodeIcon />,
            onClick: () => {
                sdk.uiEvents.emit('receive', {
                    method: 'receive',
                    params: {}
                });
            }
        }
    ];

    return (
        <View
            userSelectNone
            mb={24}
            pt={44}
            row
            jSpaceBetween
            zIdx={2}
            bgColor={theme.backgroundBrowserActive}
        >
            <View>
                <View ml={14}>
                    <DesktopHeaderBalance isLoading={isLoading} balance={balance} />
                </View>
                <View row aCenter mb={6} mt={6} ml={2}>
                    <AddressWithCopy showAddress address={address} />
                </View>
            </View>
            <View row jEnd aCenter>
                {actions.map((action: any) => {
                    return (
                        <View
                            onClick={action.onClick}
                            column
                            aCenter
                            ml12
                            mr12
                            sx={{ cursor: 'pointer' }}
                            key={action.title}
                        >
                            <IconButton sx={{ color: theme.textPrimary }}>{action.icon}</IconButton>
                            <View mt={2} textProps={{ fontSize: 'small' }} text={action.title} />
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
