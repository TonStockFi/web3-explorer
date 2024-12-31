import { IconButton } from '@mui/material';
import { formatAddress } from '@tonkeeper/core/dist/utils/common';

import { AccountMAM } from '@tonkeeper/core/dist/entries/account';
import { useSendTransferNotification } from '@tonkeeper/uikit/dist/components/modals/useSendTransferNotification';
import { useAppSdk } from '@tonkeeper/uikit/dist/hooks/appSdk';
import { useWalletTotalBalance } from '@tonkeeper/uikit/dist/state/asset';
import { useActiveAccount } from '@tonkeeper/uikit/dist/state/wallet';
import { useTranslation } from '@web3-explorer/lib-translation';
import {
    HistoryIcon,
    PhotoLibrary,
    QrCodeIcon,
    SendIcon,
    ShareTwoToneIcon
} from '@web3-explorer/uikit-mui/dist/mui/Icons';
import { View } from '@web3-explorer/uikit-view';
import { useTheme } from 'styled-components';
import { useBlockChainExplorer } from '../../hooks/wallets';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { MAIN_NAV_TYPE } from '../../types';
import { WalletList } from '../app/WalletList';
import { NetworkView } from '../aside/NetworkView';
import { DesktopHeaderBalance } from '../dashboard/DesktopHeaderElements';
import { WalletEmoji } from '../WalletEmoji';
import { AddressWithCopy } from './AddressWithCopy';

export function WalletTop() {
    const { t } = useTranslation();
    const { openTab, openUrl } = useBrowserContext();
    const theme = useTheme();

    const account = useActiveAccount();
    const activeWallet = account.activeTonWallet;

    const address = formatAddress(activeWallet.rawAddress);

    const sdk = useAppSdk();
    const { onOpen: sendTransfer } = useSendTransferNotification();

    const { data: balance, isLoading } = useWalletTotalBalance();
    const accountExplorer = useBlockChainExplorer();
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
                onShowWallet(false);
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
        },
        {
            title: t('wallet_aside_history'),
            icon: <HistoryIcon />,
            onClick: () => {
                const url = accountExplorer.replace('%s', address);
                openUrl(url);
            }
        },
        {
            title: t('NFT'),
            icon: <PhotoLibrary />,
            onClick: () => {
                const url = accountExplorer.replace('%s', address);
                openUrl(url + '#nfts');
            }
        }
    ];

    let accountEmoji = account.emoji;
    let accountTitle = `${account.name}`;
    const { onShowWalletList, showWalletList, onShowWallet } = useIAppContext();
    if (account.type === 'mam') {
        const name = account.activeDerivation.name;
        accountEmoji = account.activeDerivation.emoji;
        const { activeDerivationIndex } = account as AccountMAM;
        accountTitle = `# ${activeDerivationIndex + 1} ${name}`;
        // address = account.derivations[activeDerivationIndex].tonWallets[0].rawAddress;
        if (name.indexOf(` ${activeDerivationIndex + 1}`) > -1) {
            accountTitle = `${name}`;
        }
    }

    return (
        <View
            userSelectNone
            mb={24}
            jSpaceBetween
            zIdx={2}
            pt12
            px12
            bgColor={theme.backgroundBrowser}
            column
        >
            <View
                drawer={{
                    onClose: () => {
                        onShowWalletList(false);
                    },
                    open: showWalletList,
                    anchor: 'right'
                }}
            >
                <View width={380}>
                    <WalletList></WalletList>
                </View>
            </View>
            <View w100p center column>
                <View w100p center mb12 relative>
                    <View abs top={-6} left={0} h={44} rowVCenter>
                        <View
                            mr={4}
                            tips={t('Settings')}
                            iconButton
                            iconButtonSmall
                            iconSmall
                            iconProps={{ sx: { color: theme.textPrimary } }}
                            icon={'Settings'}
                            onClick={() => {
                                openTab(MAIN_NAV_TYPE.ACCOUNTS_MANAGE);
                                onShowWallet(false);
                            }}
                        />
                    </View>
                    <View abs top={-6} right={0} h={44} rowVCenter>
                        <NetworkView />
                    </View>
                    <View
                        hoverBgColor={theme.backgroundContentAttention}
                        bgColor={theme.backgroundContentTint}
                        center
                        rowVCenter
                        pointer
                        borderRadius={4}
                        onClick={() => onShowWalletList(true)}
                        borderBox
                        px={8}
                        py={4}
                        overflowHidden
                        mb={4}
                    >
                        <WalletEmoji emojiSize="16px" emoji={accountEmoji} />
                        <View
                            mt={2}
                            ml={8}
                            rowVCenter
                            textFontSize="0.9rem"
                            text={`${accountTitle}`}
                            mr={6}
                        />
                        <View iconSmall icon="ArrowRight" />
                    </View>
                </View>
                <View>
                    <DesktopHeaderBalance isLoading={isLoading} balance={balance} />
                </View>
                <View row aCenter mb={6} mt={6}>
                    <AddressWithCopy showAddress address={address} />
                </View>
            </View>
            <View row jSpaceAround aCenter mt={12}>
                {actions.map((action: any) => {
                    return (
                        <View
                            onClick={action.onClick}
                            column
                            aCenter
                            ml12
                            tips={action.title}
                            mr12
                            sx={{ cursor: 'pointer' }}
                            key={action.title}
                        >
                            <IconButton sx={{ color: theme.textPrimary }}>{action.icon}</IconButton>
                            <View
                                hide
                                mt={2}
                                textProps={{ fontSize: 'small' }}
                                text={action.title}
                            />
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
