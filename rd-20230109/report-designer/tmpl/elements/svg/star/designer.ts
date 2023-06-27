/*
    author:https://github.com/xinglie
*/
import Const from '../../../designer/const';
import Enum from '../../../designer/enum';
import Transform from '../../../designer/transform';
import DesignerProvider from '../../../provider/designer';
import SVGProvider from '../../../provider/svg';
import Designer from '../designer';
let { PI, cos, sin } = Math;
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./index'
        });
    }
}).static({
    type: 'svg/star',
    title: '@:{lang#elements.svg.five.star}',
    icon: '&#xe62d;',
    '@:{modifier}': Enum['@:{enum#modifier.protate}'],
    '@:{get.key.points}': Transform['@:{transform#get.key.point}'],
    '@:{move.props}': SVGProvider['@:{svg#get.moved.props}'],
    '@:{update.props}'(props) {
        let minX = props.ctrl1X, minY = props.ctrl1Y,
            maxX = props.ctrl1X, maxY = props.ctrl1Y;
        let keyPoints = Transform['@:{transform#get.key.point}'](props);
        for (let i = keyPoints.length; i--;) {
            let key = keyPoints[i];
            let x = props[key + 'X'],
                y = props[key + 'Y'];

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
        props.x = minX;
        props.y = minY;
        props.width = maxX - minX;
        props.height = maxY - minY;
    },
    '@:{get.props}'(x, y) {
        let ANGLE = PI / 180;
        let R = Const['@:{const#to.unit}'](100);
        let r = R * sin(18 * ANGLE) / cos(36 * ANGLE);
        x = Const['@:{const#to.unit}'](x);
        y = Const['@:{const#to.unit}'](y);
        let props = {
            x,
            y,
            alpha: 1,
            linewidth: Const['@:{const#to.unit}'](1),
            dash: 0,
            fillcolor: '',
            color: '#000',
            linejoin: 'meter',
            cap: false,
            animations: [],
            locked: false
        };

        for (let i = 0; i < 5; i++) {
            props[`ctrl${i * 2 + 1}X`] = x + R + R * cos((-90 + i * 72) * ANGLE);
            props[`ctrl${i * 2 + 1}Y`] = y + R + R * sin((-90 + i * 72) * ANGLE);
            props[`ctrl${i * 2 + 2}X`] = x + R + r * cos((-54 + i * 72) * ANGLE);
            props[`ctrl${i * 2 + 2}Y`] = y + R + r * sin((-54 + i * 72) * ANGLE);
        }
        return props;
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.svg.width}'],
        DesignerProvider['@:{designer#shared.props.svg.height}'],
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.spliter}'],
        SVGProvider['@:{svg#prop.key.point}'](1),
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