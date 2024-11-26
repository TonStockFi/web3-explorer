import { View } from '@web3-explorer/uikit-view/dist/View';
import { WebviewTag } from 'electron';
import { useState } from 'react';

import { START_URL } from '../../../constant';
import LLMGeminiService from '../../../services/LLMGeminiService';
import LogService from '../../../services/LogService';
import WebviewService from '../../../services/WebviewService';
import { WebveiwEventType } from '../../../types';
import { LoadingView } from '../../LoadingView';
import WebViewBrowser from '../WebViewBrowser';

export function LLmWebview({ url, tabId, pid }: { pid: string; url: string; tabId: string }) {
    const [loading, setLoading] = useState<boolean>(true);

    const onEvent = async (
        webview: WebviewTag,
        eventType: WebveiwEventType,
        payload: any,
        webContentsId: number
    ) => {
        if (eventType === 'did-start-navigation') {
            const { isMainFrame, url } = payload;
        }

        if (eventType === 'console-message') {
            const res = LLMGeminiService.parseMasterTabIdFromTabId(tabId);
            if (res && res.tabId) {
                LogService.handleConsoleLogMessage(res.tabId, payload);
            }
        }
    };

    const onStopLoading = async () => {
        setLoading(false);
    };

    const onReady = async () => {
        setLoading(false);
        const ws = new WebviewService(tabId);
        const { url: url1 } = ws.getWebviewUrlUri();
        if (url1 === START_URL) {
            ws.goTo(url);
        }
    };

    return (
        <View flex1 h100p borderBox>
            <WebViewBrowser
                hideBoxShadow
                url={START_URL}
                tabId={tabId}
                partitionId={pid}
                webviewProps={{
                    onContextMenu: (e: { params: any; webContentsId: number; tabId: string }) => {
                        console.log('onContextMenu', e);
                        window.dispatchEvent(
                            new CustomEvent('onWebviewContextMenu', {
                                detail: e
                            })
                        );
                    },

                    onError: error => {
                        setLoading(false);
                    },
                    onEvent,
                    onStopLoading,
                    onSiteMessage: async (message: {
                        action: string;
                        payload?: Record<string, any>;
                    }) => {
                        console.log('onSiteMessage', message);
                    },
                    onReady
                }}
            />
            <LoadingView
                borderRadius={8}
                onRefresh={async () => {
                    const ws = new WebviewService(tabId);
                    if (ws.getWebview()) {
                        ws.getWebview()!.stop();
                    }
                    ws.goTo(url);
                    setLoading(true);
                }}
                loading={loading}
                setLoading={(loading: boolean) => setLoading(loading)}
            />
        </View>
    );
}
