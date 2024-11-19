import { View } from '@web3-explorer/uikit-view';
import { WebviewTag } from 'electron';
import { useState } from 'react';
import WebViewBrowser from '../../components/webview/WebViewBrowser';
import WebviewService from '../../services/WebviewService';
import { WebveiwEventType } from '../../types';

export function FeatureLibBackground({ url }: { url: string }) {
    const [webview, setWebview] = useState<null | WebviewTag>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const tabId = 'FeatureLibBackground';
    const pid = 'FeatureLibBackground';
    const onEvent = async (webview1: WebviewTag, eventType: WebveiwEventType, payload: any) => {
        switch (eventType) {
            case 'dom-ready': {
                if (!webview) {
                    setWebview(webview1);
                }
                const ws = new WebviewService(tabId);
                console.log('FeatureLibBackground', 'dom-ready');

                const text = await ws.waitForExecJsResult(`return document.body.textContent;`);
                console.log('FeatureLibBackground', 'dom-ready', text);

                setLoading(true);
                break;
            }
            default: {
                break;
            }
        }
    };

    return (
        <View wh100p relative>
            <View wh100p opacity={1}>
                <WebViewBrowser
                    url={url}
                    tabId={tabId}
                    partitionId={pid}
                    webviewProps={{
                        onEvent
                    }}
                />
            </View>
        </View>
    );
}
