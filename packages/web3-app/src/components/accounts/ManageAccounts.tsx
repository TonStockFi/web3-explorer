import { ListBlockDesktopAdaptive } from '@tonkeeper/uikit/dist/components/List';
import { useAccountsState } from '@tonkeeper/uikit/dist/state/wallet';
import { useTranslation } from '@web3-explorer/lib-translation';
import { View } from '@web3-explorer/uikit-view';
import { useState } from 'react';
import { useTheme } from 'styled-components';
import { AccountsPager } from '../aside/AccountsPager';
import { AccountRows } from './AccountsRows';
import { DialogCreateAccount } from './DialogCreateAccount';
import { ImportExistingWallet } from './ImportExistingWallet';

export const ManageAccounts = () => {
    const theme = useTheme();
    const [page, setPage] = useState(0);
    const [importDialog, setImportDialog] = useState(false);
    const [openCreateAccountDialog, setOpenCreateAccountDialog] = useState(false);
    const accounts = useAccountsState();
    const { t } = useTranslation();

    const total = accounts.length;
    const limit = 18;
    return (
        <View>
            <View w100p row aCenter jEnd h={58}>
                <View row aCenter jEnd>
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
                </View>
            </View>
            <ListBlockDesktopAdaptive margin={false}>
                <AccountRows accounts={accounts} limit={limit} page={page} />
            </ListBlockDesktopAdaptive>
            <View h={58} row aCenter jStart abs bottom0 left0 right0>
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
        </View>
    );
};
