import { md5 } from '@web3-explorer/lib-crypto/dist/utils';
import { View } from '@web3-explorer/uikit-view';
import { WebviewTag } from 'electron';
import { useEffect, useRef, useState } from 'react';
import { currentTs, getPartitionKey } from '../../common/utils';
import { GLOBAL_CSS } from '../../constant';
import { useIAppContext } from '../../providers/IAppProvider';
import BrowserFavoricoService from '../../services/BrowserFavoricoService';
import BrowserHistoryService from '../../services/BrowserHistoryService';
import WebviewMuteService from '../../services/WebviewMuteService';
import { WebveiwEventType, WebviewProps } from '../../types';
import ErrorWebview from '../ErrorWebview';
export const TabIdAccountIndexMap: Map<string, number> = new Map();
export const TabIdUrlMap: Map<string, string> = new Map();
export const WebveiwContentsIdTabIdMap: Map<number, string> = new Map();
export const TabIdWebveiwContentsIddMap: Map<string, number> = new Map();
export const TabIdWebviewMap: Map<string, WebviewTag> = new Map();
export const TabIdWebviewReadyMap: Map<string, boolean> = new Map();
export const TabIdWebveiwSizedMap: Map<string, { width: number; height: number }> = new Map();

function getOriginFromUrl({ url }: { url: string }): string {
    try {
        const urlInfo = new URL(url);
        const { origin } = urlInfo;
        return origin || '';
    } catch (error) {
        console.error(error);
    }
    return '';
}

export function checkOneKeyCardGoogleOauthUrl({ url }: { url: string }): boolean {
    const origin = getOriginFromUrl({ url });
    return ['https://accounts.google.com'].includes(origin);
}

export function focusWebviewStopFindInPage(tabId: string) {
    const webview = TabIdWebviewMap.get(tabId);
    if (webview) {
        webview.stopFindInPage('clearSelection');
    }
}

export function focusWebviewFindInPage(
    tabId: string,
    text: string,
    options?: { forward?: boolean; findNext?: boolean }
) {
    const webview = TabIdWebviewMap.get(tabId);

    if (webview) {
        webview.findInPage(text, options);
    }
}

export async function getFocusWebviewSelection(tabId: string) {
    const webview = TabIdWebviewMap.get(tabId);

    if (webview) {
        return await webview.executeJavaScript(`
        window.getSelection().toString();
        `);
    } else {
        return '';
    }
}

export function getTabIdByWebviewContentsId(id: number) {
    return WebveiwContentsIdTabIdMap.get(id);
}

export function getUrlByTabId(tabId: string) {
    return TabIdUrlMap.get(tabId) || '';
}

export function getAccountIndexByTabId(tabId: string) {
    return TabIdAccountIndexMap.get(tabId) || 0;
}
export function getWebviewContentsIdByTabId(tabId: string) {
    return TabIdWebveiwContentsIddMap.get(tabId);
}
export function getFocusWebviewByTabId(tabId: string) {
    return TabIdWebviewMap.get(tabId);
}

export function getFocusWebviewIsReadyByTabId(tabId: string) {
    return TabIdWebviewReadyMap.get(tabId);
}

export const getFocusWebview = (webviewContentsId: number) => {
    const tabId = WebveiwContentsIdTabIdMap.get(webviewContentsId);
    if (tabId) {
        return TabIdWebviewMap.get(tabId);
    }
    return null;
};

export const focusWebviewReload = (webviewContentsId: number) => {
    const webview = getFocusWebview(webviewContentsId);
    if (webview) {
        webview.reload();
    }
};

const UrlFavorIconMap: Map<string, string> = new Map();
const UrlTitleMap: Map<string, { desc: string; title: string; id: string }> = new Map();

export function getTitleFromUrl(url: string) {
    console.log('getTitleFromUrl', UrlTitleMap, url);
    return UrlTitleMap.get(url) ? UrlTitleMap.get(url)?.title : '';
}

const WebViewBrowser = ({
    webviewProps,
    borderRadius,
    url,
    partitionId,
    tabId,
    accountIndex
}: {
    accountIndex?: number;
    borderRadius?: number;
    hideBoxShadow?: boolean;
    tabId: string;
    webviewProps?: WebviewProps;
    partitionId: string;
    url: string;
}) => {
    TabIdAccountIndexMap.set(tabId, accountIndex || 0);
    const ref = useRef<null | HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const updateSize = () => {
            if (ref.current) {
                const size = {
                    width: ref.current.clientWidth,
                    height: ref.current.clientHeight
                };
                if (size.width === 0) {
                    setTimeout(() => {
                        updateSize();
                    }, 1000);
                } else {
                    TabIdWebveiwSizedMap.set(tabId, size);
                    setSize(size);
                }
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    const [initUrl] = useState(url);
    function siteLoading(loading: boolean) {
        webviewProps?.onLoading && webviewProps?.onLoading(loading);
        window.dispatchEvent(
            new CustomEvent('siteLoading_' + tabId, {
                detail: {
                    loading
                }
            })
        );
    }
    const webviewRef = useRef(null);
    const [error, setError] = useState<null | {
        errorCode: number;
        validatedURL: string;
        errorDescription: string;
    }>(null);
    const { env } = useIAppContext();
    useEffect(() => {
        siteLoading(true);
        if (!webviewRef.current) {
            return;
        }

        const webview = webviewRef.current as WebviewTag;
        TabIdWebviewMap.set(tabId, webview);
        let loadFailed = false;
        let webContentsId: number;
        const handleOnSiteMessage = (event: {
            detail: {
                message: {
                    action: string;
                    payload?: Record<string, any>;
                };
            };
        }) => {
            const { message } = event.detail;
            webviewProps!.onSiteMessage!(message, webview);
        };

        const onEvent = (eventType: WebveiwEventType, payload?: any) => {
            const { isMainFrame, url } = payload || {};
            if (url && isMainFrame) {
                //console.log('> _ET:', eventType, isMainFrame, url);
            } else {
                //console.log('> _ET:', eventType, payload);
            }
            webviewProps?.onEvent &&
                webviewProps?.onEvent(webview, eventType, payload || {}, webContentsId);
        };

        const events: Record<string, any> = {
            // 'found-in-page': async (e: {
            //     result: {
            //         requestId: number;
            //         activeMatchOrdinal: number;
            //         matches: number;
            //         selectionArea: { x: number; y: number; width: number; height: number };
            //         finalUpdate: boolean;
            //     };
            // }) => {
            //     onEvent('found-in-page', e.result);
            // },
            // 'will-navigate': async (e: { url: string }) => {
            //     onEvent('will-navigate', e);
            // },
            // 'load-commit': async ({ url, isMainFrame }: { url: string; isMainFrame: boolean }) => {
            //     onEvent('load-commit', { url, isMainFrame });
            // },
            'context-menu': (e: any) => {
                if (webviewProps?.onContextMenu) {
                    if (webContentsId) {
                        TabIdWebveiwContentsIddMap.set(tabId, webContentsId);
                        WebveiwContentsIdTabIdMap.set(webContentsId, tabId);
                    }
                    if (webviewProps?.onContextMenu) {
                        webviewProps?.onContextMenu({
                            params: e.params,
                            webContentsId: webview.getWebContentsId(),
                            tabId
                        });
                    }
                }
            },
            'console-message': (e: any) => {
                onEvent('console-message', e);
            },

            'page-title-updated': async ({
                title,
                explicitSet
            }: {
                explicitSet: boolean;
                title: string;
            }) => {
                let url = webview.getURL();
                let description, id;
                //console.log('page-title-updated', { title, tabId }, webview.getURL());
                if (!UrlTitleMap.has(url)) {
                    onEvent('page-title-updated', { title, explicitSet });
                    description = await webview.executeJavaScript(`(()=>{
                        const descriptionMetaTag = document.querySelector('meta[name="description"]');
                        const description = descriptionMetaTag ? descriptionMetaTag.content : '';
                        return description
                        })()`);
                    id = md5(url);
                    UrlTitleMap.set(url, {
                        desc: description,
                        id,
                        title
                    });
                } else {
                    const res = UrlTitleMap.get(url);
                    description = res?.desc;
                    id = res?.id;
                }
                window.dispatchEvent(
                    new CustomEvent('siteTitleUpated_' + tabId, {
                        detail: {
                            title,
                            description
                        }
                    })
                );
                await new BrowserHistoryService(id).save({
                    id,
                    url,
                    title,
                    desc: description,
                    ts: currentTs()
                });
            },

            'page-favicon-updated': async ({ favicons }: { favicons: string[] }) => {
                const uri = new URL(webview.getURL());
                if (!UrlFavorIconMap.has(uri.host)) {
                    //console.log('page-favicon-updated >> ', uri.host, favicons[0]);

                    onEvent('page-favicon-updated', { favicons });
                    const icon = favicons[0];
                    window.dispatchEvent(
                        new CustomEvent('siteFavorUpated_' + tabId, {
                            detail: {
                                icon
                            }
                        })
                    );
                    UrlFavorIconMap.set(uri.host, icon);
                    await new BrowserFavoricoService(uri.host).save({
                        icon,
                        favicons,
                        host: uri.host
                    });
                }
            },

            'did-start-navigation': async (e: { url: string; isMainFrame: boolean }) => {
                try {
                    const originUA = webview.getUserAgent();
                    const updatedUserAgent = originUA.replace(/ Electron\/[\d.]+/, '');
                    webview.setUserAgent(updatedUserAgent);
                } catch (e) {
                    console.log('error setUserAgent');
                }
                const { url, isMainFrame } = e;
                const { host, pathname } = new URL(url);
                console.log('> _ET:', 'did-start-navigation:', isMainFrame ? 'm' : 'i', [
                    host,
                    pathname.substring(0, 20)
                ]);
                onEvent('did-start-navigation', e);
                if (isMainFrame) {
                    siteLoading(true);
                    if (url.startsWith('http') || url.startsWith('about')) {
                        TabIdUrlMap.set(tabId, url);
                    }

                    if (url && url.startsWith('http')) {
                        new WebviewMuteService(url, getAccountIndexByTabId(tabId))
                            .get()
                            .then((isMute: boolean) => {
                                // console.log('setAudioMuted', { accountIndex }, isMute);
                                if (isMute) {
                                    if (!webview.isAudioMuted()) {
                                        webview.setAudioMuted(!!isMute);
                                    }
                                }
                            });
                    }
                }
            },
            'did-start-loading': () => {
                loadFailed = false;
                onEvent('did-start-loading');
                siteLoading(true);
            },
            'did-stop-loading': () => {
                setReady(true);
                loadFailed = false;
                siteLoading(false);
                webviewProps?.onStopLoading && webviewProps?.onStopLoading();
                onEvent('did-stop-loading');
                TabIdWebviewReadyMap.set(tabId, true);
                webview.executeJavaScript(`// 防止重复执行的标志位
                    if (!window._observerInitialized) {
                      window._observerInitialized = true; // 标志为已初始化
                      
                      const observer = new MutationObserver(() => {
                        document.querySelectorAll('a[target="_blank"]').forEach(anchor => {
                          anchor.removeAttribute('target');
                        });
                      });
                    
                      observer.observe(document.body, { childList: true, subtree: true });
                      
                      console.log('MutationObserver initialized');
                    } else {
                      console.log('MutationObserver is already running.');
                    }`);
            },
            'did-fail-load': async ({
                errorCode,
                errorDescription,
                isMainFrame,
                validatedURL,
                ...e
            }: {
                isMainFrame: boolean;
                errorCode: number;
                validatedURL: string;
                errorDescription: string;
            }) => {
                onEvent('did-fail-load', { errorCode, validatedURL, errorDescription, ...e });
                if (isMainFrame && errorDescription) {
                    TabIdWebviewReadyMap.set(tabId, false);
                    setError({ errorCode, validatedURL, errorDescription });
                    siteLoading(false);
                    webviewProps?.onError &&
                        webviewProps.onError({
                            isMainFrame,
                            errorCode,
                            validatedURL,
                            errorDescription
                        });
                    loadFailed = true;
                }
            },

            'dom-ready': async () => {
                try {
                    const url = webview.getURL();

                    if (!webContentsId) {
                        webContentsId = webview.getWebContentsId();
                        console.log('>> _ET dom-ready webContentsId', webContentsId);
                        WebveiwContentsIdTabIdMap.set(webContentsId, tabId);
                        TabIdWebveiwContentsIddMap.set(tabId, webContentsId);
                        if (webviewProps?.onSiteMessage) {
                            //@ts-ignore
                            window.addEventListener(
                                `onSiteMessage_${webContentsId}`,
                                handleOnSiteMessage
                            );
                        }
                    } else {
                        if (url === 'about:blank') {
                            return;
                        }
                    }

                    if (loadFailed) {
                        console.error('Skipping dom-ready due to load failure.');
                        siteLoading(false);
                        return;
                    }

                    await webview.insertCSS(GLOBAL_CSS);
                    await webview.executeJavaScript(`// 防止重复执行的标志位
if (!window._observerInitialized) {
  window._observerInitialized = true; // 标志为已初始化
  
  const observer = new MutationObserver(() => {
    document.querySelectorAll('a[target="_blank"]').forEach(anchor => {
      anchor.removeAttribute('target');
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
  
  console.log('MutationObserver initialized');
} else {
  console.log('MutationObserver is already running.');
}`);
                    if (url.indexOf('mail.proton.me') > -1) {
                        await webview.insertCSS(
                            `body > div.app-root > div.flex.flex-row.flex-nowrap.h-full > div > div.flex.flex-nowrap.flex-row.p-4.items-center.border-bottom.border-weak{display:none}`
                        );
                    }
                    if (url.indexOf('web.telegram.org/a') > -1) {
                        await webview.insertCSS(`.MessageSelectToolbar{display: none!important;}`);
                    }
                    if (webviewProps?.insertCss) {
                        await webview.insertCSS(webviewProps?.insertCss);
                    }
                    if (webviewProps?.insertJs) {
                        webview.executeJavaScript(webviewProps?.insertJs);
                    }

                    console.log('onReady >> ', url);
                    setError(null);
                    onEvent('dom-ready');
                    TabIdWebviewReadyMap.set(tabId, true);
                    webviewProps?.onReady && (await webviewProps.onReady(webview));
                } catch (e) {
                    console.error(tabId, e);
                }
            },

            'enter-html-full-screen': () => {
                onEvent('enter-html-full-screen');
            },
            'leave-html-full-screen': () => {
                onEvent('leave-html-full-screen');
            },
            close: () => {
                onEvent('close');
            },

            destroyed: () => {
                onEvent('destroyed');
            }
        };

        Object.keys(events).forEach(key => {
            if (events[key]) {
                webview.addEventListener(key, events[key]);
            }
        });
        return () => {
            if (webview) {
                Object.keys(events).forEach(key => {
                    if (events[key]) {
                        webview.removeEventListener(key, events[key]);
                    }
                });
                TabIdUrlMap.delete(tabId);
                TabIdWebviewMap.delete(tabId);
                if (webContentsId) {
                    WebveiwContentsIdTabIdMap.delete(webContentsId);
                    TabIdWebveiwContentsIddMap.delete(tabId);
                    if (webviewProps?.onSiteMessage) {
                        //@ts-ignore
                        window.removeEventListener(
                            `onSiteMessage_${webContentsId}`,
                            handleOnSiteMessage
                        );
                    }
                }
                webContentsId = 0;
            }
        };
    }, [env]);
    const partition = getPartitionKey(partitionId);

    let webpreferences = '';
    webpreferences = `contextIsolation=0,nativeWindowOpen=1,nodeIntegration,preload=${env.dirname}/../renderer/site/preload.js`;

    if (!env) {
        return null;
    }
    return (
        <View
            ref={ref}
            relative
            wh100p
            borderRadius={borderRadius || 8}
            overflowHidden
            sx={{
                zIndex: 1
            }}
        >
            <View hide={!ready} absFull bgColor="white" borderRadius={10} zIdx={1} />
            <View absFull zIdx={2}>
                <webview
                    src={initUrl}
                    httpreferrer={webviewProps?.httpReferrer || undefined}
                    webpreferences={webpreferences}
                    ref={webviewRef}
                    partition={partition}
                    style={{
                        display: 'inline-flex',
                        width: '100%',
                        height: '100%'
                    }}
                />
            </View>
            {!!error && (
                <ErrorWebview
                    onClick={() => {
                        if (webviewRef.current) {
                            const webview = webviewRef.current as WebviewTag;
                            webview.reload();
                        }
                        webviewProps?.onErrorReset && webviewProps.onErrorReset();
                        setError(null);
                    }}
                    errorDescription={error.errorDescription}
                    url={error.validatedURL}
                />
            )}
        </View>
    );
};
export default WebViewBrowser;
function setIsMute(arg0: boolean) {
    throw new Error('Function not implemented.');
}
