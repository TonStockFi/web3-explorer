import { View } from '@web3-explorer/uikit-view/dist/View';
import { useEffect, useRef, useState } from 'react';
import { canvasToBlob, getRoiArea } from '../../common/opencv';
import { currentTs } from '../../common/utils';
import { DEFAULT_THRESHOLD, ENTRY_ID_ROI } from '../../constant';

import { getRecoId, usePlayground } from '../../providers/PlaygroundProvider';
import { useRecognition } from '../../providers/RecognitionProvider';
import { useScreenshotContext } from '../../providers/ScreenshotProvider';
import CutAreaService from '../../services/CutAreaService';

import { RoiInfo, XYWHProps } from '../../types';
import CutAreaRectView from './CutAreaView';
import { ScreenshotBar } from './ScreenshotBar';

export const getPlaygroundCutImag = async (tabId: string, cutAreaRect: XYWHProps) => {
    const img = document.querySelector(`#screen_img_copy_${tabId}`) as HTMLImageElement;
    if (!img) {
        return;
    }

    const r = await getRoiArea(cutAreaRect, 'tmp', tabId);
    if (!r) {
        return;
    }
    const blob = await canvasToBlob(`roi_output_tmp`);
    if (!blob) {
        return;
    }
    const cutImageUrl = URL.createObjectURL(blob);
    return cutImageUrl;
};

export default function ScreenshotView({
    tabId,
    inPlayground
}: {
    inPlayground?: boolean;
    tabId: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const { onCutting } = useScreenshotContext();

    const { addRoiArea, recognitionCatId, showRecognition } = useRecognition();
    const [viewSize, setViewSize] = useState({ width: 0, height: 0 });
    const { currentAccount, tab } = usePlayground();

    const handleRecognition = async (tabId: string, cutAreaRect: XYWHProps) => {
        if (!currentAccount || !tab) {
            return;
        }
        if (recognitionCatId) {
            showRecognition('');
        }
        const recoId = getRecoId(tab, currentAccount);
        let cutImageUrl;

        if (inPlayground) {
            cutImageUrl = await getPlaygroundCutImag(tabId, cutAreaRect);
            if (!cutImageUrl) {
                return;
            }
        } else {
            const image = await CutAreaService.getCutBlob(tabId, cutAreaRect);
            if (!image) {
                return;
            }
            cutImageUrl = URL.createObjectURL(image);
        }

        const ts = currentTs();

        //@ts-ignore
        delete cutAreaRect.start;
        //@ts-ignore
        delete cutAreaRect.end;
        const roiInfo: RoiInfo = {
            priority: 1000,
            id: '',
            pid: ENTRY_ID_ROI,
            ts,
            tabId,
            type: 'reco',
            threshold: DEFAULT_THRESHOLD,
            cutAreaRect: cutAreaRect!
        };
        addRoiArea(roiInfo, cutImageUrl, recoId);
        onCutting(false);
    };
    useEffect(() => {
        if (!ref.current) {
            return;
        }
        const updateViewSize = () => {
            if (ref.current) {
                const { clientHeight, clientWidth } = ref.current;
                setViewSize({
                    width: clientWidth,
                    height: clientHeight
                });
            }
        };
        updateViewSize();
        window.addEventListener('resize', updateViewSize);
        return () => {
            window.removeEventListener('resize', updateViewSize);
        };
    }, [ref]);
    return (
        <View
            ref={ref}
            borderRadius={8}
            absFull
            bottom={0}
            left={0}
            right={0}
            sx={{ cursor: 'crosshair' }}
            zIdx={2}
            top={0}
        >
            <ScreenshotBar
                inPlayground={inPlayground}
                handleRecognition={handleRecognition}
                tabId={tabId}
                viewSize={viewSize}
            />
            {viewSize.width > 0 && (
                <CutAreaRectView
                    handleRecognition={handleRecognition}
                    inPlayground={inPlayground}
                    tabId={tabId}
                    viewSize={viewSize}
                />
            )}
        </View>
    );
}
