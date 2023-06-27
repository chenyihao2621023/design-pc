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
            view: '@:./dshow'
        });
    }
}).static({
    type: 'todo',
    title: 'Todo',
    icon: '&#xe66f;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.icon}'] |
        Enum['@:{enum#modifier.nomask}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            alpha: 1,
            width: Const['@:{const#to.unit}'](300),
            height: Const['@:{const#to.unit}'](77),
            todos: [],
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            locked: false,
            animations: []
        }
    },
    props: [{
        key: 'todos',
        json: 1
    },
    DesignerProvider['@:{designer#shared.props.x}'],
    DesignerProvider['@:{designer#shared.props.y}'],
    DesignerProvider['@:{designer#shared.props.width}'](200),
    DesignerProvider['@:{designer#shared.props.scale.label.height}'],
    DesignerProvider['@:{designer#shared.props.alpha}'],
    DesignerProvider['@:{designer#shared.props.spliter}'],
    DesignerProvider['@:{designer#shared.props.ename}'],
    DesignerProvider['@:{designer#shared.props.locked}'],
    DesignerProvider['@:{designer#shared.props.animations}']]
});