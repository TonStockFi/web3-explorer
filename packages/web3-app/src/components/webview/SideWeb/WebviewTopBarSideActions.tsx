import { ImageIcon } from '@web3-explorer/uikit-view/dist/icons/ImageIcon';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { SideWebSite, useBrowserContext } from '../../../providers/BrowserProvider';
import { useIAppContext } from '../../../providers/IAppProvider';
import WebviewMainEventService from '../../../services/WebviewMainEventService';
import { SUB_WIN_ID } from '../../../types';

export function WebviewTopBarSideActions({
    selected,
    isSideWeb,
    hideGemini
}: {
    hideGemini?: boolean;
    selected?: string;
    isSideWeb?: boolean;
}) {
    const { openSideWeb, theme } = useBrowserContext();
    const tipsPlacement = isSideWeb ? 'left' : 'bottom';
    const sBgColor = theme.backgroundPage;
    const { env } = useIAppContext();
    const onClick = (site: SideWebSite) => {
        if (location.href.indexOf(SUB_WIN_ID.LLM) > -1) {
            openSideWeb({
                site
            });
        } else {
            new WebviewMainEventService().openLLMWindow({ site });
        }
    };
    return (
        <View empty>
            <View
                borderRadius={8}
                bgColor={selected === 'ChatGpt' ? sBgColor : undefined}
                tips={'ChatGpt'}
                ml={4}
                sx={{
                    '& .MuiSvgIcon-root': {
                        width: 20,
                        height: 20
                    }
                }}
                icon={<ImageIcon icon={'icon_chatgpt'} size={18} />}
                iconButtonSmall
                tipsPlacement={tipsPlacement}
                onClick={() => onClick('ChatGpt')}
            />
            <View
                hide={hideGemini}
                ml={4}
                borderRadius={8}
                bgColor={selected === 'Gemini' ? sBgColor : undefined}
                tips={'Gemini'}
                tipsPlacement={tipsPlacement}
                icon={<ImageIcon icon={'icon_gemini'} size={18} />}
                iconButtonSmall
                onClick={() => onClick('Gemini')}
            />
        </View>
    );
}
