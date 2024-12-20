import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
