import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { View } from '@web3-explorer/uikit-view';

export default function SubtractingImages() {
    const canvasView = useRef(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    const handleImageLoad = () => {
        const img1 = document.getElementById('imgInput1') as HTMLImageElement;
        const img2 = document.getElementById('imgInput2') as HTMLImageElement;

        if (img1.complete && img2.complete) {
            setImagesLoaded(true);
        }
    };

    useEffect(() => {
        if (!canvasView.current || !imagesLoaded) return;
        //@ts-ignore
        const { cv } = window;
        let src1 = cv.imread('imgInput1');
        let src2 = cv.imread('imgInput2');

        // Convert images to RGB channel
        let src1RGB = new cv.Mat();
        let src2RGB = new cv.Mat();
        // Subtraction works with RGB
        cv.cvtColor(src1, src1RGB, cv.COLOR_BGR2RGB);
        cv.cvtColor(src2, src2RGB, cv.COLOR_BGR2RGB);
        let dst = new cv.Mat();
        let mask = new cv.Mat();
        let dtype = 0;
        cv.subtract(src1RGB, src2RGB, dst);
        cv.imshow('canvasOutput', dst);

        // Clean up
        src1.delete();
        src2.delete();
        src1RGB.delete();
        src2RGB.delete();
        dst.delete();
        mask.delete();
    }, [canvasView, imagesLoaded]);
    return (
        <View>
            <View row mb12>
                <View mr12>
                    <img
                        onLoad={handleImageLoad}
                        src="arithmetic_operations/img1.jpg"
                        id="imgInput1"
                        width="400"
                        height="250"
                    />
                </View>
                <img
                    onLoad={handleImageLoad}
                    src="arithmetic_operations/img2.jpg"
                    id="imgInput2"
                    width="400"
                    height="250"
                />
            </View>
            <View>
                <canvas ref={canvasView} id="canvasOutput"></canvas>
            </View>
        </View>
    );
}
