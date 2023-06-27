/*
    author:https://github.com/xinglie
*/
import Enum from '../../../designer/enum';
import DesignerProvider from '../../../provider/designer';
import Designer from '../designer';
let { sqrt } = Math;
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./index'
        });
    }
}).static({
    type: 'flow/ref',
    title: '@:{lang#elements.flow.ref}',
    icon: '&#xe65a;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'] |
        Enum['@:{enum#modifier.inputext}'],
    '@:{link.points}': ['p4', 'p5', 'p6', 'p7'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{update.props}'(props) {
        let { x, y, rotate, width, height } = props;
        let cx = x + width / 2,
            cy = y + height / 2;
        let center = {
            x: cx,
            y: cy
        };
        let points = [{
            x, y
        }, {
            x,
            y: y + height
        }, {
            x: x + width,
            y: y + height
        }, {
            x: x + width,
            y
        }, {
            x,
            y: cy
        }, {
            x: x + width,
            y: cy
        }, {
            x: cx,
            y: y + height
        }, {
            x: cx,
            y
        }];
        Designer['@:{update.props}'](points, center, rotate, props);
        let rx = width / 2,
            ry = height / 2;
        let textX = width / 8,
            textY,
            textHeight;
        let tx = textX - rx;
        let ty = sqrt(ry * ry * (1 - (tx * tx) / (rx * rx)));
        let ty1 = ry - ty;
        let ty2 = ry + ty;
        textY = ty1;
        textHeight = ty2 - ty1;
        props.textX = x + textX;
        props.textY = y + textY;
        props.textWidth = width / 4 * 3;
        props.textHeight = textHeight;
    },
    '@:{get.props}'(x, y) {
        return Designer['@:{get.props}'](x, y, 150, 150);
    },
    props: Designer['@:{shared.props}']
});