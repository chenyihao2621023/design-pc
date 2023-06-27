
import Magix from 'magix5';
import Const from '../designer/const';
import Transform from '../designer/transform';
import DesignerProvider from './designer';
import Enum from '../designer/enum';
let { has, Cache } = Magix;
let { abs, max, min, sqrt } = Math;
let propCache = new Cache();
let MaxNum = Number.MAX_VALUE;
let MinNum = -MaxNum;
let bezier2Value = (t, p0, p1, p2) => {
    return p0 * (1 - t) * (1 - t) +
        2 * p1 * t * (1 - t) +
        p2 * t * t;
};
let bezier3Value = (t, p1, cp1, cp2, p2) => {
    return p1 * (1 - t) * (1 - t) * (1 - t) +
        3 * cp1 * t * (1 - t) * (1 - t) +
        3 * cp2 * t * t * (1 - t) +
        p2 * t * t * t;
};

/**
 * json序列化svg关键点
 * @param dest 目标属性
 * @param props 源属性
 */
let jsonEncodeKeyPoint = (dest, props) => {
    let keyPoints = Transform['@:{transform#get.key.point}'](props);
    for (let kp of keyPoints) {
        dest[kp + 'X'] = Transform['@:{transform#to.show.value}'](props[kp + 'X']);
        dest[kp + 'Y'] = Transform['@:{transform#to.show.value}'](props[kp + 'Y']);
    }
};
/**
 * 缩放svg关键点
 * @param props 源属性
 * @param step 缩放步长
 * @param dest 目标属性
 */
let stageScaleKeyPoint = (props, step, dest) => {
    let keyPoints = Transform['@:{transform#get.key.point}'](props);
    for (let kp of keyPoints) {
        props[kp + 'X'] *= step;
        props[kp + 'Y'] *= step;
        if (dest) {
            dest[kp + 'X'] = props[kp + 'X'];
            dest[kp + 'Y'] = props[kp + 'Y'];
        }
    }
};
/**
 * 转换svg关键点单位
 * @param props 源属性
 * @param toUnit 目标单位
 */
let unitConverKeyPoint = (props, toUnit) => {
    let keyPoints = Transform['@:{transform#get.key.point}'](props);
    for (let kp of keyPoints) {
        props[kp + 'X'] = Const['@:{const#unit.to.unit}'](props[kp + 'X'], toUnit);
        props[kp + 'Y'] = Const['@:{const#unit.to.unit}'](props[kp + 'Y'], toUnit);
    }
};
let svgKeyPoint = (mod = 1, min = 2) => {
    let key = `${mod}_${min}`;
    let dest;
    if (propCache.has(key)) {
        dest = propCache.get(key);
    } else {
        dest = {
            '@:{json.encode}': jsonEncodeKeyPoint,
            '@:{stage.scale}': stageScaleKeyPoint,
            '@:{unit.convert}': unitConverKeyPoint,
            mod,
            min,
            type: Enum["@:{enum#prop.svg.key.point}"]
        };
        propCache.set(key, dest);
    }
    return dest;
};
export default {
    /**
     * bezier3 value
     */
    '@:{svg#bezier3.value}': bezier3Value,
    /**
     * bezier3 value
     */
    '@:{svg#bezier2.value}': bezier2Value,
    /**
     * 获取bezier2外接矩形
     * @param x0 控制1点x坐标
     * @param y0 控制1点y坐标
     * @param x1 控制2点x坐标
     * @param y1 控制2点y坐标
     * @param x2 控制3点x坐标
     * @param y2 控制3点y坐标
     * @returns 外接矩形
     */
    '@:{svg#bezier2.outline.rect}'(x0, y0, x1, y1, x2, y2) {
        let t = (x0 - x1) / (x0 - 2 * x1 + x2);
        let xPoints = [x0, x2];
        let yPoints = [y0, y2];
        if (t >= 0 && t <= 1) {
            xPoints.push(bezier2Value(t, x0, x1, x2));
        }
        t = (y0 - y1) / (y0 - 2 * y1 + y2);
        if (t >= 0 && t <= 1) {
            yPoints.push(bezier2Value(t, y0, y1, y2));
        }
        let minX = min(...xPoints);
        let maxX = max(...xPoints);
        let minY = min(...yPoints);
        let maxY = max(...yPoints);
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    },
    /**
     * 获取bezier3外接矩形
     * @param x0 控制1点x坐标
     * @param y0 控制1点y坐标
     * @param x1 控制2点x坐标
     * @param y1 控制2点y坐标
     * @param x2 控制3点x坐标
     * @param y2 控制3点y坐标
     * @param x3 控制4点x坐标
     * @param y3 控制4点y坐标
     * @returns 外接矩形
     */
    '@:{svg#bezier3.outline.rect}'(x0, y0, x1, y1, x2, y2, x3, y3) {
        let tvalues = [], xvalues = [], yvalues = [],
            a, b, c, t, t1, t2, b2ac, sqrtb2ac;
        for (let i = 0; i < 2; ++i) {
            if (i == 0) {
                b = 6 * x0 - 12 * x1 + 6 * x2;
                a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
                c = 3 * x1 - 3 * x0;
            } else {
                b = 6 * y0 - 12 * y1 + 6 * y2;
                a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
                c = 3 * y1 - 3 * y0;
            }
            if (abs(a) < 1e-12) {
                if (abs(b) < 1e-12) {
                    continue;
                }
                t = -c / b;
                if (0 < t && t < 1) {
                    tvalues.push(t);
                }
                continue;
            }
            b2ac = b * b - 4 * c * a;
            if (b2ac < 0) {
                continue;
            }
            sqrtb2ac = sqrt(b2ac);
            t1 = (-b + sqrtb2ac) / (2 * a);
            if (0 < t1 && t1 < 1) {
                tvalues.push(t1);
            }
            t2 = (-b - sqrtb2ac) / (2 * a);
            if (0 < t2 && t2 < 1) {
                tvalues.push(t2);
            }
        }

        let j = tvalues.length;
        while (j--) {
            t = tvalues[j];
            //mt = 1 - t;
            xvalues[j] = bezier3Value(t, x0, x1, x2, x3);// (mt * mt * mt * x0) + (3 * mt * mt * t * x1) + (3 * mt * t * t * x2) + (t * t * t * x3);
            yvalues[j] = bezier3Value(t, y0, y1, y2, y3);// (mt * mt * mt * y0) + (3 * mt * mt * t * y1) + (3 * mt * t * t * y2) + (t * t * t * y3);
        }

        xvalues.push(x0, x3);
        yvalues.push(y0, y3);
        let minX = min(...xvalues);
        let maxX = max(...xvalues);
        let minY = min(...yvalues);
        let maxY = max(...yvalues);
        //console.log(xvalues);
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    },
    /**
     * 根据关键点获取外接矩形
     * @param keyPoints 关键点
     * @param source 来源属性
     * @returns 外接矩形
     */
    '@:{svg#keypoints.outline.rect}'(keyPoints, source) {
        let minX = MaxNum,
            minY = MaxNum,
            maxX = MinNum,
            maxY = MinNum;
        for (let i = keyPoints.length; i--;) {
            let key = keyPoints[i];
            let x = source[key + 'X'],
                y = source[key + 'Y'];

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
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    },
    /**
     * 获取元素有哪些移动点
     * @param props svg元素属性
     * @returns 移动点列表
     */
    '@:{svg#get.moved.props}'(props: Report.StageElementProps) {
        if (!props['@:{cached.move.props}']) {
            let points = [{
                key: 'x',
                use: 'x'
            }, {
                key: 'y',
                use: 'y'
            }];
            let kPoints = Transform['@:{transform#get.key.point}'](props);
            for (let kp of kPoints) {
                points.push({
                    key: kp + 'X',
                    use: 'x'
                }, {
                    key: kp + 'Y',
                    use: 'y'
                });
            }
            props['@:{cached.move.props}'] = points;
        }
        return props['@:{cached.move.props}'];
    },
    '@:{svg#prop.key.point}': svgKeyPoint,
    /**
     * json序列化svg关键点
     * @param dest 目标属性
     * @param props 源属性
     */
    '@:{svg#json.encode.key.point}': jsonEncodeKeyPoint,
    /**
     * 缩放svg关键点
     * @param props 源属性
     * @param step 缩放步长
     * @param dest 目标属性
     */
    '@:{svg#stage.scale.key.point}': stageScaleKeyPoint,
    /**
     * 转换svg关键点单位
     * @param props 源属性
     * @param toUnit 目标单位
     */
    '@:{svg#unit.convert.key.point}': unitConverKeyPoint,
    /**
     * 生成svg关键点
     * @param to 生成几个
     * @returns svg关键点
     */
    '@:{svg#generate.key.points}'(to: number) {
        let points = [...DesignerProvider['@:{designer#shared.move.props}']];
        for (let i = 1; i <= to; i++) {
            points.push({
                key: `ctrl${i}X`,
                use: 'x'
            }, {
                key: `ctrl${i}Y`,
                use: 'y'
            });
        }
        return points;
    },

    /**
     * 获取以mod开头的所有修改点
     * @param props svg元素属性
     * @returns 修改点列表
     */
    '@:{svg#get.mod.point}'(props: Report.StageElementProps) {
        if (!props['@:{cached.mod.points}']) {
            let points = [],
                index = 1;
            while (1) {
                let key = 'mod' + index++;
                if (has(props, key + 'X') ||
                    has(props, key + 'Y')) {
                    points.push(key);
                } else {
                    break;
                }
            }
            props['@:{cached.mod.points}'] = points;
        }
        return props['@:{cached.mod.points}'];
    },
}