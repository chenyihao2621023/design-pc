/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../../designer/const';
let { PI, sin, cos } = Math;
let { MAX_VALUE } = Number;
let findMaxAndMin = points => {
    let maxX = -MAX_VALUE,
        maxY = maxX,
        minY = MAX_VALUE,
        minX = minY;
    for (let i = 0; i < points.length; i += 2) {
        let x = points[i],
            y = points[i + 1];
        if (x > maxX) {
            maxX = x;
        }
        if (x < minX) {
            minX = x;
        }
        if (y > maxY) {
            maxY = y;
        }
        if (y < minY) {
            minY = y;
        }
    }
    return {
        h: minX + (maxX - minX) / 2,
        v: minY + (maxY - minY) / 2
    };
};
export default Magix.View.extend({
    tmpl: '@:index.html',
    assign(data) {
        let { props, unit } = data;
        let ANGLE = PI / 180;
        let R = Const['@:{const#to.px}'](props.width) / 2;
        let r = R * (1 - props.mod1Y);
        let p = props.corner;
        let offsetAngle = 360 / p;
        let halfAngle = offsetAngle / 2;
        let innerStart = halfAngle - 90;
        let points = [];
        for (let i = 0; i < p; i++) {
            points.push(R + R * cos((-90 + i * offsetAngle) * ANGLE),
                R + R * sin((-90 + i * offsetAngle) * ANGLE),
                R + r * cos((innerStart + i * offsetAngle) * ANGLE),
                R + r * sin((innerStart + i * offsetAngle) * ANGLE));
        }
        let { h, v } = findMaxAndMin(points);
        h = (R - h);
        v = (R - v);
        let path = 'M';
        for (let i = 0; i < points.length; i += 2) {
            let x = points[i],
                y = points[i + 1];
            if (path != 'M') {
                path += 'L';
            }
            path += (x + h) + ' ' + (y + v);
        }
        path += 'Z';
        this.set({
            unit,
            props,
            path
        });
    },
    render() {
        this.digest();
    }
});