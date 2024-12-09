import { Network } from '@tonkeeper/core/dist/entries/network';
import { useActiveTonNetwork } from '@tonkeeper/uikit/dist/state/wallet';
import { View } from '@web3-explorer/uikit-view';
import { useTimeoutLoop } from '@web3-explorer/utils';
import { useState } from 'react';
import { onAction } from '../../common/electron';
import { currentTs } from '../../common/utils';
import { START_URL } from '../../constant';
import { useAccountAddress, useBlockChainExplorer } from '../../hooks/wallets';
import { useIAppContext } from '../../providers/IAppProvider';
import { usePro } from '../../providers/ProProvider';
import PayCommentOrderService from '../../services/PayCommentOrderService';
import WebviewService from '../../services/WebviewService';
import { PayCommentOrder, PRO_LEVEL, ProInfoProps, SUB_WIN_ID } from '../../types';
import WebViewBrowser from '../webview/WebViewBrowser';

export function PayCommentOrderBackgroundPage() {
    const address = useAccountAddress();
    const { onCheckPayCommentOrder } = usePro();
    const { env } = useIAppContext();
    const network = useActiveTonNetwork();
    const baseUrl = useBlockChainExplorer(env.isDev ? network : Network.MAINNET);

    const [loading, setLoading] = useState<boolean>(false);
    const service = new WebviewService('');

    const checkOrder = async (order: PayCommentOrder) => {
        const { address, checkProLevel, comment } = order;
        setLoading(true);
        await service.waitwebviewIsReady();
        const url = baseUrl.replace('%s', address);
        service.goTo(url);
        const res = await service.waitForExecJsResult('return location.href', 5000);
        if (!res) {
            return;
        }
        if (res.toLowerCase().indexOf(address.toLowerCase()) === -1) {
            return;
        }
        const content = await service.waitForElemenBoundingClientRect(
            `.tx-mobile-comment__contents`,
            5000
        );
        console.debug('PayCommentOrder tx-mobile-comment__contents', { content });
        if (content) {
            const rows = await service.execJs(
                `const rows = document.querySelectorAll(".tx-mobile-content");
                const items = []
                rows.forEach(row=>{
                    const comment = row.querySelector(".tx-mobile-comment__contents")?.textContent
                    const amount = row.querySelector(".tx-amount--in")?.textContent
                    items.push({amount,comment,text:row.innerHTML})
                })
                return items;`
            );
            // debugger;
            if (rows.length === 0) {
                return;
            }
            const res = rows.find((row: PayCommentOrder) => row.comment === comment);
            console.debug('PayCommentOrder res:', res);
            if (!res) {
                return;
            }
            if (!res.amount || res.amount.split(' ').length !== 2) {
                return;
            }
            if (res.amount.split(' ')[0].trim() !== order.amount) {
                return;
            }

            if (res.amount.split(' ')[1].trim().toLowerCase() !== order.symbol.toLowerCase()) {
                return;
            }
            console.debug('PayCommentOrder ok', res);

            await new PayCommentOrderService().save(order.id, {
                ...order,
                ts1: currentTs(),
                isOk: true
            });
            onCheckPayCommentOrder(false);
            if (checkProLevel) {
                handleProLevel(order.id, comment);
            }

            return res;
        }
    };
    const { onChangeProInfo } = usePro();
    const handleProLevel = async (orderId: string, orderComment: string) => {
        const [level, amount1, accountIndex, ts, id] = orderComment.split('/');

        const proInfo: ProInfoProps = {
            level: level as PRO_LEVEL,
            amount: Number(amount1),
            index: Number(accountIndex),
            ts: Number(ts),
            id
        };
        onChangeProInfo(proInfo);
        await new PayCommentOrderService().remove(orderId);
        onAction('subWin', {
            toWinId: SUB_WIN_ID.PLAYGROUND,
            action: 'onChangeProInfo',
            payload: {
                proInfo
            }
        });
        window.dispatchEvent(new CustomEvent('updatePayPlan', {}));
        return;
    };
    useTimeoutLoop(async () => {
        // await checkOrder({
        //     comment: 'MONTH/0.00999/2/1731612266866/TK1jewM0JbFdb1f7mWsTlk17',
        //     id: '1',
        //     amount: '11',
        //     checkProLevel: true,
        //     address: address,
        //     ts: 0
        // });

        const orders = await new PayCommentOrderService().getAll();
        console.debug('PayCommentOrder', orders);

        if (orders.length > 0) {
            const orders1 = orders.filter(row => !row.isOk);
            if (!orders1 || orders1.length === 0) {
                return;
            }
            orders1.sort((a, b) => a.ts - b.ts);
            const order = orders1[0];
            await checkOrder(order);
            return;
        }
        setLoading(false);
    });

    if (!loading) {
        return null;
    }
    return (
        <View absFull zIndex={-1000} width={320} relative>
            <WebViewBrowser
                url={START_URL}
                tabId={service.getTabId()}
                partitionId={'pay_order'}
                webviewProps={{}}
            />
        </View>
    );
}
