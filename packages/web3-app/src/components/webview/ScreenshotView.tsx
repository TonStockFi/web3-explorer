import { View } from '@web3-explorer/uikit-view/dist/View';
import { useEffect, useRef, useState } from 'react';
import { canvasToBlob, getRoiArea } from '../../common/opencv';
import { currentTs } from '../../common/utils';
import { DEFAULT_THRESHOLD, PAGE_ALL_ROI } from '../../constant';

import { useIAppContext } from '../../providers/IAppProvider';
import { usePlayground } from '../../providers/PlaygroundProvider';
import { useRecognition } from '../../providers/RecognitionProvider';
import { CutAreaRect, useScreenshotContext } from '../../providers/ScreenshotProvider';
import CutAreaService from '../../services/CutAreaService';
import { RoiInfo } from '../../services/RoiService';
import WebviewMainEventService from '../../services/WebviewMainEventService';
import { SUB_WIN_ID } from '../../types';
import CutAreaRectView from './CutAreaView';
import { ScreenshotBar } from './ScreenshotBar';

export const getPlaygroundCutImag = async (catId: string, cutAreaRect: CutAreaRect) => {
    const img = document.querySelector(`#screen_img_copy_${catId}`) as HTMLImageElement;
    if (!img) {
        return;
    }

    const r = await getRoiArea(cutAreaRect, 'tmp', catId);
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
    const { addRoiArea, recognitionCatId, selectedPage } = useRecognition();
    const [viewSize, setViewSize] = useState({ width: 0, height: 0 });
    const { currentAccount, tab } = usePlayground();
    const { env } = useIAppContext();
    const handleRecognition = async (
        tabId: string,
        cutAreaRect: CutAreaRect,
        selectedPage?: string
    ) => {
        if (!currentAccount) {
            return;
        }
        let cutImageUrl;
        const catId = tabId;

        if (inPlayground) {
            cutImageUrl = await getPlaygroundCutImag(catId, cutAreaRect);
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
        let pageBelongTo = '';
        if (selectedPage && selectedPage !== PAGE_ALL_ROI) {
            pageBelongTo = selectedPage;
        }

        //@ts-ignore
        delete cutAreaRect.start;
        //@ts-ignore
        delete cutAreaRect.end;
        const roiInfo: RoiInfo = {
            priority: 0,
            id: '',
            ts,
            catId,
            pageBelongTo,
            threshold: DEFAULT_THRESHOLD,
            cutAreaRect: cutAreaRect!
        };
        if (!inPlayground) {
            const s = new WebviewMainEventService();
            const isReady = await s.isWinReady(SUB_WIN_ID.PLAYGROUND);
            const payload = {
                account: currentAccount,
                tab,
                roiInfo,
                cutImageUrl
            };
            if (!isReady) {
                await new WebviewMainEventService().openFeatureWindow(env, 'onAddRoiArea', payload);
            } else {
                await s.sendMessageToSubWin(SUB_WIN_ID.PLAYGROUND, 'onAddRoiArea', payload);
            }
        } else {
            addRoiArea(roiInfo, cutImageUrl, recognitionCatId);
        }

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
