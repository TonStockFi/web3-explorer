import { ImageIcon } from '@web3-explorer/uikit-view/dist/icons/ImageIcon';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { useEffect, useState } from 'react';
import { useTheme } from 'styled-components';
import { useAccountInfo } from '../../hooks/wallets';
import { BrowserTab, useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import WebviewMainEventService from '../../services/WebviewMainEventService';
import WebviewService from '../../services/WebviewService';
import { UrlInput } from './UrlInput';

export function WebviewTopBar({
    hideOpenInNew,
    urlReadOnly,
    tab,
    currentUrl
}: {
    urlReadOnly?: boolean;
    hideOpenInNew?: boolean;
    tab: BrowserTab;
    currentUrl?: string;
}) {
    const theme = useTheme();
    const { closeTab } = useBrowserContext();
    const [canGoBack, setCanGoBack] = useState(false);
    const [loading, setLoading] = useState(false);

    const account = useAccountInfo();
    const { env } = useIAppContext();
    useEffect(() => {
        const handleSiteLoading = (event: any) => {
            const { detail } = event as any;
            setLoading(detail.loading);
            const ws = new WebviewService(tab.tabId);
            if (detail.loading) {
                setCanGoBack(false);
            } else {
                const webview = ws.getWebview();
                if (webview) {
                    setCanGoBack(webview.canGoBack());
                }
            }
        };

        window.addEventListener(`siteLoading_${tab.tabId}`, handleSiteLoading);

        return () => {
            window.addEventListener(`siteLoading_${tab.tabId}`, handleSiteLoading);
        };
    }, []);
    let hideOpenInNew1 = !!hideOpenInNew;
    return (
        <View aCenter jStart wh100p pr={4} borderBox pl={0}>
            <View empty>
                <View
                    center
                    mr12
                    onClick={() => {
                        const ws = new WebviewService(tab.tabId);
                        if (ws.getWebview() && ws.getWebview()?.canGoBack()) {
                            ws.goBack();
                        }
                    }}
                    iconButton={{
                        disabled: !canGoBack,
                        sx: {
                            width: 24,
                            height: 24
                        }
                    }}
                    iconProps={{ sx: { width: 18, height: 18 } }}
                    icon={'KeyboardArrowLeft'}
                />

                <View
                    onClick={() => {
                        const ws = new WebviewService(tab.tabId);
                        const webview = ws.getWebview();
                        if (webview) {
                            if (webview?.isLoading()) {
                                webview?.stop();
                            } else {
                                webview?.reload();
                            }
                        }
                    }}
                    center
                    iconButtonColor={theme.textPrimary}
                    iconButton={{ sx: { width: 24, height: 24 } }}
                    iconProps={{ sx: { width: 18, height: 18 } }}
                    icon={loading ? 'Close' : 'Refresh'}
                />
            </View>
            <View h={44} row aCenter ml12 flex1>
                <UrlInput
                    urlReadOnly={urlReadOnly}
                    isDiscover={false}
                    currentUrl={currentUrl}
                    tab={tab}
                />
            </View>

            <View ml12 rowVCenter>
                <View
                    hide={hideOpenInNew1}
                    borderRadius={8}
                    ml={4}
                    sx={{
                        '& .MuiSvgIcon-root': {
                            width: 18,
                            height: 18
                        }
                    }}
                    icon={<ImageIcon icon={'OpenInNew'} size={18} />}
                    iconButtonSmall
                    onClick={() => {
                        new WebviewMainEventService().openPlaygroundWindow(tab, account, env);
                    }}
                />
            </View>
        </View>
    );
}
