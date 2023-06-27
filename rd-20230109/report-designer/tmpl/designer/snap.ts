/**
 * 拖动吸附对齐
 */
import Magix from 'magix5';
import Const from './const';
import Enum from './enum';
import Transform from './transform';
let { node, State } = Magix;

let alignLocker = {};
/**
 * 可对齐元素的类型
 */
let Display_Line = 1;//需要展示的
let Axis_X_Line = 2;//x辅助线
let Axis_Y_Line = 4;//y辅助线

let MaxNum = Number.MAX_VALUE;

let { min, max, atan, PI, sin, cos, tan, abs, } = Math;

let sortAsc = (a, b) => a - b;

let approachZero = Const['@:{const#approach.zero}'];

let minUnitPx = 1;
let halfUnitPx = .5 + approachZero;

/**
 * 合并同样位置的吸附辅助线，减少最终生成辅助线的DOM数量
 * @param align 记录辅助线信息的数组
 * @param aberration 误差
 * @param snapInfo 吸附辅助线信息
 */
let mergeSamePositionSnapLine = (align: number[][],
    aberration: number,
    snapInfo: number[]) => {
    let find;
    for (let a of align) {
        if (abs(a[0] - snapInfo[0]) <= aberration) {
            find = 1;
            if (a[1] > snapInfo[1]) {
                a[1] = snapInfo[1];
            }
            if (a[2] < snapInfo[2]) {
                a[2] = snapInfo[2];
            }
            break;
        }
    }
    if (!find) {
        align.push(snapInfo);
    }
};

let queryXAndYFromAlignElements = (neType,
    neLeft,
    neTop,
    neWidth,
    neHeight,
    neXDiffed,
    neYDiffed,
    helpLineIsShown) => {
    let nearestX;
    //根据type不同，采用不同的测量方案
    if (neType == Axis_X_Line) {//x辅助线
        //如果辅助线临时隐藏，则不比较
        nearestX = helpLineIsShown ? [neLeft] : [];//只需要比较辅助线坐标
    } else if (neType == Axis_Y_Line) {//y辅助线
        nearestX = [];//不比较
    } else {//普通元素，比较左中右3个x坐标
        if (neWidth < Const['@:{const#element.min.px.size}']) {
            nearestX = [neLeft];
        } else {
            nearestX = [];
            if (Enum['@:{enum#align.line.coners}'] & Const['@:{const#align.points}']) {
                nearestX.push(neLeft, neLeft + neWidth);
            }
            if (Enum['@:{enum#align.centers}'] & Const['@:{const#align.points}']) {
                nearestX.push(neLeft + neWidth / 2);
            }
            if (neXDiffed) {
                nearestX.push(...neXDiffed);
            }
        }
    }
    let nearestY;//同x的逻辑
    if (neType == Axis_Y_Line) {
        nearestY = helpLineIsShown ? [neTop] : [];
    } else if (neType == Axis_X_Line) {
        nearestY = [];
    } else {
        if (neHeight < Const['@:{const#element.min.px.size}']) {
            nearestY = [neTop];
        } else {
            nearestY = [];
            if (Enum['@:{enum#align.line.coners}'] & Const['@:{const#align.points}']) {
                nearestY.push(neTop, neTop + neHeight);
            }
            if (Enum['@:{enum#align.centers}'] & Const['@:{const#align.points}']) {
                nearestY.push(neTop + neHeight / 2);
            }
            if (neYDiffed) {
                nearestY.push(...neYDiffed);
            }
        }
    }
    return {
        h: nearestX,
        v: nearestY
    };
};

let queryFinalPoint = (dragHandler,
    handX, handY,
    cx, cy,
    sWidth, osWidth,
    sHeight, osHeight,
    oppsiteWidth, oppsiteHeight) => {
    let finalX, finalY;
    if (handY == 'm') {//左右中间手柄
        finalX = cx + (sWidth + osHeight / 2) * oppsiteWidth;
        finalY = cy + (osWidth - sHeight / 2) * oppsiteWidth;
    } else if (handX == 'm') {//上下中间手柄
        finalX = cx + (sWidth / 2 - osHeight) * oppsiteHeight;
        finalY = cy + (sHeight + osWidth / 2) * oppsiteHeight;
    } else if (dragHandler == 'tl' ||
        dragHandler == 'br') {//左上右下
        finalX = cx + (sWidth - osHeight) * oppsiteWidth;
        finalY = cy + (sHeight + osWidth) * oppsiteHeight;
    } else {//左下右上
        finalX = cx + (sWidth + osHeight) * oppsiteWidth;
        finalY = cy + (sHeight - osWidth) * oppsiteHeight;
    }
    return {
        x: finalX,
        y: finalY
    };
};
export default {
    /**
     * 查询所有可对齐元素的可用对齐信息，比如旋转后的元素多2个对齐点
     * @param allElements 所有可对齐的元素
     * @param maskId 如果在窗口里，则表示容器格子的遮盖层id
     * @param element 鼠标下的元素，比如同时拖动多个元素
     * @param selectedMap 选中的元素id对象，选中的元素一起移动，所以需要从对齐的元素中排除
     */
    '@:{align#query.align.elements}'(allElements: Report.StageElement[], maskId?: string, element?: Report.StageElement,
        selectedMap?: object): Report.AlignNearestElementResult {
        let nearestElements: Report.AlignNearestElementRectangle[] = [];
        let scale = State.get<number>('@:{global#stage.scale}');//缩放
        let { pages, grid, snapGrid, gridHeight, gridWidth, width, height } = State.get<Report.StagePage>('@:{global#stage.page}');//几个编辑区

        let pos = Transform['@:{transform#get.stage.dom.rect}']();
        let singlePageHeight = pos.height / pages;//单个编辑区高度
        let maskBound,
            startX,
            startY,
            othersElements = [];
        for (let i = 0; i < pages; i++) {//几个编辑区是逻辑上的设置，它们仍然是一个节点，所以这里需要进行位置拆分
            nearestElements.push({
                '@:{align.queried#type}': Display_Line,
                '@:{align.queried#left}': 0,
                '@:{align.queried#top}': i * singlePageHeight,
                '@:{align.queried#width}': pos.width,
                '@:{align.queried#height}': singlePageHeight
            });
        }
        if (maskId) {//元素处在元素格子里，则拖动时，该格子也可以成为对齐对象
            let hodMaskNode = node<HTMLDivElement>(maskId);
            if (hodMaskNode) {
                maskBound = hodMaskNode.getBoundingClientRect();
                nearestElements.push({
                    '@:{align.queried#type}': Display_Line,
                    '@:{align.queried#left}': maskBound.x - pos.x,
                    '@:{align.queried#top}': maskBound.y - pos.y,
                    '@:{align.queried#width}': maskBound.width,
                    '@:{align.queried#height}': maskBound.height
                });
            }
        }
        let xLines = State.get('@:{global#stage.x.help.lines}');
        let yLines = State.get('@:{global#stage.y.help.lines}');
        for (let x of xLines) {
            nearestElements.push({
                '@:{align.queried#type}': Axis_X_Line,
                '@:{align.queried#left}': x * scale
            });
        }
        for (let y of yLines) {
            nearestElements.push({
                '@:{align.queried#type}': Axis_Y_Line,
                '@:{align.queried#top}': y * scale
            });
        }
        if (grid &&
            snapGrid) {
            let pxOfGridWidth = Const['@:{const#to.px}'](gridWidth),
                pxOfWidth = Const['@:{const#to.px}'](width),
                pxOfGridHeight = Const['@:{const#to.px}'](gridHeight),
                pxOfHeight = Const['@:{const#to.px}'](height);
            for (let x = pxOfGridWidth; x <= pxOfWidth; x += pxOfGridWidth) {
                nearestElements.push({
                    '@:{align.queried#type}': Display_Line,
                    '@:{align.queried#left}': x * scale,
                    '@:{align.queried#top}': 0,
                    '@:{align.queried#width}': 0,
                    '@:{align.queried#height}': pos.height
                });
            }
            for (let p = 0; p < pages; p++) {
                for (let y = pxOfGridHeight; y <= pxOfHeight; y += pxOfGridHeight) {
                    nearestElements.push({
                        '@:{align.queried#type}': Display_Line,
                        '@:{align.queried#top}': y * scale + p * pxOfHeight * scale,
                        '@:{align.queried#left}': 0,
                        '@:{align.queried#width}': pxOfWidth,
                        '@:{align.queried#height}': 0
                    });
                }
            }
        }
        if (element &&
            !selectedMap?.[element.id]) {
            let { props, ctrl } = element;
            let { '@:{focus.ctrl}': focused,
                '@:{cached.key.points}': keyPoints } = props;
            if (focused &&
                keyPoints &&
                Const['@:{const#align.svg.self.points}']) {
                for (let p of keyPoints) {
                    if (p != focused) {
                        let x = Const['@:{const#to.px}'](props[p + 'X']);
                        let y = Const['@:{const#to.px}'](props[p + 'Y']);
                        nearestElements.push({
                            '@:{align.queried#ctrl}': ctrl,
                            '@:{align.queried#type}': Display_Line,
                            '@:{align.queried#left}': x,
                            '@:{align.queried#top}': y,
                            '@:{align.queried#width}': 0,
                            '@:{align.queried#height}': 0
                        });
                    }
                }
            }
        }
        for (let l of allElements) {
            let rect: Report.AlignNearestElementRectangle;
            //流程图的连线不作为对齐参考
            if (!(l.ctrl['@:{modifier}'] & Enum['@:{enum#modifier.linkage}'])) {//鼠标下的元素不作为对齐参考
                let maskNode = node<HTMLDivElement>(`_rdm_${l.id}`);
                if (!maskNode) {
                    continue;
                }
                let b = maskNode.getBoundingClientRect();
                let { props, ctrl } = l,
                    xDiffed,
                    yDiffed,
                    bLeft = b.x - pos.x,
                    bTop = b.y - pos.y,
                    bWidth = b.width,
                    bHeight = b.height;
                /**
                 * 元素未旋转，则从左到右分左、中、右3个对齐点
                 * 而旋转后，顶或底的点也需要成为水平对齐点，则有5个对齐点
                 * 垂直方向上同理
                 */
                let fourPoints,
                    fourMiddles;//,
                //dHeight = ctrl['@:{modifier}'] & Enum['@:{enum#modifier.dheight}'];
                if (props.rotate) {
                    let rect = Transform['@:{transform#rotate.rect}'](props);
                    fourPoints = rect['@:{point}'];
                    fourMiddles = rect['@:{middles}'];
                    let cx = Const['@:{const#to.px}'](rect['@:{center.x}'] - rect['@:{left}']);
                    let cy = Const['@:{const#to.px}'](rect['@:{center.y}'] - rect['@:{top}']);
                    xDiffed = [];
                    yDiffed = [];
                    let rotatePoints = [];
                    if (Enum['@:{enum#align.line.coners}'] & Const['@:{const#align.points}']) {
                        rotatePoints = rotatePoints.concat(fourPoints);
                    }
                    if (Enum['@:{enum#align.line.middles}'] & Const['@:{const#align.points}']) {
                        rotatePoints = rotatePoints.concat(fourMiddles);
                    }
                    for (let np of rotatePoints) {
                        let xDiff = Const['@:{const#to.px}'](np.x - rect['@:{left}']);
                        let yDiff = Const['@:{const#to.px}'](np.y - rect['@:{top}']);
                        //如果点离左侧或右侧非常近，则不再记录，比如旋转了非常小的角度，仍以原始的左或右侧进行对齐
                        if (xDiff > minUnitPx &&
                            xDiff < bWidth - minUnitPx &&
                            abs(xDiff - cx) > minUnitPx) {
                            xDiffed.push(xDiff + bLeft);
                        }
                        if (yDiff > minUnitPx &&
                            yDiff < bHeight - minUnitPx &&
                            abs(yDiff - cy) > minUnitPx) {
                            yDiffed.push(yDiff + bTop);
                        }
                    }
                }
                rect = {
                    '@:{align.queried#ctrl}': ctrl,
                    '@:{align.queried#x.diffed}': xDiffed,
                    '@:{align.queried#y.diffed}': yDiffed,
                    '@:{align.queried#type}': Display_Line,
                    '@:{align.queried#left}': bLeft,
                    '@:{align.queried#top}': bTop,
                    '@:{align.queried#width}': bWidth,
                    '@:{align.queried#height}': bHeight
                };
                if (element?.id == l.id) {//当前鼠标下的元素
                    othersElements.unshift(rect);//把鼠标下的元素放在首位，其它元素相对它进行偏移
                    startX = rect['@:{align.queried#left}'];
                    startY = rect['@:{align.queried#top}'];
                } else {
                    // if (dHeight) {
                    //     rect['@:{align.queried#height}'] = 0;
                    // }
                    if (selectedMap?.[l.id]) {//真实选中和程序处理后认为`选中`的元素
                        if (selectedMap[l.id] != -1 &&//如果不是特殊的容器或指定的跟随，则进行吸附
                            (selectedMap[l.id] & Const['@:{const#page.follow.snap.align.elements}'])) {
                            othersElements.push(rect);
                        }
                    } else {
                        nearestElements.push(rect);
                        let keyPoints = props['@:{cached.key.points}'];
                        if (keyPoints &&
                            Const['@:{const#align.svg.points}']) {
                            for (let p of keyPoints) {
                                let x = Const['@:{const#to.px}'](props[p + 'X']);
                                let y = Const['@:{const#to.px}'](props[p + 'Y']);
                                nearestElements.push({
                                    '@:{align.queried#ctrl}': ctrl,
                                    '@:{align.queried#type}': Display_Line,
                                    '@:{align.queried#left}': x,
                                    '@:{align.queried#top}': y,
                                    '@:{align.queried#width}': 0,
                                    '@:{align.queried#height}': 0
                                });
                            }
                        }
                    }
                }
            }
        }
        return {
            '@:{align.queried#align.elements.sizes}': nearestElements,
            '@:{align.queried#together.elements.sizes}': othersElements,
            '@:{align.queried#start.x}': startX,
            '@:{align.queried#start.y}': startY,
            '@:{align.queried#root.bound}': pos,
            '@:{align.queried#mask.bound}': maskBound
        }
    },
    /**
     * 查找并触发对齐信息
     * @param nearestElements 所有附近可对齐的元素信息
     * @param startX 开始x坐标
     * @param offsetX x坐标偏移
     * @param startY 开始y坐标
     * @param offsetY y坐标偏移
     * @param sizesMap 位置信息对象
     * @param testX 待测试x点信息
     * @param fixTestX 修正的x点信息
     * @param testY y点信息
     * @param fixTestY 修正的y点信息
     * @param pinX 是否固定x
     * @param pinY 是否固定y
     * @param altPressed alt键是否按下
     * @param aberration 误差
     * @param snapThreshold 吸附阈值
     * @param ref 引用对象
     * @param scrollOffsetX 滚动x偏移
     * @param scrollOffsetY 滚动y偏移
     * @param maxWidth 吸附提示线最大宽度
     * @param maxHeight 吸附提示线最大高度
     */
    '@:{align#find.and.fire.align.position}'(nearestElements: Report.AlignNearestElementRectangle[],
        startX: number, offsetX: number,
        startY: number, offsetY: number,
        sizesMap: object,
        testX: number[],
        testY: number[],
        pinX: boolean | number, pinY: boolean | number,
        altPressed: boolean | number,
        snapThreshold: number,
        aberration: number,
        scrollOffsetX = 0, scrollOffsetY = 0,
        maxWidth = 0, maxHeight = 0): Report.AlignOffsetResult {
        snapThreshold += aberration;
        //console.log(nearestElements, startX, startY, startWidth, startHeight);
        let alignLinkX,
            alignLinkY,
            hasXOrYLines;
        if (!altPressed) {
            let minX = MaxNum,
                minY = MaxNum;
            let destX = startX + offsetX,
                destY = startY + offsetY,
                helpLineIsShown = State.get('@:{global#stage.axis.show.help.lines}');
            //console.log('helpLineIsShown', helpLineIsShown);
            let findFirstTXPoint,
                findFirstCXPoint,
                findFirstTYPoint,
                findFirstCYPoint;
            // console.log('------');
            for (let {
                '@:{align.queried#type}': neType,
                '@:{align.queried#left}': neLeft,
                '@:{align.queried#top}': neTop,
                '@:{align.queried#width}': neWidth,
                '@:{align.queried#height}': neHeight,
                '@:{align.queried#x.diffed}': neXDiffed,
                '@:{align.queried#y.diffed}': neYDiffed
            } of nearestElements) {
                let {
                    h: nearestX,
                    v: nearestY
                } = queryXAndYFromAlignElements(neType,
                    neLeft, neTop,
                    neWidth, neHeight,
                    neXDiffed, neYDiffed, helpLineIsShown);
                if (!pinX) {
                    for (let tx of nearestX) {
                        for (let cx of testX) {
                            //元素当前x坐标与待测量x坐标的差值
                            let diffX = abs(destX + cx - tx - scrollOffsetX);
                            //console.log(diffX, tx,minX);
                            if (diffX <= snapThreshold &&//可以吸附
                                diffX < minX &&
                                abs(diffX - minX) >= halfUnitPx) {//其它单位有一定误差，只要小于半像素则认为相同
                                minX = diffX;
                                //计算吸附需要的偏移量
                                offsetX = tx - startX - cx + scrollOffsetX;
                                //if (neType & Display_Line) {//辅助线无须拉线，而普通元素需要
                                findFirstCXPoint = cx;
                                findFirstTXPoint = tx;
                                // }

                                if (alignLinkY) {
                                    alignLinkY.length = 0;
                                } else {
                                    alignLinkY = []
                                }
                            }
                        }
                    }
                    if (minX != MaxNum) {
                        //console.log(minX);
                        for (let tx of nearestX) {
                            for (let cx of testX) {
                                //console.log(tx,cx,abs(tx - findFirstTXPoint - cx + findFirstCXPoint))
                                if ((neType == Display_Line) &&
                                    abs(tx - findFirstTXPoint - cx + findFirstCXPoint) < halfUnitPx) {//元素才需要记录更多线
                                    //参考元素找到的位置，与当前第一个y线的距离，需要和拖动的元素找到的y一样大
                                    mergeSamePositionSnapLine(alignLinkY, halfUnitPx, [tx, neTop, neTop + neHeight, cx]);
                                }
                            }
                        }
                    }
                }
                if (!pinY) {
                    for (let ty of nearestY) {
                        for (let cy of testY) {
                            let diffY = abs(destY + cy - ty - scrollOffsetY);
                            //console.log(diffY, halfUnitPx);
                            if (diffY <= snapThreshold &&
                                diffY < minY &&
                                abs(diffY - minY) >= halfUnitPx) {
                                //console.log(nearestY, ty, startY, cy, diffY, minY);
                                minY = diffY;
                                offsetY = ty - startY - cy + scrollOffsetY;
                                //console.log(offsetY);
                                //if (neType & Display_Line) {//辅助线无须拉线，而普通元素需要
                                findFirstCYPoint = cy;
                                findFirstTYPoint = ty;
                                //}
                                if (alignLinkX) {
                                    alignLinkX.length = 0;
                                } else {
                                    alignLinkX = []
                                }
                            }
                        }
                    }
                    //console.clear();
                    if (minY != MaxNum) {
                        for (let ty of nearestY) {
                            for (let cy of testY) {
                                //console.log(abs(ty - findFirstTYPoint - cy + findFirstCYPoint), aberration, ty, cy);
                                if ((neType == Display_Line) &&
                                    abs(ty - findFirstTYPoint - cy + findFirstCYPoint) < halfUnitPx) {
                                    //console.log(abs(ty - findFirstTYPoint - cy + findFirstCYPoint),ty,cy);
                                    mergeSamePositionSnapLine(alignLinkX, halfUnitPx, [ty, neLeft, neLeft + neWidth, cy]);
                                }
                            }
                        }
                    }
                }
            }
            hasXOrYLines = minX != MaxNum || minY != MaxNum;
        }
        //console.log(hasXOrYLines,ref);
        if (hasXOrYLines ||
            alignLocker['@:{align#fire.snap.event}']) {
            alignLocker['@:{align#fire.snap.event}'] = hasXOrYLines;
            if (alignLinkY) {
                for (let y of alignLinkY) {
                    //y长度在循环x的时候，因offsetY不确定，所以需要在这里重新处理一次
                    let [, neTop, neBottom, cy] = y;
                    let m = sizesMap[cy];
                    let minTop = min(neTop, startY + m['@:{top}'] + offsetY - scrollOffsetY) - snapThreshold,
                        maxBottom = max(neBottom, startY + m['@:{bottom}'] + offsetY - scrollOffsetY) + snapThreshold;
                    if (maxHeight > 0 &&
                        maxBottom > maxHeight) {
                        maxBottom = maxHeight;
                    }
                    //y[0] = tx | 0;
                    y[1] = minTop;
                    y[2] = maxBottom;
                }
            }
            if (alignLinkX) {
                for (let x of alignLinkX) {
                    let [, neLeft, neRight, cx] = x;
                    let m = sizesMap[cx];
                    //console.log(m['@:{right}'] - m['@:{left}'])
                    let minLeft = min(neLeft, startX + m['@:{left}'] + offsetX - scrollOffsetX) - snapThreshold,
                        maxRight = max(neRight, startX + m['@:{right}'] + offsetX - scrollOffsetX) + snapThreshold;
                    if (maxWidth > 0 &&
                        maxRight > maxWidth) {
                        maxRight = maxWidth;
                    }
                    //x[0] = ty | 0;
                    x[1] = minLeft;
                    x[2] = maxRight;
                }
            }
            //console.log(JSON.stringify(alignLinkX));//, alignLinkY, offsetX, offsetY);
            State.fire('@:{event#stage.snap.element.find}', {
                x: alignLinkX,
                y: alignLinkY
            });
        }
        return {
            '@:{align#new.offset.x}': offsetX,
            '@:{align#new.offset.y}': offsetY
        };
    },
    /**
     * 清空所有吸附提示线
     */
    '@:{align#reset.snap.lines}'() {
        if (alignLocker['@:{align#fire.snap.event}']) {
            alignLocker['@:{align#fire.snap.event}'] = 0;
            State.fire('@:{event#stage.snap.element.find}');
        }
    },
    /**
     * 查询尺寸吸附信息
     * @param nearestElements 附近元素信息
     * @param fixedPoint 哪个点固定不动
     * @param dragHandler 拖动手柄
     * @param rotate 旋转角度
     * @param draggedWidth 拖动的宽度
     * @param draggedHeight 拖动的高度
     * @param snapThreshold 吸附阈值
     * @param minWidth 最小宽度
     * @param maxWidth 最大宽度
     * @param minHeight 最小高度
     * @param maxHeight 最大高度
     * @param syncSize 是否同步尺寸
     * @param beginWidth 开始宽度
     * @param beginHeight 开始高度
     * @param minRatio 最小缩放比例
     * @param maxRatio 最大缩放比例
     * @param isShiftPressed shift键是否按下
     * @param altPressed alt键是否按下
     * @param hodCellLeft 容器左侧坐标
     * @param hodCellTop 容器顶部坐标
     * @returns 吸附信息
     */
    '@:{align#query.snap.info}'(nearestElements: Report.AlignNearestElementRectangle[],
        fixedPoint: Report.Point,
        dragHandler: string,
        rotate: number,
        draggedWidth: number,
        draggedHeight: number,
        snapThreshold: number,
        minWidth: number,
        maxWidth: number,
        minHeight: number,
        maxHeight: number,
        syncFlag: number,
        beginWidth: number,
        beginHeight: number,
        minRatio: number,
        maxRatio: number,
        altPressed: boolean,
        hodCellLeft: number,
        hodCellTop: number) {
        //alt键按下，关闭吸附
        if (altPressed) {
            if (alignLocker['@:{align#fire.size.snap.event}']) {
                alignLocker['@:{align#fire.size.snap.event}'] = 0;
                State.fire('@:{event#stage.snap.element.find}');
            }
            return {
                '@:{sapped}': 0
            };
        }
        //syncSize=isShiftPressed;
        let [handY, handX] = dragHandler;
        let oppsiteWidth = handX == 'l' ? -1 : 1;
        let oppsiteHeight = handY == 't' ? -1 : 1;
        let minX = MaxNum,
            minY = MaxNum,
            helpLineIsShown = State.get('@:{global#stage.axis.show.help.lines}');
        let b = sin(rotate * (PI / 180)),
            a = cos(rotate * (PI / 180)),
            c = tan(rotate * (PI / 180)),
            { x: cx, y: cy } = fixedPoint;
        //统一使用px进行判断
        cx = Const['@:{const#to.px}'](cx);
        cy = Const['@:{const#to.px}'](cy);
        draggedWidth = Const['@:{const#to.px}'](draggedWidth);
        draggedHeight = Const['@:{const#to.px}'](draggedHeight);
        beginWidth = Const['@:{const#to.px}'](beginWidth);
        beginHeight = Const['@:{const#to.px}'](beginHeight);
        minWidth = Const['@:{const#to.px}'](minWidth);
        maxWidth = Const['@:{const#to.px}'](maxWidth);
        minHeight = Const['@:{const#to.px}'](minHeight);
        maxHeight = Const['@:{const#to.px}'](maxHeight);

        let sWidth = a * draggedWidth;
        let osWidth = b * draggedWidth;
        let sHeight = a * draggedHeight;
        let osHeight = b * draggedHeight;
        let absA = abs(a),
            absB = abs(b);
        //console.log(sThreshod, osThreshod);
        //先查出当前手柄对应矩形点的信息，需要把鼠标点转化成矩形点
        //鼠标点可以任意位置，矩形点相对是固定的
        let { x: finalX,
            y: finalY } = queryFinalPoint(dragHandler, handX, handY, cx, cy, sWidth, osWidth, sHeight, osHeight, oppsiteWidth, oppsiteHeight);

        //坐标相对容器坐标，需要转换成世界坐标
        if (hodCellLeft) {
            finalX += hodCellLeft;
        }
        if (hodCellTop) {
            finalY += hodCellTop;
        }
        let snapX,
            snapY,
            snapH,
            snapV,
            snapHList = [],
            snapVList = [],
            snapWidth,
            snapHeight;
        let hThreshod,
            vThreshod;
        //不同的吸附不一样的阈值，防止旋转1度这样小角度，导致突然吸附的问题

        let rectAngle;
        let leftTopOrRightBottom = dragHandler == 'tl' ||
            dragHandler == 'br';
        if (handY == 'm') {
            if (syncFlag) {
                rectAngle = atan(beginHeight / 2 / beginWidth) * 180 / PI;
                rectAngle = (rectAngle + (360 - rotate)) % 360;
            } else {
                hThreshod = absA * snapThreshold;
                vThreshod = absB * snapThreshold;
            }
        } else if (handX == 'm') {
            if (syncFlag) {
                rectAngle = atan(beginHeight / (beginWidth / 2)) * 180 / PI;
                rectAngle = (rectAngle - (360 - rotate)) % 360;
            } else {
                hThreshod = absB * snapThreshold;
                vThreshod = absA * snapThreshold;
            }
        } else {
            if (syncFlag) {
                let f = leftTopOrRightBottom ? -1 : 1;
                //计算从固定点出发和当前点连线在矩形中的角度
                rectAngle = atan(beginHeight / beginWidth) * 180 / PI;
                rectAngle = (rectAngle + f * (360 - rotate)) % 360;
            } else {
                hThreshod = vThreshod = snapThreshold;
            }
        }
        if (syncFlag) {
            hThreshod = abs(cos(rectAngle * PI / 180)) * snapThreshold;
            vThreshod = abs(sin(rectAngle * PI / 180)) * snapThreshold;
        }

        hThreshod = max(0.2, hThreshod);
        vThreshod = max(0.2, vThreshod);
        //console.log(hThreshod,vThreshod);
        //console.log('before', finalX, finalY, hThreshod, vThreshod);
        //console.log(hThreshod, vThreshod,draggedWidth,draggedHeight);
        //console.log(hThreshod, vThreshod);
        //let firstY;
        //查询吸附信息
        for (let {
            '@:{align.queried#type}': neType,
            '@:{align.queried#left}': neLeft,
            '@:{align.queried#top}': neTop,
            '@:{align.queried#width}': neWidth,
            '@:{align.queried#height}': neHeight,
            '@:{align.queried#x.diffed}': neXDiffed,
            '@:{align.queried#y.diffed}': neYDiffed
        } of nearestElements) {
            let {
                h: nearestX,
                v: nearestY
            } = queryXAndYFromAlignElements(neType,
                neLeft, neTop,
                neWidth, neHeight,
                neXDiffed, neYDiffed, helpLineIsShown);
            for (let tx of nearestX) {
                let diffX = abs(finalX - tx);
                if (diffX <= hThreshod) {
                    snapH = 1;
                    if (diffX < minX) {
                        minX = diffX;
                        snapX = tx;//round(tx);
                    }
                }
            }

            for (let ty of nearestY) {
                let diffY = abs(finalY - ty);
                if (diffY <= vThreshod) {
                    snapV = 1;
                    if (diffY < minY) {
                        minY = diffY;
                        snapY = ty;//round(ty);
                        //firstY = nearestY;
                    }
                }
            }
        }
        //console.log(finalY, vThreshod, rectAngle,hThreshod);
        //console.log(snapH, snapV);
        if (snapH ||
            snapV) {
            //console.log('find snap', snapX, snapY, hThreshod, vThreshod, draggedWidth, draggedHeight, finalX, finalY);
            //需要再转化成容器坐标
            if (hodCellLeft) {
                finalX -= hodCellLeft;
                if (snapH) {
                    snapX -= hodCellLeft;
                }
            }
            if (hodCellTop) {
                finalY -= hodCellTop;
                if (snapV) {
                    snapY -= hodCellTop;
                }
            }
            if (handY == 'm') {//左右中间手柄，高固定，只需要计算宽度
                //思路：先根据当前吸附的x或y坐标，推出对应的y或x坐标
                //再根据最终的x,y计算矩形应该对应的宽高是什么
                let r1 = draggedHeight / 2 / b;
                if (snapH) {
                    finalX = snapX;
                    if (!syncFlag &&
                        absB > approachZero) {
                        let rest = (cx - snapX + r1 * oppsiteWidth) * c;
                        finalY = cy - rest;
                    }
                }
                if (snapV &&
                    !snapH) {
                    finalY = snapY;
                    if (!syncFlag &&
                        absB > approachZero) {
                        let rest = (snapY - cy) * oppsiteWidth / c + r1;
                        finalX = cx + rest * oppsiteWidth;
                    }
                }
                if (syncFlag) {
                    //console.log(finalX,finalY,snapV,snapH,absA,absB);
                    if (dragHandler == 'mr') {
                        oppsiteHeight = -1;
                    }
                    if (snapH) {
                        //注意这里是 * tan
                        finalY = cy + ((finalX - cx) * oppsiteWidth * tan(rectAngle * PI / 180)) * oppsiteHeight;
                    } else {//
                        finalX = cx + ((finalY - cy) * oppsiteHeight / tan(rectAngle * PI / 180)) * oppsiteWidth;
                    }
                }
                //console.log('snap',snapH,snapV,finalX,finalY);
                snapWidth = ((finalX - cx) * a + (finalY - cy) * b) / (b * b * oppsiteWidth + a * a * oppsiteWidth);
                snapHeight = draggedHeight;
                //snapHeight = (2 * b * (finalX - cx) + 2 * a * (cy - finalY)) / (b * b * oppsiteWidth + a * a * oppsiteWidth);

            } else if (handX == 'm') {//上下手柄，只计算高度
                let halfHA = draggedWidth / 2 * a;
                let halfHB = draggedWidth / 2 * b;
                if (snapV) {
                    finalY = snapY;
                    if (!syncFlag) {
                        let rest1 = (snapY - cy) * oppsiteHeight - halfHB;
                        let halfH1 = rest1 * c;
                        finalX = cx + (halfHA - halfH1) * oppsiteHeight;
                    }
                }
                if (snapH &&
                    !snapV) {
                    finalX = snapX;
                    if (!syncFlag &&
                        absB > approachZero) {
                        let hr1 = halfHA - (snapX - cx) * oppsiteHeight;
                        let v2 = hr1 / c;
                        finalY = cy + (halfHB + v2) * oppsiteHeight;
                    }
                }
                if (syncFlag) {

                    if (dragHandler == 'tm') {
                        oppsiteWidth = -1;
                    }
                    if (snapV) {
                        finalX = cx + ((finalY - cy) * oppsiteHeight / tan(rectAngle * PI / 180)) * oppsiteWidth;
                    } else {//
                        //注意这里是 * tan
                        finalY = cy + ((finalX - cx) * oppsiteWidth * tan(rectAngle * PI / 180)) * oppsiteHeight;
                    }
                }
                snapHeight = ((finalY - cy) * a + (cx - finalX) * b) / (b * b + a * a) * oppsiteHeight;
                snapWidth = draggedWidth;
            } else {
                //优先使用y吸附
                if (snapV) {
                    finalY = snapY;
                }
                //如果未找到y吸附或不锁定长宽比，自由移动的点，x也可以吸附
                if (snapH &&
                    (!syncFlag || !snapV)) {
                    finalX = snapX;
                }
                //锁定长宽比的吸附
                if (syncFlag) {
                    /**
                     * 锁定长宽比的情况下，我们需要根据某一个吸附，比如x或y，推算它相应的y和x的值，算出这个点的坐标，只有这样做在旋转吸附时才不抖动
                     */

                    if (snapV) {//垂直吸附，即y值确定，推算x的值
                        finalX = cx + ((finalY - cy) * oppsiteHeight / tan(rectAngle * PI / 180)) * oppsiteWidth;
                    } else {
                        //注意这里是 * tan
                        finalY = cy + ((finalX - cx) * oppsiteWidth * tan(rectAngle * PI / 180)) * oppsiteHeight;
                    }
                }

                // console.log(useHRatio, useVRatio, syncFlag);

                //console.log(finalX, finalY);

                //console.log(finalX, finalY, snapX, snapY);
                // if (a
                //     && b) {//拐角手柄，因为拐角点是自由的，直接算矩形宽度或高度即可
                if (leftTopOrRightBottom) {
                    snapWidth = ((finalY - cy) * b * oppsiteWidth + (finalX - cx) * a * oppsiteHeight) / ((a * a + b * b) * oppsiteWidth * oppsiteHeight);

                    //console.log('------', snapWidth);

                    snapHeight = ((finalY - cy) * a * oppsiteWidth + (cx - finalX) * b * oppsiteHeight) / ((a * a + b * b) * oppsiteWidth * oppsiteHeight);


                } else {

                    snapWidth = ((finalX - cx) * a * oppsiteHeight + (cy - finalY) * b * oppsiteWidth) / ((a * a + b * b) * oppsiteWidth * oppsiteHeight);
                    //console.log('------', snapWidth);

                    snapHeight = ((finalX - cx) * b * oppsiteHeight + (finalY - cy) * a * oppsiteWidth) / ((a * a + b * b) * oppsiteWidth * oppsiteHeight);
                }
            }

            //以下进行尺寸判断，有可能吸附后计算出的矩形超出限制，因此在这种情况下需要取消吸附
            if (snapWidth < minWidth) {
                snapWidth = minWidth;
            } else if (snapWidth > maxWidth) {
                snapWidth = maxWidth;
            }
            if (snapHeight < minHeight) {
                snapHeight = minHeight;
            } else if (snapHeight > maxHeight) {
                snapHeight = maxHeight;
            }
            //按下shift键或元素本身就需要使用相同的宽高
            if (syncFlag) {
                let r;
                //console.log('===', beginWidth, beginHeight, snapWidth, snapHeight);
                if (syncFlag == 1) {
                    r = snapHeight / beginHeight;
                } else if (syncFlag == 2) {
                    r = snapWidth / beginWidth;
                }
                if (r < minRatio) {
                    r = minRatio;
                } else if (r > maxRatio) {
                    r = maxRatio;
                }
                snapWidth = beginWidth * r;
                snapHeight = beginHeight * r;
                draggedHeight = snapHeight;
                draggedWidth = snapWidth;
            }
            //console.log(syncFlag, snapWidth, snapHeight, draggedWidth, draggedHeight, snapX, snapY);
            sWidth = a * snapWidth;
            osWidth = b * snapWidth;
            sHeight = a * snapHeight;
            osHeight = b * snapHeight;
            //对吸附的宽高进行限制后，重新算出当前手柄对应的点
            let { x, y } = queryFinalPoint(dragHandler, handX, handY, cx, cy, sWidth, osWidth, sHeight, osHeight, oppsiteWidth, oppsiteHeight);
            //console.log(x, y, snapX, snapY);
            minX = MaxNum;
            minY = MaxNum;
            let snappedX = x + (hodCellLeft || 0),
                snappedY = y + (hodCellTop || 0);
            //处理某些元素限制尺寸，虽然在吸附阈值内但无法定位到目标点上
            //这种情况下我们需要取消吸附
            //比如矩形是{x:10,y:-15,width:200,height:30} 最小高度是20
            //拉最底边向上调整高度，当贴近设计区顶边时，进行吸附，但吸附后底边的坐标是5不是0，所以这种无法吸附到目标点上时，应该取消吸附

            //console.log(snapV, snapY, y, snapH, snapX, x, snapWidth, snapHeight);
            if (snapV &&
                abs(snapY - y) >= minUnitPx) {
                snapV = 0;
                snapHeight = draggedHeight;
            }
            if (snapH &&
                abs(snapX - x) >= minUnitPx) {
                snapH = 0;
                snapWidth = draggedWidth;
            }
            if (snapV ||
                snapH) {
                if (hodCellLeft) {
                    x += hodCellLeft;
                    if (snapH) {
                        snapX += hodCellLeft;
                    }
                }
                if (hodCellTop) {
                    y += hodCellTop;
                    if (snapV) {
                        snapY += hodCellTop;
                    }
                }
                let minCompare = syncFlag ? halfUnitPx : minUnitPx;
                //console.log(minCompare);
                //查询所有与吸附坐标相同的元素，进行辅助线提示
                for (let {
                    '@:{align.queried#type}': neType,
                    '@:{align.queried#left}': neLeft,
                    '@:{align.queried#top}': neTop,
                    '@:{align.queried#width}': neWidth,
                    '@:{align.queried#height}': neHeight,
                    '@:{align.queried#x.diffed}': neXDiffed,
                    '@:{align.queried#y.diffed}': neYDiffed
                } of nearestElements) {
                    if (Axis_X_Line == neType) {
                        neTop = -1;
                        neHeight = 0
                    } else if (Axis_Y_Line == neType) {
                        neLeft = -1;
                        neWidth = 0;
                    }
                    let {
                        h: nearestX,
                        v: nearestY
                    } = queryXAndYFromAlignElements(neType,
                        neLeft, neTop,
                        neWidth, neHeight,
                        neXDiffed, neYDiffed, helpLineIsShown);
                    for (let tx of nearestX) {
                        let d = abs(x - tx);
                        if (d < minCompare) {
                            if (d < minX) {
                                minX = d;
                                snappedX = tx;
                                if (!snapH) {
                                    snapH = 1;
                                    snapX = tx;
                                }
                            }
                            //console.log(snapX, minX, snappedX);
                            snapHList.push(neTop, neTop + neHeight);
                        }
                    }
                    for (let ty of nearestY) {
                        let d = abs(y - ty);
                        //console.log(d,y,ty);
                        if (d < minCompare) {
                            if (d < minY) {
                                minY = d;
                                snappedY = ty;
                                if (!snapV) {
                                    snapV = 1;
                                    snapY = ty;
                                }
                            }
                            snapVList.push(neLeft, neLeft + neWidth);
                        }
                    }
                }
            }
            let alignLinkX,
                alignLinkY,
                vCount = snapVList.length,
                hCount = snapHList.length;
            if (vCount) {
                if (snapVList[0] == -1 &&
                    snapVList[1] == -1) {
                    alignLinkX = [[snapY, 0, 0]];
                } else {
                    snapVList.push(snappedX);
                    snapVList.sort(sortAsc);
                    alignLinkX = [[snapY, snapVList[0] - snapThreshold, snapVList[vCount] + snapThreshold]];
                }
            } else {
                snapV = 0;
            }

            if (hCount) {
                if (snapHList[0] == -1 &&
                    snapHList[1] == -1) {
                    alignLinkY = [[snapX, 0, 0]];
                } else {
                    snapHList.push(snappedY);
                    snapHList.sort(sortAsc);
                    alignLinkY = [[snapX, snapHList[0] - snapThreshold, snapHList[hCount] + snapThreshold]];
                }
            } else {
                snapH = 0;
            }
            //console.log(snapH, snapV, JSON.stringify(alignLinkX), JSON.stringify(alignLinkY));
            if (alignLinkX ||
                alignLinkY) {
                alignLocker['@:{align#fire.size.snap.event}'] = 1;
                State.fire('@:{event#stage.snap.element.find}', {
                    x: alignLinkX,
                    y: alignLinkY
                });
            } else if (alignLocker['@:{align#fire.size.snap.event}']) {
                alignLocker['@:{align#fire.size.snap.event}'] = 0;
                State.fire('@:{event#stage.snap.element.find}');
            }
        } else if (alignLocker['@:{align#fire.size.snap.event}']) {
            alignLocker['@:{align#fire.size.snap.event}'] = 0;
            State.fire('@:{event#stage.snap.element.find}');
        }
        return {
            '@:{snapped}': snapH || snapV,
            '@:{snap.width}': Const['@:{const#to.unit}'](snapWidth),
            '@:{snap.height}': Const['@:{const#to.unit}'](snapHeight)
        };
    },
    /**
     * svg点进行吸附
     * @param nearestElements 附近吸附元素
     * @param nowX 当前x坐标
     * @param nowY 当前y坐标
     * @param snapThreshold 吸附阈值
     * @param altPressed alt键是否按下
     * @returns 吸附信息
     */
    '@:{align#query.svg.point.snap.info}'(nearestElements: Report.AlignNearestElementRectangle[],
        nowX: number,
        nowY: number,
        snapThreshold: number,
        altPressed) {
        if (altPressed) {
            if (alignLocker['@:{align#fire.svg.snap.point.event}']) {
                alignLocker['@:{align#fire.svg.snap.point.event}'] = 0;
                State.fire('@:{event#stage.snap.element.find}');
            }
            return {
                '@:{snapped}': 0
            };
        }

        let minX = MaxNum,
            minY = MaxNum,
            helpLineIsShown = State.get('@:{global#stage.axis.show.help.lines}');
        let snapX,
            snapY,
            snapHList = [],
            snapVList = [];
        for (let {
            '@:{align.queried#type}': neType,
            '@:{align.queried#left}': neLeft,
            '@:{align.queried#top}': neTop,
            '@:{align.queried#width}': neWidth,
            '@:{align.queried#height}': neHeight,
            '@:{align.queried#x.diffed}': neXDiffed,
            '@:{align.queried#y.diffed}': neYDiffed
        } of nearestElements) {
            if (Axis_X_Line == neType) {
                neTop = -1;
                neHeight = 0
            } else if (Axis_Y_Line == neType) {
                neLeft = -1;
                neWidth = 0;
            }
            let {
                h: nearestX,
                v: nearestY
            } = queryXAndYFromAlignElements(neType,
                neLeft, neTop,
                neWidth, neHeight,
                neXDiffed, neYDiffed, helpLineIsShown);
            for (let tx of nearestX) {
                let diffX = abs(nowX - tx);
                if (diffX <= snapThreshold) {
                    if (diffX <= minX) {
                        minX = diffX;
                        snapX = tx;
                        snapHList.length = 0;
                        snapHList.push(neTop, neTop + neHeight);
                    } else if (diffX == minX) {
                        snapHList.push(neTop, neTop + neHeight);
                    }
                }
            }

            for (let ty of nearestY) {
                let diffY = abs(nowY - ty);
                if (diffY <= snapThreshold) {
                    if (diffY < minY) {
                        minY = diffY;
                        snapY = ty;
                        snapVList.length = 0;
                        snapVList.push(neLeft, neLeft + neWidth);
                    } else if (diffY == minY) {
                        snapVList.push(neLeft, neLeft + neWidth);
                    }
                }
            }
        }
        let alignLinkX,
            alignLinkY;
        let hCount = snapHList.length,
            vCount = snapVList.length;
        if (vCount) {
            if (snapVList[0] == -1 &&
                snapVList[0] == snapVList[1]) {
                alignLinkX = [[snapY, 0, 0]];
            } else {
                snapVList.push(hCount ? snapX : nowX);
                snapVList.sort(sortAsc);
                alignLinkX = [[snapY, snapVList[0] - snapThreshold, snapVList[vCount] + snapThreshold]];
            }
        }

        if (hCount) {
            if (snapHList[0] == -1 &&
                snapHList[0] == snapHList[1]) {
                alignLinkY = [[snapX, 0, 0]];
            } else {
                snapHList.push(vCount ? snapY : nowY);
                snapHList.sort(sortAsc);
                alignLinkY = [[snapX, snapHList[0] - snapThreshold, snapHList[hCount] + snapThreshold]];
            }
        }
        if (alignLinkX ||
            alignLinkY) {
            alignLocker['@:{align#fire.svg.snap.point.event}'] = 1;
            State.fire('@:{event#stage.snap.element.find}', {
                x: alignLinkX,
                y: alignLinkY
            });
        } else if (alignLocker['@:{align#fire.svg.snap.point.event}']) {
            alignLocker['@:{align#fire.svg.snap.point.event}'] = 0;
            State.fire('@:{event#stage.snap.element.find}');
        }
        return {
            '@:{snapped}': vCount || hCount,
            '@:{snap.x}': hCount ? snapX : nowX,
            '@:{snap.y}': vCount ? snapY : nowY
        };
    }
};