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
    type: 'lscreen/image',
    title: '@:{lang#elements.ls-image}',
    icon: '&#xe6e9;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            height: Const['@:{const#to.unit}'](100),
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            animations: [],
            rotateX: false,
            rotateY: false,
            width: Const['@:{const#to.unit}'](200),
            image: '',
            locked: false,
        }
    },
    props: [{
        key: 'image',
        json: 1
    },
    DesignerProvider['@:{designer#shared.props.x}'],
    DesignerProvider['@:{designer#shared.props.y}'],
    DesignerProvider['@:{designer#shared.props.width}'](),
    DesignerProvider['@:{designer#shared.props.height}'](),
    DesignerProvider['@:{designer#shared.props.alpha}'],
    DesignerProvider['@:{designer#shared.props.rotate}'],
    DesignerProvider['@:{designer#shared.props.spliter}'],
    DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.rotate.x}', 'rotateX'),
    DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.rotate.y}', 'rotateY'),
    DesignerProvider['@:{designer#shared.props.spliter}'],
    DesignerProvider['@:{designer#shared.props.ename}'],
    DesignerProvider['@:{designer#shared.props.locked}'],
    DesignerProvider['@:{designer#shared.props.animations}']]
});