import Paper from '@web3-explorer/uikit-mui/dist/mui/Paper';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { ImageIcon } from '@web3-explorer/uikit-view/dist/icons/ImageIcon';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import { getWinId, showAlertMessage, showGlobalLoading } from '../../common/helpers';
import { copyImageToClipboard } from '../../common/image';
import { urlToDataUri } from '../../common/opencv';
import { copyTextToClipboard, currentTs } from '../../common/utils';
import { useIAppContext } from '../../providers/IAppProvider';
import { usePlayground } from '../../providers/PlaygroundProvider';
import { CutAreaRect, useScreenshotContext } from '../../providers/ScreenshotProvider';
import CutAreaService from '../../services/CutAreaService';
import LLMService from '../../services/LLMService';
import WebviewMainEventService from '../../services/WebviewMainEventService';
import { SUB_WIN_ID, ViewSize } from '../../types';

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
    const {
        currentExtension,
        onChangeCurrentExtension,
        onChangeCurrentRecoAreaImage,
        currentAccount,
        tab
    } = usePlayground();
    const { t, i18n } = useTranslation();

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
    const { showSnackbar, env } = useIAppContext();
    const theme = useTheme();
    return (
        <>
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
                            mr={4}
                            onClick={async () => {
                                showGlobalLoading(true);
                                handleRecognition(tabId, cutAreaRect);
                                setTimeout(() => {
                                    showGlobalLoading(false);
                                    onCut(false);
                                }, 1000);
                            }}
                            iconButton={{
                                sx: {
                                    width: 24,
                                    height: 24
                                }
                            }}
                            hide={getWinId() === SUB_WIN_ID.LLM}
                            iconProps={{ sx: { width: 16, height: 16 } }}
                            tips={t('提取特征')}
                            iconButtonSmall
                            icon="Add"
                        />

                        <View
                            divider
                            dividerProps={{
                                orientation: 'vertical'
                            }}
                        ></View>
                        <View
                            mr={4}
                            onClick={async () => {
                                showGlobalLoading(true);
                                const prompt = `${t('RecognitionImageTransTo').replace(
                                    '%{lang}',
                                    t(i18n.language)
                                )}`;
                                const message = {
                                    id: LLMService.genId(),
                                    tabId: tab?.tabId!,
                                    ts: currentTs(),
                                    prompt
                                };

                                const imgBlob = await CutAreaService.getCutBlob(tabId, cutAreaRect);

                                if (!imgBlob) {
                                    showSnackbar(false);
                                    return showAlertMessage('截图失败', true);
                                }

                                const url = URL.createObjectURL(imgBlob);
                                const imageUrl = await urlToDataUri(url);

                                new WebviewMainEventService().openLLMWindow({
                                    site: 'Gemini',
                                    message: {
                                        ...message,
                                        imageUrl
                                    }
                                });
                                setTimeout(() => {
                                    showGlobalLoading(false);
                                    onCut(false);
                                }, 1000);
                            }}
                            iconButton={{
                                sx: {
                                    width: 24,
                                    height: 24
                                }
                            }}
                            hide={getWinId() === SUB_WIN_ID.LLM}
                            iconProps={{ sx: { width: 16, height: 16 } }}
                            tips={t('TranslateInGemini')}
                            iconButtonSmall
                            icon="Translate"
                        />

                        <View
                            mr={4}
                            hide={!!inPlayground}
                            onClick={async () => {
                                onCut(false);
                                const imgBlob = await CutAreaService.getCutBlob(tabId, cutAreaRect);
                                if (imgBlob) {
                                    await copyImageToClipboard(imgBlob);
                                    showSnackbar({ message: t('CopyOk') });
                                    setTimeout(() => {
                                        showSnackbar(false);
                                    }, 3000);
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
                            mr={4}
                            onClick={async () => {
                                await copyTextToClipboard(
                                    `\n//clickRect and sleep 1 seconds\nawait G.clickRect({x:${x}, y:${y}, w:${w}, h:${h}}, 1)\n`
                                );
                                showSnackbar({
                                    message: `Copied!`
                                });
                                onCut(false);
                            }}
                            iconButton={{
                                sx: {
                                    width: 24,
                                    height: 24
                                }
                            }}
                            iconProps={{ sx: { width: 16, height: 16 } }}
                            tips={`点击复制`}
                            iconButtonSmall
                            icon="AdsClick"
                        />
                        <View
                            hide
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
                            tips={t('特征提取保存')}
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
        </>
    );
}
