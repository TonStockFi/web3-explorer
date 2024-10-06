import * as React from 'react';
import { useEffect, useState } from 'react';
import { View } from '@web3-explorer/uikit-view';

export default function TemplateMatchingImage() {
    const [imagesLoaded, setImagesLoaded] = useState(false);

    const handleImageLoad = () => {
        const img1 = document.getElementById('referenceImage') as HTMLImageElement;
        const img2 = document.getElementById('imgToFind') as HTMLImageElement;
        if (img1.complete && img2.complete) {
            setImagesLoaded(true);
        }
    };

    useEffect(() => {
        if (!imagesLoaded) return;
        //@ts-ignore
        const { cv } = window;

        // 读取参考图像
        let src = cv.imread('referenceImage');
        // 读取要查找的模板图像
        let templ = cv.imread('imgToFind');
        // 创建一个用于存放匹配结果的 Mat 对象
        let dst = new cv.Mat();
        // 创建一个掩码 Mat 对象（可选）
        let mask = new cv.Mat();

        // 使用模板匹配函数进行匹配，结果存放在 dst 中
        cv.matchTemplate(src, templ, dst, cv.TM_CCOEFF, mask);

        // 获取匹配结果的最大值和最小值的位置
        let result = cv.minMaxLoc(dst, mask);
        let maxPoint = result.maxLoc; // 获取最大值的位置
        console.log({ maxPoint, templ });
        // 定义矩形的颜色（红色）
        let color = new cv.Scalar(255, 0, 0, 255);

        // 计算矩形的右下角点
        let point = new cv.Point(maxPoint.x + templ.cols, maxPoint.y + templ.rows);

        // 在参考图像上绘制矩形，标出匹配位置
        cv.rectangle(src, maxPoint, point, color, 1, cv.LINE_8, 0);

        // 在画布上显示结果图像
        cv.imshow('canvasOutput', src);

        // 释放内存
        src.delete();
        dst.delete();
        mask.delete();
    }, [imagesLoaded]);
    return (
        <View column>
            <View mb12>
                <View mb12>
                    <img
                        onLoad={handleImageLoad}
                        id="imgToFind"
                        src="template_matching/img2.jpg"
                        alt="Test Image"
                    />
                </View>
                <View mr12>
                    <img
                        onLoad={handleImageLoad}
                        id="referenceImage"
                        src="template_matching/img1.jpg"
                        alt="Reference Image"
                    />
                </View>
            </View>
            <View>
                <canvas id="canvasOutput"></canvas>
            </View>
        </View>
    );
}
