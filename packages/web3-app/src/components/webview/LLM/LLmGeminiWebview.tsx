import { View } from '@web3-explorer/uikit-view/dist/View';

import { useOnce } from '@web3-explorer/utils';
import { useState } from 'react';
import { useTheme } from 'styled-components';
import { sleep } from '../../../common/utils';
import { usePlayground } from '../../../providers/PlaygroundProvider';
import LLMGeminiService from '../../../services/LLMGeminiService';
import WebviewService from '../../../services/WebviewService';
import { LoopView } from '../../common/LoopView';
import { ControlsView } from '../ControlsView';
import { LLmWebview } from './LLmWebview';

export function LLmGeminiWebview({
    currentTabId,
    pid,
    tabId,
    noCut,
    loop
}: {
    noCut?: boolean;
    loop?: (reply: string) => Promise<void>;
    currentTabId?: string;
    pid?: string;
    tabId: string;
}) {
    const url = 'https://gemini.google.com/app';
    const [reply, setReply] = useState('');
    const { currentAccount } = usePlayground();

    const pid1 = pid || `p_llm_${currentAccount!.id}_${currentAccount!.index || 0}`;

    useOnce(() => {
        const ls = new LLMGeminiService(tabId);
        ls.setIsReady(false);
        ls.getAll().then(rows => {
            rows.forEach(element => {
                ls.remove(element.id);
            });
        });
    });

    const checkGeminiCb = async () => {
        loop && (await loop(reply));
        await new LLMGeminiService(tabId).checkWebviewIsReady();
    };

    const pullMessageCb = async () => {
        const ls = new LLMGeminiService(tabId);
        if (!ls.getIsReady()) {
            return;
        }
        const message = await ls.pullMessage();

        if (message) {
            setReply('');
            console.debug('llm gemini pullMessage', message);
            const prompt = message.prompt.replace(/MESSAGE_ID/g, message.id);
            let { imageUrl, cutArea } = message;
            let imageUrl1;
            if (cutArea) {
                const ws = new WebviewService(message.tabId);
                await ws.sendClickEvent(cutArea.x + cutArea.w / 2, cutArea.y + cutArea.h / 2);
                await sleep(200);
                imageUrl1 = await ws.captureScreenToDataURL(
                    cutArea.x,
                    cutArea.y,
                    cutArea.w,
                    cutArea.h
                );
                if (!imageUrl1) {
                    ls.fisnishMessage(message.id, '');
                    return;
                }
                imageUrl = imageUrl1;
            }
            let res = '';
            console.debug('llm gemini onPromptGemini');
            await ls.onPrompt(prompt, imageUrl);
            if (message.formatResult) {
                res = await ls.waitWebviewMessageReply(message);
                console.debug('llm gemini waitWebviewMessageReply', res);
                setReply(res || '');
                ls.fisnishMessage(message.id, res);
            } else {
                ls.remove(message.id);
            }
        }
    };
    const theme = useTheme();
    let showControl = tabId === currentTabId;

    return (
        <View wh100p relative>
            <View
                zIdx={11}
                abs
                opacity={0.8}
                hide
                bgColor={theme.backgroundBrowserActive}
                left={8}
                right={8}
                px12
                borderRadius={8}
                bottom={110}
                h={120}
            >
                <View absFull mx12 py12 overflowYAuto>
                    <View text={JSON.stringify(reply)} />
                </View>
                <View
                    zIdx={100}
                    icon={'Close'}
                    iconButtonSmall
                    abs
                    top={6}
                    onClick={() => {
                        setReply('');
                    }}
                    right={6}
                />
            </View>
            <LoopView callback={checkGeminiCb} delay={1000} />
            <LoopView callback={pullMessageCb} delay={100} />
            <View abs left0 right0 top={0} bottom={0} flx>
                <View flex1 h100p borderBox overflowHidden relative>
                    <LLmWebview
                        noCut
                        currentTabId={currentTabId}
                        pid={pid1}
                        tabId={tabId}
                        url={url}
                    />
                </View>
            </View>
            {showControl && <ControlsView findInPageTop={72} tabId={tabId} />}
        </View>
    );
}
