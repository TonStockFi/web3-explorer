import ErrorWebview from '@web3-explorer/uikit-desk/dist/components/ErrorWebview';
import { Loading } from '@web3-explorer/uikit-mui';
import { View } from '@web3-explorer/uikit-view';
import { useEffect, useRef, useState } from 'react';
import { GLOBAL_CSS, USER_AGENT } from '../../common/constant';
import { getPartitionKey } from '../../common/utils';
import { WebviewProps } from '../../types';
import {WebviewTag} from "electron";

const WebViewBrowser = ({
    webviewProps,
    webviewWidth,
    webviewHeight,
    url,
    partitionId,
    setWebview,
}: {
    webviewProps?: WebviewProps;
    topBarHeight: number;
    webviewWidth?: number;
    webviewHeight?: number;
    partitionId: string;
    url: string;
    setWebview: any;
}) => {
    const webviewRef = useRef(null);
    const [error, setError] = useState<null | { errorCode: number; errorDescription: string }>(
        null
    );
    const [isReady, setIsReady] = useState(false);
    const [env, setEnv] = useState<null|{__dirname:string}>(null);

    useEffect(() => {
        window.backgroundApi && window.backgroundApi
            .message({
                king: 'onAction',
                payload: {
                    action: 'getEnv'
                }
            })
            .then((env:any) => {
                setEnv(env as {__dirname:string});
            });
    }, []);

    useEffect(() => {
        if (!env) {
            return;
        }
        if (!webviewRef.current) {
            return;
        }
        const webview = webviewRef.current as WebviewTag;
        setWebview(webview);

        let loadFailed = false;
        let isMounted = true;

        const events: Record<string, any> = {
            'load-commit': async () => {},
            'did-start-loading': () => {
                loadFailed = false;
            },
            'did-fail-load': ({
                errorCode,
                errorDescription
            }: {
                errorCode: number;
                errorDescription: string;
            }) => {
                console.error('did-fail-load', errorCode, errorDescription);
                if (errorDescription) {
                    setError({ errorCode, errorDescription });
                    loadFailed = true; // Set the flag to true when load fails
                }
            },
            'did-finish-load': async () => {},
            'dom-ready': async () => {
                if (loadFailed) {
                    console.error('Skipping dom-ready due to load failure.');
                    return;
                }
                if (loadFailed) {
                    console.error('Skipping did-finish-load due to load failure.');
                    return;
                }
                if (!webview.isAudioMuted()) {
                    webview.setAudioMuted(true);
                }
                await webview.insertCSS(GLOBAL_CSS);
                if (webview.getURL().indexOf('web.telegram.org/a') > -1) {
                    await webview.insertCSS(`.MessageSelectToolbar{display: none!important;}`);
                }
                if (webviewProps?.insertCss) {
                    await webview.insertCSS(webviewProps?.insertCss);
                }
                if (webviewProps?.insertJs) {
                    webview.executeJavaScript(webviewProps?.insertJs);
                }
                setError(null);
                webviewProps?.onReady && (await webviewProps.onReady(webview));

                if (webviewProps && webviewProps.onSiteMessage) {
                    window.backgroundApi.onSiteMessage(
                        async (event: {
                            senderWebContentsId: number;
                            message: { action: string; payload?: Record<string, any> };
                        }) => {
                            if (!isMounted) {
                                return;
                            }
                            try {
                                const webContentsId = webview.getWebContentsId();
                                if (event.senderWebContentsId === webContentsId) {
                                    if (webviewProps.onSiteMessage) {
                                        await webviewProps.onSiteMessage(event.message, webview);
                                    }
                                }
                            }catch (e){
                                console.error(e)
                            }
                        }
                    );
                }
                setIsReady(true);
            }
        };

        Object.keys(events).forEach(key => {
            if (events[key]) {
                webview.addEventListener(key, events[key]);
            }
        });
        return () => {
            isMounted = false;
            if (webview) {
                Object.keys(events).forEach(key => {
                    if (events[key]) {
                        webview.removeEventListener(key, events[key]);
                    }
                });
            }
        };
    }, [env]);
    const partition = getPartitionKey(partitionId);

    if (!env) {
        return null;
    }
    const preload = `${env.__dirname}/../renderer/site/preload.js`;
    return (
        <View w={webviewWidth} absolute top={0} left={0} h={webviewHeight} sx={{ zIndex: 1 }}>
            <webview
                useragent={USER_AGENT}
                ref={webviewRef}
                partition={partition}
                src={url}
                style={{
                    display: 'inline-flex',
                    width: '100%',
                    height: '100%'
                }}
                webpreferences={`nodeIntegration,preload=${preload}`}
            />
            <View hide={!!error || isReady} absFull center>
                <Loading />
            </View>
            {!!error && (
                <ErrorWebview
                    onClick={() => {
                        if(webviewRef.current){
                            const webview = webviewRef.current as WebviewTag;
                            webview.reload();
                        }
                        setError(null);
                    }}
                    errorDescription={error.errorDescription}
                />
            )}
        </View>
    );
};
export default WebViewBrowser;
