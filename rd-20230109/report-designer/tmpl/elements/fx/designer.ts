/*
    author:https://github.com/xinglie
*/
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import DesignerProvider from '../../provider/designer';
import Designer from '../designer';
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./index'
        });
    }
}).static({
    type: 'fx',
    title: '@:{lang#elements.fx}',
    icon: '&#xe628;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            height: Const['@:{const#to.unit}'](300),
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            width: Const['@:{const#to.unit}'](400),
            title: '',
            grid: false,
            zoom: true,
            xLine: true,
            yLine: true,
            xAxisRange: [-10, 10],
            xAxisTitle: '',
            yAxisRange: [-1, 10],
            yAxisTitle: '',
            data: [{
                color: '#e16632',
                fn: 'x^2',
                graphType: 'interval',
                closed: false
            }],
            annotations: [],
            ow: 'github.com/mauriciopoppe/function-plot',
            locked: false,
            animations: []
        };
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.width}'](20),
        DesignerProvider['@:{designer#shared.props.height}'](20),
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.rotate}'],
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            tip: '@:{lang#props.chart.title}',
            key: 'title',
            type: Enum["@:{enum#prop.text.input}"],
            json: 1
        },
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.page.grid}', 'grid'),
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.disable.zoom}', 'zoom'), {
            tip: '@:{lang#props.x.axis.title}',
            key: 'xAxisTitle',
            type: Enum["@:{enum#prop.text.input}"],
            json: 1
        }, {
            tip: '@:{lang#props.x.axis.range}',
            type: Enum["@:{enum#prop.number.pair}"],
            key: 'xAxisRange',
            json: 1
        }, {
            tip: '@:{lang#props.y.axis.title}',
            key: 'yAxisTitle',
            type: Enum["@:{enum#prop.text.input}"],
            json: 1
        }, {
            tip: '@:{lang#props.y.axis.range}',
            type: Enum["@:{enum#prop.number.pair}"],
            key: 'yAxisRange',
            json: 1
        },
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.x.line}', 'xLine'),
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.y.line}', 'yLine'),
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            key: 'data',
            type: Enum["@:{enum#prop.fx.expression}"],
            json: 1
        },
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            key: 'annotations',
            type: Enum["@:{enum#prop.fx.help}"],
            json: 1
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ow}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});