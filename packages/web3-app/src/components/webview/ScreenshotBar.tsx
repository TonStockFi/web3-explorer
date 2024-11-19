import Paper from '@web3-explorer/uikit-mui/dist/mui/Paper';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { CutAreaRect, useScreenshotContext } from '../../providers/ScreenshotProvider';

import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import { ViewSize } from '../../types';
import { DefaultCutRect, isCutAreaExists } from './CutAreaView';
import { ScreenshotCutAreaBar } from './ScreenshotCutAreaBar';

export function ScreenshotBar({
    viewSize,
    handleRecognition,
    tabId,
    inPlayground
}: {
    inPlayground?: boolean;
    handleRecognition: (
        tabId: string,
        cutAreaRect: CutAreaRect,
        selectedPage?: string
    ) => Promise<void>;
    tabId: string;
    viewSize: ViewSize;
}) {
    const { t } = useTranslation();
    const { isCutting, cutAreaRect, changeCutAreaRect, onCut } = useScreenshotContext();
    const theme = useTheme();

    if (isCutAreaExists(cutAreaRect) && !isCutting && !inPlayground) {
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
                        mr={4}
                        buttonVariant="outlined"
                        onClick={() => {}}
                        button={t('CutArea')}
                        sx={{ wordBreak: 'keep-all' }}
                        buttonStartIcon={
                            <View iconProps={{ sx: { width: '0.8rem' } }} icon="Screenshot" />
                        }
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
