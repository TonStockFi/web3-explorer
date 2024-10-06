import * as React from 'react';
import { useEffect, useState } from 'react';
import { View } from '@web3-explorer/uikit-view';

export default function RegionOfInterest() {
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const handleImageLoad = () => {
        const img1 = document.getElementById('imgInput') as HTMLImageElement;
        if (img1.complete) {
            setImagesLoaded(true);
        }
    };

    useEffect(() => {
        if (!imagesLoaded) return;
        //@ts-ignore
        const { cv } = window;

        // Img is 320px by 320px
        let src = cv.imread('imgInput');
        let dst = new cv.Mat();
        /*
        Like in canvas
        x = 50: The x-coordinate of the top-left corner of the rectangle.
        y = 50: The y-coordinate of the top-left corner of the rectangle.
        width = 200: The width of the rectangle.
        height = 200: The height of the rectangle.
        we use roi to improve accuracy of detection, instead of searching
        for whole image, we basically focus on particular region.
        */
        let rect = new cv.Rect(50, 50, 200, 200);
        dst = src.roi(rect);
        cv.imshow('canvasOutput', dst);
        src.delete();
        dst.delete();
    }, [imagesLoaded]);
    return (
        <View row>
            <View mr12>
                <img onLoad={handleImageLoad} src="region_of_interest/img1.png" id="imgInput"></img>
            </View>
            <View>
                <canvas id="canvasOutput"></canvas>
            </View>
        </View>
    );
}
