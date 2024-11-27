import { deepPurple } from '@mui/material/colors';
import { View } from '@web3-explorer/uikit-view/dist/View';

import { MAC_TITLE_BAR_WIDTH } from '../../../constant';
import { useBrowserContext } from '../../../providers/BrowserProvider';
import { useIAppContext } from '../../../providers/IAppProvider';
import { TitleBarControlView } from '../../app/TitleBarControlView';
import { ControlsView } from '../ControlsView';
import MoreTopbarDropdown from '../MoreTopbarDropdown';
import { PromptAction } from '../PromptAction';
import { SideWebviewInner } from './SideWebviewInner';
import { WebviewTopBarSideActions } from './WebviewTopBarSideActions';

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

export function SideWebview() {
    const { theme } = useBrowserContext();
    const { isMacNotFullScreen } = useIAppContext();
    const { sideWeb } = useBrowserContext();

    const site = sideWeb?.site || 'Gemini';

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
                        <MoreTopbarDropdown tab={{ twa: false }} tabId={`side_${site}`} />
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
            <View abs left0 right0 top={44 + 36} bottom={0} py={2} px={2} flx>
                <View flex1 h100p borderRadius={0} borderBox overflowHidden relative>
                    {['Gemini', 'ChatGpt'].map(site1 => {
                        return <SideWebviewInner currentSite={site} key={site1} site={site1} />;
                    })}
                </View>
            </View>
            <ControlsView findInPageTop={72} tabId={`side_${sideWeb?.site || 'ChatGpt'}`} />
        </View>
    );
}
