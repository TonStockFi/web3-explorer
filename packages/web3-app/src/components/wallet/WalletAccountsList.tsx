import { WalletId } from '@tonkeeper/core/dist/entries/wallet';
import { formatAddress } from '@tonkeeper/core/dist/utils/common';
import { AccountBadge } from '@tonkeeper/uikit/dist/components/account/AccountBadge';
import { KeyIcon } from '@tonkeeper/uikit/dist/components/Icon';
import { useAccountsState } from '@tonkeeper/uikit/dist/state/accounts';
import { useActiveAccount, useMutateActiveAccount } from '@tonkeeper/uikit/dist/state/wallet';
import { View } from '@web3-explorer/uikit-view';
import { useState } from 'react';
import { useTheme } from 'styled-components';
import { hexToRGBA } from '../../common/utils';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { AccountMoreView } from '../accounts/AccountMoreView';
import { DialogCreateAccount } from '../accounts/DialogCreateAccount';
import { ImportExistingWallet } from '../accounts/ImportExistingWallet';
import { WalletEmoji } from '../WalletEmoji';
import { AddressWithCopy } from './AddressWithCopy';
import { ToggleActiveAccount } from './ToggleActiveAccount';

export function WalletAccountsList() {
    const theme = useTheme();
    const account = useActiveAccount();
    const [openCreateAccountDialog, setOpenCreateAccountDialog] = useState(false);

    const accounts = useAccountsState();
    const { t } = useBrowserContext();
    const { showWalletAside } = useIAppContext();

    const { mutateAsync: setActiveAccount } = useMutateActiveAccount();
    const [importDialog, setImportDialog] = useState(false);

    const onClickAccount = (walletId: WalletId) => {
        setActiveAccount(walletId);
    };
    return (
        <View overflowHidden wh100p column px={8} borderBox>
            <View borderBox h={48} jSpaceBetween aCenter relative>
                <View rowVCenter>
                    <View ml12 mr12 h100p row aCenter>
                        <View text={'主帐户'} mr12 />
                        <View></View>
                        <View
                            dialog={{
                                dialogProps: {
                                    fullScreen: true,
                                    open: importDialog
                                },
                                content: (
                                    <View wh100p row center bgColor={theme.backgroundPage}>
                                        <View sx={{ maxWidth: 800 }}>
                                            <ImportExistingWallet
                                                onClose={() => {
                                                    setImportDialog(false);
                                                }}
                                                afterCompleted={() => {
                                                    setImportDialog(false);
                                                }}
                                            />
                                        </View>
                                    </View>
                                )
                            }}
                        />
                        <DialogCreateAccount
                            {...{
                                open: openCreateAccountDialog,
                                onClose: () => {
                                    setOpenCreateAccountDialog(false);
                                },
                                onConfirm: () => {}
                            }}
                        />
                    </View>
                    {/* <NetworkView /> */}
                </View>
                <View rowVCenter jEnd aCenter>
                    <View
                        ml={6}
                        tips={'导入助记词'}
                        iconButtonSmall
                        icon={<KeyIcon></KeyIcon>}
                        onClick={() => {
                            setImportDialog(true);
                        }}
                    ></View>
                    <View
                        ml={6}
                        tips={'添加主帐户'}
                        iconButtonSmall
                        icon={'Add'}
                        onClick={() => {
                            setOpenCreateAccountDialog(true);
                        }}
                    ></View>
                    <View
                        ml={6}
                        mr12
                        tips={t('close')}
                        iconButtonSmall
                        icon={'Close'}
                        onClick={() => {
                            showWalletAside(false);
                        }}
                    ></View>
                </View>
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
                            <View
                                aCenter
                                jStart
                                pointer
                                onClick={() => {
                                    onClickAccount(wallet.id);
                                    showWalletAside(false);
                                }}
                            >
                                <ToggleActiveAccount isActived={wallet.id === account.id} />
                                <View h={32} center mr12>
                                    <WalletEmoji containerSize="20px" emoji={wallet.emoji} />
                                </View>
                                <View text={wallet.name} textFontSize="0.9rem" />
                                <View center ml12>
                                    <AccountBadge accountType={wallet.type} size="s">
                                        {wallet.type === 'mam' ? t('Multi') : ''}
                                    </AccountBadge>
                                </View>
                            </View>
                            <View aCenter jEnd pr={8}>
                                <View rowVCenter hide={wallet.type === 'mam'}>
                                    <AddressWithCopy address={address} />
                                </View>
                                <AccountMoreView
                                    name={wallet.name}
                                    accountId={wallet.id}
                                    right="-14px"
                                    top="32px"
                                />
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
