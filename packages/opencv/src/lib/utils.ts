import { createWorker, PSM, Worker } from 'tesseract.js';
import { CV, Mat } from '../types/opencv';

export type TesseractWorker = Worker;

export const initTesseractWorker = async (): Promise<TesseractWorker> => {
    const start = +new Date();
    console.log('start initTesseractWorker');
    const worker = await createWorker('eng');
    worker.setParameters({
        tessedit_char_whitelist: '0123456789',
        tessedit_pageseg_mode: PSM.SINGLE_CHAR
    });
    console.log('initTesseractWorker ok!', +new Date() - start);
    return worker;
};

export const terminateTesseractWorker = async (worker: TesseractWorker) => {
    await worker.terminate();
};

/**
 * 
 * @param pairs 
 * @returns 
 * 
 * 
// 示例数据
const pairs = [
    { id: 5, level: 1 },
    { id: 8, level: 1 },
    { id: 3, level: 2 },
    { id: 4, level: 2 },
    { id: 10, level: 2 },
    { id: 11, level: 2 },
    { id: 12, level: 2 }, // 将被移除
    { id: 2, level: 3 },
    { id: 7, level: 3 },
    { id: 9, level: 3 },
    { id: 6, level: 4 },
];

// 调用函数
const result = formatPairs(pairs);
console.log(result);
 * 
 */
export const formatPairs = (
    pairs: { id: number; level: number; position: { x: number; y: number } }[]
) => {
    pairs.sort((a, b) => a.level - b.level);
    const grouped: {
        [level: number]: { id: number; level: number; position: { x: number; y: number } }[];
    } = {};

    // 按 level 分组
    for (const pair of pairs) {
        if (!grouped[pair.level]) {
            grouped[pair.level] = [];
        }
        grouped[pair.level].push(pair);
    }

    const result: { id: number; level: number; position: { x: number; y: number } }[][] = [];

    for (const level in grouped) {
        const items = grouped[level];

        // 如果是奇数个，移除最后一个
        if (items.length % 2 !== 0) {
            items.pop();
        }

        // 将每两个一组存储
        for (let i = 0; i < items.length; i += 2) {
            result.push([items[i], items[i + 1]]);
        }
    }

    return result;
};

export function matchSimpleTemplateV1(cv: any, src: any, templ: any, matchThreshold: number) {
    // 创建一个用于存放匹配结果的 Mat 对象
    let dst = new cv.Mat();
    // 创建一个掩码 Mat 对象（可选）
    let mask = new cv.Mat();

    // 使用模板匹配函数进行匹配，结果存放在 dst 中
    cv.matchTemplate(src, templ, dst, cv.TM_CCOEFF, mask);

    // 获取匹配结果的最大值和最小值的位置
    let result = cv.minMaxLoc(dst, mask);

    const { maxLoc, maxVal } = result;
    if (maxVal < matchThreshold && matchThreshold > 0) {
        dst.delete();
        mask.delete();
        return null;
    }
    let matchPoint = maxLoc; // 获取最大值的位置
    let point = new cv.Point(matchPoint.x + templ.cols, matchPoint.y + templ.rows);
    dst.delete();
    mask.delete();
    return {
        maxVal,
        x: matchPoint.x,
        y: matchPoint.y,
        w: templ.cols,
        h: templ.rows,
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

export function offsetTopDst(cv: CV, dst: Mat, offsetTop: number) {
    // Step 1: Create a new image with padding at the top
    let newDst = new cv.Mat(
        dst.rows + offsetTop,
        dst.cols,
        dst.type(),
        new cv.Scalar(255, 255, 255)
    ); // Create a white image (background is white)

    // Step 2: Copy the original image into the new image starting from the offset position
    let roi = new cv.Rect(0, offsetTop, dst.cols, dst.rows); // Define region of interest starting from offsetTop
    dst.copyTo(newDst.roi(roi)); // Copy the original image to the new image at the specified position
    newDst.copyTo(dst);
    newDst.delete();
}

export function resizeDst(cv: any, dst: any, scaleFactor: number) {
    let dsize = new cv.Size(dst.cols * scaleFactor, dst.rows * scaleFactor); // New size (4x the original dimensions)
    cv.resize(dst, dst, dsize, 0, 0, cv.INTER_LINEAR); // Resize the image using linear interpolation
    return dst;
}

export const processRoiImg = (
    cv: any,
    fromImg: any,
    outputId: string,
    xywh: { x: number; y: number; w: number; h: number },
    scaleFactor: number,
    gray?: boolean,
    resize?: boolean,
    offsetTop?: number
) => {
    let dst = new cv.Mat();
    let rect = new cv.Rect(xywh.x, xywh.y, xywh.w, xywh.h);
    dst = fromImg.roi(rect);
    if (resize) {
        resizeDst(cv, dst, scaleFactor);
    }
    if (offsetTop) {
        offsetTopDst(cv, dst, offsetTop);
    }

    if (gray) {
        grayImg(cv, dst);
    }
    cv.imshow(outputId, dst);

    dst.delete();
};

export const processItem = (
    cv: any,
    fromImg: any,
    outputIdPrefix: string,
    xywh: { x: number; y: number; w: number; h: number },
    index: number,
    scaleFactor: number,
    showImage: boolean
) => {
    let dst = new cv.Mat();
    let rect = new cv.Rect(xywh.x, xywh.y, xywh.w, xywh.h);
    dst = fromImg.roi(rect);
    resizeDst(cv, dst, scaleFactor);
    const id0 = outputIdPrefix + '_' + index;
    showImage && cv.imshow(id0, dst);
    grayImg(cv, dst);
    const id1 = outputIdPrefix + '_' + index + '_1';
    // 显示处理后的图像
    showImage && cv.imshow(id1, dst);
    return dst;
};

export const grayImg = (cv: CV, dst: Mat) => {
    let gray = new cv.Mat();
    let blurred = new cv.Mat();

    // 将图像转换为灰度图像
    cv.cvtColor(dst, gray, cv.COLOR_BGR2GRAY);
    // 使用高斯模糊去除噪声
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
    // 二值化处理，背景为白色，数字为黑色
    cv.threshold(gray, dst, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

    // 进行形态学操作以去除不必要的轮廓，保留数字
    let kernel = cv.Mat.ones(10, 10, cv.CV_8U);
    cv.dilate(dst, dst, kernel);
    kernel = cv.Mat.ones(3, 3, cv.CV_8U); // 小的内核
    cv.erode(dst, dst, kernel);
    cv.morphologyEx(dst, dst, cv.MORPH_CLOSE, kernel); // 关闭操作填补空隙
    cv.morphologyEx(dst, dst, cv.MORPH_OPEN, kernel); // 打开操作去除小的噪声

    kernel.delete();
    gray.delete();
    blurred.delete();
    return dst;
};

export function matchMultiTemplateV1(
    cv: any,
    refImageId: string,
    templImageId: string,
    outputId?: string
) {
    const res = [];
    // 读取参考图像
    let src = cv.imread(refImageId);
    // 读取要查找的模板图像
    let templ = cv.imread(templImageId);
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
                outputId && cv.rectangle(src, maxPoint, point, color, 1, cv.LINE_8, 0);
            }
            start++; // 移动到下一个元素
        }
        // 更新起始和结束索引，以便处理下一行
        start = end;
        end = end + dst.cols;
    }
    outputId && cv.imshow(outputId, src);
    return res;
}

export function combineCanvasesFromElements(
    canvasList: HTMLCanvasElement[],
    outputCanvas: HTMLCanvasElement
): HTMLCanvasElement {
    if (canvasList.length === 0) {
        throw new Error('The canvas list is empty.');
    }

    const outputCtx = outputCanvas.getContext('2d');
    if (!outputCtx) {
        throw new Error('Failed to get 2D context for the output canvas.');
    }

    // Calculate the total width and height for the output canvas
    const totalWidth = canvasList.reduce((sum, canvas) => sum + canvas.width, 0);
    const height = canvasList[0].height;

    // Ensure all canvases have the same height
    for (const canvas of canvasList) {
        if (canvas.height !== height) {
            throw new Error('All canvases must have the same height.');
        }
    }

    // Resize the output canvas
    outputCanvas.width = totalWidth;
    outputCanvas.height = height;

    // Draw each canvas onto the output canvas
    let currentX = 0;
    for (const canvas of canvasList) {
        outputCtx.drawImage(canvas, currentX, 0);
        currentX += canvas.width;
    }

    return outputCanvas;
}

export function combineCanvases(canvasIdList: string[], outputId: string): HTMLCanvasElement {
    if (canvasIdList.length === 0) {
        throw new Error('The canvas ID list is empty.');
    }

    // Get the output canvas by its ID
    const outputCanvas = document.getElementById(outputId) as HTMLCanvasElement | null;
    if (!outputCanvas) {
        throw new Error(`Output canvas with ID '${outputId}' not found.`);
    }

    const outputCtx = outputCanvas.getContext('2d');
    if (!outputCtx) {
        throw new Error('Failed to get 2D context for the output canvas.');
    }

    // Get all canvases from the input list by their IDs
    const canvasList: HTMLCanvasElement[] = canvasIdList.map(id => {
        const canvas = document.getElementById(id) as HTMLCanvasElement | null;
        if (!canvas) {
            throw new Error(`Canvas with ID '${id}' not found.`);
        }
        return canvas;
    });

    // Calculate the total width and height for the output canvas
    const totalWidth = canvasList.reduce((sum, canvas) => sum + canvas.width, 0);
    const height = canvasList[0].height;

    // Ensure all canvases have the same height
    for (const canvas of canvasList) {
        if (canvas.height !== height) {
            throw new Error('All canvases must have the same height.');
        }
    }

    // Resize the output canvas
    outputCanvas.width = totalWidth;
    outputCanvas.height = height;

    // Draw each canvas onto the output canvas
    let currentX = 0;
    for (const canvas of canvasList) {
        outputCtx.drawImage(canvas, currentX, 0);
        currentX += canvas.width;
    }

    return outputCanvas;
}
