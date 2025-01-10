import { View } from '@web3-explorer/uikit-view';
import { WebviewTag } from 'electron';
import { useEffect, useState } from 'react';
import { useAccountInfo, usePublicAccountsInfo } from '../../hooks/wallets';
import { BrowserTab, useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';

import { getDiscoverHost } from '../../common/helpers';
import { currentTs, getSessionCacheInfo } from '../../common/utils';
import { DISCOVER_PID, START_URL } from '../../constant';
import { usePro } from '../../providers/ProProvider';
import WebviewService from '../../services/WebviewService';
import { AccountPublic, InitConfig, MAIN_NAV_TYPE, SUB_WIN_ID, WebApp } from '../../types';
import { LoadingView } from '../LoadingView';

import { useTranslation } from '@web3-explorer/lib-translation';
import { deepDiff } from '@web3-explorer/utils';
import { onAction } from '../../common/electron';
import { useScreenshotContext } from '../../providers/ScreenshotProvider';
import WebviewMainEventService from '../../services/WebviewMainEventService';
import ScreenshotView from './ScreenshotView';
import WebViewBrowser from './WebViewBrowser';
import { WebviewTopBar } from './WebViewTopBar';

export function WebviewDiscoverApps({
    winId,
    tabId
}: {
    winId: 'Games' | 'Discover';
    tabId: string;
}) {
    const isGames = winId === 'Games';
    const { isCutEnable } = useScreenshotContext();
    const { env } = useIAppContext();
    const {
        theme,
        openUrl,
        openTabFromWebview,
        currentTabId,
        onChangeLeftSideActions,
        browserTabs
    } = useBrowserContext();
    let tab: BrowserTab | undefined = browserTabs.get(tabId);

    const { i18n } = useTranslation();

    const currentLanguage = i18n.language;
    if (!tab) {
        tab = { tabId: tabId, ts: currentTs() };
    }
    const isSelected = currentTabId === tabId;
    const [loading, setLoading] = useState<boolean>(true);
    const { updateProPlans } = usePro();
    const { name, emoji, index, id, address } = useAccountInfo();
    const currentAccount = { name, emoji, index, id, address };
    const accounts = usePublicAccountsInfo();
    const [accountsList, setAccountsList] = useState<AccountPublic[]>([]);

    useEffect(() => {
        if (deepDiff(accounts, accountsList)) {
            setAccountsList(accounts);
        }
    }, [accounts, accountsList]);

    if (!isGames) {
        sessionStorage.setItem('currentAccount', JSON.stringify(currentAccount));
    }

    useEffect(() => {
        const account = getSessionCacheInfo();
        const ws = new WebviewService(tabId);
        if (!isGames && ws.webviewIsReady()) {
            setAccountsList(r => {
                ws.dispatchEvent('onPlaygroundMainMessage', {
                    action: 'onChangeCurrentAccount',
                    payload: { account, accounts: r }
                });
                return r;
            });
        }
    }, [index]);
    const [firstLoad, setFirstLoad] = useState(!isGames);
    useEffect(() => {
        if (currentTabId === MAIN_NAV_TYPE.DISCOVERY && !isGames) {
            setFirstLoad(false);
        }
    }, [currentTabId]);
    // let id1 = Buffer.from(id).toString('hex');
    const url = `${getDiscoverHost(env.isDev, env.version)}&_a=${address}&_id=${
        index + id
    }&lang=${currentLanguage}#${!isGames ? SUB_WIN_ID.PLAYGROUND : 'GAMES_FI'}`;
    // console.log({ tab, currentTabId, firstLoad });

    const onSiteMessage = async ({
        action,
        payload
    }: {
        action: string;
        payload?: Record<string, any> | undefined;
    }) => {
        const ws = new WebviewService(tabId);

        if (action === 'initConfig') {
            const { proPlans, proRecvAddress, leftSideActions } = payload as InitConfig;
            updateProPlans({ proPlans, proRecvAddress });
            onChangeLeftSideActions(leftSideActions);
        }

        if (action === 'notifySubWinAction') {
            const { payload: payload1, action, tab, currentAccount, currentType } = payload as any;
            new WebviewMainEventService().notifySubWinAction(
                action,
                payload1,
                tab,
                currentAccount,
                currentType
            );
        }
        if (action === 'makeWindowsAlign') {
            const { tab, action, currentAccount, currentType } = payload as any;
            new WebviewMainEventService().makeWindowsAlign(
                action,
                tab,
                currentAccount,
                currentType
            );
        }

        if (action === 'getCurrentAccount') {
            if (ws.webviewIsReady()) {
                const account = getSessionCacheInfo();
                setAccountsList(r => {
                    ws.dispatchEvent('onPlaygroundMainMessage', {
                        action: 'onChangeCurrentAccount',
                        payload: { account, accounts: r }
                    });
                    return r;
                });
            }
        }

        if (action === 'getAllReadyWin') {
            const windows = await onAction('getAllReadyWin');
            ws.dispatchEvent('onPlaygroundMainMessage', {
                action: 'onGetAllReadyWin',
                payload: { windows }
            });
        }
        if (action === 'onOpenTab') {
            const { item } = payload as { item: WebApp };
            openTabFromWebview(item);
        }

        if (action === 'closeWin') {
            const { winId } = payload as { winId: string };
            onAction('closeWin', {
                winId
            });
        }
        if (action === 'openLLMWindow') {
            const { site, message } = payload as any;
            await new WebviewMainEventService().openLLMWindow({
                site,
                message
            });
        }
        if (action === 'notifyWindowAction') {
            const winId = WebviewMainEventService.getPlaygroundWinId({
                index: payload!.acuccountIndex,
                tabId: payload!.tabId
            });
            onAction('subWin', {
                toWinId: winId,
                action: payload!.action,
                payload: payload!.payload
            });
        }
        if (action === 'notifyWindowsAction') {
            const notifyWindowAction = (data: any) => {
                const { accounts, tabId, currentAccount, action, payload } = data;

                new WebviewMainEventService().notifyWindowAction({
                    accounts,
                    tabId,
                    currentAccount,
                    action,
                    payload
                });
            };
            notifyWindowAction(payload);
        }
        if (action === 'openPlaygroundWindow') {
            const { tab, account, action } = payload as {
                tab: BrowserTab;
                action: string;
                payload: any;
                account: AccountPublic;
            };
            const wmes = new WebviewMainEventService();

            const winId = await wmes.openPlaygroundWindow(tab, account, env);
            if (action) {
                const isReady = await wmes.isWinReady(winId);
                if (!isReady) {
                    await wmes.waitForIsWinReady(winId);
                }
                onAction('subWin', {
                    toWinId: winId,
                    action,
                    payload: payload!.payload
                });
            }
        }
        if (action === 'openMainTabUrl') {
            const { url } = payload as { url: string };
            openUrl(url);
        }
    };

    if (firstLoad) {
        return null;
    }
    return (
        <View
            bgColor={theme.backgroundBrowserActive}
            rowVCenter
            overflowHidden
            jSpaceBetween
            wh100p
            relative
        >
            <View abs xx0 top0 borderBox w100p h={44} px={12} aCenter row jSpaceBetween>
                <View aCenter jStart flex1>
                    <WebviewTopBar
                        hideOpenInNew
                        tab={{
                            ...tab!,
                            tabId
                        }}
                        currentUrl={url}
                    />
                </View>
            </View>
            <View
                abs
                borderRadius={8}
                overflowHidden
                right={8}
                left={8}
                bottom={8}
                top={44}
                borderBox
            >
                <WebViewBrowser
                    preload={'playground'}
                    hideBoxShadow
                    borderRadius={0}
                    url={START_URL}
                    tabId={tabId}
                    partitionId={DISCOVER_PID}
                    webviewProps={{
                        onSiteMessage,
                        onError: () => setLoading(false),
                        onErrorReset: () => setLoading(true),
                        onReady: (webview: WebviewTag) => {
                            if (webview.getURL() === START_URL) {
                                new WebviewService(tabId).goTo(url);
                            }
                            setLoading(false);
                        }
                    }}
                />
                <LoadingView
                    loading={loading}
                    setLoading={(loading: boolean) => setLoading(loading)}
                />
            </View>
            {Boolean(isCutEnable && isSelected) && <ScreenshotView tabId={currentTabId} />}
        </View>
    );
}
