import { matchSimpleTemplateV1 } from '@web3-explorer/opencv';
import { urlToDataUri } from '../common/opencv';
import { currentTs } from '../common/utils';
import { RoiInfo, SUB_WIN_ID, XYWHProps } from '../types';
import LLMGeminiService from './LLMGeminiService';
import { MessageLLM } from './LLMService';
import RoiService from './RoiService';
import WebviewMainEventService from './WebviewMainEventService';
import WebviewService from './WebviewService';

export interface OcrType {
    rect: XYWHProps;
    tabId: string;
    prompt: string;
    formatResult: string;
    timeout: number;
}

type ActionType = Map<
    number,
    {
        type: 'click' | 'drag' | 'onMatch' | 'onOcrImg';
        feature: RoiInfo;
        ocr: OcrType;
        ts: number;
        x: number;
        y: number;
        x1: number;
        y1: number;
        steps?: number;
    }
>;

function imageLoaded(img: HTMLImageElement): Promise<void> {
    return new Promise((resolve, reject) => {
        if (img.complete) {
            // Image already loaded
            resolve();
        } else {
            img.onload = () => resolve();
            img.onerror = err => reject(new Error(`Failed to load image: ${err}`));
        }
    });
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

export function combineCanvasesFromElementsToOneColumn(
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

    // Calculate the total height and maximum width for the output canvas
    const totalHeight = canvasList.reduce((sum, canvas) => sum + canvas.height, 0);
    const width = Math.max(...canvasList.map(canvas => canvas.width));

    // Ensure all canvases have the same width
    for (const canvas of canvasList) {
        if (canvas.width !== width) {
            throw new Error('All canvases must have the same width.');
        }
    }

    // Resize the output canvas
    outputCanvas.width = width;
    outputCanvas.height = totalHeight;

    // Draw each canvas onto the output canvas (stacked vertically)
    let currentY = 0;
    for (const canvas of canvasList) {
        outputCtx.drawImage(canvas, 0, currentY);
        currentY += canvas.height;
    }

    return outputCanvas;
}

export default class WebviewLoopCallbackService extends WebviewService {
    constructor(tabId: string) {
        super(tabId);
    }
    async handleScreenCopy(tabId: string) {
        let screenId = `screen_img_copy_${tabId}`;
        let img = document.getElementById(screenId) as HTMLImageElement;
        if (!img) {
            const ws = new WebviewService(tabId);
            await ws.waitwebviewIsReady();
            const size = ws.getWebViewSize();
            const screenImgUrl = await ws.getScreenImageUrl(size!);
            if (!screenImgUrl) {
                console.warn('match screenImgUrl is null');
                return;
            }
            screenId = `screen_img_copy_${tabId}_xxx`;
            img = document.createElement('img');
            img.id = screenId;
            img.style.display = 'none';
            img.src = screenImgUrl;
            document.body.appendChild(img);
            await imageLoaded(img);
        }
        if (!img) {
            console.warn('screen img is not ready', tabId);
        }
        return img;
    }
    async onMatch(feature: RoiInfo) {
        console.log('onMatch', feature);
        if (!feature) {
            return null
        }
        let startTime = currentTs();
        const { tabId } = feature;
        //@ts-ignore
        const { cv } = window;
        const img = await this.handleScreenCopy(tabId);
        if (!img) {
            return null
        }
        const imgRoiSrc = await new RoiService(feature.tabId).getImage(feature.id)
        
        const imgRoi = document.createElement('img');
        imgRoi.id = "imgRoi";
        imgRoi.style.display = 'none';
        imgRoi.src = imgRoiSrc;
        document.body.appendChild(imgRoi);
        await imageLoaded(imgRoi);

        let src = cv.imread(img);
        const { x, y, w, h } = feature.cutAreaRect;
        let rect = new cv.Rect(x, y, w, h);
        const refImg = src.roi(rect);

        let imgRoiDst = cv.imread(imgRoi);
        const matchResult = matchSimpleTemplateV1(cv, refImg, imgRoiDst, feature.threshold);
        const endTime = currentTs();
        const duration = (endTime - startTime) / 1000;
        let { maxVal } = matchResult! || { maxVal: 0 };
        maxVal = maxVal / 1000000;
        const res = {
            threshold: maxVal,
            time: endTime,
            duration
        };
        if (img && img.id.endsWith("_xxx")) {
            img.remove();
        }
        imgRoi.remove()
        imgRoiDst.delete()
        refImg.delete();
        src.delete();
        return res;
    }
    async responseActionResult(ts:number,result:any){
        const ts1 = currentTs()
        await this.execJs(`__ActionResults.set(${ts},${JSON.stringify({
            duration:(ts1 - ts)/1000,
            result
        })})`);
    }
    async onOcrImg(data: OcrType, ts: number) {
        const { rect, tabId, prompt, formatResult, timeout } = data;
        console.log("onOcrImg",data)
        await this.log("onOcrImg")
        let startTime = currentTs();
        const ls = new LLMGeminiService(LLMGeminiService.getTabId());
        const wme = new WebviewMainEventService()
        if(!await wme.isWinReady(SUB_WIN_ID.OCR)){
            ls.setIsReady(false)
            await wme.openOcrWindow();
        }
        if (!ls.getIsReady()) {
            const isGeminiReady = await ls.checIsReady(timeout);
            if (!isGeminiReady) {
                await this.log('ocr>> GeminiIsReady is false');
                return null;
            }
        }
        
        const ws = new WebviewService(tabId);
        await ws.waitwebviewIsReady();
        const { x, y, w, h } = rect;
        const blob = await ws.captureScreenToBlob(x, y, w, h);
        if (!blob) {
            await this.log('ocr captureScreenToBlob is null');
            return null;
        }
        const url = URL.createObjectURL(blob);
        const dataUrl = await urlToDataUri(url);
        const messageId = LLMGeminiService.genId();
        await this.log(`messageId: ${messageId}`)
        let message:MessageLLM =  {
            id: messageId,
            tabId,
            ts: currentTs(),
            prompt,
            formatResult,
            imageUrl: dataUrl
        }
        if(formatResult){
            message = await ls.sendMessageWaitForReply(
                message,
                timeout
            );
            if (!message || !message.reply) {
                await this.log('ocr>> Gemini ocr reply message is null');
                return null;
            }
        }else{
            await this.log(`formatResult is null,sendMessageOnce`)
            await ls.sendMessageOnce(message)
            return null;
        }

        const endTime = currentTs();
        const duration = (endTime - startTime) / 1000;
        const res = {
            duration,
            reply: message.reply
        };
        console.log('ocr>> message reply', message.reply, duration);
        return res
    }
    async log(message:string){
        await this.execJs(`console.log("> ${message}")`);
    }
    async process() {
        const ws = this;
        if (ws.webviewIsReady()) {
            const __Actions: ActionType = await ws.execJs(`
                //console.debug("> loop action...",!window.__Actions ? "" :window.__Actions.size)
                return window.__Actions;`);

            if (__Actions && __Actions.size > 0) {
                const keys = Array.from(__Actions).map(row => row[0]);
                keys.sort((a, b) => a - b);
                const ts = keys[0];
                await ws.execJs(`__Actions.delete(${ts})`);
                const action = __Actions.get(ts)!;
                console.debug('useTimeoutLoop', ts, __Actions.get(ts));
                const { x, y, x1, y1, type, feature, ocr, steps } = action;
                await this.log(`run action: ${type} ts:${ts}`)
                if (type === 'click') {
                    await ws.sendClickEvent(action.x, action.y);
                    await this.responseActionResult(ts,true)
                }
                if (type === 'onMatch') {
                    const res = await this.onMatch(feature);
                    await this.responseActionResult(ts,res)
                }

                if (type === 'onOcrImg') {
                    const res = await this.onOcrImg(ocr, ts);
                    await this.responseActionResult(ts,res)
                }
                if (type === 'drag') {
                    await ws.sendDragEvent({ x, y }, { x: x1, y: y1 }, steps || 10);
                    await this.responseActionResult(ts,true)
                }
            }
        }
    }
}
