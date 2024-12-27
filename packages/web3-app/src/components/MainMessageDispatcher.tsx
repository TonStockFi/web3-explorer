import { useBrowserContext } from '../providers/BrowserProvider';
import {
    AccountPublic,
    MainMessageEvent,
    MallProduct,
    Network,
    PayCommentOrder,
    SendTransferPayload
} from '../types';

import { AccountMAM } from '@tonkeeper/core/dist/entries/account';
import { useSendTransferNotification } from '@tonkeeper/uikit/dist/components/modals/useSendTransferNotification';
import { useFormatCoinValue } from '@tonkeeper/uikit/dist/hooks/balance';
import { useMutateDevSettings } from '@tonkeeper/uikit/dist/state/dev';
import { useActiveWalletTonConnectConnections } from '@tonkeeper/uikit/dist/state/tonConnect';
import {
    useActiveAccount,
    useActiveTonNetwork,
    useMutateActiveTonWallet
} from '@tonkeeper/uikit/dist/state/wallet';
import { deepDiff } from '@web3-explorer/utils';
import { useEffect, useState } from 'react';
import { onAction } from '../common/electron';
import { genId, getAccountIdFromAccount } from '../common/helpers';
import { currentTs, getSessionCacheInfo } from '../common/utils';
import { useAccountInfo, usePublicAccountsInfo } from '../hooks/wallets';
import { useIAppContext } from '../providers/IAppProvider';
import { usePro } from '../providers/ProProvider';
import PayCommentOrderService from '../services/PayCommentOrderService';
import ProService from '../services/ProService';
import WebviewMainEventService from '../services/WebviewMainEventService';
import { PayCommentOrderBackgroundPage } from './webview-background/PayCommentOrderBackgroundPage';

export function MainMessageDispatcher() {
    const { onShowWallet } = useIAppContext();
    const { onShowProBuyDialog, checkPayCommentOrder, onCheckPayCommentOrder } = usePro();
    const { openUrl, openTabFromWebview, openTab } = useBrowserContext();
    const accounts = usePublicAccountsInfo();
    const { id: accountId, index } = useAccountInfo();
    const activeAcount = useActiveAccount();
    const network = useActiveTonNetwork();
    const { data: connections } = useActiveWalletTonConnectConnections();
    const { mutateAsync: setActiveAccount } = useMutateActiveTonWallet();
    const { onOpen: sendTransfer } = useSendTransferNotification();
    const format = useFormatCoinValue();
    const [_, setPayCommentOrder] = useState<null | PayCommentOrder>(null);
    const { mutate: mutateDevSettings } = useMutateDevSettings();
    const [accountsList, setAccountsList] = useState<AccountPublic[]>([]);
    useEffect(() => {
        if (deepDiff(accounts, accountsList)) {
            setAccountsList(accounts);
        }
    }, [accounts, accountsList]);
    useEffect(() => {
        sessionStorage.setItem(
            'cacheInfo',
            JSON.stringify({
                network,
                connections: connections
                    ? connections.map(row => {
                          return {
                              url: row.manifest.url,
                              clientSessionId: row.clientSessionId
                          };
                      })
                    : []
            })
        );
    }, [network, connections]);
    useEffect(() => {
        function finishPay(e: any) {
            onCheckPayCommentOrder(true);
            setPayCommentOrder(payCommentOrder => {
                if (payCommentOrder) {
                    new PayCommentOrderService().save(payCommentOrder.id, payCommentOrder);
                    onAction('subWin', {
                        toWinId: payCommentOrder.winId,
                        action: 'onPayCommentOrderSubmit',
                        payload: {
                            id: payCommentOrder.id
                        }
                    });
                }
                return null;
            });
        }
        window.addEventListener('finishPay', finishPay);
        return () => {
            window.removeEventListener('finishPay', finishPay);
        };
    }, []);
    useEffect(() => {
        WebviewMainEventService.onMainMessage(async (e: MainMessageEvent) => {
            if (!WebviewMainEventService.checkCacheMessage(e.action, e.payload)) {
                return;
            }
            const { action, payload, webContentsId } = e;
            window.dispatchEvent(
                new CustomEvent('onMainMessage', {
                    detail: {
                        action,
                        payload,
                        webContentsId
                    }
                })
            );

            if (e.action === 'onProtocol') {
                let { url } = e.payload as {
                    url: string;
                };
                try {
                    const { pathname, searchParams } = new URL(url);
                    switch (pathname) {
                        case '//onBuyProduct': {
                            const productHex = searchParams.get('product');
                            if (productHex) {
                                const product = JSON.parse(
                                    Buffer.from(productHex, 'hex').toString()
                                ) as MallProduct;
                            }
                            break;
                        }
                        case '//openMainTabUrl': {
                            const urlHex = searchParams.get('url');
                            if (urlHex) {
                                const { url } = JSON.parse(Buffer.from(urlHex, 'hex').toString());
                                openUrl(url);
                            }
                            break;
                        }
                        case '//onOpenTab': {
                            const itemHex = searchParams.get('item');
                            if (itemHex) {
                                const item = JSON.parse(Buffer.from(itemHex, 'hex').toString());
                                openTabFromWebview(item);
                            }
                            break;
                        }
                        default:
                            break;
                    }
                } catch (e) {}
            }
            if (e.action === 'openWallet') {
                let { visible } = e.payload as {
                    visible: boolean;
                };
                onShowWallet(visible);
            }
            if (e.action === 'openMainTabUrl') {
                let { url } = e.payload as {
                    url: string;
                };
                openUrl(url);
            }
            if (e.action === 'openMainTab') {
                let { tabId } = e.payload as {
                    tabId: string;
                };
                openTab(tabId);
            }
            if (e.action === 'getNetwork') {
                let { fromWinId } = e.payload as {
                    fromWinId: string;
                };
                const { network } = getSessionCacheInfo('cacheInfo');
                onAction('subWin', {
                    toWinId: fromWinId,
                    action: 'onGetNetwork',
                    payload: {
                        network
                    }
                });
            }
            if (e.action === 'getConnectedApps') {
                const { connections } = getSessionCacheInfo('cacheInfo');
                let { fromWinId } = e.payload as {
                    fromWinId: string;
                };
                console.log('getPayCommentOrder', fromWinId);
                onAction('subWin', {
                    toWinId: fromWinId,
                    action: 'onGetConnectedApps',
                    payload: {
                        connections: connections || []
                    }
                });
            }
            if (e.action === 'getPayCommentOrder') {
                let { payCommentOrderId, fromWinId } = e.payload as {
                    payCommentOrderId: string;
                    fromWinId: string;
                };
                console.log('getPayCommentOrder', payCommentOrderId);
                const order = await new PayCommentOrderService().get(payCommentOrderId);
                if (!order?.isOk) {
                    window.dispatchEvent(new CustomEvent('finishPay', {}));
                } else {
                    onCheckPayCommentOrder(false);
                }
                onAction('subWin', {
                    toWinId: fromWinId,
                    action: 'onGetPayCommentOrder',
                    payload: {
                        order
                    }
                });
            }
            if (e.action === 'delPayCommentOrder') {
                let { payCommentOrderId } = e.payload as {
                    payCommentOrderId: string;
                };
                await new PayCommentOrderService().remove(payCommentOrderId);
            }
            if (e.action === 'onSendTransfer') {
                let { address, amount, comment, winId, mainNet, jetton, needPayOrder } =
                    e.payload as SendTransferPayload;
                if (mainNet) {
                    mutateDevSettings({ tonNetwork: Network.MAINNET });
                }
                if (!jetton) {
                    jetton = 'TON';
                }
                if (needPayOrder && comment) {
                    setPayCommentOrder({
                        id: genId(),
                        winId,
                        symbol: jetton,
                        amount: String(amount),
                        address,
                        ts: currentTs(),
                        comment
                    });
                } else {
                    setPayCommentOrder(null);
                }

                const amount1 = String(format(String(amount * 1000000000)));

                sendTransfer({
                    transfer: {
                        address,
                        amount: amount1,
                        text: comment || '',
                        jetton
                    },
                    asset: jetton
                });
            }
            if (e.action === 'onPayPro') {
                onShowProBuyDialog(true);
            }
            if (e.action === 'changeAccount') {
                const { accountIndex } = e.payload!;
                if (activeAcount.type === 'mam') {
                    const { derivations } = activeAcount as AccountMAM;
                    const account = derivations.find(row => row.index === accountIndex);
                    if (account) {
                        setActiveAccount(account.activeTonWalletId);
                    }
                }
            }

            if (e.action === 'openTab') {
                openUrl(e.payload!.url);
            }
            if (e.action === 'getProInfo') {
                const proInfoList = await new ProService(
                    getAccountIdFromAccount({ id: accountId, index: index })
                ).getAll();
                onAction('subWin', {
                    toWinId: e.fromWinId!,
                    action: 'updateProInfo',
                    payload: {
                        proInfoList
                    }
                });
            }
            if (e.action === 'getAccountsPublic') {
                setAccountsList((accounts: AccountPublic[]) => {
                    onAction('subWin', {
                        fromWinId: 'main',
                        toWinId: e.fromWinId,
                        action: 'accountsPublic',
                        payload: { accounts }
                    });
                    return accounts;
                });
            }
        });
    }, []);

    return <>{checkPayCommentOrder && <PayCommentOrderBackgroundPage />}</>;
}
