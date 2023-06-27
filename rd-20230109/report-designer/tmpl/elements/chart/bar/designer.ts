/*
    author:https://github.com/xinglie
*/
import Const from '../../../designer/const';
import Enum from '../../../designer/enum';
import DesignerProvider from '../../../provider/designer';
import GenericProvider from '../../../provider/generic';
import Designer from '../../designer';
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./index'
        });
    }
}).static({
    type: 'chart/bar',
    title: '@:{lang#elements.chart-bar}',
    icon: '&#xe64b;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            background: '',
            alpha: 1,
            width: Const['@:{const#to.unit}'](500),
            height: Const['@:{const#to.unit}'](300),
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            title: '',
            titleAlign: 'left',
            rotate: 0,
            bind: {},
            animations: [],
            color: GenericProvider['@:{generic#get.brand.color}'](),
            ow: 'echarts.apache.org',
            locked: false
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.width}'](),
        DesignerProvider['@:{designer#shared.props.height}'](),
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.rotate}'],
        DesignerProvider['@:{designer#shared.props.data.source.spliter}'],
        DesignerProvider['@:{designer#shared.props.bind}'](-1),
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            tip: '@:{lang#props.chart.title}',
            key: 'title',
            type: Enum["@:{enum#prop.text.input}"],
            json: 1
        }, {
            tip: '@:{lang#props.title.align}',
            key: 'titleAlign',
            type: Enum['@:{enum#prop.font.align}'],
            json: 1
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.background}', 'background', 1, 1),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.color}', 'color'),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ow}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});