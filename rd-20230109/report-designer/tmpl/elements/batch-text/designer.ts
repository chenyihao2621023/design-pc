/*
    author:https://github.com/xinglie
*/
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import DesignerProvider from '../../provider/designer';
import Designer from '../designer';
import TextDesigner from '../text/designer';
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:../text/dshow'
        });
    }
}).static({
    type: 'batch-text',
    title: '@:{lang#elements.batch.text}',
    icon: '&#xe61d;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'] |
        Enum['@:{enum#modifier.nomask}'],
    '@:{allowed.to.hod}': {//只允许放设计区
        root: 1
    },
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        let shared = TextDesigner['@:{get.shared.props}'](x, y, 200, 25);
        return {
            ...shared,
            hspace: Const['@:{const#to.unit}'](30),
            vspace: Const['@:{const#to.unit}'](30),
            locked: false,
            format: '',
            bind: {},
            help: 'github.com/xinglie/report-designer/issues/31',
        };
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.width}'](),
        DesignerProvider['@:{designer#shared.props.height}'](),
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.rotate}'],
        DesignerProvider['@:{designer#shared.props.bind.spliter}'],
        DesignerProvider['@:{designer#shared.props.bind}'](), {
            tip: '@:{lang#props.format}',
            key: 'format',
            type: Enum["@:{enum#prop.format}"],
            json: 1,
            '@:{if.show}'({ bind }) {
                return bind.id;
            }
        },
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.richtext}', 'richText'),
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.auto.height}', 'autoHeight'),
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.h.space}',
            key: 'hspace',
            min: 0,
            max: () => Const['@:{const#to.unit}'](100)
        }, {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.v.space}',
            key: 'vspace',
            min: 0,
            max: () => Const['@:{const#to.unit}'](100)
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        ...TextDesigner['@:{shared.props}'],
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.help}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}']]
});