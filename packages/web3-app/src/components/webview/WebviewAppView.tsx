import { View } from '@web3-explorer/uikit-view';
import { WebviewTag } from 'electron';
import { useEffect, useState } from 'react';
import { useTheme } from 'styled-components';
import { START_URL } from '../../constant';
import { useAccountInfo, useAccountWallePartitionId } from '../../hooks/wallets';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useScreenshotContext } from '../../providers/ScreenshotProvider';
import WebviewService from '../../services/WebviewService';
import { WebApp, WebveiwEventType } from '../../types';
import ScreenshotView from './ScreenshotView';
import WebViewBrowser from './WebViewBrowser';
import { WebviewTopBar } from './WebViewTopBar';

export function WebviewAppView({ tabId }: { tabId: string }) {
    const { isCutEnable } = useScreenshotContext();
    const { currentTabId, openUrl, openTabFromWebview, updateAt, browserTabs, saveTab } =
        useBrowserContext();

    const theme = useTheme();
    const tab = browserTabs.get(tabId)!;
    let { url } = tab || {};
    const account = useAccountInfo();
    const partitionId = useAccountWallePartitionId();

    const [currentUrl, setCurrentUrl] = useState(url);
    const isSelected = currentTabId === tabId;
    const displayNone = !isSelected;
    const [firstLoad, setFirstLoad] = useState(true);
    // console.log({ currentTabId, tabId, url });
    const onEvent = async (webview1: WebviewTag, eventType: WebveiwEventType, payload: any) => {
        switch (eventType) {
            case 'did-start-navigation': {
                if (payload) {
                    const { isMainFrame, url } = payload;
                    if (
                        isMainFrame &&
                        url &&
                        url !== START_URL &&
                        url !== currentUrl &&
                        url.startsWith('http')
                    ) {
                        saveTab(tabId, {
                            ...tab,
                            url: url
                        });
                        setCurrentUrl(url);
                    }
                }
                break;
            }

            case 'dom-ready': {
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
    }) => {
        console.log('_ET', action, payload);
        if (action === 'onOpenTab') {
            const { item } = payload as { item: WebApp };
            openTabFromWebview(item);
        }
    };

    useEffect(() => {
        if (isSelected) {
            setFirstLoad(false);
        }
    }, [isSelected]);

    let httpReferrer = undefined;

    const width = '100%';
    const height = '100%';
    let webviewUrl = url || '';
    return (
        <View
            wh100p
            userSelectNone
            flx
            transitionEase={'width 0.3s'}
            displayNone={displayNone}
            hide={firstLoad}
        >
            <View flex1 bgColor={theme.backgroundBrowserActive} column overflowHidden relative>
                <View borderBox w100p h={44} px={12} aCenter row jSpaceBetween>
                    <View aCenter jStart flex1 hide={!webviewUrl || !tab}>
                        <WebviewTopBar tab={tab} currentUrl={currentUrl} />
                    </View>
                </View>
                <View
                    flex1
                    center
                    relative
                    borderRadius={8}
                    overflowHidden
                    mx={8}
                    mb={8}
                    mt={0}
                    borderBox
                >
                    <View
                        hide={!webviewUrl}
                        w={width}
                        h={height}
                        borderRadius={0}
                        overflowHidden
                        relative
                    >
                        <WebViewBrowser
                            accountIndex={account.index}
                            url={START_URL}
                            tabId={tabId}
                            partitionId={partitionId}
                            webviewProps={
                                !isSelected
                                    ? undefined
                                    : {
                                          onReady: (webview: WebviewTag) => {
                                              if (START_URL === webview.getURL()) {
                                                  new WebviewService(tabId).goTo(webviewUrl);
                                              }
                                          },
                                          httpReferrer,
                                          onSiteMessage,
                                          onEvent
                                      }
                            }
                        />
                        {Boolean(isCutEnable && isSelected) && (
                            <ScreenshotView tabId={currentTabId} />
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}
