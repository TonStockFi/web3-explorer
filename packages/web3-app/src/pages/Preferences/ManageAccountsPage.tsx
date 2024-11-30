import { View } from '@web3-explorer/uikit-view';
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
            <View wh100p borderBox px={12} pt={12} overflowYAuto>
                <View h100p sx={{ margin: '0 auto', maxWidth: '768px' }}>
                    <ManageSubWalletPage />
                    {/* <TabViewContainer
                        panelStyle={{
                            height: '100%',
                            overflowY: 'auto'
                        }}
                        onChangeTabIndex={setCurrentTabIndex}
                        tabs={tabs}
                        currentTabIndex={currentTabIndex}
                    /> */}
                </View>
            </View>
        </Page>
    );
};
