import { ImageIcon } from '@web3-explorer/uikit-view/dist/icons/ImageIcon';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { useEffect, useState } from 'react';
import { useTheme } from 'styled-components';
import { useAccountInfo } from '../../hooks/wallets';
import { BrowserTab, useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import WebviewMainEventService from '../../services/WebviewMainEventService';
import WebviewService from '../../services/WebviewService';
import { MAIN_NAV_TYPE } from '../../types';
import { WalletSide } from '../app/WalletSide';
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
    const { currentTabId } = useBrowserContext();
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

    let hideUrlInput = false;
    if (
        currentTabId === MAIN_NAV_TYPE.DISCOVERY ||
        currentTabId === 'tab_airdrop' ||
        currentTabId === 'MOBILE_MONITORS'
    ) {
        hideUrlInput = true;
    }
    return (
        <View aCenter jStart wh100p pr={4} borderBox pl={0}>
            <View empty>
                <View>
                    <WalletSide />
                </View>
            </View>
            <View h={44} row aCenter ml12 flex1 hide={hideUrlInput}>
                <UrlInput
                    urlReadOnly={urlReadOnly}
                    isDiscover={false}
                    currentUrl={currentUrl}
                    tab={tab}
                />
            </View>

            <View ml12 rowVCenter>
                <View
                    hide
                    center
                    mr12
                    onClick={() => {
                        const ws = new WebviewService(tab.tabId);
                        if (ws.getWebview() && ws.getWebview()?.canGoBack()) {
                            ws.goBack();
                        }
                    }}
                    iconButton={{
                        sx: {
                            width: 24,
                            height: 24
                        }
                    }}
                    iconProps={{ sx: { width: 18, height: 18 } }}
                    icon={'KeyboardArrowLeft'}
                />

                <View
                    tips={'reload'}
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
                <View
                    hide={true}
                    borderRadius={8}
                    ml={4}
                    sx={{
                        '& .MuiSvgIcon-root': {
                            width: 18,
                            height: 18
                        }
                    }}
                    tips={'机器决策'}
                    icon={<ImageIcon icon={'PrecisionManufacturing'} size={18} />}
                    iconButtonSmall
                    onClick={() => {
                        new WebviewMainEventService().openPlaygroundWindow(tab, account, env);
                    }}
                />
            </View>
        </View>
    );
}
