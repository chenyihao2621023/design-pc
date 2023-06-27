/*
    author:https://github.com/xinglie
*/
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import DesignerProvider from '../../provider/designer';
import GenericProvider from '../../provider/generic';
import Designer from '../designer';
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./dshow'
        });
    }
}).static({
    type: 'heat',
    title: '@:{lang#elements.heat}',
    icon: '&#xe613;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'] |
        Enum['@:{enum#modifier.nomask}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            height: Const['@:{const#to.unit}'](30),
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            width: Const['@:{const#to.unit}'](120),
            locked: false,
            bars: 10,
            barWidth: Const['@:{const#to.unit}'](8),
            background: '#ececec',
            fillcolor: GenericProvider['@:{generic#get.brand.color}'](),
            value: 50,
            starSize: Const['@:{const#to.unit}'](24),
            bind: {},
            animations: []
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.width}'](20),
        DesignerProvider['@:{designer#shared.props.height}'](20),
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.rotate}'],
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            tip: '@:{lang#props.preset.value}',
            key: 'value',
            type: Enum['@:{enum#prop.number}'],
            min: 0,
            max: 100,
            json: 1,
            fixed: 1,
        },
        DesignerProvider['@:{designer#shared.props.bind.roost}']('@:{lang#props.preset.value}'),
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            tip: '@:{lang#props.bar.number}',
            key: 'bars',
            type: Enum['@:{enum#prop.number}'],
            min: 2,
            max: 30,
            json: 1
        }, {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.bar.width}',
            key: 'barWidth',
            min: () => Const['@:{const#to.unit}'](2),
        },
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.background}', 'background'),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.highlight.color}', 'fillcolor'),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});