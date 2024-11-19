import { View } from '@web3-explorer/uikit-view';
import { WebviewTag } from 'electron';
import { useEffect, useState } from 'react';
import { useTheme } from 'styled-components';
import { openWindow } from '../../common/electron';
import { START_URL } from '../../constant';
import { useAccountInfo, useAccountWallePartitionId } from '../../hooks/wallets';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useScreenshotContext } from '../../providers/ScreenshotProvider';
import WebviewService from '../../services/WebviewService';
import { MAIN_NAV_TYPE, WebveiwEventType } from '../../types';
import { onOpenTab } from '../discover/DiscoverView';
import ScreenshotView from './ScreenshotView';
import WebViewBrowser from './WebViewBrowser';
import { WebviewTopBar } from './WebViewTopBar';
let _tabId = '';

export function WebviewAppView({ tabId }: { tabId: string }) {
    const { isCutEnable } = useScreenshotContext();
    const { currentTabId, updateAt, editTab, openTab, closeTab, newTab, browserTabs, saveTab } =
        useBrowserContext();

    useEffect(() => {
        _tabId = tabId;
    }, [tabId]);
    const theme = useTheme();
    const tab = browserTabs.get(tabId)!;
    let { initUrl, mobile } = tab || {};
    const account = useAccountInfo();
    const partitionId = useAccountWallePartitionId();

    const [currentUrl, setCurrentUrl] = useState(initUrl);
    const isSelected = currentTabId === tabId;
    const displayNone = !isSelected;
    const [firstLoad, setFirstLoad] = useState(true);

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
                            initUrl: url
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
        if (action === 'openWindow') {
            openWindow(payload as any);
        }

        if (action === 'onOpenTab') {
            onOpenTab({ _tabId, payload, editTab, openTab, closeTab, newTab, browserTabs });
        }
    };

    useEffect(() => {
        if (isSelected) {
            setFirstLoad(false);
        }
    }, [isSelected]);

    let httpReferrer = undefined;

    let width = '360px';
    let height = '700px';
    let isMobile = mobile;
    if (!isMobile) {
        width = '100%';
        height = '100%';
    }

    let webviewUrl = initUrl || '';
    // console.log('>>', {
    //     currentUrl,
    //     browserTabs,
    //     currentTabId,
    //     tab,
    //     initUrl,
    //     displayNone
    // });
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
                <View
                    hide={tabId === MAIN_NAV_TYPE.GAME_FI}
                    borderBox
                    w100p
                    h={44}
                    px={12}
                    aCenter
                    row
                    jSpaceBetween
                >
                    <View aCenter jStart flex1 hide={!initUrl || !tab}>
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
                        hide={!initUrl || tabId === MAIN_NAV_TYPE.GAME_FI}
                        w={width}
                        h={height}
                        borderRadius={isMobile ? 8 : 0}
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
