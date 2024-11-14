import Loading from '@web3-explorer/uikit-mui/dist/components/Loading';
import { View } from '@web3-explorer/uikit-view';
import { useTimeoutLoop } from '@web3-explorer/utils';
import { WebviewTag } from 'electron';
import { useEffect, useState } from 'react';
import WebViewBrowser from '../../components/webview/WebViewBrowser';
import {
    useAccountAddress,
    useBlockChainExplorer,
    usePublicAccountsInfo
} from '../../hooks/wallets';
import { usePro } from '../../providers/ProProvider';
import WebviewService from '../../services/WebviewService';
import { PRO_LEVEL, WebveiwEventType } from '../../types';
let address = '';
export function BalanceBackgroundPage() {
    address = useAccountAddress();
    const accounts = usePublicAccountsInfo();
    const url = useBlockChainExplorer().replace(
        '%s',
        accounts.find(row => row.index === 0)!.address
    );
    const [webview, setWebview] = useState<null | WebviewTag>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { onChangeProLevel } = usePro();
    useEffect(() => {
        const ws = new WebviewService('Explore');
        if (ws.webviewIsReady()) {
            ws.goTo(url);
        }
    }, [url]);
    const checkProLevel = async () => {
        const ws = new WebviewService('Explore');

        const content = await ws.waitForElemenBoundingClientRect(`.tx-table`, 0);
        console.log('content', content);
        if (content) {
            const adr = '0QAonoXuQ_1WzZhwbuoIHYFwBqkVCmZSf-yr0DQ1uhnIzyZq';
            const flag = await ws.execJs(
                `
                const rows = document.querySelectorAll(".tx-table .tx-table-cell-icon--out");
                let flag = false
                rows.forEach(row=>{
                    const h = row.parentElement.innerHTML;
                    console.log(h)
                    if(h.toLowerCase().indexOf("${adr.toLowerCase()}") > -1){
                        flag = true;
                    }
                })
                return flag`
            );
            console.log('checkProLevel', address, flag);
            onChangeProLevel(flag ? PRO_LEVEL.LONG : PRO_LEVEL.COMMON);
        }
    };
    useTimeoutLoop(async () => {
        const ws = new WebviewService('Explore');
        if (ws.webviewIsReady()) {
            ws.goTo(url);
        }
    }, 10000);
    const onEvent = async (webview1: WebviewTag, eventType: WebveiwEventType, payload: any) => {
        const ws = new WebviewService('Explore');
        switch (eventType) {
            case 'did-stop-loading':
                break;
            case 'dom-ready': {
                console.log('BalanceBackgroundPage', 'dom-ready');
                if (!webview) {
                    setWebview(webview1);
                }

                checkProLevel();

                setLoading(false);
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
            <View center absFull hide={!loading}>
                <Loading />
            </View>
        </View>
    );
}
