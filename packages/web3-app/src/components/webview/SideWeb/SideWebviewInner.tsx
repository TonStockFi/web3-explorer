import { View } from '@web3-explorer/uikit-view/dist/View';
import { WebviewTag } from 'electron';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sleep } from '../../../common/utils';

import { copyImageToClipboard } from '../../../common/image';
import { base64ToBlob, urlToBlob } from '../../../common/opencv';
import { SideWebType, useBrowserContext } from '../../../providers/BrowserProvider';
import WebviewService from '../../../services/WebviewService';
import { WebveiwEventType } from '../../../types';
import WebViewBrowser from '../WebViewBrowser';
const CachedMessage: Map<number, boolean> = new Map();

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
export async function isGeminiIsReady(tabId: string, timeOut: number = -1) {
    const ws = new WebviewService(tabId);
    const webview = await ws.waitwebviewIsReady()!;
    const rect = (await ws.waitForExecJsResult(
        `const textarea = document.querySelector("rich-textarea");
                if (!textarea) return null;
                const rect = textarea.getBoundingClientRect()
                return {top:rect.top,left:rect.left,width:rect.width,height:rect.height};`,
        timeOut
    )) as any;
    return rect;
}
export const onPromptGemini = async (tabId: string, prompt: string, image?: string) => {
    const ws = new WebviewService(tabId);
    const webview = await ws.waitwebviewIsReady()!;
    const rect = await isGeminiIsReady(tabId);
    await ws.sendClickEvent(rect!.left + rect.width / 2, rect!.top + rect.height / 2);

    if (image) {
        if (image.startsWith('http') || image.startsWith('blob:http') || image.startsWith('data')) {
            let imgBlob;
            if (image.startsWith('data')) {
                imgBlob = base64ToBlob(image);
            } else {
                imgBlob = await urlToBlob(image);
            }
            if (imgBlob) {
                await copyImageToClipboard(imgBlob);
                await sleep(200);
                webview!.paste();
            }
        }
    }

    await sleep(200);
    await webview!.insertText(prompt);
    await sleep(200);

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
    return true;
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
