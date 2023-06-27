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
    type: 'svg/signal',
    title: '@:{lang#elements.signal}',
    icon: '&#xe614;',
    '@:{modifier}': Enum['@:{enum#modifier.size}'] |
        Enum['@:{enum#modifier.sync.size}'] |
        Enum['@:{enum#modifier.rotate}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            width: Const['@:{const#to.unit}'](190),
            height: Const['@:{const#to.unit}'](150),
            rotate: 0,
            alpha: 1,
            connected: true,
            strength: 2,
            bind: {},
            disconnect: '#E8405B',
            fill: '#2c2c2c',
            background: '#dbdbdb',
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
        DesignerProvider['@:{designer#shared.props.bind.roost}']('@:{lang#props.wifi.connected}', '@:{lang#props.signal.strength}'),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.wifi.connected}', 'connected'), {
            tip: '@:{lang#props.signal.strength}',
            key: 'strength',
            type: Enum['@:{enum#prop.number}'],
            min: 0,
            max: 5,
            json: 1
        },
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.fill.color}', 'fill'),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.background}', 'background'),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.disconnect.color}', 'disconnect'),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});