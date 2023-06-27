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
    type: 'svg/polyline2',
    title: '@:{lang#elements.polyline}',
    icon: '&#xe6a0;',
    '@:{modifier}': Enum['@:{enum#modifier.protate}'],
    '@:{get.key.points}': Transform['@:{transform#get.key.point}'],
    '@:{move.props}': SVGProvider['@:{svg#get.moved.props}'],
    '@:{update.props}'(props) {
        let keyPoints = Transform['@:{transform#get.key.point}'](props);
        let rect = SVGProvider['@:{svg#keypoints.outline.rect}'](keyPoints, props);
        mix(props, rect);
    },
    '@:{get.props}'(x, y) {
        return {
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            ctrl1X: Const['@:{const#to.unit}'](x),
            ctrl1Y: Const['@:{const#to.unit}'](y + 50),
            ctrl2X: Const['@:{const#to.unit}'](x + 100),
            ctrl2Y: Const['@:{const#to.unit}'](y),
            ctrl3X: Const['@:{const#to.unit}'](x + 120),
            ctrl3Y: Const['@:{const#to.unit}'](y + 180),
            ctrl4X: Const['@:{const#to.unit}'](x + 160),
            ctrl4Y: Const['@:{const#to.unit}'](y + 100),
            linewidth: Const['@:{const#to.unit}'](1),
            linejoin: 'meter',
            cap: false,
            closed: false,
            dash: 0,
            fillcolor: '',
            animations: [],
            color: '#000',
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
        SVGProvider['@:{svg#prop.key.point}'](1, 2),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.svg.line.width}'],
        DesignerProvider['@:{designer#shared.props.svg.color}'],
        DesignerProvider['@:{designer#shared.props.svg.dash}'],
        DesignerProvider['@:{designer#shared.props.svg.fill.color}'],
        DesignerProvider['@:{designer#shared.props.svg.cap}'],
        DesignerProvider['@:{designer#shared.props.svg.line.join}'],
        DesignerProvider['@:{designer#shared.props.svg.closed}'],
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});