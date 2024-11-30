import { RoiInfo } from "./RoiService";

export class F {
    constructor(id?: string) {}
}

export class G {
    static random(start: number, end: number) {}
    static async sleep() {}
    static log() {}
    static waitForResult(cb: () => any | Promise<any>, timeout: number, interval: number) {}
    static async click(position: { x: number; y: number }) {}
    static async clickRect(rect: { x: number; y: number; w: number; h: number }) {}
    static async showRect(
        rect: { x: number; y: number; w: number; h: number },
        showSeconds?: number,
        color?:string
    ) {}
    static async clickFeature(feature: F) {}
    static async clearRect(delaySeconds:number) {}
    static async drag(x: number, y: number, x1: number, y1: number, steps: number) {}
}

export const GMethodSnapCodes: Record<string, string> = {
    getOcrResult: `// Get Ocr Result
const ocrResult = G.getOcrResult();
G.log(ocrResult);`,

    random: `// Generate a random number between start and end
const randomNumber = G.random(10, 99);
G.log(randomNumber);`,

    log: `G.log("")`,

    sleep: `// Pause execution for a specified time (in seconds)
await G.sleep(2);`,

    waitForResult: `// Wait for a callback to return a truthy value within a timeout
const result = await G.waitForResult(() => {
    return true;
}, 5000, 500);
if (result) {
    G.log("Callback succeeded!");
} else {
    G.log("Callback timed out!");
}`,

    click: `// click at a specific position
await G.click({x, y});`,

    clickFeature: `// click at the center of a feature
await G.clickFeature(F("#1"));`,

    clickRect: `// a click at a specific rect
await G.clickRect({x, y, w , h});`,

    showRect: `// show a specific rect
G.showRect({x, y, w , h});`,

    clearRect: `// clear all rect
await G.clearRect(1);`,

    drag: `// a drag a postion to position
await G.drag(x,y,x1,y1);`
};


export const jsCodePrefix = `

if(!window.__Actions){
    window.__Actions = new Map()
}
class G {
    static isTest = false;
    static __OcrResult = null;
    static __CurrentFeatureId = null;
    static __Features = new Map();
    
    static getCurrentFeatureId() {
        return G.__CurrentFeatureId;
    }

    static setCurrentFeatureId(id) {
        G.__CurrentFeatureId = id;
    }
    static getFeatures() {
        return G.__Features;
    }

    static setFeatures(rows) {
        rows.forEach(row=>{
            G.__Features.set(row.id,row)
        })
    }

    static getOcrResult() {
        return G.__OcrResult;
    }

    static setOcrResult(ocrReply) {
        G.__OcrResult = ocrReply;
    }

    static random(start, end) {
        return Math.floor(Math.random() * (end - start + 1)) + start;
    }

    static log(...args) {
        console.log(...args.map(arg =>
            typeof arg === 'object' && arg !== null ? JSON.stringify(arg) : arg
        ));
    }

    static sleep(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    static waitForResult(cb, timeout = -1, interval = 1000) {
        const startTime = Date.now();
        return new Promise((resolve) => {
            const checkReply = async () => {
                try {
                    const res = await Promise.resolve(cb()); // Ensure cb result is a Promise
                    if (res) {
                        resolve(res);
                        return;
                    }
                    if (timeout > -1 && Date.now() - startTime > timeout) {
                        resolve(false);
                        return;
                    }
                    setTimeout(checkReply, interval);
                } catch (error) {
                    console.error("Error in waitForResult callback:", error);
                    resolve(false);
                }
            };
            checkReply();
        });
    }

    static click({ x, y }) {
        const ts = +new Date();
        console.log("G.click", x, y);
        window.__Actions.set(ts, { type: "click", ts, x, y });
        return G.waitForResult(() => {
            const res = window.__Actions.get(ts);
            return !res;
        }, 30000, 1000);
    }

    static clickFeature(feature) {
        const { x, y, w, h } = feature;
        return G.clickRect({ x, y, w, h });
    }

    static clickRect({ x, y, w, h }) {
        return G.click({x:x + w / 2, y:y + h / 2});
    }

    static drag(x, y, x1, y1, steps = 1) {
        const ts = +new Date();
        console.log("G.drag", x, y, x1, y1, steps);
        window.__Actions.set(ts, { type: "drag", ts, x, y, x1, y1, steps });
        return G.waitForResult(() => {
            const res = window.__Actions.get(ts);
            return !res;
        }, 30000, 1000);
    }

    static async clearRect(delaySeconds) {
        const t = delaySeconds ? delaySeconds * 1000: 0
        setTimeout(() => {
           const rects = document.querySelectorAll('.__react');
            rects.forEach(rect => {
                rect.parentNode.removeChild(rect);  // Safely remove the node
            }); 
        },t); 
        await G.sleep(delaySeconds)
    }
    static drawArrowLine(x, y, x1, y1, width = 2, showSeconds = 0, color = "red") {
        // Calculate the angle of the arrow
        const angle = Math.atan2(y1 - y, x1 - x);

        // Create an SVG container
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.style.position = "fixed";
        svg.style.left = "0";
        svg.style.top = "0";
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.zIndex = "1000000000";
        svg.style.pointerEvents = "none"; // Ignore mouse events

        // Create the line
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x);
        line.setAttribute("y1", y);
        line.setAttribute("x2", x1);
        line.setAttribute("y2", y1);
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", width);
        svg.appendChild(line);

        // Create the arrowhead
        const arrowhead = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        const arrowSize = 10; // Size of the arrowhead
        const arrowX = x1 - arrowSize * Math.cos(angle - Math.PI / 6);
        const arrowY = y1 - arrowSize * Math.sin(angle - Math.PI / 6);
        const arrowX2 = x1 - arrowSize * Math.cos(angle + Math.PI / 6);
        const arrowY2 = y1 - arrowSize * Math.sin(angle + Math.PI / 6);
        arrowhead.setAttribute("points", \`\${x1},\${y1} \${arrowX},\${arrowY} \${arrowX2},\${arrowY2}\`);
        arrowhead.setAttribute("fill", color);
        svg.appendChild(arrowhead);

        // Append the SVG to the body
        document.body.appendChild(svg);

        // Remove the arrow after the specified time
        if (showSeconds && showSeconds > 0) {
            setTimeout(() => {
                try {
                    document.body.removeChild(svg);
                } catch (e) {}
            }, showSeconds * 1000);
        }
    }

    static showRect({x, y, w, h}, showSeconds = 0,color = "red",text = "" ) {
        const rect = document.createElement('div');
        rect.className = '__react';
        rect.style.position = 'fixed';
        rect.style.left = x+"px";
        rect.style.top =  y+"px";
        rect.style.width = w+"px";
        rect.style.height = h+"px";
        rect.style.zIndex = '1000000000';
        rect.style.opacity = '0.8';
        rect.style.backgroundColor = color;
        rect.style.pointerEvents = 'none';
        rect.style.display = 'flex'; // Use Flexbox for centering
        rect.style.justifyContent = 'center'; // Horizontally center the text
        rect.style.alignItems = 'center'; // Vertically center the text
        
        if (text) {
            rect.innerText = text;
        }
        document.body.appendChild(rect);
        if (showSeconds && showSeconds > 0) {
            setTimeout(() => {
                try{document.body.removeChild(rect)}catch(e){}
            }, showSeconds * 1000); // Convert seconds to milliseconds
        }
    }
}

class Feature {
    id;
    feature;
    constructor(id) {
        this.id = id || G.__CurrentFeatureId;
        this.feature = G.__Features.get(this.id);
        if(!this.feature){
            throw new Error("no feature")
        }
        return this;
    }

    get id() {
        return this.feature.id;
    }

    get w() {
        return this.feature.cutAreaRect.w || 0;
    }

    get h() {
        return this.feature.cutAreaRect.h || 0;
    }

    get x() {
        return this.feature.cutAreaRect.x;
    }

    get y() {
        return this.feature.cutAreaRect.y;
    }
        
    get rect() {
        return this.feature.cutAreaRect;
    }

    click() {
        return G.clickFeature(this)
    }
}
const F = (id)=>{
    return new Feature(id)
}
`

export default class JsCodeService {
    static formatCodeWithFeature(code:string,roi:RoiInfo|null,roiAreaList:RoiInfo[],ocrResult:null|string|any,isTest?:boolean){
        let features:string[] = []
        const matches = [...code.matchAll(/#\d+/g)]; // 使用扩展运算符将迭代器转换为数组
        matches.forEach(match => {
            features.push(match[0])
        });
        const featuresPrefix = JsCodeService.getFeaturesPrefix(roi,roiAreaList,features)
        const ocrPrefix = JsCodeService.getOcrResultPrefix(ocrResult)
        return JsCodeService.formatCode(`\n${ocrPrefix}\n${featuresPrefix}\n${code}\n`,isTest)
    }
    static getFeaturesPrefix(roi:RoiInfo|null,roiAreaList:RoiInfo[],features:string[]) {
        const currentFeatureId = roi ? `"${roi.id}"` : "null";
        const roiAreaListNew = [...roiAreaList].filter(row=>{
            return row.id === currentFeatureId || features.indexOf(row.id) > -1
        }).map(row=>{
            const {jsCode,testJsCode,ocrReplyFormat,ocrPrompt,...row1} = row
            return row1
        })
        
        return `\nG.setCurrentFeatureId(${currentFeatureId});\nG.setFeatures(${JSON.stringify(roiAreaListNew,null,2)});\n`
    }
    static getOcrResultPrefix(ocrResult:any) {
        let ocrResultString = 'null';
        if (ocrResult && typeof ocrResult === 'string') {
            ocrResultString = `'${ocrResult}'`;
        }

        if (ocrResult && typeof ocrResult !== 'string') {
            ocrResultString = JSON.stringify(ocrResult, null, 2);
        }
        return `G.setOcrResult(${ocrResultString});\n`
    }
    static formatCode(code: string,isTest?:boolean) {
        let testCode = isTest ? "G.isTest = true\n":""
        const code1 = `
try{
    ${jsCodePrefix}\n\n${testCode}\n${code}
    if(main){
        return main()
    }else{
        return null;
    }
}catch(e){
    console.log("error",e.message,e.stack)
    return null
}`
        return JsCodeService.handleConsole(code1)
    }

    static handleConsole(code: string) {
        const res = code.replace(/console\.log\(/g, function() {
            return `console.log('[>>>]',`;
        });
        return res
    }
}
