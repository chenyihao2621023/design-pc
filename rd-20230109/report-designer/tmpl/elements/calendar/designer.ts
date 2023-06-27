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
    type: 'calendar',
    title: '@:{lang#elements.calendar}',
    icon: '&#xe65c;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            alpha: 1,
            width: Const['@:{const#to.unit}'](300),
            height: Const['@:{const#to.unit}'](180),
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            theadFontsize: Const['@:{const#to.unit}'](16),
            tbodyFontsize: Const['@:{const#to.unit}'](14),
            theadRowBackground: '#ffda95',
            weekStart: 0,
            locked: false,
            animations: [],
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.width}'](300),
        DesignerProvider['@:{designer#shared.props.height}'](180),
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.rotate}'],
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.table.head.font.size}',
            min: () => Const["@:{const#to.unit}"](12),
            max: () => Const["@:{const#to.unit}"](100),
            key: 'theadFontsize',
        },
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.table.head.row.background}', 'theadRowBackground', 1, 1), {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.table.body.font.size}',
            min: () => Const["@:{const#to.unit}"](12),
            max: () => Const["@:{const#to.unit}"](100),
            key: 'tbodyFontsize',
        }, {
            tip: '@:{lang#props.week.start}',
            key: 'weekStart',
            json: 1,
            type: Enum['@:{enum#prop.collection}'],
            items: [{
                text: '星期日',
                value: 0
            }, {
                text: '星期一',
                value: 1
            }, {
                text: '星期二',
                value: 2
            }, {
                text: '星期三',
                value: 3
            }, {
                text: '星期四',
                value: 4
            }, {
                text: '星期五',
                value: 5
            }, {
                text: '星期六',
                value: 6
            }]
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});