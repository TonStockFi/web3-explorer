import { Account, AccountMAM } from '@tonkeeper/core/dist/entries/account';
import { WalletId } from '@tonkeeper/core/dist/entries/wallet';
import { ListBlockDesktopAdaptive } from '@tonkeeper/uikit/dist/components/List';

import { DesktopViewPageLayout } from '@tonkeeper/uikit/dist/components/desktop/DesktopViewLayout';
import { useAccountsStorage } from '@tonkeeper/uikit/dist/hooks/useStorage';
import {
    useAccountsState,
    useActiveAccount,
    useMutateActiveTonWallet
} from '@tonkeeper/uikit/dist/state/wallet';
import { View } from '@web3-explorer/uikit-view';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { useCreateMAMAccountDerivation } from '../../hooks/wallets';
import { AccountsPager } from '../aside/AccountsPager';
import { AccountsMoreView } from './AccountsMoreView';
import { AccountsSelect } from './AccountsSelect';
import { DialogCreateAccount } from './DialogCreateAccount';
import { ImportExistingWallet } from './ImportExistingWallet';
import { MAMIndexesPageContent } from './MamIndexes';
import { WalletBatchCreateNumber } from './WalletBatchCreateNumber';

const DesktopViewPageLayoutStyled = styled(DesktopViewPageLayout)`
    height: 100%;
`;

export const ManageSubWalletPage = () => {
    const theme = useTheme();
    const storage = useAccountsStorage();
    const [page, setPage] = useState(0);
    const [openSetCountDialog, setOpenSetCountDialog] = useState(false);
    const accounts = useAccountsState();
    const activeAccount = useActiveAccount();
    const accountsMAM = accounts.filter(account => account.type === 'mam');
    const [selectAccount, setSelectAccount] = useState<Account | null>(
        activeAccount.type !== 'mam'
            ? accountsMAM.length > 0
                ? accountsMAM[0]
                : null
            : activeAccount
    );
    useEffect(() => {
        setSelectAccount(activeAccount);
    }, [activeAccount]);
    const { t } = useTranslation();

    const { mutateAsync: createDerivation } = useCreateMAMAccountDerivation();
    const { mutateAsync: setActiveWallet } = useMutateActiveTonWallet();

    const onClickWallet = (walletId: WalletId) => setActiveWallet(walletId);
    const onCreateDerivation = async () => {
        setOpenSetCountDialog(true);
    };

    if (selectAccount === null) {
        return null;
    }

    const [importDialog, setImportDialog] = useState(false);
    const [openCreateAccountDialog, setOpenCreateAccountDialog] = useState(false);
    const accountMAM = selectAccount as AccountMAM;
    const { allAvailableDerivations: derivations } = accountMAM;
    const total = derivations.length;
    const limit = 18;

    return (
        <DesktopViewPageLayoutStyled>
            <View borderBox w100p h={58} row aCenter jSpaceBetween mb12>
                <View row aCenter jStart pl12>
                    <View
                        center
                        onClick={() => setImportDialog(true)}
                        button={t('import_mnemonic')}
                        buttonStartIcon={<View icon="Input" iconSmall />}
                    />
                    <View
                        ml12
                        center
                        onClick={() => setOpenCreateAccountDialog(true)}
                        button={t('create_wallet_account')}
                        buttonStartIcon={<View icon="Input" iconSmall />}
                    />
                    <View
                        ml12
                        center
                        onClick={() => onCreateDerivation()}
                        button={t('add_sub_wallet')}
                        buttonStartIcon={<View icon="Add" iconSmall />}
                    />
                </View>
                <View rowVCenter jStart>
                    <AccountsSelect
                        accounts={accountsMAM}
                        onChange={(val: Account) => setSelectAccount(val)}
                        account={selectAccount}
                    />
                    <View ml12 center mr={16}>
                        <AccountsMoreView />
                    </View>
                </View>
            </View>
            <ListBlockDesktopAdaptive margin={false}>
                <MAMIndexesPageContent
                    limit={limit}
                    page={page}
                    setSelectAccount={(val: AccountMAM) => setSelectAccount(val)}
                    account={accountMAM}
                />
            </ListBlockDesktopAdaptive>
            <View h={58} hide={total <= limit} row aCenter jStart abs bottom0 left0 right0>
                <View ml12 w={150}>
                    <AccountsPager
                        total={total}
                        limit={limit}
                        page={page}
                        setPage={(p: number) => setPage(p)}
                    />
                </View>
            </View>
            <View
                dialog={{
                    dialogProps: {
                        fullScreen: true,
                        open: openSetCountDialog
                    },
                    content: (
                        <View wh100p row center bgColor={theme.backgroundPage}>
                            <View sx={{ maxWidth: 800 }}>
                                <WalletBatchCreateNumber
                                    onClose={() => {
                                        setOpenSetCountDialog(false);
                                    }}
                                    submitHandler={async ({ count }: { count: number }) => {
                                        setOpenSetCountDialog(false);
                                        const d = await createDerivation({
                                            accountId: accountMAM.id,
                                            count: count
                                        });
                                        if (d) {
                                            await onClickWallet(d.activeTonWalletId);
                                            const v = await storage.getAccount(accountMAM.id);
                                            setSelectAccount(v as AccountMAM);
                                        }
                                        if (total + count > limit) {
                                            setPage(Math.ceil((total + count) / limit) - 1);
                                        }
                                    }}
                                />
                            </View>
                        </View>
                    )
                }}
            />
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
                    onConfirm: () => {
                        setPage(Math.ceil((total + 1) / limit) - 1);
                    }
                }}
            />
        </DesktopViewPageLayoutStyled>
    );
};
