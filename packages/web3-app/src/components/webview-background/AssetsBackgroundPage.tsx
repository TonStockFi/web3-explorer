import { View } from '@web3-explorer/uikit-view';
import { WebviewTag } from 'electron';
import { useState } from 'react';
import { onAction } from '../../common/electron';
import WebViewBrowser from '../../components/webview/WebViewBrowser';
import { useBlockChainExplorerTonViewer } from '../../hooks/wallets';
import WebviewService from '../../services/WebviewService';
import { AccountPublic, WebveiwEventType } from '../../types';

export function AssetsBackgroundPage({
    parentTabId,
    account
}: {
    parentTabId: string;
    account: AccountPublic;
}) {
    const url = useBlockChainExplorerTonViewer().replace('%s', account.address);
    const [webview, setWebview] = useState<null | WebviewTag>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const tabId = 'AssetsBackgroundPage';
    const pid = 'AssetsBackgroundPage';
    const onEvent = async (webview1: WebviewTag, eventType: WebveiwEventType, payload: any) => {
        switch (eventType) {
            case 'dom-ready': {
                if (!webview) {
                    setWebview(webview1);
                }
                const ws = new WebviewService(tabId);
                console.log('AssetsBackgroundPage', 'dom-ready');

                const text = await ws.execJs(
                    `return document.querySelector("#__next > div.cdfkt4l > div.c1sl3usg > div.cedeugn > div.c2te7p5 > div.cwhsyqn > div").textContent`
                );
                console.log('AssetsBackgroundPage', text);
                const ton = text
                    .substring(text.indexOf('Balance') + 'Balance'.length, text.indexOf('TON≈'))
                    .trim();
                console.log('AssetsBackgroundPage', { ton });
                const ws1 = new WebviewService(parentTabId);
                onAction(
                    'sendToSite',
                    {
                        action: 'updateBalance',
                        payload: {
                            account,
                            ton
                        }
                    },
                    ws1.getWebviewContentsId()
                );
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
                    tabId={tabId}
                    partitionId={pid}
                    webviewProps={{
                        onSiteMessage,
                        onEvent
                    }}
                />
            </View>
        </View>
    );
}
