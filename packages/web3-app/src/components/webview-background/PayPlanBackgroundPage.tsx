import { View } from '@web3-explorer/uikit-view';
import { useTimeoutLoop } from '@web3-explorer/utils';
import { WebviewTag } from 'electron';
import { useEffect, useState } from 'react';
import { onAction } from '../../common/electron';
import WebViewBrowser from '../../components/webview/WebViewBrowser';
import { useAccountAddress, useBlockChainExplorer } from '../../hooks/wallets';
import { usePro } from '../../providers/ProProvider';
import WebviewService from '../../services/WebviewService';
import { PRO_LEVEL, ProInfoProps, SUB_WIN_ID, WebveiwEventType } from '../../types';
let address = '';

export function PayPlanBackgroundPage() {
    address = useAccountAddress();
    const { proRecvAddress, updateOrderComment, orderComment } = usePro();
    const url = useBlockChainExplorer().replace('%s', proRecvAddress);
    const [webview, setWebview] = useState<null | WebviewTag>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { onChangeProInfo } = usePro();
    useEffect(() => {
        const ws = new WebviewService('Explore');
        if (ws.webviewIsReady()) {
            ws.goTo(url);
        }
    }, [url]);
    const checkProLevel = async (orderComment: string) => {
        setLoading(true);
        const ws = new WebviewService('Explore');
        const content = await ws.waitForElemenBoundingClientRect(`.tx-mobile-comment__contents`, 0);
        console.log('comment__contents', content);

        if (content) {
            const rows = await ws.execJs(
                `
                const rows = document.querySelectorAll(".tx-mobile-content");
                const items = []
                rows.forEach(row=>{
                    const comment = row.querySelector(".tx-mobile-comment__contents")?.textContent
                    const amount = row.querySelector(".tx-amount--in")?.textContent
                    items.push({amount,comment})
                })
                return items;`
            );
            let flag = false;
            const [level, amount1, accountIndex, ts, id] = orderComment.split('/');

            if (rows && rows.length > 0) {
                for (let index = 0; index < rows.length; index++) {
                    const { amount, comment } = rows[index] as { amount: string; comment: string };
                    if (
                        amount &&
                        comment &&
                        comment.toLowerCase().indexOf(orderComment.toLowerCase()) > -1 &&
                        amount.replace(' TON', '') === amount1
                    ) {
                        flag = true;
                        break;
                    }
                }
            }
            if (flag) {
                const proInfo: ProInfoProps = {
                    level: level as PRO_LEVEL,
                    amount: Number(amount1),
                    index: Number(accountIndex),
                    ts: Number(ts),
                    id
                };
                onChangeProInfo(proInfo);
                updateOrderComment('');
                onAction('subMin', {
                    toWinId: SUB_WIN_ID.PLAYGROUND,
                    action: 'onChangeProInfo',
                    payload: {
                        proInfo
                    }
                });
                window.dispatchEvent(new CustomEvent('updatePayPlan', {}));
                return;
            }
        }
        setLoading(false);
    };
    useTimeoutLoop(async () => {
        if (orderComment && !loading) {
            const ws = new WebviewService('Explore');
            if (ws.webviewIsReady()) {
                ws.goTo(url);
            }
        }
    }, 5000);
    const onEvent = async (webview1: WebviewTag, eventType: WebveiwEventType, payload: any) => {
        const ws = new WebviewService('Explore');
        switch (eventType) {
            case 'dom-ready': {
                console.log('BalanceBackgroundPage', 'dom-ready');
                if (!webview) {
                    setWebview(webview1);
                }

                checkProLevel(orderComment);
                setLoading(true);
                break;
            }
            default: {
                break;
            }
        }
    };
    const onSiteMessage = async ({
        action,
        payload
    }: {
        action: string;
        payload?: Record<string, any> | undefined;
    }) => {};
    return (
        <View wh100p relative>
            <View wh100p opacity={1}>
                <WebViewBrowser
                    url={url}
                    tabId={'Explore'}
                    partitionId={'Explore'}
                    webviewProps={{
                        onSiteMessage,
                        onEvent
                    }}
                />
            </View>
        </View>
    );
}
