import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { View } from '@web3-explorer/uikit-view';

export default function BitwiseOperations() {
    const canvasView = useRef(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    const handleImageLoad = () => {
        const img1 = document.getElementById('imgInput') as HTMLImageElement;
        const img2 = document.getElementById('insertedImg') as HTMLImageElement;

        if (img1.complete && img2.complete) {
            setImagesLoaded(true);
        }
    };

    useEffect(() => {
        if (!canvasView.current || !imagesLoaded) return;
        //@ts-ignore
        const { cv } = window;
        let src = cv.imread('imgInput');
        let inserted = cv.imread('insertedImg');
        let dst = new cv.Mat();
        let roi = new cv.Mat();
        let mask = new cv.Mat();
        let maskInv = new cv.Mat();
        let imgBg = new cv.Mat();
        let imgFg = new cv.Mat();
        let sum = new cv.Mat();
        let rect = new cv.Rect(0, 0, inserted.cols, inserted.rows);
        // I want to put insertedImg on top-left corner, So I create a ROI
        roi = src.roi(rect);
        // Create a mask of insertedImg and create its inverse mask also
        cv.cvtColor(inserted, mask, cv.COLOR_RGBA2GRAY, 0);
        cv.threshold(mask, mask, 0, 255, cv.THRESH_BINARY);
        cv.bitwise_not(mask, maskInv);
        // Black-out the area of insertedImg in ROI
        cv.bitwise_and(roi, roi, imgBg, maskInv);

        // Take only region of insertedImg from insertedImg
        cv.bitwise_and(inserted, inserted, imgFg, mask);

        // Put inserted in ROI and modify the main image
        cv.add(imgBg, imgFg, sum);

        dst = src.clone();
        for (let i = 0; i < inserted.rows; i++) {
            for (let j = 0; j < inserted.cols; j++) {
                dst.ucharPtr(i, j)[0] = sum.ucharPtr(i, j)[0];
            }
        }
        cv.imshow('canvasOutput', dst);
        src.delete();
        dst.delete();
        inserted.delete();
        roi.delete();
        mask.delete();
        maskInv.delete();
        imgBg.delete();
        imgFg.delete();
        sum.delete();
    }, [canvasView, imagesLoaded]);
    return (
        <View>
            <View row>
                <View mr12>
                    <img
                        src="arithmetic_operations/img2.jpg"
                        id="imgInput"
                        width="400"
                        height="250"
                        onLoad={handleImageLoad}
                    />
                </View>
                <View>
                    <img
                        src="arithmetic_operations/img5.jpg"
                        id="insertedImg"
                        onLoad={handleImageLoad}
                    />
                </View>
            </View>
            <View mt12>
                <canvas ref={canvasView} id="canvasOutput"></canvas>
            </View>
        </View>
    );
}
