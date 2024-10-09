import { useEffect, useState } from 'react';
import { View } from '@web3-explorer/uikit-view';
import { DefaultCutRect, getBorderWidthFromRect } from '../global';
import { CutAreaRect, DeviceOptions } from '../types';
import { sendLogEvent } from '../../../common/ws';

export default function ({
    width,
    height,
    deviceOptions
}: {
    width: number;
    height: number;
    deviceOptions: DeviceOptions;
}) {
    const { isCutEnable, setRecognitionAreaRect, recognitionAreaRect, setCutAreaRect } =
        deviceOptions;
    const [cutAreaRect1, setCutAreaRect1] = useState<CutAreaRect>(DefaultCutRect);

    const [isCutting, setIsCutting] = useState(false);
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
    const { borderLeftWidth, borderTopWidth, borderRightWidth, borderBottomWidth } =
        getBorderWidthFromRect(width, height, cutAreaRect1);
    const handleMouseDown = (e: any) => {
        if (deviceOptions.recognitionAreaRect.length > 0) {
            return;
        }
        const view = e.currentTarget.getBoundingClientRect(); // Get View's position and size
        const relativeX = e.clientX - view.left; // Mouse X relative to View
        const relativeY = e.clientY - view.top; // Mouse Y relative to View
        setIsCutting(true);
        setStartPosition({ x: relativeX, y: relativeY });
    };

    const handleMouseMove = (e: any) => {
        if (deviceOptions.recognitionAreaRect.length > 0) {
            return;
        }
        const view = e.currentTarget.getBoundingClientRect(); // Get View's position and size
        const relativeX = e.clientX - view.left; // Mouse X relative to View
        const relativeY = e.clientY - view.top; // Mouse Y relative to View
        if (
            isCutting &&
            (Math.abs(startPosition.x - relativeX) > 0 ||
                Math.abs(startPosition.y - relativeY) > 0) &&
            (startPosition.x > 0 || startPosition.y > 0)
        ) {
            setCutAreaRect1({
                start: startPosition,
                end: {
                    x: relativeX,
                    y: relativeY
                }
            });
        }
    };

    const handleMouseUp = (e: any) => {
        if (deviceOptions.recognitionAreaRect.length > 0) {
            return;
        }
        const view = e.currentTarget.getBoundingClientRect(); // Get View's position and size
        const relativeX = e.clientX - view.left; // Mouse X relative to View
        const relativeY = e.clientY - view.top; // Mouse Y relative to View
        setIsCutting(false);
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
                }
            };
            sendLogEvent({ cutArea: t });
            setCutAreaRect1(t);
            setCutAreaRect(t);
        } else {
            setCutAreaRect1(DefaultCutRect);
            setCutAreaRect(DefaultCutRect);
        }
    };
    useEffect(() => {
        if (!isCutEnable) {
            setCutAreaRect(DefaultCutRect);
            setCutAreaRect1(DefaultCutRect);
            setRecognitionAreaRect([]);
        } else {
            setCutAreaRect1({
                ...DefaultCutRect,
                end: {
                    x: 1,
                    y: 1
                }
            });
        }
    }, [isCutEnable]);

    useEffect(() => {
        if (recognitionAreaRect.length > 0) {
            console.log({ recognitionAreaRect });
            setCutAreaRect1(recognitionAreaRect[0]);
        } else {
            setCutAreaRect1({
                ...DefaultCutRect,
                end: {
                    x: 1,
                    y: 1
                }
            });
        }
    }, [recognitionAreaRect]);
    let props = {};
    if (isCutEnable) {
        props = {
            onMouseDown: handleMouseDown,
            onMouseMove: handleMouseMove,
            onMouseUp: handleMouseUp
        };
    }
    let borderColor = 'transparent';
    if (isCutEnable) {
        borderColor = 'rgba(0, 255, 0, 0.3)';
    }
    if (deviceOptions.recognitionAreaRect.length > 0) {
        borderColor = 'rgba(0, 0, 255, 0.8)';
    }
    return (
        <View
            sx={{
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
