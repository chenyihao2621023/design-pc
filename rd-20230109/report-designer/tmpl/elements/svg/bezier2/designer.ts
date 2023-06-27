/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../../designer/const';
import Enum from '../../../designer/enum';
import Transform from '../../../designer/transform';
import DesignerProvider from '../../../provider/designer';
import SVGProvider from '../../../provider/svg';
import Designer from '../designer';
let { mix } = Magix;
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./index'
        });
    }
}).static({
    type: 'svg/bezier2',
    title: '@:{lang#elements.bezier2}',
    icon: '&#xeabb;',
    '@:{modifier}': Enum['@:{enum#modifier.protate}'],
    '@:{move.props}': SVGProvider['@:{svg#generate.key.points}'](3),
    '@:{update.props}'(props) {
        let { ctrl1X: x0, ctrl1Y: y0,
            ctrl2X: x1, ctrl2Y: y1,
            ctrl3X: x2, ctrl3Y: y2 } = props;
        let rect = SVGProvider['@:{svg#bezier2.outline.rect}'](x0, y0, x1, y1, x2, y2);
        mix(props, rect);
    },
    '@:{get.key.points}': Transform['@:{transform#get.key.point}'],
    '@:{path.points}': ['M', 'ctrl1', 'L', 'ctrl2', 'L', 'ctrl3'],
    '@:{get.props}'(x, y) {
        return {
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            ctrl1X: Const['@:{const#to.unit}'](x + 200),
            ctrl1Y: Const['@:{const#to.unit}'](y),
            ctrl3X: Const['@:{const#to.unit}'](x),
            ctrl3Y: Const['@:{const#to.unit}'](y + 100),
            ctrl2X: Const['@:{const#to.unit}'](x),
            ctrl2Y: Const['@:{const#to.unit}'](y),
            linewidth: Const['@:{const#to.unit}'](1),
            // startArrow: false,
            // endArrow: false,
            dash: 0,
            cap: false,
            closed: false,
            color: '#000',
            fillcolor: '',
            animations: [],
            locked: false
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.svg.width}'],
        DesignerProvider['@:{designer#shared.props.svg.height}'],
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.spliter}'],
        SVGProvider['@:{svg#prop.key.point}'](0),
        // DesignerProvider['@:{designer#shared.props.spliter}'],
        // DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.start.arrow}', 'startArrow'),
        // DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.end.arrow}', 'endArrow'),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.svg.line.width}'],
        DesignerProvider['@:{designer#shared.props.svg.color}'],
        DesignerProvider['@:{designer#shared.props.svg.dash}'],
        DesignerProvider['@:{designer#shared.props.svg.fill.color}'],
        DesignerProvider['@:{designer#shared.props.svg.cap}'],
        DesignerProvider['@:{designer#shared.props.svg.closed}'],
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});