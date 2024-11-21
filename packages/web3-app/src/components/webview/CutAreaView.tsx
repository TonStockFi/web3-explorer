import { View } from '@web3-explorer/uikit-view';
import { useRecognition } from '../../providers/RecognitionProvider';
import { CutAreaRect, useScreenshotContext } from '../../providers/ScreenshotProvider';

export function getBorderWidthFromRect(width: number, height: number, rect: CutAreaRect) {
    if (!isCutAreaExists(rect)) {
        return {
            borderLeftWidth: 0,
            borderTopWidth: 0,
            borderRightWidth: 0,
            borderBottomWidth: 0
        };
    }
    const { x, y, w, h } = rect;

    const borderLeftWidth = `${x}px`;
    const borderTopWidth = `${y}px`;
    const borderRightWidth = `${width - w - x}px`;
    const borderBottomWidth = `${height - h - y}px`;

    return {
        borderLeftWidth,
        borderTopWidth,
        borderRightWidth,
        borderBottomWidth
    };
}

export const DefaultCutRect: CutAreaRect = {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
    x: 0,
    y: 0,
    w: 0,
    h: 0
};

export function getRoiRect(rect: CutAreaRect) {
    return {
        x: rect.start.x,
        y: rect.start.y,
        w: Math.abs(rect.start.x - rect.end.x),
        h: Math.abs(rect.start.y - rect.end.y)
    };
}

let startPosition = { x: 0, y: 0 };

export function isCutAreaExists(cutAreaRect: CutAreaRect) {
    return cutAreaRect.w > 0 && cutAreaRect.h > 0;
}
export default function CutAreaRectView({
    viewSize,
    tabId,
    inPlayground,
    handleRecognition
}: {
    tabId?: string;
    handleRecognition: (tabId: string, cutAreaRect: CutAreaRect) => Promise<void>;
    inPlayground?: boolean;
    viewSize: { width: number; height: number };
}) {
    const { recognitionCatId, selectedPage } = useRecognition();
    const { isCutEnable, changeCutAreaRect, onCut, cutAreaRect, onCutting, isCutting } =
        useScreenshotContext();

    const { borderLeftWidth, borderTopWidth, borderRightWidth, borderBottomWidth } =
        getBorderWidthFromRect(viewSize.width, viewSize.height, cutAreaRect);

    const handleMouseDown = (e: any) => {
        const view = e.currentTarget.getBoundingClientRect();
        const relativeX = e.clientX - view.left;
        const relativeY = e.clientY - view.top;
        onCutting(true);
        changeCutAreaRect(DefaultCutRect);
        startPosition = { x: relativeX, y: relativeY };
    };

    const handleMouseMove = (e: any) => {
        const view = e.currentTarget.getBoundingClientRect();
        const relativeX = e.clientX - view.left;
        const relativeY = e.clientY - view.top;
        if (
            isCutting &&
            (Math.abs(startPosition.x - relativeX) > 0 ||
                Math.abs(startPosition.y - relativeY) > 0) &&
            (startPosition.x > 0 || startPosition.y > 0)
        ) {
            changeCutAreaRect({
                start: startPosition,
                end: {
                    x: relativeX,
                    y: relativeY
                },

                x: startPosition.x < relativeX ? startPosition.x : relativeX,
                y: startPosition.y < relativeY ? startPosition.y : relativeY,
                w: Math.abs(startPosition.x - relativeX),
                h: Math.abs(startPosition.y - relativeY)
            });
        }
    };

    const handleMouseUp = (e: any) => {
        const view = e.currentTarget.getBoundingClientRect();
        const relativeX = e.clientX - view.left;
        const relativeY = e.clientY - view.top;
        onCutting(false);
        if (
            (Math.abs(startPosition.x - relativeX) > 0 ||
                Math.abs(startPosition.y - relativeY) > 0) &&
            (startPosition.x > 0 || startPosition.y > 0)
        ) {
            const t = {
                start: startPosition,
                end: {
                    x: relativeX,
                    y: relativeY
                },
                x: startPosition.x < relativeX ? startPosition.x : relativeX,
                y: startPosition.y < relativeY ? startPosition.y : relativeY,
                w: Math.abs(startPosition.x - relativeX),
                h: Math.abs(startPosition.y - relativeY)
            };
            changeCutAreaRect(t);
            if (inPlayground) {
                if (tabId && recognitionCatId) {
                    handleRecognition(tabId, t);
                    onCutting(false);
                    setTimeout(() => {
                        onCut(false);
                    }, 200);
                } else {
                    onCutting(false);
                }
            }

            onCutting(false);
        } else {
            changeCutAreaRect(DefaultCutRect);
        }
    };

    let props = {};
    if (isCutEnable) {
        props = {
            onMouseDown: handleMouseDown,
            onMouseMove: handleMouseMove,
            onMouseUp: handleMouseUp
        };
    }
    let borderColor = 'transparent',
        bgcolor;

    if (isCutting) {
        borderColor = 'rgba(0, 255, 0, 0.3)';
    }
    if (isCutAreaExists(cutAreaRect)) {
        borderColor = 'rgba(0, 0, 0, 0.3)';
    } else {
        bgcolor = 'rgba(0, 0, 0, 0.3)';
    }

    return (
        <View
            sx={{
                bgcolor,
                userSelect: 'none',
                cursor: isCutEnable ? 'crosshair' : undefined,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 2,
                borderStyle: 'solid',
                borderColor,
                borderLeftWidth,
                borderTopWidth,
                borderRightWidth,
                borderBottomWidth
            }}
            {...props}
        />
    );
}
