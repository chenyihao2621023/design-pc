/*
    author:https://github.com/xinglie
*/
import Const from '../../../designer/const';
import Enum from '../../../designer/enum';
import DesignerProvider from '../../../provider/designer';
import Designer from '../../designer';
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./index'
        });
    }
}).static({
    type: 'svg/battery',
    title: '@:{lang#elements.battery}',
    icon: '&#xe66b;',
    '@:{modifier}': Enum['@:{enum#modifier.size}'] |
        Enum['@:{enum#modifier.sync.size}'] |
        Enum['@:{enum#modifier.rotate}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            width: Const['@:{const#to.unit}'](150),
            height: Const['@:{const#to.unit}'](150),
            outline: '#000',
            charging: true,
            fill: '#000',
            lightning: '#fff',
            power: 30,
            rotate: 0,
            alpha: 1,
            bind: {},
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
        DesignerProvider['@:{designer#shared.props.rotate}'],
        DesignerProvider['@:{designer#shared.props.data.source.spliter}'],
        DesignerProvider['@:{designer#shared.props.bind.roost}']('@:{lang#props.battery.power}', '@:{lang#props.battery.charging}'),
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            tip: '@:{lang#props.battery.power}',
            type: Enum['@:{enum#prop.number}'],
            key: 'power',
            min: 0,
            max: 100,
            json: 1
        },
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.battery.charging}', 'charging'),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.battery.outline.color}', 'outline'),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.battery.fill.color}', 'fill'),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.battery.lightning.color}', 'lightning'),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});