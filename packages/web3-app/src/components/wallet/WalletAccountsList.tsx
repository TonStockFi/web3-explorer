import { WalletId } from '@tonkeeper/core/dist/entries/wallet';
import { formatAddress } from '@tonkeeper/core/dist/utils/common';
import { AccountBadge } from '@tonkeeper/uikit/dist/components/account/AccountBadge';
import { useAccountsState } from '@tonkeeper/uikit/dist/state/accounts';
import { useActiveAccount, useMutateActiveAccount } from '@tonkeeper/uikit/dist/state/wallet';
import { View } from '@web3-explorer/uikit-view';
import { useTheme } from 'styled-components';
import { hexToRGBA } from '../../common/utils';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { MAIN_NAV_TYPE } from '../../types';
import { NetworkView } from '../aside/NetworkView';
import { WalletEmoji } from '../WalletEmoji';
import { AddressWithCopy } from './AddressWithCopy';
import { ToggleActiveAccount } from './ToggleActiveAccount';

export function WalletAccountsList({ onBack }: { onBack: () => void }) {
    const theme = useTheme();
    const account = useActiveAccount();
    const { openTab } = useBrowserContext();
    const accounts = useAccountsState();
    const { currentTabId, t } = useBrowserContext();
    const { showWalletAside } = useIAppContext();

    const { mutateAsync: setActiveAccount } = useMutateActiveAccount();

    const onClickAccount = (walletId: WalletId) => {
        setActiveAccount(walletId);
    };
    return (
        <View overflowHidden wh100p column px={8} borderBox>
            <View borderBox h={48} jSpaceBetween aCenter relative>
                <View rowVCenter>
                    <View
                        hide={account.type !== 'mam'}
                        iconSmall
                        iconButtonSmall
                        iconButton
                        iconProps={{ sx: { width: 16, height: 16, color: theme.textPrimary } }}
                        onClick={onBack}
                        icon="Back"
                    />
                    <View ml12 h100p row aCenter>
                        <View text={t('WalletAccounts')} />
                    </View>
                    <NetworkView />
                </View>
                <View
                    mr={4}
                    tips={t('Settings')}
                    iconButton
                    iconButtonSmall
                    iconSmall
                    iconProps={{ sx: { color: theme.textPrimary } }}
                    icon={'Settings'}
                    onClick={() => {
                        showWalletAside(false);
                        openTab(MAIN_NAV_TYPE.ACCOUNTS_MANAGE);
                    }}
                />
            </View>
            <View divider />
            <View pb={8} pt={4} flex1 column overflowYAuto>
                {accounts.map(wallet => {
                    const address = formatAddress(wallet.activeTonWallet.rawAddress);
                    return (
                        <View
                            key={wallet.id}
                            jSpaceBetween
                            aCenter
                            row
                            mb={2}
                            px={8}
                            py={4}
                            pointer
                            onClick={() => {
                                onClickAccount(wallet.id);
                                if (wallet.type !== 'mam') {
                                    if (currentTabId !== MAIN_NAV_TYPE.WALLET) {
                                        showWalletAside(false);
                                    }
                                } else {
                                    onBack();
                                }
                            }}
                            bgColor={
                                account.id === wallet.id
                                    ? theme.backgroundContentAttention
                                    : undefined
                            }
                            sx={{
                                borderRadius: 2,
                                '&:hover': {
                                    bgcolor: hexToRGBA(theme.backgroundContentTint, 0.56)
                                }
                            }}
                        >
                            <View aCenter jStart>
                                <ToggleActiveAccount isActived={wallet.id === account.id} />
                                <View h={32} center mr12>
                                    <WalletEmoji containerSize="20px" emoji={wallet.emoji} />
                                </View>
                                <View text={wallet.name} textFontSize="0.8rem" />
                                <View center ml12>
                                    <AccountBadge accountType={wallet.type} size="s">
                                        {wallet.type === 'mam' ? t('Multi') : ''}
                                    </AccountBadge>
                                </View>
                            </View>
                            <View aCenter jEnd hide={wallet.type === 'mam'}>
                                <AddressWithCopy address={address} />
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
