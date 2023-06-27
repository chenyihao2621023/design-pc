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
    type: 'svg/rarrow',
    title: '@:{lang#elements.svg.arrow}',
    icon: '&#xe630;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.ctrl.points}'(props) {
        let { width, height, mod1X, mod1Y } = props;
        let halfHeight = height / 2;
        let x = width * mod1X,
            y = halfHeight * mod1Y;
        return [{ x, y, c: 'mod1' }];
    },
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
            mod1X, mod1Y,
            ename } = props;
        x = Const['@:{const#to.px}'](x);
        y = Const['@:{const#to.px}'](y);
        width = Const['@:{const#to.px}'](width);
        height = Const['@:{const#to.px}'](height);
        rotate = (360 + rotate) % 360;
        let xMax = width,
            xMin = 0;
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
        let { x: startX,
            y: startY } = Transform["@:{transform#get.rotated.point}"](pos, c, start - rotate);
        let startModX = width * mod1X,
            startModY = height / 2 * mod1Y;
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
            let { x: newX,
                y: newY } = Transform["@:{transform#get.rotated.point}"](mpos, c, current - rotate);
            let destX = newX - startX + startModX;
            let destY = newY - startY + startModY;
            if (destX < xMin) {
                destX = xMin;
            } else if (destX > xMax) {
                destX = xMax;
            }
            if (destY < yMin) {
                destY = yMin;
            } else if (destY > yMax) {
                destY = yMax;
            }
            props.mod1X = destX / width;
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
    '@:{get.props}'(x, y) {
        return {
            height: Const['@:{const#to.unit}'](150),
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            width: Const['@:{const#to.unit}'](250),
            linewidth: Const['@:{const#to.unit}'](1),
            dash: 0,
            mod1X: 0.8,
            mod1Y: 0.6,
            cap: false,
            stail: false,
            linejoin: 'meter',
            fillcolor: '',
            color: '#000',
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
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.swallow.tailed}', 'stail'), {
            type: Enum["@:{enum#prop.svg.mod.point}"],
            '@:{json.encode}'(dest, props) {
                dest.mod1X = props.mod1X;
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