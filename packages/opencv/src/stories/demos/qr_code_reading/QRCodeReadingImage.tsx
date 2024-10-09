import * as React from 'react';
import { useEffect, useRef } from 'react';
import { View } from '@web3-explorer/uikit-view';

export default function QRCodeReadingImage() {
    const canvasView = useRef(null);

    useEffect(() => {
        if (!canvasView.current) return;
        //@ts-ignore
        const { cv } = window;

        let canvas = canvasView.current as any;
        let ctx = canvas.getContext('2d');

        let img = document.createElement('img');
        img.src = 'qr_code_reading/code.png';
        img.onload = function () {
            let cvImg = cv.imread(img);
            let qcd = new cv.QRCodeDetector();

            let qrCode = new cv.Mat();
            let points = new cv.Mat();
            let straightQrCode = new cv.Mat();

            let retval = qcd.detectAndDecode(cvImg);
            console.log(retval);

            cv.putText(
                cvImg,
                retval,
                new cv.Point(10, 20),
                cv.FONT_HERSHEY_SIMPLEX,
                0.8,
                new cv.Scalar(0, 255, 0, 255),
                1,
                cv.LINE_AA
            );

            cv.imshow('result', cvImg);
        };
    }, [canvasView]);
    return (
        <View>
            <canvas ref={canvasView} id="result" width="440" height="275"></canvas>
        </View>
    );
}
