/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../../designer/const';
let { PI, cos, sin } = Math;
export default Magix.View.extend({
    tmpl: '@:index.html',
    init() {
        this.set({
            toPx: Const['@:{const#to.px}']
        });
    },
    assign(data) {
        let { props, unit } = data;
        let { startAngle, endAngle,
            rx, ry,
            centerX, centerY,
            mod1X, mod1Y } = props;
        rx = Const['@:{const#to.px}'](rx);
        ry = Const['@:{const#to.px}'](ry);
        centerX = Const['@:{const#to.px}'](centerX);
        centerY = Const['@:{const#to.px}'](centerY);
        if (endAngle < startAngle) {
            [endAngle, startAngle] = [startAngle, endAngle];
        }
        let diff = endAngle - startAngle;
        if (diff > 360) {
            startAngle += 360;
            diff = endAngle - startAngle;
        }
        let big = diff >= 180;
        let ANGLE = PI / 180;
        let startX = centerX + rx * cos(startAngle * ANGLE);
        let startY = centerY + ry * sin(startAngle * ANGLE);

        let endX = centerX + rx * cos(endAngle * ANGLE);
        let endY = centerY + ry * sin(endAngle * ANGLE);

        let cx = 2 * rx * mod1X;
        let cy = 2 * ry * mod1Y;
        this.set(data, {
            unit,
            big,
            cx, cy,
            startX,
            startY,
            endX,
            endY
        });
    },
    render() {
        this.digest();
    }
});