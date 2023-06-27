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
    type: 'data-richtext',
    title: '@:{lang#elements.richtext}',
    icon: '&#xe642;',
    '@:{allowed.to.hod}': {
        root: 1
    },
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.nomask}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            background: '',
            height: Const['@:{const#to.unit}'](30),
            alpha: 1,
            text: '',
            tfs: Const['@:{const#to.unit}'](14),
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            width: Const['@:{const#to.unit}'](300),
            help: '//github.com/xinglie/report-designer/issues/50',
            bind: {},
            animations: []
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.tfs}'], {
            key: 'height',
            '@:{is.scale.and.unit.field}': 1,
        },
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.width}'](),
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.bind}'](),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.help}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});