/*
    author:https://github.com/xinglie
*/
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import DesignerProvider from '../../provider/designer';
import Hollow from '../designer';
export default Hollow.extend({
    ctor() {
        this.set({
            view: '@:./dshow'
        });
    }
}).static({
    type: 'richtext',
    title: '@:{lang#elements.richtext}',
    icon: '&#xe663;',
    '@:{allowed.to.hod}': {
        root: 1
    },
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.nomask}'] |
        Enum['@:{enum#modifier.icon}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            text: '欢迎使用通用设计器',
            alpha: 1,
            splitToPages: true,
            width: Const['@:{const#to.unit}'](680),
            height: Const['@:{const#to.unit}'](300),
            ow: 'ckeditor.com',
            help: '//github.com/xinglie/report-designer/issues/50',
            animations: [],
            locked: false
        };
    },
    props: [{
        key: 'text',
        json: 1
    },
    DesignerProvider['@:{designer#shared.props.x}'],
    DesignerProvider['@:{designer#shared.props.y}'],
    DesignerProvider['@:{designer#shared.props.width}'](200),
    DesignerProvider['@:{designer#shared.props.height}'](100),
    DesignerProvider['@:{designer#shared.props.alpha}'],
    DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.split.to.pages}', 'splitToPages'),
    DesignerProvider['@:{designer#shared.props.spliter}'],
    DesignerProvider['@:{designer#shared.props.ow}'],
    DesignerProvider['@:{designer#shared.props.help}'],
    DesignerProvider['@:{designer#shared.props.ename}'],
    DesignerProvider['@:{designer#shared.props.locked}'],
    DesignerProvider['@:{designer#shared.props.animations}']]
});