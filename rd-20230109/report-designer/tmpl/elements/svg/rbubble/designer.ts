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
    type: 'svg/rbubble',
    title: '@:{lang#elements.svg.bubble}',
    icon: '&#xe87d;',
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
            mod1X, mod1Y,
            gapPosition,
            ename } = props;

        x = Const['@:{const#to.px}'](x);
        y = Const['@:{const#to.px}'](y);
        width = Const['@:{const#to.px}'](width);
        height = Const['@:{const#to.px}'](height);

        rotate = (360 + rotate) % 360;
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
        let startModX = mod1X,
            startModY = mod1Y;
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
            let destX;
            let destY;
            if (gapPosition == 'left') {
                destX = Const['@:{const#to.unit}'](startX - newX) + startModX;
            } else {
                destX = Const['@:{const#to.unit}'](newX - startX) + startModX;
            }
            if (gapPosition == 'top') {
                destY = Const['@:{const#to.unit}'](startY - newY) + startModY;
            } else {
                destY = Const['@:{const#to.unit}'](newY - startY) + startModY
            }

            props.mod1X = destX;
            props.mod1Y = destY;
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
    '@:{get.ctrl.points}'({ mod1X, mod1Y, gapPosition, width, height }) {
        if (gapPosition == 'top') {
            mod1Y *= -1;
        } else if (gapPosition == 'right') {
            mod1X += width;
        } else if (gapPosition == 'bottom') {
            mod1Y += height;
        } else {
            mod1X *= -1;
        }
        return [{
            x: mod1X,
            y: mod1Y,
            c: 'mod1'
        }];
    },
    '@:{get.props}'(x, y) {
        return {
            height: Const['@:{const#to.unit}'](100),
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            width: Const['@:{const#to.unit}'](200),
            linewidth: Const['@:{const#to.unit}'](1),
            dash: 0,
            mod1X: Const['@:{const#to.unit}'](20),
            mod1Y: Const['@:{const#to.unit}'](30),
            radius: Const['@:{const#to.unit}'](10),
            mod1Type: 'int',
            gapPosition: 'bottom',
            gapPRatio: 0.08,
            gapRatio: 0.16,
            fillcolor: '',
            cap: false,
            animations: [],
            linejoin: 'meter',
            color: '#000',
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
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.border.radius}',
            key: 'radius',
            min: 0,
        }, {
            tip: '@:{lang#props.gap.direction}',
            type: Enum["@:{enum#prop.collection}"],
            key: 'gapPosition',
            items: [{
                text: '@:{lang#dir.top}',
                value: 'top'
            }, {
                text: '@:{lang#dir.right}',
                value: 'right'
            }, {
                text: '@:{lang#dir.bottom}',
                value: 'bottom'
            }, {
                text: '@:{lang#dir.left}',
                value: 'left'
            }],
            json: 1
        }, {
            tip: '@:{lang#props.gap.position}',
            type: Enum["@:{enum#prop.number}"],
            key: 'gapPRatio',
            min: 0.00,
            max: 1.00,
            step: 0.01,
            fixed: 2,
            json: 1
        }, {
            tip: '@:{lang#props.gap.size}',
            type: Enum["@:{enum#prop.number}"],
            key: 'gapRatio',
            min: 0.00,
            max: 1.00,
            step: 0.01,
            fixed: 2,
            json: 1
        }, {
            type: Enum["@:{enum#prop.svg.mod.point}"],
            '@:{json.encode}'(dest, props) {
                dest.mod1Y = Transform["@:{transform#to.show.value}"](props.mod1Y);
                dest.mod1X = Transform["@:{transform#to.show.value}"](props.mod1X);
            },
            '@:{unit.convert}'(props, toUnit) {
                props.mod1Y = Const['@:{const#unit.to.unit}'](props.mod1Y, toUnit);
                props.mod1X = Const['@:{const#unit.to.unit}'](props.mod1X, toUnit);
            },
            '@:{stage.scale}'(props, step, dest) {
                props.mod1X *= step;
                props.mod1Y *= step;
                if (dest) {
                    dest.mod1X = props.mod1X;
                    dest.mod1Y = props.mod1Y;
                }
            }
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
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