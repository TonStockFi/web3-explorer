//@ts-nocheck
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { View } from '@web3-explorer/uikit-view';

export default function ArucoMarkerDetectionWebCam() {
    const canvasView = useRef(null);
    useEffect(() => {
        if (!canvasView.current) return;
        //@ts-ignore
        const { cv } = window;
        async function init() {
            let canvas = canvasView.current;
            //@ts-ignore
            let ctx = canvas.getContext('2d');

            let arucoDictionary = new cv.Dictionary(cv.DICT_4X4_100);
            let parameters = new cv.DetectorParameters();

            const video = document.getElementById('input_video');
            try {
                let stream = await navigator.mediaDevices.getUserMedia({ video: true });
                video.srcObject = stream;
            } catch (error) {
                console.error('Error accessing the webcam:', error);
                return;
            } //@ts-ignore

            const videoLoadedPromise = new Promise(resolve => {
                video.onloadedmetadata = () => {
                    video.play();
                    resolve();
                };
            });

            await videoLoadedPromise;

            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;
            canvas.width = videoWidth;
            canvas.height = videoHeight;

            let markerIds = new cv.Mat();
            let markerCorners = new cv.MatVector();
            let rgbImage = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC3);

            function processFrame() {
                ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
                const imageData = ctx.getImageData(0, 0, videoWidth, videoHeight);
                cv.cvtColor(cv.matFromImageData(imageData), rgbImage, cv.COLOR_RGBA2RGB, 0);
                cv.detectMarkers(rgbImage, arucoDictionary, markerCorners, markerIds, parameters);
                console.log(markerIds.data32S[0]); // to get the marker ID
                if (markerIds.rows > 0) {
                    cv.drawDetectedMarkers(rgbImage, markerCorners, markerIds);
                    cv.imshow(canvas, rgbImage);
                } else {
                    cv.imshow(canvas, cv.matFromImageData(imageData));
                }
                requestAnimationFrame(processFrame);
            }

            processFrame();
        }
        init();
    }, [canvasView]);
    return (
        <View>
            <video id="input_video" width="320" height="240" autoPlay></video>
            <canvas ref={canvasView} id="output_canvas" width="320" height="240"></canvas>
            <div id="threejs_canvas"></div>
        </View>
    );
}
