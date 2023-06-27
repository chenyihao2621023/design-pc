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
    type: 'svg/rcorner',
    title: '@:{lang#elements.svg.corner}',
    icon: '&#xe63a;',
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
            mod1Y, mod2X, mod2Y, mod3X,
            ename } = props;

        x = Const['@:{const#to.px}'](x);
        y = Const['@:{const#to.px}'](y);
        width = Const['@:{const#to.px}'](width);
        height = Const['@:{const#to.px}'](height);
        rotate = (360 + rotate) % 360;
        let halfWidth = width / 2,
            halfHeight = height / 2;
        let c = {
            x: x + halfWidth,
            y: y + halfHeight
        };
        let { eventTarget } = e;
        let pos = Transform["@:{transform#real.to.stage.coord}"]({
            x: e.pageX,
            y: e.pageY
        });
        let start = Transform["@:{transform#get.point.deg}"](pos, c);
        let { x: startX,
            y: startY } = Transform["@:{transform#get.rotated.point}"](pos, c, start - rotate);
        let startModX, startModY;
        if (key == 'mod2') {
            startModX = halfWidth * mod2X;
            startModY = halfHeight * mod2Y;
        } else if (key == 'mod1') {
            startModY = height - halfHeight * mod1Y;
        } else {
            startModX = width - halfWidth * mod3X;
        }
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
            if (key == 'mod2') {
                if (destX < 0) {
                    destX = 0;
                } else if (destX > halfWidth) {
                    destX = halfWidth;
                }
                if (destY < 0) {
                    destY = 0;
                } else if (destY > halfHeight) {
                    destY = halfHeight;
                }
                props.mod2X = destX / halfWidth;
                props.mod2Y = destY / halfHeight;
            } else if (key == 'mod1') {
                if (destY < halfHeight) {
                    destY = halfHeight;
                } else if (destY > height) {
                    destY = height;
                }
                props.mod1Y = (height - destY) / halfHeight;
            } else {
                if (destX < halfWidth) {
                    destX = halfWidth;
                } else if (destX > width) {
                    destX = width;
                }
                props.mod3X = (width - destX) / halfWidth;
            }

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
    '@:{get.ctrl.points}'(props) {
        let { width, height, mod1Y, mod2X, mod2Y, mod3X } = props;
        return [{
            x: width * mod2X / 2,
            y: height * (1 - mod1Y / 2),
            c: 'mod1'
        }, {
            x: width * mod2X / 2,
            y: height * mod2Y / 2,
            c: 'mod2'
        }, {
            x: width * (1 - mod3X / 2),
            y: height * mod2Y / 2,
            c: 'mod3'
        }];
    },
    '@:{get.props}'(x, y) {
        return {
            height: Const['@:{const#to.unit}'](120),
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            width: Const['@:{const#to.unit}'](120),
            linewidth: Const['@:{const#to.unit}'](1),
            dash: 0,
            mod1Y: 0.2,
            mod2X: 0.2,
            mod2Y: 0.2,
            mod3X: 0.2,
            cap: false,
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
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            type: Enum["@:{enum#prop.svg.mod.point}"],
            '@:{json.encode}'(dest, props) {
                dest.mod1Y = props.mod1Y;
                dest.mod2X = props.mod2X;
                dest.mod2Y = props.mod2Y;
                dest.mod3X = props.mod3X;
            }
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