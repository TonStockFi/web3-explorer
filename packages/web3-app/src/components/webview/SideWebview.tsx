import { deepPurple } from '@mui/material/colors';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { WebviewTag } from 'electron';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sleep } from '../../common/utils';

import { MAC_TITLE_BAR_WIDTH } from '../../constant';
import { SideWebType, useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import WebviewService from '../../services/WebviewService';
import { WebveiwEventType } from '../../types';
import { TitleBarControlView } from '../app/TitleBarControlView';
import { ControlsView } from './ControlsView';
import MoreTopbarDropdown from './MoreTopbarDropdown';
import { PromptAction } from './PromptAction';
import WebViewBrowser from './WebViewBrowser';
import { WebviewTopBarSideActions } from './WebviewTopBarSideActions';
const CachedMessage: Map<number, boolean> = new Map();
const getUrlInfo = (site: string) => {
    switch (site) {
        case 'ChatGpt':
            return 'https://chatgpt.com';
        case 'Gemini':
            return 'https://gemini.google.com/app';
        case 'Telegram':
            return 'https://web.telegram.org/a/';
        case 'Twitter':
            return 'https://x.com/';
    }
    return '';
};

export const onPromptChatGpt = async (tabId: string, prompt: string) => {
    const ws = new WebviewService(tabId);
    const webview = ws.getWebview();
    if (!webview) {
        return;
    }
    const rect = (await ws.waitForExecJsResult(
        `const textarea = document.querySelector("textarea")
        const parentDiv = textarea.parentElement;
        const rect = parentDiv.getBoundingClientRect();
        return {top:rect.top,left:rect.left,width:rect.width,height:rect.height}`,
        0
    )) as any;
    await ws.sendClickEvent(rect!.left + rect.width / 2, rect!.top + rect.height / 2);
    await sleep(500);
    await webview.insertText(prompt);
    await sleep(500);
    await ws.sendClickEvent(rect!.left + rect.width + 16, rect!.top + rect.height / 2);
};

export const onPromptGemini = async (tabId: string, prompt: string) => {
    const ws = new WebviewService(tabId);
    const webview = ws.getWebview();
    if (!webview) {
        return;
    }
    const rect = (await ws.waitForExecJsResult(
        `const textarea = document.querySelector("rich-textarea");
                if (!textarea) return null;
                const rect = textarea.getBoundingClientRect()
                return {top:rect.top,left:rect.left,width:rect.width,height:rect.height};`,
        0
    )) as any;
    await ws.sendClickEvent(rect!.left + rect.width / 2, rect!.top + rect.height / 2);
    await sleep(500);
    await webview.insertText(prompt);
    await sleep(500);

    const rect1 = (await ws.waitForExecJsResult(
        `const textarea = document.querySelector(".send-button")
        const isDisabled = textarea.getAttribute("aria-disabled") === "true";

        const rect = textarea.getBoundingClientRect();
        if(!isDisabled){
            return {top:rect.top,left:rect.left,width:rect.width,height:rect.height,isDisabled}
        }`,
        0
    )) as any;
    console.log('send-button', rect1);

    await ws.sendClickEvent(rect1!.left + rect1.width / 2, rect1!.top + rect1.height / 2);
};

export function SideWebviewInner({ url, site }: { url: string; site: string }) {
    const tabId = `side_${site}`;
    const { i18n } = useTranslation();
    const [loading, setLoading] = useState(true);

    const [firstLoad, setFirstLoad] = useState(false);
    const { t } = useTranslation();
    const { sideWeb, openSideWeb } = useBrowserContext();
    const [webview, setWebview] = useState<null | WebviewTag>(null);

    const onTransImagGemini = async (tabId: string, type: SideWebType) => {
        const ws = new WebviewService(tabId);
        const webview = ws.getWebview();
        if (!webview) {
            return;
        }
        setLoading(true);
        console.log('onTransImagGemini');
        const rect = (await ws.waitForExecJsResult(
            `const textarea = document.querySelector("rich-textarea");
                    if (!textarea) return null;
                    const rect = textarea.getBoundingClientRect()
                    return {top:rect.top,left:rect.left,width:rect.width,height:rect.height};`,
            0
        )) as any;
        console.log('onTransImagGemini rich-textarea', rect);

        await ws.sendClickEvent(rect!.left + rect.width / 2, rect!.top + rect.height / 2);
        console.log('onTransImagGemini paste');
        setLoading(true);
        webview.paste();

        await sleep(500);
        switch (type) {
            case 'TRANS_IMG_GEMINI':
                await webview?.insertText(
                    `${t('RecognitionImageTransTo').replace('%{lang}', t(i18n.language))}`
                );
                break;
            case 'RECO_IMG_GEMINI':
                await webview?.insertText(`${t('RecognitionImage')}`);
                break;
            case 'EXPLAIN_IMG_GEMINI':
                await webview?.insertText(`${t('ExplainImage')}`);
                break;
            default:
                break;
        }

        await sleep(500);
        const rect1 = (await ws.waitForExecJsResult(
            `const textarea = document.querySelector(".send-button")
            const isDisabled = textarea.getAttribute("aria-disabled") === "true";

            const rect = textarea.getBoundingClientRect();
            if(!isDisabled){
                return {top:rect.top,left:rect.left,width:rect.width,height:rect.height,isDisabled}
            }`,
            0
        )) as any;
        console.log('onTransImagGemini send-button', rect1);
        await ws.sendClickEvent(rect1!.left + rect1.width / 2, rect1!.top + rect1.height / 2);
        setLoading(false);

        openSideWeb({
            imgData: undefined,
            ts: undefined,
            site: 'Gemini',
            type
        });
    };

    const onTransChatGpt = async (tabId: string) => {
        setLoading(true);
        await onPromptChatGpt(
            tabId,
            `${t('PleaseTranslateTo').replace('%{lang}', t(i18n.language))}: ${sideWeb?.value}`
        );
        setLoading(false);
        openSideWeb({ value: '', site: 'ChatGpt', type: 'TRANS_CHATGPT' });
    };

    useEffect(() => {
        if (sideWeb?.type && site === sideWeb.site) {
            setLoading(true);
        }
    }, [sideWeb?.type, site]);

    useEffect(() => {
        if (!webview || site !== sideWeb?.site) return;
        console.log('sideWeb', sideWeb);
        const tabId = `side_${site}`;
        if (sideWeb.ts) {
            if (CachedMessage.get(sideWeb.ts)) {
                return;
            }
            CachedMessage.set(sideWeb.ts, true);
        }

        if (sideWeb?.value && sideWeb?.type === 'TRANS_CHATGPT') {
            onTransChatGpt(tabId);
        }
        if (sideWeb?.imgData && sideWeb?.ts) {
            onTransImagGemini(tabId, sideWeb?.type);
        }
    }, [sideWeb?.value, sideWeb?.type, sideWeb?.ts, , webview]);
    const isSelected = sideWeb?.site === site;
    useEffect(() => {
        if (isSelected) {
            setFirstLoad(false);
        }
    }, [isSelected]);
    return (
        <View flex1 h100p hide={firstLoad} displayNone={!isSelected} borderRadius={8} borderBox>
            <View
                onClick={() => setLoading(false)}
                hide={!loading}
                absFull
                center
                overflowHidden
                loading
            />
            <WebViewBrowser
                hideBoxShadow
                url={url}
                tabId={tabId}
                partitionId={'side_webview'}
                webviewProps={{
                    onContextMenu: (e: { params: any; webContentsId: number; tabId: string }) => {
                        console.log('onContextMenu', e);
                        window.dispatchEvent(
                            new CustomEvent('onWebviewContextMenu', {
                                detail: e
                            })
                        );
                    },
                    onEvent: async (
                        webview1: WebviewTag,
                        eventType: WebveiwEventType,
                        payload: any
                    ) => {
                        switch (eventType) {
                            case 'dom-ready': {
                                setLoading(false);
                                if (!webview) {
                                    setWebview(webview1);
                                }
                                break;
                            }
                            default: {
                                break;
                            }
                        }
                    }
                }}
            />
        </View>
    );
}

export function SideWebview() {
    const { theme } = useBrowserContext();
    const { env, isMacNotFullScreen } = useIAppContext();
    const { isMac } = env;
    const { sideWeb } = useBrowserContext();
    const site = sideWeb?.site || 'ChatGpt';

    return (
        <View wh100p relative>
            <View
                abs
                top0
                right0
                left0
                h={44}
                flx
                borderBox
                borderBottom={`1px solid ${theme.separatorCommon}`}
                bgColor={deepPurple[700]}
                sx={{
                    borderTop: `1px solid ${theme.separatorCommon}`
                }}
            >
                <View h100p rowVCenter pl={isMacNotFullScreen ? MAC_TITLE_BAR_WIDTH : 0}>
                    <TitleBarControlView />
                    <WebviewTopBarSideActions selected={site} isSideWeb={false} />
                </View>
                <View flex1 appRegionDrag />
                <View h100p rowVCenter jEnd mr={6}>
                    <PromptAction />
                    <View rowVCenter ml={6}>
                        <MoreTopbarDropdown tabId={`side_${site}`} />
                    </View>
                </View>
            </View>
            <View h={36} top={44} abs left0 right0 rowVCenter>
                <View bgColor={theme.backgroundBrowserActive} w100p h100p rowVCenter px={8}>
                    <View sx={{ color: 'green' }} rowVCenter>
                        <View iconFontSize="1rem" icon={'Https'} />
                    </View>
                    <View
                        ml={6}
                        userSelectNone
                        text={sideWeb?.site ? getUrlInfo(sideWeb?.site) : ''}
                    />
                </View>
            </View>
            <View abs left0 right0 top={44 + 40} bottom={0} py={2} px={2} flx>
                <View flex1 h100p borderRadius={2} borderBox overflowHidden relative>
                    {['Gemini', 'ChatGpt'].map(site => {
                        return <SideWebviewInner key={site} site={site} url={getUrlInfo(site)} />;
                    })}
                </View>
            </View>
            <ControlsView findInPageTop={72} tabId={`side_${sideWeb?.site || 'ChatGpt'}`} />
        </View>
    );
}
