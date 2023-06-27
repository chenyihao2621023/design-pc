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
    type: 'clock',
    title: '@:{lang#elements.clock}',
    icon: '&#xe691;',
    '@:{modifier}': Enum['@:{enum#modifier.size}'] |
        Enum['@:{enum#modifier.sync.size}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            alpha: 1,
            width: Const['@:{const#to.unit}'](150),
            height: Const['@:{const#to.unit}'](150),
            dialColor: '#00000040',
            handleColor: '#fff',
            markColor: '#ffffff80',
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            locked: false,
            animations: []
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.width}'](100, 400),
        DesignerProvider['@:{designer#shared.props.height}'](100, 400),
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.clock.dial.color}', 'dialColor', 1),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.clock.handle.color}', 'handleColor', 1),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.clock.mark.color}', 'markColor', 1),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});