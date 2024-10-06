import * as React from 'react';
import { useEffect, useState } from 'react';

import { Box } from '@web3-explorer/uikit-v1';
import { useOpenCv } from '../../../lib/useOpenCv';

export default function ReadAndDisplayImg() {
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const handleImageLoad = () => {
        const img1 = document.getElementById('imageSrc') as HTMLImageElement;
        if (img1.complete) {
            setImagesLoaded(true);
        }
    };
    const { cv } = useOpenCv();
    useEffect(() => {
        if (!imagesLoaded) return;
        /*
           cv.imread("canvasID/canvas or imageID or image")
           is used to read image in OpenCV.js
           new cv.Mat() - we are saving image in OpenCV in this way
           cv.imshow("canvas to display result", src) is used to display image in OpenCV
           */
        let src = cv.imread('imageSrc');
        let dst = new cv.Mat();
        // To distinguish the input and output, we graying the image.
        // You can try different conversions.
        // Here we convert RGBA image to Gray
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
        cv.imshow('canvasOutput', dst);
        src.delete();
        dst.delete();
    }, [imagesLoaded]);
    return (
        <Box>
            <Box mr12>
                <img
                    onLoad={handleImageLoad}
                    id="imageSrc"
                    src="reading_writing_img_video/sampleImgTwo.jpg"
                />
            </Box>
            <Box mr12>
                <canvas id="canvasOutput"></canvas>
            </Box>
        </Box>
    );
}
