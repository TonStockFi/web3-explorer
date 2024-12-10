import { useBrowserContext } from '../providers/BrowserProvider';
import { PayCommentOrder, SendTransferPayload } from '../types';

import { AccountMAM } from '@tonkeeper/core/dist/entries/account';
import { Network } from '@tonkeeper/core/dist/entries/network';
import { useSendTransferNotification } from '@tonkeeper/uikit/dist/components/modals/useSendTransferNotification';
import { useFormatCoinValue } from '@tonkeeper/uikit/dist/hooks/balance';
import { useMutateDevSettings } from '@tonkeeper/uikit/dist/state/dev';
import { useActiveWalletTonConnectConnections } from '@tonkeeper/uikit/dist/state/tonConnect';
import {
    useActiveAccount,
    useActiveTonNetwork,
    useMutateActiveTonWallet
} from '@tonkeeper/uikit/dist/state/wallet';
import { useEffect, useState } from 'react';
import { onAction } from '../common/electron';
import { genId } from '../common/helpers';
import { currentTs } from '../common/utils';
import { useAccountInfo, usePublicAccountsInfo } from '../hooks/wallets';
import { usePro } from '../providers/ProProvider';
import PayCommentOrderService from '../services/PayCommentOrderService';
import ProService from '../services/ProService';
import { PayCommentOrderBackgroundPage } from './webview-background/PayCommentOrderBackgroundPage';
import { getSessionCacheInfo } from './webview/WebviewDiscoverApps';

export function MainMessageDispatcher() {
    const { onShowProBuyDialog, checkPayCommentOrder, onCheckPayCommentOrder } = usePro();
    const { openUrl, openTab } = useBrowserContext();
    const accounts = usePublicAccountsInfo();
    const { id: accountId } = useAccountInfo();
    const activeAcount = useActiveAccount();
    const network = useActiveTonNetwork();
    const { data: connections } = useActiveWalletTonConnectConnections();
    const { mutateAsync: setActiveAccount } = useMutateActiveTonWallet();
    const { onOpen: sendTransfer } = useSendTransferNotification();
    const format = useFormatCoinValue();
    const [_, setPayCommentOrder] = useState<null | PayCommentOrder>(null);
    const { mutate: mutateDevSettings } = useMutateDevSettings();
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
        window.backgroundApi &&
            window.backgroundApi.onMainMessage(async (e: any) => {
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
                    const { accountIndex } = e.payload;
                    if (activeAcount.type === 'mam') {
                        const { derivations } = activeAcount as AccountMAM;
                        const account = derivations.find(row => row.index === accountIndex);
                        if (account) {
                            setActiveAccount(account.activeTonWalletId);
                        }
                    }
                }

                if (e.action === 'openTab') {
                    openUrl(e.payload.url);
                }
                if (e.action === 'getProInfo') {
                    const proInfoList = await new ProService(accountId).getAll();
                    onAction('subWin', {
                        toWinId: e.fromWinId,
                        action: 'updateProInfo',
                        payload: {
                            proInfoList
                        }
                    });
                }
                if (e.action === 'getAccountsPublic') {
                    onAction('subWin', {
                        fromWinId: 'main',
                        toWinId: e.fromWinId,
                        action: 'accountsPublic',
                        payload: { accounts }
                    });
                }
            });
    }, []);

    return <>{checkPayCommentOrder && <PayCommentOrderBackgroundPage />}</>;
}
