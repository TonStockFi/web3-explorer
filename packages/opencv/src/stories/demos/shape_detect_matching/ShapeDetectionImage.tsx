import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box } from '@web3-explorer/uikit-v1';

export default function ShapeDetectionImage() {
    const [imagesLoaded, setImagesLoaded] = useState(false);

    const handleImageLoad = () => {
        const img1 = document.getElementById('referenceImage') as HTMLImageElement;

        if (img1.complete) {
            setImagesLoaded(true);
        }
    };

    useEffect(() => {
        if (!imagesLoaded) return;
        //@ts-ignore
        const { cv } = window;

        // 读取输入图像
        let src = cv.imread('referenceImage');

        // 转换为灰度图像
        let gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // 应用阈值处理以创建二值图像
        let thresh = new cv.Mat();
        cv.threshold(gray, thresh, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);

        // 定义形态学操作的核
        let kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));

        // 应用形态学的开操作去除噪声
        cv.morphologyEx(thresh, thresh, cv.MORPH_OPEN, kernel);

        // 查找轮廓
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(thresh, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

        // 逐个绘制符合面积条件的轮廓，并检测形状
        let color = new cv.Scalar(0, 255, 0, 255);
        for (let i = 0; i < contours.size(); i++) {
            let area = cv.contourArea(contours.get(i));

            // 显示面积在2000到20000之间的轮廓
            if (area > 2000 && area < 20000) {
                cv.drawContours(src, contours, i, color, 2, cv.LINE_8, hierarchy, 0);

                // 使用多边形近似法获取角点数量
                let approx = new cv.Mat();
                cv.approxPolyDP(
                    contours.get(i),
                    approx,
                    0.01 * cv.arcLength(contours.get(i), true),
                    true
                );
                let numCorners = approx.rows;

                // 根据角点数量确定形状
                let shape = 'unknown';
                if (numCorners == 3) {
                    shape = 'triangle';
                } else if (numCorners == 4) {
                    let rect = cv.boundingRect(approx);
                    let aspectRatio = rect.width / rect.height;
                    if (aspectRatio >= 0.95 && aspectRatio <= 1.05) {
                        shape = 'square';
                    } else {
                        shape = 'rectangle';
                    }
                } else if (numCorners == 5) {
                    shape = 'pentagon';
                } else if (numCorners == 6) {
                    shape = 'hexagon';
                } else if (numCorners == 7) {
                    shape = 'heptagon';
                } else if (numCorners == 8) {
                    shape = 'octagon';
                } else if (numCorners == 9) {
                    shape = 'nonagon';
                } else if (numCorners == 10) {
                    shape = 'decagon';
                } else if (numCorners == 11) {
                    shape = 'hendecagon';
                } else if (numCorners == 12) {
                    shape = 'dodecagon';
                } else {
                    shape = 'circle';
                }

                // 计算轮廓的中心点
                let moments = cv.moments(contours.get(i));
                let centerX = moments.m10 / moments.m00;
                let centerY = moments.m01 / moments.m00;

                // 在图像上绘制形状名称、角点数量
                let text = shape + ' (' + numCorners + ')';
                let fontFace = cv.FONT_HERSHEY_SIMPLEX;
                let fontScale = 0.5;
                let thickness = 1;
                let textOrg = new cv.Point(centerX - 50, centerY);
                cv.putText(
                    src,
                    text,
                    textOrg,
                    fontFace,
                    fontScale,
                    new cv.Scalar(255, 0, 0, 255),
                    thickness
                );
            }
        }

        // 显示结果图像
        cv.imshow('canvasOutput', src);

        // 释放内存
        gray.delete();
        thresh.delete();
        contours.delete();
        hierarchy.delete();
        src.delete();
    }, [imagesLoaded]);
    return (
        <Box column alignItems={'flex-start'}>
            <Box>
                <img
                    onLoad={handleImageLoad}
                    id="referenceImage"
                    src="shape_detect_matching/shapes.jpg"
                />
            </Box>
            <Box mt12>
                <canvas id="canvasOutput"></canvas>
            </Box>
        </Box>
    );
}
