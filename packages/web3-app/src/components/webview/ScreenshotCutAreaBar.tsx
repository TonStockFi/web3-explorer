import Paper from '@web3-explorer/uikit-mui/dist/mui/Paper';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { ImageIcon } from '@web3-explorer/uikit-view/dist/icons/ImageIcon';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import { copyImageToClipboard } from '../../common/image';
import { urlToDataUri } from '../../common/opencv';
import { currentTs } from '../../common/utils';
import { useIAppContext } from '../../providers/IAppProvider';
import { CutAreaRect, useScreenshotContext } from '../../providers/ScreenshotProvider';
import CutAreaService from '../../services/CutAreaService';
import WebviewMainEventService from '../../services/WebviewMainEventService';
import { ViewSize } from '../../types';

export function ScreenshotCutAreaBar({
    handleRecognition,
    viewSize,
    tabId,
    inPlayground
}: {
    inPlayground?: boolean;
    handleRecognition: (tabId: string, cutAreaRect: CutAreaRect) => Promise<void>;
    tabId: string;
    viewSize: ViewSize;
}) {
    const { cutAreaRect, onCutting, onCut } = useScreenshotContext();

    const { t } = useTranslation();

    const { width, height } = viewSize;
    const { x, y, h, w } = cutAreaRect;
    const barHeight = 28;
    let left, right, top;
    top = y + h + 4;
    if (x > width / 2) {
        right = width - x - w;
    } else {
        left = x;
    }
    if (top + barHeight > height) {
        top = y - 4 - barHeight;
    }
    const { env, showSnackbar } = useIAppContext();
    const theme = useTheme();
    return (
        <View abs top={top} zIdx={3} left={left} right={right}>
            <Paper
                component="form"
                sx={{
                    bgcolor: theme.backgroundPage,
                    height: barHeight,
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <View wh100p rowVCenter jSpaceBetween>
                    <View
                        onClick={async () => {
                            onCut(false);
                            const imgBlob = await CutAreaService.getCutBlob(tabId, cutAreaRect);
                            if (imgBlob) {
                                await copyImageToClipboard(imgBlob);
                                const imgData = await urlToDataUri(URL.createObjectURL(imgBlob));
                                new WebviewMainEventService().openLLMWindow(env, {
                                    site: 'Gemini',
                                    type: 'TRANS_IMG_GEMINI',
                                    ts: currentTs(),
                                    imgData
                                });
                            }
                        }}
                        iconButton={{
                            sx: {
                                width: 24,
                                height: 24
                            }
                        }}
                        iconProps={{ sx: { width: 16, height: 16 } }}
                        tips={t('TranslateInGemini')}
                        iconButtonSmall
                        icon="Translate"
                    />
                    <View
                        hide={!!inPlayground}
                        onClick={async () => {
                            onCut(false);
                            const imgBlob = await CutAreaService.getCutBlob(tabId, cutAreaRect);
                            if (imgBlob) {
                                await copyImageToClipboard(imgBlob);
                                const imgData = await urlToDataUri(URL.createObjectURL(imgBlob));
                                new WebviewMainEventService().openLLMWindow(env, {
                                    site: 'Gemini',
                                    type: 'RECO_IMG_GEMINI',
                                    ts: currentTs(),
                                    imgData
                                });
                            }
                        }}
                        iconButton={{
                            sx: {
                                width: 24,
                                height: 24
                            }
                        }}
                        iconProps={{ sx: { width: 16, height: 16 } }}
                        tips={t('RecognitionInGemini')}
                        iconButtonSmall
                        icon="AutoFixHigh"
                    />
                    <View
                        hide={!!inPlayground}
                        onClick={async () => {
                            onCut(false);
                            const imgBlob = await CutAreaService.getCutBlob(tabId, cutAreaRect);
                            if (imgBlob) {
                                await copyImageToClipboard(imgBlob);
                                showSnackbar({ message: t('CopyOk') });
                            }
                        }}
                        iconButton={{
                            sx: {
                                width: 24,
                                height: 24
                            }
                        }}
                        iconProps={{ sx: { width: 16, height: 16 } }}
                        tips={t('Copy')}
                        iconButtonSmall
                        icon="ContentCopy"
                    />
                    <View
                        hide={!inPlayground}
                        onClick={async () => {
                            handleRecognition(tabId, cutAreaRect);
                            onCutting(false);
                            setTimeout(() => {
                                onCut(false);
                            }, 200);
                        }}
                        iconButton={{
                            sx: {
                                width: 24,
                                height: 24
                            }
                        }}
                        iconProps={{ sx: { width: 16, height: 16 } }}
                        sx={{ wordBreak: 'keep-all' }}
                        tips={t('save')}
                        iconButtonSmall
                        icon={<ImageIcon icon={'Save'} size={18} />}
                    />

                    <View mx={4} divider={{ orientation: 'vertical' }} borderBox />
                    <View
                        onClick={() => {
                            onCut(false);
                        }}
                        iconButton={{
                            sx: {
                                width: 24,
                                height: 24
                            }
                        }}
                        iconProps={{ sx: { width: 16, height: 16 } }}
                        iconButtonSmall
                        icon="Close"
                    />
                </View>
            </Paper>
        </View>
    );
}
