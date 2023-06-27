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
    type: 'svg/speaker',
    title: '@:{lang#elements.speaker}',
    icon: '&#xe6db;',
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
            rotate: 0,
            alpha: 1,
            muted: false,
            volume: 1,
            bind: {},
            mutedcolor: '#E8405B',
            fill: '#2c2c2c',
            vcolor: '#2c2c2c',
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
        DesignerProvider['@:{designer#shared.props.bind.roost}']('@:{lang#props.muted}', '@:{lang#props.volume}'),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.muted}', 'muted'), {
            tip: '@:{lang#props.volume}',
            key: 'volume',
            type: Enum['@:{enum#prop.number}'],
            min: 0,
            max: 3,
            json: 1
        },
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.fill.color}', 'fill'),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.speaker.volume.color}', 'vcolor'),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.background}', 'background'),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.muted.color}', 'mutedcolor'),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});