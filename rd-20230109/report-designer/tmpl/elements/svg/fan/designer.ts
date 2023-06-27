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
    type: 'svg/fan',
    title: '@:{lang#elements.fan}',
    icon: '&#xe666;',
    '@:{modifier}': Enum['@:{enum#modifier.size}'] |
        Enum['@:{enum#modifier.sync.size}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            width: Const['@:{const#to.unit}'](80),
            height: Const['@:{const#to.unit}'](80),
            alpha: 1,
            fill: GenericProvider['@:{generic#get.brand.color}'](),
            speed: 5,
            reverse: false,
            bind: {},
            working: false,
            animations: [],
            locked: false
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.width}'](20),
        DesignerProvider['@:{designer#shared.props.height}'](20),
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.data.source.spliter}'],
        DesignerProvider['@:{designer#shared.props.bind.roost}']('@:{lang#props.rotating}', '@:{lang#props.speed}'),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.fill.color}', 'fill', 1),
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.rotating}', 'working'),
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.reverse.rotating}', 'reverse'), {
            tip: '@:{lang#props.speed}',
            type: Enum['@:{enum#prop.number}'],
            key: 'speed',
            json: 1,
            min: 1,
            max: 10,
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});