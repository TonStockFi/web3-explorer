import { useTranslation } from '@web3-explorer/lib-translation';
import { useState } from 'react';
import { ManageAccounts } from '../../components/accounts/ManageAccounts';
import { ManageSubWalletPage } from '../../components/accounts/ManageSubWalletPage';
import { Page } from '../../components/Page';

export const ManageAccountsPage = () => {
    const { t } = useTranslation();

    const [currentTabIndex, setCurrentTabIndex] = useState(0);
    const tabs = [
        {
            title: t('WalletAccounts'),
            node: ManageAccounts
        },
        {
            title: t('SubWallets'),
            node: ManageSubWalletPage
        }
    ];
    return (
        <Page full>
            <ManageSubWalletPage />
        </Page>
    );
};
