import { FiatCurrencies } from '@tonkeeper/core/dist/entries/fiat';
import { Network } from '@tonkeeper/core/dist/entries/network';
import { formatDecimals } from '@tonkeeper/core/dist/utils/balance';
import { formatFiatCurrency, formatter } from '@tonkeeper/uikit/dist/hooks/balance';
import {
    TokenMeta,
    useAssetsDistribution,
    useWalletTotalBalance
} from '@tonkeeper/uikit/dist/state/asset';
import { useUserFiat } from '@tonkeeper/uikit/dist/state/fiat';
import { useActiveTonNetwork } from '@tonkeeper/uikit/dist/state/wallet';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { WebviewTag } from 'electron';
import { useEffect, useState } from 'react';
import { onAction } from '../../common/electron';
import { getDiscoverHost } from '../../common/helpers';
import { currentTs } from '../../common/utils';
import { LoadingView } from '../../components/LoadingView';
import WebViewBrowser from '../../components/webview/WebViewBrowser';
import { WebviewTopBar } from '../../components/webview/WebViewTopBar';
import { DISCOVER_PID, START_URL } from '../../constant';
import { useAccountInfo, usePublicAccountsInfo } from '../../hooks/wallets';
import { BrowserTab, useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { usePro } from '../../providers/ProProvider';
import AssetBalanceService from '../../services/AssetBalanceService';
import ProService from '../../services/ProService';
import WebviewService from '../../services/WebviewService';
import { AccountAssetBalance, MAIN_NAV_TYPE, SUB_WIN_ID } from '../../types';

const DashboardPage = () => {
    const { onShowProBuyDialog, proInfoList } = usePro();
    const { data: totalBalance, isLoading } = useWalletTotalBalance();
    const { data: distribution } = useAssetsDistribution();
    const fiat = useUserFiat();
    const currentAccount = useAccountInfo();
    const accounts = usePublicAccountsInfo();
    const currentPlan = ProService.getCurrentPlan(
        proInfoList,
        currentAccount.id,
        currentAccount.index
    );

    sessionStorage.setItem(
        'accountInfo',
        JSON.stringify({ currentPlan, currentAccount, accounts })
    );
    const { theme, browserTabs } = useBrowserContext();
    const [loading, setLoading] = useState<boolean>(true);
    let tab: BrowserTab | undefined = browserTabs.get(MAIN_NAV_TYPE.DASHBOARD);
    const network = useActiveTonNetwork();
    const tabId = MAIN_NAV_TYPE.DASHBOARD;
    useEffect(() => {
        function updatePayPlan() {
            getAccountsBalance();
        }
        window.addEventListener('updatePayPlan', updatePayPlan);
        return () => {
            window.removeEventListener('updatePayPlan', updatePayPlan);
        };
    }, []);
    useEffect(() => {
        if (!isLoading) {
            const assetList: any[] = [];
            const totalBalance1 = formatFiatCurrency(FiatCurrencies.USD, totalBalance || 0);
            distribution?.forEach(element => {
                const { meta } = element;
                const { balance, name, symbol, image } = meta as TokenMeta;
                const decimals = 9;
                const amount = formatter.format(formatDecimals(balance, decimals), {
                    ignoreZeroTruncate: false,
                    decimals
                });

                assetList.push({
                    amount,
                    name,
                    symbol,
                    image
                });
            });
            const accountAssetBalance = {
                balance: totalBalance1,
                assetList,
                id: currentAccount.id,
                index: currentAccount.index
            };
            console.log('accountAssetBalance', accountAssetBalance);
            new AssetBalanceService(currentAccount.id, network === Network.MAINNET)
                .save(currentAccount.index, accountAssetBalance)
                .then(() => {
                    getAccountsBalance();
                });
        }
    }, [isLoading, currentAccount, fiat, totalBalance]);

    const getAccountsBalance = async () => {
        const ws = new WebviewService(tabId);
        const res = sessionStorage.getItem('accountInfo');
        if (!res || !ws.getWebviewContentsId()) {
            return;
        }
        const { currentAccount, currentPlan, accounts } = JSON.parse(res);
        const accountAssetBalance1 = await new AssetBalanceService(
            currentAccount.id,
            network === Network.MAINNET
        ).getAll();
        const accountAssetBalance: Map<string, AccountAssetBalance> = new Map();
        accountAssetBalance1.forEach(row => {
            accountAssetBalance.set(row.id + row.index, row);
        });
        console.log('getAccountsBalance', { accountAssetBalance, accounts, currentAccount });

        onAction(
            'sendToSite',
            {
                action: 'updateAccounts',
                payload: {
                    currentPlan,
                    accountAssetBalance,
                    accounts,
                    currentAccount
                }
            },
            ws.getWebviewContentsId()
        );
    };

    if (!tab) {
        tab = { tabId: tabId, ts: currentTs(), ts1: currentTs() };
    }
    const { env } = useIAppContext();
    const url = `${getDiscoverHost(env.isDev)}#${SUB_WIN_ID.ASSETS}`;

    return (
        <View
            bgColor={theme.backgroundBrowserActive}
            rowVCenter
            overflowHidden
            jSpaceBetween
            wh100p
            relative
        >
            <View hide abs xx0 top0 borderBox w100p h={44} px={12} aCenter row jSpaceBetween>
                <View aCenter jStart flex1>
                    <WebviewTopBar urlReadOnly hideOpenInNew={true} tab={tab!} currentUrl={url} />
                </View>
            </View>
            <View
                abs
                borderRadius={8}
                overflowHidden
                right={8}
                left={8}
                bottom={0}
                top={8}
                borderBox
            >
                <WebViewBrowser
                    hideBoxShadow
                    borderRadius={0}
                    url={START_URL}
                    tabId={tabId}
                    partitionId={DISCOVER_PID}
                    webviewProps={{
                        onError: () => setLoading(false),
                        onErrorReset: () => setLoading(true),
                        onSiteMessage: async (
                            { action, payload }: { action: string; payload?: Record<string, any> },
                            webview: WebviewTag
                        ) => {
                            if (action === 'onPayPro') {
                                onShowProBuyDialog(true);
                            }
                            if (action === 'getAccountsBalance') {
                                getAccountsBalance();
                            }
                        },
                        onReady: (webview: WebviewTag) => {
                            if (webview.getURL() === START_URL) {
                                new WebviewService(tabId).goTo(url);
                                return;
                            }
                            setLoading(false);
                        }
                    }}
                />
                <LoadingView
                    loading={loading}
                    setLoading={(loading: boolean) => setLoading(loading)}
                />
            </View>
        </View>
    );
};

export default DashboardPage;
