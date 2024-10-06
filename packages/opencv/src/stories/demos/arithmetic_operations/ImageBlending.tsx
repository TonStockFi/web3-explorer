import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { View } from '@web3-explorer/uikit-view';

export default function ImageBlending() {
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
        let dst = new cv.Mat();
        let alpha = 0.5; // Weight for the first image
        let beta = 0.5; // Weight for the second image
        let gamma = 0; // Scalar added to the result
        cv.addWeighted(src1, alpha, src2, beta, gamma, dst);
        cv.imshow('canvasOutput', dst);
        src1.delete();
        src2.delete();
        dst.delete();
    }, [canvasView, imagesLoaded]);
    return (
        <View>
            <View row>
                <View mr12>
                    <img
                        onLoad={handleImageLoad}
                        src="arithmetic_operations/img1.jpg"
                        id="imgInput1"
                        width="300"
                        height="200"
                    />
                </View>
                <img
                    onLoad={handleImageLoad}
                    src="arithmetic_operations/img2.jpg"
                    id="imgInput2"
                    width="300"
                    height="200"
                />
            </View>
            <View mt12>
                <canvas ref={canvasView} id="canvasOutput"></canvas>
            </View>
        </View>
    );
}
