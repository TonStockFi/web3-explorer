import { CutAreaRect, XYWHProps } from "../types";
import { currentTs } from "./utils";

export function roiAreaDelta({
    cv,
    srcId,
    xywh,
    delta
}: {
    delta: number;
    srcId: string;
    cv: any;
    xywh: XYWHProps;
}) {
    const { x, y, w, h } = xywh;
    let src = cv.imread(srcId);
    let dst = new cv.Mat();
    const x_ = x - delta < 0 ? 0 : x - delta;
    const y_ = y - delta < 0 ? 0 : y - delta;
    let rect = new cv.Rect(x_, y_, w + delta * 2, h + delta * 2);
    dst = src.roi(rect);
    src.delete();
    return dst;
}

export function matchSimpleTemplate(
    cv: any,
    refImageId: string | any,
    templImageId: string | any,
    matchThreshold: number
) {
    //https://docs.opencv.org/4.x/d4/dc6/tutorial_py_template_matching.html
    // 读取参考图像
    let src;

    src = cv.imread(refImageId);

    // 读取要查找的模板图像
    let templ = cv.imread(templImageId);
    // 创建一个用于存放匹配结果的 Mat 对象
    let dst = new cv.Mat();
    // 创建一个掩码 Mat 对象（可选）
    let mask = new cv.Mat();

    // 使用模板匹配函数进行匹配，结果存放在 dst 中
    cv.matchTemplate(src, templ, dst, cv.TM_CCOEFF, mask);

    // 获取匹配结果的最大值和最小值的位置
    let result = cv.minMaxLoc(dst, mask);

    const { maxLoc, maxVal } = result;

    //console.log('matchSimpleTemplate', { maxLoc, maxVal, matchThreshold });
    if (maxVal < matchThreshold && matchThreshold > 0) {
        src.delete();
        dst.delete();
        mask.delete();
        return null;
    }
    let matchPoint = maxLoc; // 获取最大值的位置

    // 计算矩形的右下角点
    let point = new cv.Point(matchPoint.x + templ.cols, matchPoint.y + templ.rows);
    // cv.imshow('matching_result', dst);
    // cv.imshow('matching_result1', src);
    // 释放内存
    src.delete();
    dst.delete();
    mask.delete();
    return {
        maxVal,
        start: {
            x: matchPoint.x,
            y: matchPoint.y
        },
        end: {
            x: point.x,
            y: point.y
        }
    };
}

export function matchMultiTemplate(cv: any, refImage: string | any, templImage: string | any) {
    const res = [];
    // 读取参考图像
    let src = cv.imread(refImage);
    // 读取要查找的模板图像
    let templ = cv.imread(templImage);
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
            if (newDst[i][k] > 0.99) {
                // 创建一个表示最大点的对象（匹配位置）
                let maxPoint = {
                    x: k,
                    y: i
                };
                // 计算矩形的右下角点
                let point = new cv.Point(k + templ.cols, i + templ.rows);
                res.push({
                    start: {
                        x: maxPoint.x,
                        y: maxPoint.y
                    },
                    end: {
                        x: point.x,
                        y: point.y
                    }
                });
                // 在参考图像上绘制矩形，标出匹配位置
                //cv.rectangle(src, maxPoint, point, color, 1, cv.LINE_8, 0);
            }
            start++; // 移动到下一个元素
        }
        // 更新起始和结束索引，以便处理下一行
        start = end;
        end = end + dst.cols;
    }
    //console.log(res);
    return res;
}

export function canvasToBlob(id: string, type: string = 'image/jpeg') {
    return new Promise<Blob | null>(resolve => {
        const canvas = document.getElementById(id) as HTMLCanvasElement;
        if (canvas) {
            canvas.toBlob((blob: Blob | null) => {
                resolve(blob);
            }, type);
        } else {
            resolve(null);
        }
    });
}

export async function urlToBlob(url: string) {
    const response = await fetch(url);
    return await response.blob();
}

export async function urlToDataUri(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}


export const getRoiArea = async (cutAreaRect: CutAreaRect, outputId: string, catId: string) => {
    //@ts-ignore
    const { cv } = window;
    try {
        let startTime = currentTs();

        const ele1 = document.querySelector(
            `#roi_output_${outputId.replace('#', '')}`
        ) as HTMLImageElement;

        if (!ele1) {
            return {};
        }

        let src = cv.imread(`screen_img_copy_${catId.replace('#', '')}`);
        let dst = new cv.Mat();
        const { x, y, w, h } = cutAreaRect;
        let rect = new cv.Rect(x, y, w, h);
        dst = src.roi(rect);
        cv.imshow(`roi_output_${outputId.replace('#', '')}`, dst);
        const duration = (currentTs() - startTime) / 1000;

        src.delete();
        dst.delete();
        return {
            duration,
            cutAreaRect: cutAreaRect,
            time: currentTs()
        };
    } catch (e) {
        return { err: e };
    }
};