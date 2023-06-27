/*
    author:https://github.com/xinglie
*/
import Enum from '../../../designer/enum';
import DesignerProvider from '../../../provider/designer';
import Designer from '../designer';
let Bezier3Value = (t, p1, cp1, cp2, p2) => {
    return p1 * (1 - t) * (1 - t) * (1 - t) +
        3 * cp1 * t * (1 - t) * (1 - t) +
        3 * cp2 * t * t * (1 - t) +
        p2 * t * t * t;
};
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./index'
        });
    }
}).static({
    type: 'flow/document',
    title: '@:{lang#elements.flow.document}',
    icon: '&#xe60f;',
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
        let ctrl1X = x + width / 4;
        let ctrl1Y = y + height + height / 2;
        let ctrl2X = x + width * 3 / 4;
        let ctrl2Y = y + height / 2;
        let endX = x + width;
        let endY = y + height;
        let bx = Bezier3Value(0.5, x, ctrl1X, ctrl2X, endX);
        let by = Bezier3Value(0.5, y + height, ctrl1Y, ctrl2Y, endY);
        //console.log(by,bx,cy);
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
            x: x,
            y: cy
        }, {
            x: x + width,
            y: cy
        }, {
            x: cx,
            y
        }, {
            x: bx,
            y: by
        }];
        Designer['@:{update.props}'](points, center, rotate, props);
        props.textX = x;
        props.textY = y;
        props.textWidth = width;
        props.textHeight = height - height / 8;
    },
    '@:{get.props}'(x, y) {
        return Designer['@:{get.props}'](x, y, 200, 100);
    },
    props: Designer['@:{shared.props}']
});