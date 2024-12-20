import { View } from '@web3-explorer/uikit-view/dist/View';
import { useEffect, useState } from 'react';
import { useScreenshotContext } from '../../providers/ScreenshotProvider';
import WebviewMuteService from '../../services/WebviewMuteService';
import WebviewService from '../../services/WebviewService';
import { ContextMenuProps } from '../../types';
import ContextMenu from './ContextMenu';
import FindInPage from './FindInPage';
import { getFocusWebviewSelection, getTabIdByWebviewContentsId } from './WebViewBrowser';
let _currentTabId = '';

export function ControlsView({ findInPageTop, tabId }: { findInPageTop?: number; tabId: string }) {
    const { onCut } = useScreenshotContext();
    const [findInPage, setFindInPage] = useState<{ text?: string } | null>(null);
    const [contextMenu, setContextMenu] = useState<null | ContextMenuProps>(null);
    const [isMute, setIsMute] = useState(false);

    useEffect(() => {
        _currentTabId = tabId;
        if (tabId) {
            setFindInPage(null);
        }
    }, [tabId]);
    const onContextMenu = ({
        webContentsId,
        payload,
        tabId
    }: {
        payload: {
            selectionText: string;
            x: number;
            y: number;
            selectionRect: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
        };
        webContentsId: number;
        tabId?: string;
    }) => {
        if (tabId !== undefined && tabId !== _currentTabId) {
            return;
        }
        const ws = WebviewService.getServiceByWebContentsId(webContentsId);
        if (ws?.getWebviewUrl()) {
            const accountIndex = ws?.getAccountIndex();
            new WebviewMuteService(ws?.getWebviewUrl()!, accountIndex)
                .get()
                .then((mute: boolean) => {
                    setIsMute(!!mute);
                });
        }
        const { selectionText, x, y, selectionRect } = payload;
        console.log('onContextMenu', payload);
        setContextMenu({
            webContentsId,
            params: { selectionText: selectionText.trim(), x, y, selectionRect }
        });
    };
    useEffect(() => {
        async function onMainMessage(e: any) {
            const { action, payload, webContentsId } = e.detail;
            if (action === 'onContextMenu') {
                const tabId = getTabIdByWebviewContentsId(webContentsId);
                if (!tabId) {
                    return;
                }
                onContextMenu({ payload, webContentsId });
            }
            if (e.action === 'onShortcut') {
                if (e.payload.key === 'Cmd+Shift+W') {
                    if (tabId.startsWith('side_')) {
                        return;
                    }
                    console.log('Cmd+Shift+W');
                    onCut(true);
                    setFindInPage(null);
                    setContextMenu(null);
                }
                if (e.payload.key === 'CommandOrControl+F') {
                    const ws = new WebviewService(_currentTabId);
                    if (!ws.getWebview()) {
                        return;
                    }
                    console.log('CommandOrControl', { _currentTabId });
                    const text = await getFocusWebviewSelection(_currentTabId);
                    setFindInPage({ text });
                }
                if (e.payload.key === 'Escape') {
                    setFindInPage(null);
                    setContextMenu(null);
                    onCut(false);
                }
            }
        }

        function handleOnWebviewContextMenu(e: any) {
            const { detail } = e;
            console.log('handleOnWebviewContextMenu', detail);
            const { params, webContentsId, tabId } = detail;
            onContextMenu({ payload: params, webContentsId, tabId });
        }
        window.addEventListener('onMainMessage', onMainMessage);
        window.addEventListener('onWebviewContextMenu', handleOnWebviewContextMenu);
        return () => {
            window.removeEventListener('onWebviewContextMenu', handleOnWebviewContextMenu);
            window.removeEventListener('onMainMessage', onMainMessage);
        };
    }, []);

    if (!tabId) {
        return null;
    }
    return (
        <>
            <View
                abs
                hide={!findInPage}
                zIdx={2}
                sx={{ left: '50%' }}
                ml={-150}
                top={findInPageTop || 32}
                rowVCenter
                height={44}
                width={300}
            >
                <FindInPage
                    tabId={tabId}
                    findInPage={findInPage}
                    hideSearch={() => {
                        setFindInPage(null);
                    }}
                />
            </View>
            <View hide={!contextMenu}>
                <ContextMenu
                    isMute={isMute}
                    setIsMute={(v: boolean) => setIsMute(v)}
                    contextMenu={contextMenu!}
                    onHide={() => setContextMenu(null)}
                />
            </View>
        </>
    );
}
