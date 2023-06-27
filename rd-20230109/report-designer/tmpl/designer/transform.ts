import Magix from 'magix5';
import Const from './const';
let { State, node, has } = Magix;
let { atan, PI, sin, hypot,
    cos, min, max, atan2, tan, abs } = Math;
let PD180 = PI / 180;
let handlerToPointIndex = {
    tl: 2,//top left相对右下角
    tm: 2,//top middle 相对右下角
    tr: 3,//top right 相对左下角
    br: 0,//bottom right 相对左上角
    bm: 0,//bottom middle 相对左上角
    bl: 1,//bottom left 相对右上角
    mr: 3,//middle right or 3相对左上角
    ml: 1,//middle left 相对右上角
};
// let handlerToEightPointIndex = {
//     tl: 0,
//     tm: 1,
//     tr: 2,
//     mr: 3,
//     br: 4,
//     bm: 5,
//     bl: 6,
//     ml: 7
// };
/**
 * 获取画布位置及大小
 * @returns
 */
let getStageCanvasDomRect = () => node<HTMLElement>('_rd_sc').getBoundingClientRect();
export default {
    /**
     * 获取设计区dom节点的rect
     */
    '@:{transform#get.stage.dom.rect}': getStageCanvasDomRect,
    /**
     * 真实坐标转设计区坐标
     * @param param0 坐标点
     */
    '@:{transform#real.to.stage.coord}'({ x, y }: Report.Point) {
        let pos = getStageCanvasDomRect();
        x = x - pos.x - scrollX;// + oNode.prop('scrollLeft');
        y = y - pos.y - scrollY;// + oNode.prop('scrollTop');
        return {
            x,
            y
        };
    },
    /**
     * 真实坐标转最近的设计区
     * @param node 从哪个dom节点向上是容器即设计区的节点
     * @param param1 转换坐标信息
     */
    '@:{transform#real.to.nearest.coord}'(node,
        { x, y, f }: Report.Point) {
        let stage = node;
        if (f) {
            while (stage.parentNode) {
                if (stage.dataset.as == 'hod') {
                    break;
                }
                stage = stage.parentNode;
            }
        }
        let pos = stage.getBoundingClientRect();
        x = x - pos.x - scrollX;// + oNode.prop('scrollLeft');
        y = y - pos.y - scrollY;// + oNode.prop('scrollTop');
        return {
            x,
            y
        };
    },
    /**
     * 设计区坐标转真实坐标
     * @param param0 坐标点
     */
    '@:{transform#stage.to.real.coord}'({ x, y }: Report.Point) {
        let pos = getStageCanvasDomRect();
        x = x + pos.x + scrollX;// + oNode.prop('scrollLeft');
        y = y + pos.y + scrollY;// + oNode.prop('scrollTop');
        return {
            x,
            y
        };
    },
    /**
     * 真实值转成显示值
     * @param x 待转换的值
     */
    '@:{transform#to.show.value}'(x: number) {
        let s = State.get('@:{global#stage.scale}');
        let v = (x / s);
        return Const['@:{const#scale.to.unit}'](v);
    },
    /**
     * 显示值转成真实值
     * @param x 待转换的值
     */
    '@:{transform#to.real.value}'(x: number) {
        let s = State.get('@:{global#stage.scale}');
        return x * s;
    },
    /**
     * 获取旋转后的矩形
     * @param param0 矩形信息
     */
    '@:{transform#rotate.rect}'({ x, y, width, height, rotate }: Report.StageElementProps) {
        rotate ||= 0;
        let r = hypot(width, height) / 2;//sqrt(pow(width, 2) + pow(height, 2)) / 2;
        let a = width ? atan(height / width) * 180 / PI : 90;
        let tlbra = 180 - rotate - a;
        let trbla = a - rotate;
        let ta = 90 - rotate;
        // let ra = rotate;

        let halfWidth = width / 2;
        let halfHeight = height / 2;

        let middleX = x + halfWidth;
        let middleY = y + halfHeight;
        let topLeft = {
            x: middleX + r * cos(tlbra * PD180),
            y: middleY - r * sin(tlbra * PD180)
        };
        let topRight = {
            x: middleX + r * cos(trbla * PD180),
            y: middleY - r * sin(trbla * PD180)
        };
        let bottomRight = {
            x: middleX - r * cos(tlbra * PD180),
            y: middleY + r * sin(tlbra * PD180)
        };
        let bottomLeft = {
            x: middleX - r * cos(trbla * PD180),
            y: middleY + r * sin(trbla * PD180)
        };

        let topMiddle = {
            x: middleX + halfHeight * cos(ta * PD180),
            y: middleY - halfHeight * sin(ta * PD180),
        };
        let rightMiddle = {
            x: middleX + halfWidth * cos(rotate * PD180),
            y: middleY + halfWidth * sin(rotate * PD180),
        };
        let bottomMiddle = {
            x: middleX - halfHeight * sin(rotate * PD180),
            y: middleY + halfHeight * cos(rotate * PD180),
        };
        let leftMiddle = {
            x: middleX - halfWidth * cos(rotate * PD180),
            y: middleY - halfWidth * sin(rotate * PD180),
        };
        let minX = min(topLeft.x, topRight.x, bottomRight.x, bottomLeft.x);
        let maxX = max(topLeft.x, topRight.x, bottomRight.x, bottomLeft.x);
        let minY = min(topLeft.y, topRight.y, bottomRight.y, bottomLeft.y);
        let maxY = max(topLeft.y, topRight.y, bottomRight.y, bottomLeft.y);
        //return [topLeft, top, topRight, right, bottomRight, bottom, bottomLeft, left];
        return {
            '@:{point}': [topLeft, topRight, bottomRight, bottomLeft],
            '@:{middles}': [topMiddle, rightMiddle, bottomMiddle, leftMiddle],
            '@:{width}': maxX - minX,
            '@:{height}': maxY - minY,
            '@:{left}': minX,
            '@:{right}': maxX,
            '@:{top}': minY,
            '@:{bottom}': maxY,
            '@:{center.x}': middleX,
            '@:{center.y}': middleY
        }
    },
    /**
     * 计算旋转后的左上角坐标
     * @param param0 元素描述对象
     */
    // '@:{transform#get.rect.xy}'({ x, y, width, height, rotate }: Report.StageElementProps) {
    //     // if (width == 0) {
    //     //     width = 0.001;
    //     // }
    //     //圆心x0,y0
    //     // let x0 = x + width / 2;
    //     // let y0 = y + height / 2;
    //     // //半径r
    //     // let r = sqrt(width * width / 2 / 2 + height * height / 2 / 2);
    //     // //初始角度 左上角与圆心的角度
    //     // let deg0 = 180 * atan(height / width) / PI;
    //     // //旋转角度，与x轴正方向角度，左上角顶点要加上180度

    //     // let rDeg = deg0 + rotate + 180;

    //     // //新的左上角坐标
    //     // let x1 = x0 + r * cos(rDeg * PD180);
    //     // let y1 = y0 + r * sin(rDeg * PD180);
    //     // return {
    //     //     x: x1,
    //     //     y: y1
    //     // };
    //     let c = {
    //         x: x + width / 2,
    //         y: y + height / 2
    //     };
    //     let o = {
    //         x,
    //         y
    //     };
    //     let deg = this['@:{transform#get.point.deg}'](o, c);
    //     return this['@:{transform#get.rotated.point}'](o, c, deg + rotate);
    // },
    // '@:{transform#get.left.top}'(width, height, rotate) {
    //     rotate ||= 0;
    //     let r = sqrt(pow(width, 2) + pow(height, 2)) / 2;
    //     let a = width ? atan(height / width) * 180 / PI : 90;
    //     let tlbra = 180 - (rotate || 0) - a;
    //     return {
    //         x: r * cos(tlbra * PD180),
    //         y: r * sin(tlbra * PD180)
    //     };
    // },
    /**
     * 计算两点角度
     * @param p1 第一个点
     * @param p2 第二个点
     */
    '@:{transform#get.point.deg}'(p1: Report.Point, p2: Report.Point) {
        return (360 + atan2((p1.y - p2.y), (p1.x - p2.x)) * 180 / PI) % 360;
    },
    /**
     * 手柄转固定坐标索引
     * @param handler 拖动手柄字符串
     */
    '@:{transform#handle.to.fixed.point}'(handler: string): number {
        return handlerToPointIndex[handler]
    },
    /**
     * 计算一点绕另一点旋转某角度后的新坐标
     * @param src 待旋转的点
     * @param center 绕哪个点旋转
     * @param degree 旋转多少度
     */
    '@:{transform#get.rotated.point}'(src: Report.Point,
        center: Report.Point,
        degree: number) {
        let r = hypot(src.x - center.x, src.y - center.y);// sqrt(pow(src.x - center.x, 2) + pow(src.y - center.y, 2));
        //deg = 360 - deg;
        let newX = center.x + r * cos(degree * PD180);
        let newY = center.y + r * sin(degree * PD180);
        //console.log(newX, newY);
        return { x: newX, y: newY };
    },
    /**
     * 根据角度计算线性方程
     * @param x x点坐标
     * @param y y点坐标
     * @param degree 倾斜角度
     */
    '@:{transform#get.linear.equation.by.deg}'(x: number,
        y: number,
        degree: number) {
        let k = tan(degree * PD180);
        let b = y - x * k;
        return { k, b };
    },
    /**
     * 根据点算直线方程
     * @param x1 第1个点的x坐标
     * @param y1 第1个点的y坐标
     * @param x2 第2个点的x坐标
     * @param y2 第2个点的y坐标
     */
    '@:{transform#get.linear.equation.by.point}'(x1: number,
        y1: number,
        x2: number,
        y2: number) {
        let k = (y2 - y1) / (x2 - x1);
        let b = y1 - x1 * k;
        return { k, b };
    },
    /**
     * 计算点距离
     * @param p1 第1个点坐标
     * @param p2 第2个点坐标
     */
    // '@:{transform#get.point.distance}'(p1: Report.Point,
    //     p2: Report.Point): number {
    //     return sqrt(pow(p1.x - p2.x, 2) + pow(p1.y - p2.y, 2));
    // },
    /**
     * 判断线段是否相交
     * @param line1 第1条线段
     * @param line2 第2条线段
     */
    '@:{transform#is.line.cross}'(line1: Report.Point[],
        line2: Report.Point[]): boolean {
        let [s1, e1] = line1, [s2, e2] = line2;
        let d1 = ((e1.x - s1.x) * (s2.y - s1.y) - (e1.y - s1.y) * (s2.x - s1.x)) * ((e1.x - s1.x) * (e2.y - s1.y) - (e1.y - s1.y) * (e2.x - s1.x));
        let d2 = ((e2.x - s2.x) * (s1.y - s2.y) - (e2.y - s2.y) * (s1.x - s2.x)) * ((e2.x - s2.x) * (e1.y - s2.y) - (e2.y - s2.y) * (e1.x - s2.x));
        return d1 < 0 && d2 < 0;
    },
    /**
     * 判断点是否在线段上
     * @param p 待判断的点
     * @param p1 线段第1个点
     * @param p2 线段第2个点
     */
    // '@:{transform#point.on.segment}'(p: Report.Point,
    //     p1: Report.Point,
    //     p2: Report.Point): boolean {
    //     p.x = round(p.x);
    //     p.y = round(p.y);
    //     p1.x = round(p1.x);
    //     p1.y = round(p1.y);
    //     p2.x = round(p2.x);
    //     p2.y = round(p2.y);
    //     return (p.x - p1.x) * (p2.y - p1.y) == (p2.x - p1.x) * (p.y - p1.y) && min(p1.x, p2.x) <= p.x && p.x <= max(p1.x, p2.x) && min(p1.y, p2.y) <= p.y && p.y <= max(p1.y, p2.y);
    // },
    /**
     * 判断2个矩形是否相交
     * @param rect1 第1个矩形
     * @param rect2 第2个矩形
     */
    '@:{transform#rect.intersect}'(rect1: Report.Rect | Report.StageElementProps,
        rect2: Report.Rect | Report.StageElementProps,
        onlyCheckInside?: boolean): boolean {
        let half1Width = rect1.width / 2,
            half1Height = rect1.height / 2,
            half2Width = rect2.width / 2,
            half2Height = rect2.height / 2,
            cen1 = {
                x: rect1.x + half1Width,
                y: rect1.y + half1Height
            },
            cen2 = {
                x: rect2.x + half2Width,
                y: rect2.y + half2Height
            },
            f = onlyCheckInside ? -1 : 1;

        return abs(cen2.x - cen1.x) <= half1Width + f * half2Width &&
            abs(cen2.y - cen1.y) <= half1Height + f * half2Height;
    },
    /**
     * 判断2个点是否相同
     * @param p1 第1个点
     * @param p2 第2个点
     */
    // '@:{transform#is.same.point}'(p1: Report.Point,
    //     p2: Report.Point): boolean {
    //     return round(p1.x) == round(p2.x) &&
    //         round(p1.y) == round(p2.y);
    // },
    /**
     * 计算圆上点的坐标
     * @param center 圆心
     * @param radius 半径
     * @param rotate 旋转角度
     * @returns 圆上点
     */
    // '@:{transform#get.circle.point}'(center: Report.Point,
    //     radius: number,
    //     rotate: number): Report.Point {
    //     return {
    //         x: center.x + radius * cos(rotate * PD180),
    //         y: center.y + radius * sin(rotate * PD180)
    //     };
    // },
    // '@:{transform#extrct.info.by.props}'(props: Report.StageElementProps,
    //     key: string) {
    //     let { x, y, width, height } = props;
    //     let halfWidth = width / 2,
    //         halfHeight = height / 2;
    //     let eightPoints = [{//左上
    //         x,
    //         y
    //     }, {//上中
    //         x: x + halfWidth,
    //         y
    //     }, {//右上
    //         x: x + width,
    //         y
    //     }, {//右中
    //         x: x + width,
    //         y: y + halfHeight
    //     }, {//右下
    //         x: x + width,
    //         y: y + height
    //     }, {//下中
    //         x: x + halfWidth,
    //         y: y + height
    //     }, {//左下
    //         x,
    //         y: y + height
    //     }, {//左中
    //         x,
    //         y: y + halfHeight
    //     }];
    //     let currentPoint = eightPoints[handlerToEightPointIndex[key]];
    //     let center = {
    //         x: x + halfWidth,
    //         y: y + halfHeight
    //     };
    //     let radius = this['@:{transform#get.point.distance}'](currentPoint, center);
    //     return {
    //         '@:{point}': currentPoint,
    //         '@:{center}': center,
    //         '@:{radius}': radius
    //     };
    // }
    //点在矩形内
    // '@:{point.in.rect}'(point, rect) {
    //     return rect.x <= point.x &&
    //         rect.y <= point.y &&
    //         (rect.y + rect.height) >= point.y &&
    //         (rect.x + rect.width) >= point.x;
    // }
    /**
     * 获取以ctrl开头的所有控制点
     * @param props svg元素属性
     * @returns 控制点列表
     */
    '@:{transform#get.key.point}'(props: Report.StageElementProps) {
        if (!props['@:{cached.key.points}']) {
            let points = [],
                index = 1;
            while (1) {
                let key = 'ctrl' + index++;
                if (has(props, key + 'X')) {
                    points.push(key);
                } else {
                    break;
                }
            }
            props['@:{cached.key.points}'] = points;
        }
        return props['@:{cached.key.points}'];
    },
};