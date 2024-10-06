import * as React from 'react';
import { useEffect, useState } from 'react';
import { View } from '@web3-explorer/uikit-view';

export default function TemplateMatchingImageMulti() {
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
        // cv.TM_CCORR_NORMED 是归一化的相关匹配方法
        cv.matchTemplate(src, templ, dst, cv.TM_CCORR_NORMED, mask);

        // 定义矩形的颜色（绿色）
        let color = new cv.Scalar(0, 255, 0, 255);

        // 创建一个数组用于存放归一化匹配结果
        var newDst: any = [];
        var start = 0; // 匹配结果的起始索引
        var end = dst.cols; // 匹配结果的结束索引（列数）

        // 遍历匹配结果的每一行
        for (var i = 0; i < dst.rows; i++) {
            newDst[i] = []; // 初始化当前行的数组

            // 遍历匹配结果的每一列
            for (var k = 0; k < dst.cols; k++) {
                newDst[i][k] = dst.data32F[start]; // 获取匹配结果的值

                // 如果匹配值大于 0.97，表示匹配度较高
                if (newDst[i][k] > 0.97) {
                    // 创建一个表示最大点的对象（匹配位置）
                    let maxPoint = {
                        x: k,
                        y: i
                    };
                    // 计算矩形的右下角点
                    let point = new cv.Point(k + templ.cols, i + templ.rows);
                    // 在参考图像上绘制矩形，标出匹配位置
                    cv.rectangle(src, maxPoint, point, color, 1, cv.LINE_8, 0);
                }
                start++; // 移动到下一个元素
            }
            // 更新起始和结束索引，以便处理下一行
            start = end;
            end = end + dst.cols;
        }

        // 在画布上显示匹配结果的图像
        cv.imshow('canvasOutput', src);
    }, [imagesLoaded]);
    return (
        <View column alignItems={'flex-start'}>
            <View>
                <img onLoad={handleImageLoad} id="imgToFind" src="template_matching/multi2.jpg" />
            </View>
            <View mt12>
                <img
                    onLoad={handleImageLoad}
                    id="referenceImage"
                    src="template_matching/multi1.jpg"
                />
            </View>
            <View mt={12}>
                <canvas id="canvasOutput"></canvas>
            </View>
        </View>
    );
}
