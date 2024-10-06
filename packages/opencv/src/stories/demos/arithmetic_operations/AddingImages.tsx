import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { View } from '@web3-explorer/uikit-view';

export default function AddingImages() {
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
        let mask = new cv.Mat();
        let dtype = -1;
        /*
        src1: The first source matrix.
        src2: The second source matrix.
        dst: The destination matrix where the result of the addition will be stored.
        mask (optional): An optional mask specifying the operation's region of interest. Only the pixels specified by the mask will be modified.
        dtype (optional): An optional data type parameter specifying the depth of the destination matrix. If not provided, the depth of dst will be inferred from src1 and src2.
        */
        cv.add(src1, src2, dst, mask, dtype);
        cv.imshow('canvasOutput', dst);
        src1.delete();
        src2.delete();
        dst.delete();
        mask.delete();
    }, [canvasView, imagesLoaded]);
    return (
        <View>
            <View row>
                <View mr12>
                    <img
                        src="arithmetic_operations/img1.jpg"
                        onLoad={handleImageLoad}
                        id="imgInput1"
                        width="400"
                        height="250"
                    />
                </View>
                <img
                    src="arithmetic_operations/img2.jpg"
                    onLoad={handleImageLoad}
                    id="imgInput2"
                    width="400"
                    height="250"
                />
            </View>
            <View mt12>
                <canvas ref={canvasView} id="canvasOutput"></canvas>
            </View>
        </View>
    );
}
