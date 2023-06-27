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
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./index'
        });
    }
}).static({
    type: 'svg/rcylinder',
    title: '@:{lang#elements.svg.cylinder}',
    icon: '&#xe631;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{drag.mod.point}'(element, e, key, host) {
        State.fire('@:{event#pointer.using}', {
            active: 1
        });
        State.fire('@:{event#stage.scrolling}', {
            active: 1,
        });
        let { props } = element;
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
        let yMax = height / 2,
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
        let startModY = height / 2 * mod1Y;
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
            props.mod1Y = destY / (height / 2);
            StageGeneric['@:{generic#update.stage.element}'](element, '@:{mod}', host.owner);
        }, () => {
            if (moved) {
                Cursor["@:{hide}"]();
                DHistory['@:{history#save}'](DHistory['@:{history#element.modified.mod.point}'], ename);
            }
            State.fire('@:{event#pointer.using}');
            State.fire('@:{event#stage.scrolling}');
        });
    },
    '@:{get.ctrl.points}'({ mod1Y, width, height }) {
        return [{
            x: width / 2,
            y: height / 2 * mod1Y,
            c: 'mod1'
        }];
    },
    '@:{get.props}'(x, y) {
        return {
            height: Const['@:{const#to.unit}'](150),
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            width: Const['@:{const#to.unit}'](120),
            linewidth: Const['@:{const#to.unit}'](1),
            dash: 0,
            mod1Y: 0.4,
            bodycolor: '',
            topcolor: '',
            color: '#000',
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
            type: Enum["@:{enum#prop.svg.mod.point}"],
            '@:{json.encode}'(dest, props) {
                dest.mod1Y = props.mod1Y;
            }
        },
        DesignerProvider['@:{designer#shared.props.svg.line.width}'],
        DesignerProvider['@:{designer#shared.props.svg.color}'],
        DesignerProvider['@:{designer#shared.props.svg.dash}'],
        DesignerProvider['@:{designer#shared.props.svg.cap}'],
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.top.color}', 'topcolor', 1, 1),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.cylinder.body.color}', 'bodycolor', 1, 1),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});