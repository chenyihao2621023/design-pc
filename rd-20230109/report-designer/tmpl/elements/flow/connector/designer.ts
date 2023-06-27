/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../../designer/const';
import Enum from '../../../designer/enum';
import StageGeneric from '../../../designer/generic';
import Transform from '../../../designer/transform';
import DesignerProvider from '../../../provider/designer';
import SVGProvider from '../../../provider/svg';
import Designer from '../designer';
let { State } = Magix;
let { abs, max, min, hypot } = Math;
let ReachBar = 15,
    OutlineBar = 10;
let POS_OF_LEFT = 1;
let POS_OF_TOP = 2;
let POS_OF_RIGHT = 4;
let POS_OF_BOTTOM = 8;
let HOR_OPPSITE = POS_OF_LEFT | POS_OF_RIGHT;
let VER_OPPSITE = POS_OF_TOP | POS_OF_BOTTOM;

let BuildLines = points => {
    let lines = [];
    let index = 0;
    let prev = points[index++];
    while (index < points.length) {
        let current = points[index];
        lines.push([{
            x: prev.x,
            y: prev.y
        }, {
            x: current.x,
            y: current.y
        }]);
        prev = current;
        index++;
    }
    return lines;
};
let FindLinesCrossCount = (destLines, testLines, points) => {
    let count = 0,
        conner = 0,
        distance = 0;
    for (let tl of testLines) {
        for (let dl of destLines) {
            if (Transform["@:{transform#is.line.cross}"](tl, dl)) {
                count++;
            }
        }
    }
    for (let i = points.length - 2; i--;) {
        let t = points[i];
        let s = points[i + 1];
        let f = points[i + 2];
        distance += hypot(f.x - s.x, f.y - s.y);
        if (!i) {
            distance += hypot(s.x - t.x, s.y - t.y);
        }
        if ((t.x == s.x && s.x == f.x) ||
            (t.y == s.y && s.y == f.y)) {
            continue;
        }
        conner++;
    }
    return {
        '@:{count}': count,
        '@:{conner}': conner,
        '@:{distance}': distance
    };
};
let FindPositionPoint = (fromPoint, points, endPoint, position) => {
    let count = 0;
    let prev = fromPoint;
    let index = 0;
    let step = Const['@:{const#unit.step}']();

    while (index <= points.length) {
        let current = index == points.length ? endPoint : points[index];
        if (Const['@:{const#great.than.or.approach}'](step, abs(prev.x - current.x))) {
            count += abs(current.y - prev.y);
        } else {
            count += abs(current.x - prev.x);
        }
        prev = current;
        index++;
    }
    let pos = count * position;
    let passed = 0;
    index = 0;
    prev = fromPoint;
    while (index <= points.length) {
        let len = 0;
        let current = index == points.length ? endPoint : points[index],
            useX = 0;
        if (Const['@:{const#great.than.or.approach}'](step, abs(prev.x - current.x))) {
            len = abs(current.y - prev.y);
            useX = 1;
        } else {
            len = abs(current.x - prev.x);
        }
        if ((passed + len) >= pos) {
            let rest = pos - passed;
            if (useX) {
                return {
                    x: current.x,
                    y: current.y > prev.y ? prev.y + rest : prev.y - rest
                };
            } else {
                return {
                    x: current.x > prev.x ? prev.x + rest : prev.x - rest,
                    y: current.y
                }
            }
        }
        passed += len;
        prev = current;
        index++;
    }
};
let CheckPoints = (fromPoint, endPoint, points) => {
    if (points.length >= 2) {
        let [f, s] = points;
        if ((f.x == s.x &&
            s.x == fromPoint.x) ||
            (f.y == s.y &&
                s.y == fromPoint.y)) {
            points.shift();
        }
    }
    if (points.length >= 2) {
        let l1 = points.at(-1);
        let l2 = points.at(-2);
        if ((l1.x == l2.x &&
            l1.x == endPoint.x) ||
            (l1.y == l2.y &&
                l1.y == endPoint.y)) {
            points.pop();
        }
    }
};
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./index'
        });
    }
}).static({
    type: 'flow/connector',
    title: '@:{lang#elements.flow.connector}',
    icon: '&#xe61e;',
    '@:{modifier}': Enum['@:{enum#modifier.linkage}'] |
        Enum['@:{enum#modifier.inputext}'],
    '@:{move.props}': SVGProvider['@:{svg#generate.key.points}'](2),
    '@:{update.props}'(props) {
        let xPos,
            yPos;
        let {
            textWidth,
            textHeight,
            textPosition,
            ctrl1X,
            ctrl1Y,
            ctrl2X,
            ctrl2Y,
            linkFromId,
            linkFromKey,
            linkToId,
            linkToKey,
            points } = props;
        let startX,
            startY,
            endX,
            endY;
        let currentStageScale = State.get('@:{global#stage.scale}');
        let { '@:{generic.all#map}': all } = StageGeneric["@:{generic#query.all.elements.and.map}"]();
        let fromAndEnd = [[0, linkFromId, linkFromKey], [1, linkToId, linkToKey]];
        for (let [index, linkId, linkKey] of fromAndEnd) {
            let destElement = all[linkId];
            let { props } = destElement;
            let pointX = props[linkKey + 'XReal'];
            let pointY = props[linkKey + 'YReal'];
            if (index) {
                endX = pointX;
                endY = pointY;
            } else {
                startX = pointX;
                startY = pointY;
            }
        }
        props.startX = startX;
        props.startY = startY;
        props.endX = endX;
        props.endY = endY;
        if (props.lineType == 'bezier') {//曲线连接，只需要连接首尾点，2个控制点需要用户拖动改变
            let { startX: x0, startY: y0,
                ctrl1X: x1, ctrl1Y: y1,
                ctrl2X: x2, ctrl2Y: y2,
                endX: x3, endY: y3 } = props;
            let { x, y, width, height } = SVGProvider['@:{svg#bezier3.outline.rect}'](x0, y0, x1, y1, x2, y2, x3, y3);
            props.x = x;
            props.y = y;
            props.width = width;
            props.height = height;
            //计算文字应该在的位置
            xPos = SVGProvider['@:{svg#bezier3.value}'](textPosition, startX, ctrl1X, ctrl2X, endX);
            yPos = SVGProvider['@:{svg#bezier3.value}'](textPosition, startY, ctrl1Y, ctrl2Y, endY);
        } else if (props.lineType == 'line') {//直线直接连接
            let minX = min(startX, endX);
            let maxX = max(startX, endX);
            let minY = min(startY, endY);
            let maxY = max(startY, endY);
            props.x = minX;
            props.y = minY;
            props.width = max(1, maxX - minX);
            props.height = max(1, maxY - minY);
            if (startX == endX) {//计算文字所在的位置，垂直情况特殊处理
                xPos = startX;
                yPos = minY + (maxY - minY) * textPosition;
            } else {
                //计算直线方程，根据方程求解文字所在的位置
                let { k, b } = Transform["@:{transform#get.linear.equation.by.point}"](startX, startY, endX, endY);
                xPos = (maxX - minX) * textPosition;
                if (startX > endX) {
                    xPos = startX - xPos;
                } else {
                    xPos = startX + xPos;
                }
                yPos = k * xPos + b;
            }
        } else {//折线
            points.length = 0;
            let fromAndEndBarPoint = [];
            let fromAndEndRectLines = [];
            let fromAndEndOutlinePoints = [];
            //连接点向外伸出的一段，防止连线触碰到元素边框，美化界面
            let reachBar = Const['@:{const#to.unit}'](ReachBar * currentStageScale);
            //元素向外扩展的一段，防止连线触碰到元素边框，美化界面
            let outlineBar = Const['@:{const#to.unit}'](OutlineBar * currentStageScale);
            let fromAndEndEdge = [];
            for (let [, linkId, linkKey] of fromAndEnd) {
                let destElement = all[linkId];
                let { props } = destElement;
                let pointX = props[linkKey + 'XReal'];
                let pointY = props[linkKey + 'YReal'];
                //p0-p3是元素所在矩形的4个拐点
                let { p0XReal,
                    p0YReal,
                    p1XReal,
                    p1YReal,
                    p2XReal,
                    p2YReal,
                    p3XReal,
                    p3YReal } = props;
                let maxX = max(p0XReal, p1XReal, p2XReal, p3XReal);
                let minX = min(p0XReal, p1XReal, p2XReal, p3XReal);
                let leftDistance = abs(pointX - minX);
                let rightDistance = abs(pointX - maxX);

                let maxY = max(p0YReal, p1YReal, p2YReal, p3YReal);
                let minY = min(p0YReal, p1YReal, p2YReal, p3YReal);
                let scralePoint = e => {
                    let oft = 0;
                    if (Const['@:{const#approach}'](e, maxX) ||
                        Const['@:{const#approach}'](e, maxY)) {
                        oft = outlineBar;
                    } else if (Const['@:{const#approach}'](e, minX) ||
                        Const['@:{const#approach}'](e, minY)) {
                        oft = -outlineBar;
                    }
                    return e + oft;
                };
                let topDistance = abs(pointY - minY);
                let bottomDistance = abs(pointY - maxY);
                //记录开始与结束元素所在的矩形
                fromAndEndEdge.push({
                    x: minX - outlineBar,
                    y: minY - outlineBar,
                    width: maxX - minX + 2 * outlineBar,
                    height: maxY - minY + 2 * outlineBar
                });
                //记录开始与结束矩形所在的线段，用于评估找出的折线是否是最优的
                fromAndEndRectLines.push([{
                    x: scralePoint(p0XReal),
                    y: scralePoint(p0YReal)
                }, {
                    x: scralePoint(p1XReal),
                    y: scralePoint(p1YReal)
                }], [{
                    x: scralePoint(p1XReal),
                    y: scralePoint(p1YReal)
                }, {
                    x: scralePoint(p2XReal),
                    y: scralePoint(p2YReal)
                }], [{
                    x: scralePoint(p2XReal),
                    y: scralePoint(p2YReal)
                }, {
                    x: scralePoint(p3XReal),
                    y: scralePoint(p3YReal)
                }], [{
                    x: scralePoint(p3XReal),
                    y: scralePoint(p3YReal)
                }, {
                    x: scralePoint(p0XReal),
                    y: scralePoint(p0YReal)
                }]);
                let minDistance = min(leftDistance, topDistance, rightDistance, bottomDistance);
                let point,//向外伸出的bar终点坐标
                    outlinePoint,//绕出当前图形所走的拐角点
                    pos;//走哪个方位出去最近
                //计算连接点向外连接，走哪个方向出去(只有左右上下4个方向向外连线)
                //根据连接点距离相应方向的最远的点进行距离判断
                if (minDistance == leftDistance) {
                    pos = POS_OF_LEFT;
                    point = {
                        x: pointX - minDistance - reachBar,
                        y: pointY
                    };
                    outlinePoint = [{
                        x: point.x,
                        y: minY - reachBar
                    }, {
                        x: point.x,
                        y: maxY + reachBar
                    }];
                } else if (minDistance == topDistance) {
                    pos = POS_OF_TOP;
                    point = {
                        x: pointX,
                        y: pointY - minDistance - reachBar
                    };
                    outlinePoint = [{
                        x: minX - reachBar,
                        y: point.y
                    }, {
                        x: maxX + reachBar,
                        y: point.y
                    }];
                } else if (minDistance == rightDistance) {
                    pos = POS_OF_RIGHT;
                    point = {
                        x: pointX + minDistance + reachBar,
                        y: pointY
                    };
                    outlinePoint = [{
                        x: point.x,
                        y: minY - reachBar
                    }, {
                        x: point.x,
                        y: maxY + reachBar
                    }];
                } else {
                    pos = POS_OF_BOTTOM;
                    point = {
                        x: pointX,
                        y: pointY + minDistance + reachBar
                    };
                    outlinePoint = [{
                        x: minX - reachBar,
                        y: point.y
                    }, {
                        x: maxX + reachBar,
                        y: point.y
                    }];
                }
                fromAndEndOutlinePoints.push(outlinePoint, pos);
                fromAndEndBarPoint.push(point);
            }
            let [fromBarPoint, endBarPoint] = fromAndEndBarPoint;
            let testPoints = [];
            let fromPoint = {
                x: startX,
                y: startY
            }, endPoint = {
                x: endX,
                y: endY
            };
            //记录待测试的拐点坐标
            // let testAndAddPoint = srcPoints => {
            //     let canAdd = 1
            //     for (let srcPoint of srcPoints) {
            //         if (Transform["@:{transform#is.same.point}"](srcPoint, fromBarPoint) ||
            //             Transform["@:{transform#is.same.point}"](srcPoint, endBarPoint) || (
            //                 !Transform["@:{transform#point.on.segment}"](srcPoint, fromPoint, fromBarPoint) &&
            //                 !Transform["@:{transform#point.on.segment}"](srcPoint, endPoint, endBarPoint))) {
            //         } else {
            //             canAdd = 0;
            //         }
            //     }
            //     if (canAdd) {
            //         testPoints.push(srcPoints);
            //     }
            // };
            //2个元素向外伸出一段线段的终点坐标
            testPoints.push([fromBarPoint, {
                x: fromBarPoint.x,
                y: endBarPoint.y
            }, endBarPoint], [fromBarPoint, {
                x: endBarPoint.x,
                y: fromBarPoint.y
            }, endBarPoint]);
            let [fromRect, endRect] = fromAndEndEdge;
            //2个元素未相交的情况，则连接线可以从元素中间的空隙穿过
            if (!Transform["@:{transform#rect.intersect}"](fromRect, endRect)) {
                let left = fromRect.x < endRect.x ? fromRect : endRect;
                let right = left == fromRect ? endRect : fromRect;
                let top = fromRect.y < endRect.y ? fromRect : endRect;
                let bottom = top == fromRect ? endRect : fromRect;
                let xSpace = right.x - left.x - left.width;
                let ySpace = bottom.y - top.y - top.height;
                //如果x方向有空隙
                //console.log(xSpace,ySpace);
                if (xSpace > 0) {
                    //连线从空隙间穿过
                    let xPos = left.x + left.width + xSpace / 2;
                    let p1 = {
                        x: xPos,
                        y: fromBarPoint.y
                    }, p2 = {
                        x: xPos,
                        y: endBarPoint.y
                    };
                    testPoints.push([fromBarPoint, p1, p2, endBarPoint]);
                }
                //y方向上有空隙
                if (ySpace > 0) {
                    let yPos = top.y + top.height + ySpace / 2;
                    let p1 = {
                        x: fromBarPoint.x,
                        y: yPos
                    }, p2 = {
                        x: endBarPoint.x,
                        y: yPos
                    };
                    testPoints.push([fromBarPoint, p1, p2, endBarPoint]);
                }
            } else {//相交的逻辑，不够好需要再调整
                // let minX = min(fromPoint.x, endPoint.x);
                // let maxX = max(fromPoint.x, endPoint.x);
                // let minY = min(fromPoint.y, endPoint.y);
                // let maxY = max(fromPoint.y, endPoint.y);
                // let middleX = minX + (maxX - minX) / 2;
                // let middleY = minY + (maxY - minY); 2;
                // testPoints.push([{
                //     x: fromPoint.x,
                //     y: middleY
                // }, {
                //     x: endPoint.x,
                //     y: middleY
                // }], [{
                //     x: middleX,
                //     y: fromPoint.y
                // }, {
                //     x: middleX,
                //     y: endPoint.y
                // }]);
            }
            //以下是绕出当前图形与另外一个图形的reachbar进行连接
            let [fromOutlinePoints, fromPos, endOutlinePoints, endPos] = fromAndEndOutlinePoints;
            //如果绕出当前图形的2个拐角点x坐标相同，则是从上下2个方向绕出
            if (fromOutlinePoints[0].x == fromOutlinePoints[1].x) {
                //走拐角连reachbar
                testPoints.push([fromBarPoint, fromOutlinePoints[0], {
                    x: endBarPoint.x,
                    y: fromOutlinePoints[0].y
                }, endBarPoint], [fromBarPoint, fromOutlinePoints[1], {
                    x: endBarPoint.x,
                    y: fromOutlinePoints[1].y
                }, endBarPoint]);
            } else {
                testPoints.push([fromBarPoint, fromOutlinePoints[0], {
                    x: fromOutlinePoints[0].x,
                    y: endBarPoint.y
                }, endBarPoint], [fromBarPoint, fromOutlinePoints[1], {
                    x: fromOutlinePoints[1].x,
                    y: endBarPoint.y
                }, endBarPoint]);
            }
            if (endOutlinePoints[0].x == endOutlinePoints[1].x) {
                testPoints.push([fromBarPoint, {
                    x: fromBarPoint.x,
                    y: endOutlinePoints[0].y
                }, endOutlinePoints[0], endBarPoint], [fromBarPoint, {
                    x: fromBarPoint.x,
                    y: endOutlinePoints[1].y
                }, endOutlinePoints[1], endBarPoint]);
            } else {
                testPoints.push([fromBarPoint, {
                    x: endOutlinePoints[0].x,
                    y: fromBarPoint.y
                }, endOutlinePoints[0], endBarPoint], [fromBarPoint, {
                    x: endOutlinePoints[1].x,
                    y: fromBarPoint.y
                }, endOutlinePoints[1], endBarPoint]);
            }
            //反向连接，比如上下平行的2个元素，从一个的左侧连另一个的右侧
            //如果仅考虑走拐角直连另外一个元素的reachbar，则可能会出现穿过元素的情况，所以这里需要针对这种情形进行增加多一个点但不增加拐角的形式绕过
            let compositePos = fromPos | endPos;
            if (compositePos == HOR_OPPSITE) {
                if (fromPos == POS_OF_LEFT) {//从左侧连另一个的右侧
                    testPoints.push([fromBarPoint,
                        fromOutlinePoints[0], {
                            x: fromRect.x + fromRect.width,
                            y: fromOutlinePoints[0].y
                        }, {
                            x: fromRect.x + fromRect.width,
                            y: endBarPoint.y
                        }, endBarPoint], [fromBarPoint,
                        fromOutlinePoints[1], {
                            x: fromRect.x + fromRect.width,
                            y: fromOutlinePoints[1].y
                        }, {
                            x: fromRect.x + fromRect.width,
                            y: endBarPoint.y
                        }, endBarPoint]);
                } else {//从右侧连左侧
                    testPoints.push([fromBarPoint,
                        fromOutlinePoints[0], {
                            x: fromRect.x,
                            y: fromOutlinePoints[0].y
                        }, {
                            x: fromRect.x,
                            y: endBarPoint.y
                        },
                        endBarPoint], [fromBarPoint,
                        fromOutlinePoints[1], {
                            x: fromRect.x,
                            y: fromOutlinePoints[1].y
                        }, {
                            x: fromRect.x,
                            y: endBarPoint.y
                        },
                        endBarPoint]);
                }
            } else if (compositePos == VER_OPPSITE) {
                if (fromPos == POS_OF_TOP) {
                    testPoints.push([fromBarPoint,
                        fromOutlinePoints[0], {
                            x: fromOutlinePoints[0].x,
                            y: fromRect.y + fromRect.height
                        }, {
                            x: endBarPoint.x,
                            y: fromRect.y + fromRect.height
                        }, endBarPoint], [fromBarPoint,
                        fromOutlinePoints[1], {
                            x: fromOutlinePoints[1].x,
                            y: fromRect.y + fromRect.height
                        }, {
                            x: endBarPoint.x,
                            y: fromRect.y + fromRect.height
                        }, endBarPoint]);
                } else {
                    testPoints.push([fromBarPoint,
                        fromOutlinePoints[0], {
                            x: fromOutlinePoints[0].x,
                            y: fromRect.y
                        }, {
                            x: endBarPoint.x,
                            y: fromRect.y
                        }, endBarPoint], [fromBarPoint,
                        fromOutlinePoints[1], {
                            x: fromOutlinePoints[1].x,
                            y: fromRect.y
                        }, {
                            x: endBarPoint.x,
                            y: fromRect.y
                        }, endBarPoint]);
                }
            }
            //对待测试的点进行评估
            //计算连线有没有穿过元素边框及穿过多少个边框
            //计算连线用了多少个拐角

            let minPoints = [],
                testPower = Number.MAX_VALUE,
                testConner = testPower,
                testDistance = testPower;
            //找最优的连线
            for (let tp of testPoints) {
                let lines = BuildLines(tp);
                let cross = FindLinesCrossCount(fromAndEndRectLines, lines, [fromPoint, ...tp, endPoint]);

                if (cross['@:{count}'] < testPower) {
                    minPoints = tp;
                    testPower = cross['@:{count}'];
                    testConner = cross['@:{conner}'];
                    testDistance = cross['@:{distance}'];
                } else if (testPower == cross['@:{count}'] &&
                    cross['@:{conner}'] < testConner) {//如果相交的个数一样，则拐的角越少越好
                    minPoints = tp;
                    testConner = cross['@:{conner}'];
                    testDistance = cross['@:{distance}'];
                } else if (testPower == cross['@:{count}'] &&
                    cross['@:{conner}'] == testConner &&
                    cross['@:{distance}'] < testDistance) {//相交、拐角一致，距离越短越好
                    minPoints = tp;
                    testDistance = cross['@:{distance}'];
                }
            }
            points.push(...minPoints);
            CheckPoints(fromPoint, endPoint, points);
            let allPoints = [fromPoint, endPoint, ...points];
            //--begin 修正某些情况下坐标差1px的问题
            let total = allPoints.length,
                singUnit = Const['@:{const#to.unit}'](1);
            for (let i = 0; i < total; i++) {
                let p = allPoints[i];
                for (let ii = i; ii < total; ii++) {
                    let ip = allPoints[ii];
                    if (abs(p.x - ip.x) <= singUnit) {
                        ip.x = p.x;
                    }
                    if (abs(p.y - ip.y) <= singUnit) {
                        ip.y = p.y;
                    }
                }
            }
            //--end
            let minX = fromBarPoint.x, minY = fromBarPoint.y,
                maxX = fromBarPoint.x, maxY = fromBarPoint.y;
            for (let tp of allPoints) {
                let x = tp.x,
                    y = tp.y;
                if (x < minX) {
                    minX = x;
                }
                if (x > maxX) {
                    maxX = x;
                }
                if (y < minY) {
                    minY = y;
                }
                if (y > maxY) {
                    maxY = y;
                }
            }
            props.x = minX;
            props.y = minY;
            props.width = maxX - minX;
            props.height = maxY - minY;
            //查找文字所在的位置
            //把所有折线线段相加，再根据百分比计算所在位置
            let { x, y } = FindPositionPoint(fromPoint, points, endPoint, textPosition);
            xPos = x;
            yPos = y;
        }
        props.textX = xPos - textWidth / 2;
        props.textY = yPos - textHeight / 2;
        props.textPointX = xPos;
        props.textPointY = yPos;
    },
    '@:{get.path.points}'(props) {
        if (props.lineType == 'bezier') {
            return ['M', 'start', 'L', 'ctrl1', 'M', 'end', 'L', 'ctrl2'];
        }
        return [];
    },
    '@:{get.key.points}'(props) {
        if (props.lineType == 'bezier') {
            return ['ctrl1', 'ctrl2'];
        }
        return [];
    },
    '@:{get.props}'(x, y) {
        return {
            alpha: 1,
            points: [],
            lineType: 'line',//line polyline bezier
            x,
            y,
            linkFromId: '',
            linkFromKey: '',
            linkToId: '',
            linkToKey: '',
            startX: x,
            startY: y,
            endX: x + 300,
            endY: y + 100,
            ctrl1X: Const['@:{const#to.unit}'](x + 50),
            ctrl1Y: Const['@:{const#to.unit}'](y + 50),
            ctrl2X: Const['@:{const#to.unit}'](x + 250),
            ctrl2Y: Const['@:{const#to.unit}'](y + 50),
            text: '',
            textWidth: Const['@:{const#to.unit}'](80),
            textHeight: Const['@:{const#to.unit}'](20),
            textRotate: 0,
            textForecolor: '#000',
            textFontfamily: 'tahoma',
            textBackground: '',
            textFontsize: Const['@:{const#to.unit}'](12),
            textLetterspacing: 0,
            textPosition: 0.5,
            textOffsetX: 0,
            textOffsetY: 0,
            startArrow: 1,
            endArrow: 1,
            dash: 0,
            cap: false,
            linewidth: Const['@:{const#to.unit}'](2),
            color: '#000',
            locked: false
        }
    },
    props: [{
        key: 'linkFromId',
        json: 1
    }, {
        key: 'linkFromKey',
        json: 1
    }, {
        key: 'linkToId',
        json: 1
    }, {
        key: 'linkToKey',
        json: 1
    }, {
        key: 'x',
        read: Transform["@:{transform#to.show.value}"],
        '@:{is.scale.and.unit.field}': 1,
        json: 1
    }, {
        key: 'y',
        read: Transform["@:{transform#to.show.value}"],
        '@:{is.scale.and.unit.field}': 1,
        json: 1
    }, {
        key: 'textPointX',
        read: Transform["@:{transform#to.show.value}"],
        json: 1
    }, {
        key: 'textPointY',
        read: Transform["@:{transform#to.show.value}"],
        json: 1
    }, {
        key: 'textX',
        read: Transform["@:{transform#to.show.value}"],
        json: 1
    }, {
        key: 'textY',
        read: Transform["@:{transform#to.show.value}"],
        json: 1
    },
    DesignerProvider['@:{designer#shared.props.svg.width}'],
    DesignerProvider['@:{designer#shared.props.svg.height}'], {
        key: 'startX',
        '@:{is.scale.and.unit.field}': 1,
        read: Transform["@:{transform#to.show.value}"],
        json: 1
    }, {
        key: 'startY',
        '@:{is.scale.and.unit.field}': 1,
        read: Transform["@:{transform#to.show.value}"],
        json: 1
    }, {
        key: 'endX',
        '@:{is.scale.and.unit.field}': 1,
        read: Transform["@:{transform#to.show.value}"],
        json: 1
    }, {
        key: 'endY',
        '@:{is.scale.and.unit.field}': 1,
        read: Transform["@:{transform#to.show.value}"],
        json: 1
    }, {
        '@:{json.encode}'(dest, props) {
            if (props.lineType == 'polyline') {
                let { points } = props;
                let dp = [];
                for (let p of points) {
                    dp.push({
                        x: Transform["@:{transform#to.show.value}"](p.x),
                        y: Transform["@:{transform#to.show.value}"](p.y)
                    });
                }
                dest.points = dp;
            }
        },
    }, {
        tip: '@:{lang#props.connector.type}',
        key: 'lineType',
        type: Enum["@:{enum#prop.collection}"],
        items: [{
            "value": 'line',
            icon: '&#xe615;',
            "text": '@:{lang#elements.line}'
        }, {
            "value": 'polyline',
            icon: '&#xe64c;',
            "text": '@:{lang#elements.polyline}'
        }, {
            "value": 'bezier',
            icon: '&#xe60d;',
            "text": "@:{lang#elements.curve}"
        }],
        json: 1,
        write(v, props) {
            if (v == 'bezier') {
                let { startX, startY, endX, endY } = props;
                let minX = min(startX, endX);
                let minY = min(startY, endY);
                let maxX = max(startX, endX);
                let maxY = max(startY, endY);
                let hov = (maxX - minX) / 4;
                let ver = (maxY - minY) / 8;
                let ctrl1X,
                    ctrl1Y,
                    ctrl2X,
                    ctrl2Y;
                if (startX < endX) {
                    ctrl1X = startX + hov;
                    ctrl2X = endX - hov;
                } else {
                    ctrl1X = startX - hov;
                    ctrl2X = endX + hov;
                }
                if (startY < endY) {
                    ctrl1Y = startY + ver;
                    ctrl2Y = endY - ver;
                } else {
                    ctrl1Y = startY - ver;
                    ctrl2Y = endY + ver;
                }
                props.ctrl1X = ctrl1X;
                props.ctrl2X = ctrl2X;
                props.ctrl1Y = ctrl1Y;
                props.ctrl2Y = ctrl2Y;
            }
        }
    }, {
        type: Enum["@:{enum#prop.svg.key.point}"],
        '@:{json.encode}'(dest, props) {
            if (props.lineType == 'bezier') {
                SVGProvider['@:{svg#json.encode.key.point}'](dest, props);
            }
        },
        '@:{stage.scale}': SVGProvider['@:{svg#stage.scale.key.point}'],
        '@:{unit.convert}': SVGProvider['@:{svg#unit.convert.key.point}'],
        '@:{if.show}'(props) {
            return props.lineType == 'bezier';
        }
    }, {
        tip: '@:{lang#props.start.arrow}',
        key: 'startArrow',
        type: Enum["@:{enum#prop.collection}"],
        items: [{
            icon: '<svg class="@:scoped.style:wp100" style="height:18px"><path d="M1 10L50 10" style="fill:none;stroke:#333" /></svg>',
            value: 1
        }, {
            icon: '<svg class="@:scoped.style:wp100" style="height:18px"><path d="M50 10L8 10L8 6L1 10L8 14L8 10z" style="fill:#333;stroke:#333" /></svg>',
            value: 2
        }, {
            icon: '<svg class="@:scoped.style:wp100" style="height:18px"><path d="M50 10L8 10L8 6L1 10L8 14L8 10z" style="fill:none;stroke:#333" /></svg>',
            value: 3
        }, {
            icon: '<svg class="@:scoped.style:wp100" style="height:18px"><path d="M50 10L1 10L8 6M1 10L8 14" style="fill:none;stroke:#333" /></svg>',
            value: 4
        }, {
            icon: '<svg class="@:scoped.style:wp100" style="height:18px"><path d="M50 10L13 10L7 6L1 10L7 14L13 10z" style="fill:#333;stroke:#333" /></svg>',
            value: 5
        }, {
            icon: '<svg class="@:scoped.style:wp100" style="height:18px"><path d="M50 10L13 10L7 6L1 10L7 14L13 10" style="fill:none;stroke:#333" /></svg>',
            value: 6
        }, {
            icon: '<svg class="@:scoped.style:wp100" style="height:18px"><path d="M50 10L9 10" style="fill:none;stroke:#333" /><circle cx="5" cy="10" r="4" style="fill:#333;stroke:#333"/></svg>',
            value: 7
        }, {
            icon: '<svg class="@:scoped.style:wp100" style="height:18px"><path d="M50 10L9 10" style="fill:none;stroke:#333" /><circle cx="5" cy="10" r="4" style="fill:none;stroke:#333"/></svg>',
            value: 8
        }, {
            icon: '<svg class="@:scoped.style:wp100" style="height:18px"><path d="M50 10L1 10M1 6L8 10M1 14L8 10" style="fill:none;stroke:#333" /></svg>',
            value: 9
        }],
        json: 1
    }, {
        tip: '@:{lang#props.end.arrow}',
        key: 'endArrow',
        type: Enum["@:{enum#prop.collection}"],
        items: [{
            icon: '<svg class="@:scoped.style:wp100" style="height:18px"><path d="M1 10L50 10" style="fill:none;stroke:#333" /></svg>',
            value: 1
        }, {
            icon: '<svg class="@:scoped.style:wp100" style="height:18px"><path d="M1 10L42 10L42 6L50 10L42 14L42 10z" style="fill:#333;stroke:#333" /></svg>',
            value: 2
        }, {
            icon: '<svg class="@:scoped.style:wp100" style="height:18px"><path d="M1 10L42 10L42 6L50 10L42 14L42 10z" style="fill:none;stroke:#333" /></svg>',
            value: 3
        }, {
            icon: '<svg class="@:scoped.style:wp100" style="height:18px"><path d="M1 10L50 10L42 6M50 10L42 14" style="fill:none;stroke:#333" /></svg>',
            value: 4
        }, {
            icon: '<svg class="@:scoped.style:wp100" style="height:18px"><path d="M1 10L37 10L43 6L50 10L43 14L37 10z" style="fill:#333;stroke:#333" /></svg>',
            value: 5
        }, {
            icon: '<svg class="@:scoped.style:wp100" style="height:18px"><path d="M1 10L37 10L43 6L50 10L43 14L37 10z" style="fill:none;stroke:#333" /></svg>',
            value: 6
        }, {
            icon: '<svg class="@:scoped.style:wp100" style="height:18px"><path d="M1 10L42 10" style="fill:none;stroke:#333" /><circle cx="46" cy="10" r="4" style="fill:#333;stroke:#333"/></svg>',
            value: 7
        }, {
            icon: '<svg class="@:scoped.style:wp100" style="height:18px"><path d="M1 10L42 10" style="fill:none;stroke:#333" /><circle cx="46" cy="10" r="4" style="fill:none;stroke:#333"/></svg>',
            value: 8
        }, {
            icon: '<svg class="@:scoped.style:wp100" style="height:18px"><path d="M1 10L50 10M50 6L42 10M50 14L42 10" style="fill:none;stroke:#333" /></svg>',
            value: 9
        }],
        json: 1
    },
    DesignerProvider['@:{designer#shared.props.spliter}'],
    DesignerProvider['@:{designer#shared.props.alpha}'], {
        key: 'linewidth',
        '@:{is.scale.and.unit.field}': 1,
        read: Transform["@:{transform#to.show.value}"],
        json: 1
    },
    DesignerProvider['@:{designer#shared.props.svg.color}'],
    DesignerProvider['@:{designer#shared.props.svg.dash}'],
    DesignerProvider['@:{designer#shared.props.svg.cap}'],
    DesignerProvider['@:{designer#shared.props.spliter}'], {
        tip: '@:{lang#props.line.text}',
        key: 'text',
        type: Enum["@:{enum#prop.text.input}"],
        json: 1
    }, {
        ...DesignerProvider['@:{designer#shared.props.partial.number}'],
        tip: '@:{lang#props.width}',
        key: 'textWidth',
        min: 0,
    }, {
        ...DesignerProvider['@:{designer#shared.props.partial.number}'],
        tip: '@:{lang#props.height}',
        key: 'textHeight',
        min: 0,
    },
    DesignerProvider['@:{designer#shared.props.fontsize}'](0, 0, 'textFontsize'),
    DesignerProvider['@:{designer#shared.props.fontfamily}']('textFontfamily'),
    DesignerProvider['@:{designer#shared.props.letter.sapcing}']('textLetterspacing'),
    DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.background}', 'textBackground', 1, 1),
    DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.forecolor}', 'textForecolor'), {
        tip: '@:{lang#props.rotate}',
        type: Enum["@:{enum#prop.number}"],
        key: 'textRotate',
        min: -360,
        max: 360,
        json: 1
    }, {
        tip: '@:{lang#props.text.on.line.position}',
        type: Enum["@:{enum#prop.number}"],
        key: 'textPosition',
        min: 0,
        max: 1,
        fixed: 2,
        step: 0.01,
        json: 1
    }, {
        ...DesignerProvider['@:{designer#shared.props.partial.number}'],
        tip: '@:{lang#props.x.offset}',
        key: 'textOffsetX',
    }, {
        ...DesignerProvider['@:{designer#shared.props.partial.number}'],
        tip: '@:{lang#props.y.offset}',
        key: 'textOffsetY',
    },
    DesignerProvider['@:{designer#shared.props.spliter}'],
    DesignerProvider['@:{designer#shared.props.ename}'],
    DesignerProvider['@:{designer#shared.props.locked}']]
});