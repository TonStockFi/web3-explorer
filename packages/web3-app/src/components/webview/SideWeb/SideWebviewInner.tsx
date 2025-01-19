import { View } from '@web3-explorer/uikit-view/dist/View';
import { useEffect, useState } from 'react';

import { LLmChatGptWebview } from '../LLM/LLMChatGptWebview';
import { LLmGeminiWebview } from '../LLM/LLmGeminiWebview';

export function SideWebviewInner({ site, currentSite }: { site: string; currentSite: string }) {
    const tabId = `side_${site}`;
    const current_tabId = `side_${currentSite}`;
    const [firstLoad, setFirstLoad] = useState(false);

    const isSelected = currentSite === site;

    useEffect(() => {
        if (isSelected) {
            setFirstLoad(false);
        }
    }, [isSelected]);
    return (
        <View
            flex1
            h100p
            hide={firstLoad}
            displayNone={!isSelected}
            overflowHidden
            sx={{
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8
            }}
            borderBox
        >
            {site === 'ChatGpt' && (
                <LLmChatGptWebview
                    currentTabId={current_tabId}
                    pid={'side_webview'}
                    tabId={tabId}
                />
            )}
            {site === 'Gemini' && (
                <LLmGeminiWebview currentTabId={current_tabId} pid={'side_webview'} tabId={tabId} />
            )}
            {site === 'Telegram' && (
                <LLmGeminiWebview currentTabId={current_tabId} pid={'side_webview'} tabId={tabId} />
            )}
        </View>
    );
}
