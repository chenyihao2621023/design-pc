/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../../designer/const';
import Enum from '../../../designer/enum';
import StageGeneric from '../../../designer/generic';
import DHistory from '../../../designer/history';
import Transform from '../../../designer/transform';
import Cursor from '../../../gallery/mx-pointer/cursor';
import DesignerProvider from '../../../provider/designer';
import Designer from '../../designer';
let { State } = Magix;
let { PI, cos, sin, max } = Math;
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
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./index'
        });
    }
}).static({
    type: 'svg/rstar',
    title: '@:{lang#elements.svg.star}',
    icon: '&#xe62d;',
    '@:{modifier}': Enum['@:{enum#modifier.size}'] |
        Enum['@:{enum#modifier.rotate}'] |
        Enum['@:{enum#modifier.sync.size}'],
    '@:{circle.paths}': [['cr', 'c']],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{drag.mod.point}'(element, e, key, host) {
        State.fire('@:{event#pointer.using}', {
            active: 1
        });
        State.fire('@:{event#stage.scrolling}', {
            active: 1,
        });
        let { props, ctrl } = element;
        let moved;
        let { x, y, width, height,
            rotate,
            mod1Y,
            ename } = props;

        x = Const['@:{const#to.px}'](x);
        y = Const['@:{const#to.px}'](y);
        width = Const['@:{const#to.px}'](width);
        height = Const['@:{const#to.px}'](height);

        rotate = (360 + rotate) % 360;
        let ANGLE = PI / 180;
        let R = width / 2;
        let b = R + R * sin((270 + 2 * 72) * ANGLE);
        let yMax = ((height - b) / 2) + R,
            yMin = 0;
        let c = {
            x: x + width / 2,
            y: y + height / 2
        };
        let { eventTarget } = e;
        let pos = Transform["@:{transform#real.to.stage.coord}"]({
            x: e.pageX,
            y: e.pageY
        });
        let start = Transform["@:{transform#get.point.deg}"](pos, c);
        let { y: startY } = Transform["@:{transform#get.rotated.point}"](pos, c, start - rotate);
        let startModY = yMax * mod1Y;
        host['@:{drag.drop}'](e, (evt) => {
            if (!moved) {
                Cursor["@:{show}"](eventTarget);
                moved = 1;
            }
            let mpos = Transform["@:{transform#real.to.stage.coord}"]({
                x: evt.pageX,
                y: evt.pageY
            });
            let current = Transform["@:{transform#get.point.deg}"](mpos, c);
            let { y: newY } = Transform["@:{transform#get.rotated.point}"](mpos, c, current - rotate);
            let destY = newY - startY + startModY;
            if (destY < yMin) {
                destY = yMin;
            } else if (destY > yMax) {
                destY = yMax;
            }
            props.mod1Y = destY / yMax;
            StageGeneric['@:{generic#update.stage.element}'](element, '@:{mod}', host.owner);
        }, () => {
            if (moved) {
                Cursor["@:{hide}"]();
                DHistory['@:{history#save}'](DHistory['@:{history#element.modified.ctrl.point}'], ename);
            }
            State.fire('@:{event#pointer.using}');
            State.fire('@:{event#stage.scrolling}');
        });
    },
    '@:{get.ctrl.points}'({ modX, modY }) {
        return [{
            x: modX,
            y: modY,
            c: 'mod1'
        }];
    },
    '@:{update.props}'(props) {
        let ANGLE = PI / 180;
        let R = props.width / 2;
        let r = R * (1 - props.mod1Y);
        let p = props.corner;
        let offsetAngle = 360 / p;
        let halfAngle = offsetAngle / 2;
        let innerStart = halfAngle - 90;
        let min = Const['@:{const#to.unit}'](1);
        let double = Const['@:{const#to.unit}'](2);
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
        props.cr = max(0, r - min);

        props.cX = props.x + R + h - min;
        props.cY = props.y + R + v - min;

        props.modX = R + h;
        props.modY = R * props.mod1Y + v + double;

    },
    '@:{get.props}'(x, y) {
        return {
            height: Const['@:{const#to.unit}'](150),
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            width: Const['@:{const#to.unit}'](150),
            linewidth: Const['@:{const#to.unit}'](1),
            dash: 0,
            mod1Y: 0.62,
            corner: 5,
            fillcolor: '',
            color: '#000',
            linejoin: 'meter',
            cap: false,
            animations: [],
            locked: false
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.width}'](20),
        DesignerProvider['@:{designer#shared.props.height}'](20),
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.rotate}'],
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            type: Enum["@:{enum#prop.number}"],
            min: 5,
            max: 50,
            json: 1,
            key: 'corner',
            tip: '@:{lang#props.corner}'
        }, {
            type: Enum["@:{enum#prop.svg.mod.point}"],
            '@:{json.encode}'(dest, props) {
                dest.mod1Y = props.mod1Y;
            },
        }, 
        DesignerProvider['@:{designer#shared.props.svg.line.width}'],
        DesignerProvider['@:{designer#shared.props.svg.color}'],
        DesignerProvider['@:{designer#shared.props.svg.dash}'],
        DesignerProvider['@:{designer#shared.props.svg.fill.color}'],
        DesignerProvider['@:{designer#shared.props.svg.cap}'],
        DesignerProvider['@:{designer#shared.props.svg.line.join}'],
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});