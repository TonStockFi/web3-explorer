/**
 * 此代码执行于当前特征被识别成功，即设置阈值大于等于识别阈值 

> 全局变量:

>> OCR_REPLY: 图文识别结果

{
  id: "MESSAGE_ID",
  levels: [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9,10,11,12]
  ]
}
 */
 
class MergeArea {
    options;
    constructor() {
        const mouseOffset = 20;
        const rows = 3;
        const cols = 4;
        const scaleFactor = 8;
        const areaLeft = 12;
        const areaTop = 394;
        const xGap = 76;
        const yGap = 59;
        const width = 11;
        const height = 9;
        const rectLeft = 78 - areaLeft;
        const rectTop = 416 - areaTop;
        const areaWidth = 338;
        const areaHeight = 203;

        const xywh = { x: rectLeft, y: rectTop, w: width, h: height };
        this.options = {
            mouseOffset,
            rows,
            cols,
            scaleFactor,
            areaLeft,
            areaTop,
            xGap,
            yGap,
            width,
            height,
            rectLeft,
            rectTop,
            areaWidth,
            areaHeight,
            xywh
        };
    }
    getOptions() {
        return this.options;
    }
}
 

/**
 * 
 * @param pairs 
 * @returns 
 * 
 * 
// 示例数据
const positions = [
    { id: 5, level: 1 },
    { id: 8, level: 1 },
    { id: 3, level: 2 },
    { id: 4, level: 2 },
    { id: 10, level: 2 },
    { id: 11, level: 2 },// 将被移除
    { id: 0, level: 2 }, 
    { id: 2, level: 3 },
    { id: 7, level: 3 },
    { id: 9, level: 3 },
    { id: 6, level: 4 },
];

 * 
 */
const formatPairs = (positions) => {
    positions.sort((a, b) => a.level - b.level);
    const grouped= {};

    // 按 level 分组
    for (const position of positions) {
        if (!grouped[position.level]) {
            grouped[position.level] = [];
        }
        grouped[position.level].push(position);
    }

    const result= [];

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


const getPosition = (index,options) => {
    const { 
      cols, xywh, xGap, yGap, mouseOffset, areaLeft, areaTop 
    } = options;
    const row = Math.floor(index / cols); 
    const col = index % cols;
    const x = xywh.x + xGap * col + xywh.w / 2 - mouseOffset + areaLeft;
    const y = xywh.y + yGap * row + xywh.h / 2 - mouseOffset + areaTop;
    return { x, y };
};


async function processMerges(positions1) {
    const positionMap = new Map(positions1.map(p => [p.id, p]));

    while (true) {
        const positions = Array.from(positionMap.values()).filter(pos => pos.level > 0);
        positions.sort((a, b) => a.id - b.id);
        log(
            ' >>>> positions',
            positions.map(row => `${row.id + 1} : ${row.level}`)
        );
        
        const pairs = formatPairs(positions);
      
        log(
            ' >>>> ID',
            pairs.map(row => `${row[0].id + 1} -----> ${row[1].id + 1}`)
        );
        
        pairs.sort((a, b) => a[0].level - b[0].level);

        for (const [start, end] of pairs) {
            log(' >>>> merge ID', `${start.id + 1} -----> ${end.id + 1}`);
            
            const randomSteps = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
            const randomSleepTime = Math.floor(Math.random() * (1500 - 1000 + 1)) + 1000;

            //await dragPositon(start.position, end.position, randomSteps);
            //await sleep(randomSleepTime);
            start.level = 0
            end.level = end.level+1
            
            positionMap.set(start.id, start);
            positionMap.set(end.id, end);
            break;
        }
    }

    const positions1 = Array.from(positionMap.values())
    
    log("finish merge",positions1)

    
    return positions1;
}


async function main(){
  const { levels } = OCR_REPLY || {}
  if(levels){
    const mergeArea = new MergeArea();
    
    let positions= [];
    let j = 0;
    levels.forEach((row) => {
        row.forEach((level) => {
            const position = getPosition(j, mergeArea.getOptions());
            positions.push({
                id: j,
                position,
                level
            });
            j += 1;
        });
    });
    log(positions.length)

    const positions = await processMerges(positions);
  // positions.filter(pos => pos.level === 0);

    // for (let index = 0; index < positionsWithLevel0.length; index++) {
    //     $().click();
    //     await sleep(500);
    // }
  }
  
  //暂停1秒
  // await sleep(1000);
}

