import { formatDecimals } from '@tonkeeper/core/dist/utils/balance';
import { formatAddress } from '@tonkeeper/core/dist/utils/common';
import { useFetchFilteredActivity } from '@tonkeeper/uikit/dist/state/activity';
import { getMixedActivity } from '@tonkeeper/uikit/dist/state/mixedActivity';
import { useTimeoutLoop } from '@web3-explorer/utils';
import { useMemo } from 'react';
import { onAction } from '../../common/electron';
import { currentTs } from '../../common/utils';
import { usePro } from '../../providers/ProProvider';
import PayCommentOrderService from '../../services/PayCommentOrderService';
import { PayCommentOrder, PRO_LEVEL, ProInfoProps, SUB_WIN_ID, TonHistoryItem } from '../../types';

export function PayCommentOrderBackgroundPage() {
    const { onCheckPayCommentOrder } = usePro();
    const checkOrder = async (order: PayCommentOrder, rows: TonHistoryItem[]) => {
        if (rows.length === 0) {
            return;
        }
        const { checkProLevel, comment } = order;
        const transfer = rows.find((row: TonHistoryItem) => row.comment === comment);
        console.debug('PayCommentOrder transfer:', transfer);
        if (!transfer || transfer.status !== 'ok') {
            return;
        }

        if (transfer.amount !== Number(order.amount)) {
            return;
        }
        const orderSymbol = order.symbol.toLowerCase();
        const isTonOrder = orderSymbol === 'ton';
        if (isTonOrder && !transfer.isTon) {
            return;
        }
        if (
            !isTonOrder &&
            (!transfer.jetton || transfer.jetton.symbol.toLowerCase() !== orderSymbol)
        ) {
            return;
        }

        await new PayCommentOrderService().save(order.id, {
            ...order,
            ts1: currentTs(),
            isOk: true
        });
        onCheckPayCommentOrder(false);
        if (checkProLevel) {
            handleProLevel(order.id, comment);
        }

        return transfer;
    };
    const { onChangeProInfo } = usePro();
    const handleProLevel = async (orderId: string, orderComment: string) => {
        const [amount1, level, ts, promo, id] = orderComment.split('/');
        const proInfo: ProInfoProps = {
            level: level as PRO_LEVEL,
            amount: Number(amount1),
            index: Number(id.substring(0, 1)),
            ts: Number(ts) * 1000,
            id: id.substring(1)
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

    const { data: tonEvents } = useFetchFilteredActivity();

    const activity = useMemo(() => {
        return getMixedActivity(tonEvents, undefined);
    }, [tonEvents]);
    useTimeoutLoop(async () => {
        if (activity.length > 0) {
            const rows: TonHistoryItem[] = [];
            activity.forEach(row => {
                const { kind, event } = row.event;
                const { actions, timestamp } = event as any;
                actions.forEach((element: any) => {
                    const { status, tonTransfer, jettonTransfer } = element;
                    let comment = '';
                    let fromAddress = '';
                    let toAddress = '';
                    let isTon = false;
                    let amount = 0;
                    let jetton;
                    if (tonTransfer) {
                        isTon = true;
                        comment = tonTransfer.comment;
                        amount = formatDecimals(tonTransfer.amount, 9);
                        fromAddress = formatAddress(tonTransfer.sender.address);
                        toAddress = formatAddress(tonTransfer.recipient.address);
                    }
                    if (jettonTransfer) {
                        jetton = {
                            ...jettonTransfer.jetton,
                            address: formatAddress(jettonTransfer.jetton.address)
                        };
                        amount = formatDecimals(jettonTransfer.amount, jetton.decimals);
                        comment = jettonTransfer.comment;
                        fromAddress = formatAddress(jettonTransfer.sender.address);
                        toAddress = formatAddress(jettonTransfer.recipient.address);
                    }
                    rows.push({
                        kind,
                        jetton,
                        timestamp,
                        amount,
                        isTon,
                        status,
                        comment,
                        fromAddress,
                        toAddress
                    });
                });
            });

            const orders = await new PayCommentOrderService().getAll();
            console.debug('PayCommentOrder', orders);

            if (orders.length > 0) {
                const orders1 = orders.filter(row => !row.isOk);
                if (!orders1 || orders1.length === 0) {
                    return;
                }
                orders1.sort((a, b) => a.ts - b.ts);
                const order = orders1[0];
                await checkOrder(order, rows);
                return;
            }
        }
    });
    return null;
}
