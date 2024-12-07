import { View } from '@web3-explorer/uikit-view/dist/View';

import { useOnce } from '@web3-explorer/utils';
import { useState } from 'react';
import { useTheme } from 'styled-components';
import { sleep } from '../../../common/utils';
import { TELEGRAME_WEB } from '../../../constant';
import { usePlayground } from '../../../providers/PlaygroundProvider';
import LLMChatGptService from '../../../services/LLMChatGptService';
import WebviewService from '../../../services/WebviewService';
import { LoopView } from '../../common/LoopView';
import { ControlsView } from '../ControlsView';
import { LLmWebview } from './LLmWebview';

export function TelegramWebview({
    currentTabId,
    pid,
    tabId
}: {
    currentTabId?: string;
    pid?: string;
    tabId: string;
}) {
    const url = TELEGRAME_WEB;
    const [reply, setReply] = useState('');
    const { currentAccount } = usePlayground();

    const pid1 = pid || `p_llm_${currentAccount!.id}_${currentAccount!.index || 0}`;

    useOnce(() => {
        const ls = new LLMChatGptService(tabId);
        ls.setIsReady(false);
        ls.getAll().then(rows => {
            rows.forEach(element => {
                ls.remove(element.id);
            });
        });
    });

    const checkChatGptCb = async () => {
        await new LLMChatGptService(tabId).checkWebviewIsReady();
    };

    const pullMessageCb = async () => {
        const ls = new LLMChatGptService(tabId);
        if (!ls.getIsReady()) {
            return;
        }
        const message = await ls.pullMessage();

        if (message) {
            console.debug('llm ChatGpt pullMessage', message);
            const prompt = message.prompt.replace(/MESSAGE_ID/g, message.id);
            let { imageUrl, cutArea } = message;
            if (cutArea) {
                const ws = new WebviewService(message.tabId!);
                await ws.sendClickEvent(cutArea.x + cutArea.w / 2, cutArea.y + cutArea.h / 2);
                await sleep(200);
                imageUrl = (await ws.captureScreenToDataURL(
                    cutArea.x,
                    cutArea.y,
                    cutArea.w,
                    cutArea.h
                )) as string;
                if (!imageUrl) {
                    ls.fisnishMessage(message.id, '');
                    return;
                }
            }
            let res = '';
            console.debug('llm ChatGpt onPromptChatGpt');
            await ls.onPrompt(prompt, imageUrl);
            if (message.formatResult) {
                res = await ls.waitWebviewMessageReply(message);
                console.debug('llm ChatGpt waitWebviewMessageReply', res);
                setReply(res || '');
            }
            ls.fisnishMessage(message.id, res);
        }
    };
    const theme = useTheme();
    return (
        <View wh100p relative>
            <View hide zIdx={11} absFull bgColor={theme.backgroundBrowserActive}>
                <View
                    icon={'Close'}
                    iconButtonSmall
                    abs
                    top={12}
                    onClick={() => {
                        setReply('');
                    }}
                    right={12}
                />
                <View absFull top={44}>
                    <View json={[reply]} />
                </View>
            </View>
            <LoopView callback={checkChatGptCb} delay={1000} />
            <LoopView callback={pullMessageCb} delay={100} />
            <View abs left0 right0 top={0} bottom={0} flx>
                <View flex1 h100p borderBox overflowHidden relative>
                    <LLmWebview currentTabId={currentTabId} pid={pid1} tabId={tabId} url={url} />
                </View>
            </View>
            {tabId === currentTabId && <ControlsView findInPageTop={5} tabId={tabId} />}
        </View>
    );
}
