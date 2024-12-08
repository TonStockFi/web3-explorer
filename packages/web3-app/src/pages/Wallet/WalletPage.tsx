import { CryptoCurrency } from '@tonkeeper/core/dist/entries/crypto';
import { View } from '@web3-explorer/uikit-view';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from '../../components/Page';
import TabViewContainer from '../../components/TabViewContainer';
import { DesktopTokens } from '../../components/wallet/DesktopTokens';
import { WalletTop } from '../../components/wallet/WalletTop';
import { useAccountInfo, useBlockChainExplorer } from '../../hooks/wallets';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { CoinPage } from './coin/DesktopCoinPage';
import { DesktopHistoryPage } from './history/DesktopHistoryPage';

export function WalletPage() {
    const { t } = useTranslation();
    const { openUrl } = useBrowserContext();
    const { selectedToken, onSelectToken } = useIAppContext();
    const [currentTabIndex, setCurrentTabIndex] = useState(0);
    const accountExplorer = useBlockChainExplorer();
    const { address } = useAccountInfo();
    useEffect(() => {
        onSelectToken('');
    }, []);
    const tabs = [
        {
            title: t('wallet_aside_tokens'),
            node: (
                <DesktopTokens
                    onClick={(token: 'ton' | string) => {
                        onSelectToken(token);
                    }}
                />
            )
        },
        {
            title: t('wallet_aside_history'),
            node: DesktopHistoryPage
        },

        {
            title: t('NFT'),
            node: DesktopHistoryPage
        }
    ];
    return (
        <Page full>
            <View
                hide={!!selectedToken}
                h100p
                column
                relative
                flx
                overflowHidden
                sx={{ margin: '0 auto', maxWidth: '800px', width: '100%' }}
            >
                <WalletTop />
                <TabViewContainer
                    panelStyle={{
                        height: 'calc(100vh - 236px)',
                        paddingTop: 1,
                        overflowY: 'auto'
                    }}
                    onChangeTabIndex={v => {
                        if (v === 0) {
                            setCurrentTabIndex(v);
                        }
                        if (v === 1) {
                            const url = accountExplorer.replace('%s', address);
                            openUrl(url);
                            return;
                        }
                        if (v === 2) {
                            const url = accountExplorer.replace('%s', address);
                            openUrl(url + '#nfts');
                            return;
                        }
                    }}
                    tabs={tabs}
                    topTabStyle={{ color: 'white' }}
                    currentTabIndex={currentTabIndex}
                />
            </View>

            <View hide={!selectedToken} sx={{ margin: '0 auto', maxWidth: '800px', width: '100%' }}>
                <View h={56} ml12 rowVCenter jStart>
                    <View
                        onClick={() => onSelectToken('')}
                        icon="Back"
                        iconButtonSmall
                        iconButton={{
                            sx: { borderRadius: '50%' }
                        }}
                        iconProps={{ fontSize: 'small' }}
                    />
                </View>
                <CoinPage
                    onClose={() => {
                        onSelectToken('');
                    }}
                    token={selectedToken === 'ton' ? CryptoCurrency.TON : selectedToken}
                />
            </View>
        </Page>
    );
}
