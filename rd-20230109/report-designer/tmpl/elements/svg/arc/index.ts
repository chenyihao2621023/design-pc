/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../../designer/const';
let { PI, cos, sin } = Math;
let { State, View } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    init() {
        this.set({
            toPx: Const['@:{const#to.px}'],
            ox: State.get('@:{global#stage.page.x.offset}') || 0,
            oy: State.get('@:{global#stage.page.y.offset}') || 0,
        });
    },
    assign(data) {
        let { props } = data;
        let { startAngle, endAngle,
            rx, ry,
            centerX, centerY } = props;
        startAngle = parseFloat(startAngle);
        endAngle = parseFloat(endAngle);
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

        this.set(data, {
            big,
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