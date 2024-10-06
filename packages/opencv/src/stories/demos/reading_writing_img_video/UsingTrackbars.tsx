import { Box } from '@web3-explorer/uikit-v1';
import * as React from 'react';
import { useState } from 'react';

export default function UsingTrackbars() {
    //@ts-ignore
    const { cv } = window;
    const [value, setValue] = useState(50);
    const onChange = ({ target }: { target: any }) => {
        let trackbar = target; // 获取滑动条的引用
        let alpha = Number(trackbar.value) / Number(trackbar.max); // 计算 alpha 值，范围在 0 到 1 之间
        let beta = 1.0 - alpha; // 计算 beta 值

        // 从输入图像中读取图像数据
        let src1 = cv.imread('imgInput1'); // 读取第一幅图像
        let src2 = cv.imread('imgInput2'); // 读取第二幅图像
        let dst = new cv.Mat(); // 创建一个用于存放结果的 Mat 对象

        // 将两幅图像进行加权合成
        //https://docs.opencv.org/4.x/d5/d2b/group__cannops__elem.html#ga4d9913d767fc04aec7fba55f58e272dc
        cv.addWeighted(src1, alpha, src2, beta, 0.0, dst, -1); // 合成结果存放在 dst 中
        cv.imshow('canvasOutput', dst); // 在 canvasOutput 上显示合成结果

        // 释放内存
        dst.delete(); // 删除结果 Mat 对象
        src1.delete(); // 删除第一幅图像的 Mat 对象
        src2.delete(); // 删除第二幅图像的 Mat 对象

        // 更新滑动条的值
        setValue(Number(trackbar.value)); // 设置当前滑动条的值
    };
    return (
        <Box column alignItems={'flex-start'}>
            <Box mt12>
                <Box mr12>
                    <img src="reading_writing_img_video/img1.png" id="imgInput1" />
                </Box>
                <Box mr12>
                    <img src="reading_writing_img_video/img2.png" id="imgInput2" />
                </Box>
            </Box>
            <Box mt12>
                <input
                    value={value}
                    min="0"
                    max="100"
                    step="1"
                    id="trackbar"
                    type="range"
                    onChange={onChange}
                />
            </Box>
            <Box mt12>
                <canvas id="canvasOutput"></canvas>
            </Box>
        </Box>
    );
}
