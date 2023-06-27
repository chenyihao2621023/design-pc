/*
    author:https://github.com/xinglie
*/
import Enum from '../../../designer/enum';
import DesignerProvider from '../../../provider/designer';
import Designer from '../designer';
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./index'
        });
    }
}).static({
    type: 'flow/estore',
    title: '@:{lang#elements.flow.estore}',
    icon: '&#xe634;',
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
            y: y + height / 2
        }, {
            x: x + width * 7 / 8,
            y: cy
        }, {
            x: cx,
            y: y + height
        }, {
            x: cx,
            y: y
        }];
        Designer['@:{update.props}'](points, center, rotate, props);
        let rx = width / 8;
        props.textX = x + rx;
        props.textY = y;
        props.textWidth = width - 2 * rx;
        props.textHeight = height;
    },
    '@:{get.props}'(x, y) {
        return Designer['@:{get.props}'](x, y, 200, 120);
    },
    props: Designer['@:{shared.props}']
});