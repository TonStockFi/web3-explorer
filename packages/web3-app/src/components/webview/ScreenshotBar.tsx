import Paper from '@web3-explorer/uikit-mui/dist/mui/Paper';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { useScreenshotContext } from '../../providers/ScreenshotProvider';

import { useTranslation } from '@web3-explorer/lib-translation';
import { useTheme } from 'styled-components';
import { isPlaygroundMaster, showGlobalLoading } from '../../common/helpers';
import { ExtensionType } from '../../providers/PlaygroundProvider';
import WebviewMainEventService from '../../services/WebviewMainEventService';
import WebviewService from '../../services/WebviewService';
import { ViewSize, XYWHProps } from '../../types';
import { DefaultCutRect, isCutAreaExists } from './CutAreaView';
import { ScreenshotCutAreaBar } from './ScreenshotCutAreaBar';

export function ScreenshotBar({
    viewSize,
    handleRecognition,
    tabId,
    inPlayground
}: {
    inPlayground?: boolean;
    handleRecognition: (tabId: string, cutAreaRect: XYWHProps) => Promise<void>;
    tabId: string;
    viewSize: ViewSize;
}) {
    const { t } = useTranslation();
    const { isCutting, cutAreaRect, changeCutAreaRect, onCut } = useScreenshotContext();
    const theme = useTheme();

    if (isCutAreaExists(cutAreaRect) && !isCutting) {
        return (
            <ScreenshotCutAreaBar
                inPlayground={inPlayground}
                handleRecognition={handleRecognition}
                tabId={tabId}
                viewSize={viewSize}
            />
        );
    }
    return (
        <View
            abs
            top={4}
            zIdx={3}
            sx={{ left: '50%', transform: `translateX(-50%)` }}
            hide={isCutting}
        >
            <Paper
                component="form"
                sx={{
                    bgcolor: theme.backgroundPage,
                    p: '6px 8px',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <View wh100p rowVCenter jSpaceBetween>
                    <View
                        tips="拖动鼠标，选取截取区域"
                        mr={4}
                        buttonProps={{
                            disabled: true
                        }}
                        buttonVariant="text"
                        button={t('CutArea')}
                        sx={{ wordBreak: 'keep-all' }}
                        buttonStartIcon={
                            <View iconProps={{ sx: { width: '0.8rem' } }} icon="Screenshot" />
                        }
                    />
                    <View
                        hide={isPlaygroundMaster()}
                        mr={4}
                        buttonVariant="text"
                        onClick={async () => {
                            const ws = new WebviewService(tabId);
                            if (ws.webviewIsReady()) {
                                try {
                                    const size = ws.getWebViewSize();
                                    if (!size) {
                                        return;
                                    }
                                    showGlobalLoading(true);
                                    const screenImgUrl = await ws.getScreenImageUrl(size);

                                    if (screenImgUrl) {
                                        new WebviewMainEventService().sendFeatureAction(
                                            'onFullscreen',
                                            {
                                                screenImgUrl
                                            }
                                        );
                                        new WebviewMainEventService().openFeatureTab(
                                            ExtensionType.GEMINI
                                        );
                                    }
                                } catch (error) {
                                    console.error(error);
                                } finally {
                                    showGlobalLoading(false, 1);
                                }
                            }
                            onCut(false);
                        }}
                        button={t('全屏截图')}
                        sx={{ wordBreak: 'keep-all' }}
                    />

                    <View divider={{ orientation: 'vertical' }} borderBox />
                    <View
                        onClick={() => {
                            onCut(false);
                            changeCutAreaRect(DefaultCutRect);
                        }}
                        iconFontSize="0.9rem"
                        iconButtonSmall
                        icon="Close"
                    />
                </View>
            </Paper>
        </View>
    );
}
