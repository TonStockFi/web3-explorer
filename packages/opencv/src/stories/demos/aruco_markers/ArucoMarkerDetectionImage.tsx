import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { View } from '@web3-explorer/uikit-view';

export default function ArucoMarkerDetectionImage() {
    const canvasView = useRef(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    const handleImageLoad = () => {
        const img1 = document.getElementById('input_image') as HTMLImageElement;

        if (img1.complete) {
            setImagesLoaded(true);
        }
    };

    useEffect(() => {
        if (!canvasView.current || !imagesLoaded) return;
        //@ts-ignore
        const { cv } = window;

        let canvas = canvasView.current as any;
        let ctx = canvas.getContext('2d');

        let arucoDictionary = new cv.Dictionary(cv.DICT_4X4_100);
        let parameters = new cv.DetectorParameters();
        let inputImage = cv.imread(document.getElementById('input_image'));

        let markerIds = new cv.Mat();
        let markerCorners = new cv.MatVector();
        let rgbImage = new cv.Mat();

        cv.cvtColor(inputImage, rgbImage, cv.COLOR_RGBA2RGB, 0);
        cv.detectMarkers(rgbImage, arucoDictionary, markerCorners, markerIds, parameters);
        console.log(markerIds.data32S[0]); // to get the marker ID
        if (markerIds.rows > 0) {
            cv.drawDetectedMarkers(rgbImage, markerCorners, markerIds);
            cv.imshow(canvas, rgbImage);
        } else {
            cv.imshow(canvas, inputImage);
        }
    }, [canvasView, imagesLoaded]);
    return (
        <View>
            <View row>
                <View mr12>
                    <img
                        onLoad={handleImageLoad}
                        id="input_image"
                        src="aruco_markers/markers.jpg"
                        width="320"
                        height="240"
                    />
                </View>
                <View>
                    <canvas ref={canvasView} id="output_canvas" width="320" height="240"></canvas>
                </View>
            </View>
            <div id="threejs_canvas"></div>
        </View>
    );
}
