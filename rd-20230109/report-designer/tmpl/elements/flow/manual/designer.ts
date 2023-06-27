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
    type: 'flow/manual',
    title: '@:{lang#elements.flow.manual}',
    icon: '&#xe61a;',
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
            y: y + height / 4 + (height / 4 * 3) / 2
        }, {
            x: x + width,
            y: cy
        }, {
            x: cx,
            y: y + height
        }, {
            x: cx,
            y: y + height / 8
        }];
        Designer['@:{update.props}'](points, center, rotate, props);
        props.textX = x;
        props.textY = y + height / 4;
        props.textWidth = width;
        props.textHeight = height / 4 * 3;
    },
    '@:{get.props}'(x, y) {
        return Designer['@:{get.props}'](x, y, 200, 120);
    },
    props: Designer['@:{shared.props}']
});