import { RoiInfo } from './RoiService';

export class F {
    constructor(id?: string) {}
}

export class G {

    static getFeatures() {}
    static getMatchedIds() {}
    static isTest() {}
    static random(start: number, end: number) {}
    static async sleep() {}
    static log() {}
    static featureMatched(id:string) {}
    static waitForResult(cb: () => any | Promise<any>, timeout: number, interval: number) {}
    static async click(position: { x: number; y: number }) {}
    static async clickRect(rect: { x: number; y: number; w: number; h: number },sleepSecond:number) {}
    static async showRect(
        rect: { x: number; y: number; w: number; h: number },
        showSeconds?: number,
        color?: string
    ) {}
    static async clickFeature(feature: F,sleepSeconds:number) {}
    static async clearRect(delaySeconds: number) {}
    static async drag(x: number, y: number, x1: number, y1: number, steps: number) {}
}

export const GMethodSnapCodes: Record<string, string> = {
    featureMatched: `\n// if Feature Matched
if(G.featureMatched("#1")){

}`,

    isTest: `\n// Get isTest 
const isTest = G.isTest();
G.log(isTest);`,

    getFeatures: `\n// Get Features
const Features = G.getFeatures();
G.log(Features);`,

    getMatchedIds: `\n// Get matched ids
const matchedIds = G.getMatchedIds();
G.log(matchedIds);`,

    random: `\n// Generate a random number between start and end
const randomNumber = G.random(10, 99);
G.log(randomNumber);`,

    log: `\nG.log("")`,

    sleep: `\n// Pause execution for a specified time (in seconds)
await G.sleep(2);`,

    waitForResult: `\n// Wait for a callback to return a truthy value within a timeout
const result = await G.waitForResult(() => {
    return true;
}, 5000, 500);
if (result) {
    G.log("Callback succeeded!");
} else {
    G.log("Callback timed out!");
}`,

    click: `\n// click at a specific position
await G.click({x, y});`,

    clickFeature: `\n// click at the center of a feature
await G.clickFeature(F("#1"));`,

    clickRect: `\n// a click at a specific rect and sleep 1 seconds
await G.clickRect({x, y, w , h}, 1);`,

    showRect: `\n// show a specific rect
G.showRect({x, y, w , h});`,

    clearRect: `\n// clear all rect
await G.clearRect(1);`,
    
    drag: `\n// a drag a postion to position
await G.drag(x,y,x1,y1);`,
    
};

export const jsCodePrefix = `

if(!window.__Actions){
    window.__Actions = new Map()
}

if(!window.__ActionResults){
    window.__ActionResults = new Map()
}
    
class G {
    static __isTest = false;

    static __CurrentFeatureId = null;
    static __matchedIds = [];
    static __Features = new Map();
    
    static getCurrentFeatureId() {
        return G.__CurrentFeatureId;
    }

    static setMatchedIds(v){
        G.__matchedIds = v;
    }

    static getMatchedIds(){
        return G.__matchedIds;
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
        
    static getCache(key,value) {
        const res = localStorage.getItem("_G-"+key,value)
        if(res){
            const data = JSON.parse(res)
            return data[0]
        }else{
            return null
        }
    }
    static setCache(key,value) {
        localStorage.setItem("_G-"+key,JSON.stringify([value]))
    }

    static featureMatched(featureId){
        return  G.__matchedIds.indexOf(featureId) > -1
    }
        
    static random(start, end) {
        return Math.floor(Math.random() * (end - start + 1)) + start;
    }
    static isTest(){
        return G.__isTest;
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
        }, 30000, 500);
    }

    static async clickFeature(feature,sleepSeconds) {
        const { x, y, w, h } = feature;
        return G.clickRect({ x, y, w, h },sleepSeconds);
    }

    static async clickRect({ x, y, w, h },sleepSeconds) {
        await G.click({x:x + w / 2, y:y + h / 2});
        if(sleepSeconds){
            await G.sleep(sleepSeconds)
        }
    }

    static drag(x, y, x1, y1, steps = 1) {
        const ts = +new Date();
        console.log("G.drag", x, y, x1, y1, steps);
        window.__Actions.set(ts, { type: "drag", ts, x, y, x1, y1, steps });
        return G.waitForResult(() => {
            const res = window.__Actions.get(ts);
            return !res;
        }, 30000, 500);
    }


    static async onOcrImg(ocr,timeout = 30000,interval = 1000) {
        const ts = +new Date();
        window.__Actions.set(ts, { type: "onOcrImg", ts, ocr });
        return G.waitForResult(() => {
            const res = window.__Actions.get(ts);
            if(res){
                return false
            }else{
                const result = window.__ActionResults.get(ts);
                if(result){
                    window.__ActionResults.delete(ts)
                    return result
                }
                return {};
            }
        }, timeout, interval);
    }
    static async onMatch(featureId,timeout = 30000,interval = 1000) {
        const ts = +new Date();
        const {feature} = F(featureId) || {}
        if(!feature){
            return null;
        }
        window.__Actions.set(ts, { type: "onMatch", ts, feature });
        return G.waitForResult(() => {
            const res = window.__Actions.get(ts);
            if(res){
                return false
            }else{
                const result = window.__ActionResults.get(ts);
                if(result){
                    window.__ActionResults.delete(ts)
                    return result
                }
                return {};
            }
        }, timeout, interval);
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
            throw new Error(id+", Error: feature is null! ")
        }
        return this;
    }

    get id() {
        return this.feature.id;
    }

    get name() {
        return this.feature.name || "";
    }
        
    get feature() {
        return this.feature || {};
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

    click(sleepSeconds) {
        return G.clickFeature(this,sleepSeconds)
    }
}
const F = (id)=>{
    return new Feature(id)
}
`;

export default class JsCodeService {
    static formatCodeWithFeature(
        code: string,
        roi: RoiInfo | null,
        roiAreaList: RoiInfo[],
        isTest: boolean = false,
        matchedIds: string[] = []
    ) {
        let features: string[] =  [];
        features = [...matchedIds]
        const matches = [...code.matchAll(/#\d+/g)]; // 使用扩展运算符将迭代器转换为数组
        matches.forEach(match => {
            if(features.indexOf(match[0]) === -1){
                features.push(match[0]);
            }
        });
        if (roi) {
            if(features.indexOf(roi.id) === -1){
                features.push(roi.id);
            }
        }
        const featuresPrefix = JsCodeService.getFeaturesPrefix(roi, roiAreaList, features);

        const matchedIdsInPagePrefix = JsCodeService.getMatchedIdsInPagePrefix(matchedIds);

        return JsCodeService.formatCode(
            `\n${featuresPrefix}\n${matchedIdsInPagePrefix}\n${code}\n`,
            isTest
        );
    }

    static getMatchedIdsInPagePrefix(ids: string[]) {
        return `\nG.setMatchedIds(${JSON.stringify(ids)});\n`;
    }
    static getFeaturesPrefix(roi: RoiInfo | null, roiAreaList: RoiInfo[], features: string[]) {
        const currentFeatureId = roi ? `"${roi.id}"` : 'null';
        const roiAreaListNew = [...roiAreaList]
            .filter(row => {
                return features.indexOf(row.id) > -1;
            })
            .map(row => {
                const { jsCode, ...row1 } = row;
                return row1;
            });

        return `\nG.setCurrentFeatureId(${currentFeatureId});\nG.setFeatures(${JSON.stringify(
            roiAreaListNew,
            null,
            2
        )});\n`;
    }
    
    static formatCode(code: string, isTest?: boolean) {
        let testCode = isTest ? 'G.__isTest = true\n' : '';
        const code1 = `
try{
    ${jsCodePrefix}\n\n${testCode}\n${code}
    if(main){
        return await main()
    }else{
        return null;
    }
}catch(e){
    alert(e.stack)
    console.log(">>>> error <<<<< ", e.stack)
    return null
}`;
        return JsCodeService.handleConsole(code1);
    }

    static handleConsole(code: string) {
        const res = code.replace(/console\.log\(/g, function () {
            return `console.log('[>>>]',`;
        });
        return res;
    }
}
