/*
    author:https://github.com/xinglie
*/
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
    type: 'pager',
    title: '@:{lang#elements.pager}',
    icon: '&#xe646;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'] |
        Enum['@:{enum#modifier.inputext}'] |
        Enum['@:{enum#modifier.nomask}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        let shared = TextDesigner['@:{get.shared.props}'](x, y, 200, 50);
        return {
            ...shared,
            text: '当前第${currentPage}页，共${totalPage}页',
            print: 'each',
            locked: false,
            ext: {},
        };
    },
    props: [{
        key: 'ext',
        json: 1
    },
    DesignerProvider['@:{designer#shared.props.x}'],
    DesignerProvider['@:{designer#shared.props.y}'],
    DesignerProvider['@:{designer#shared.props.width}'](),
    DesignerProvider['@:{designer#shared.props.height}'](),
    DesignerProvider['@:{designer#shared.props.alpha}'],
    DesignerProvider['@:{designer#shared.props.rotate}'],
    DesignerProvider['@:{designer#shared.props.spliter}'],
    DesignerProvider['@:{designer#shared.props.print.options}'],
    DesignerProvider['@:{designer#shared.props.spliter}'], {
        tip: '@:{lang#props.text.content}',
        key: 'text',
        type: Enum["@:{enum#prop.text.area}"],
        json: 1,
    },
    DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.richtext}', 'richText'),
    DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.auto.height}', 'autoHeight'),
    DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.only.display}', 'display'),
    DesignerProvider['@:{designer#shared.props.spliter}'],
    ...TextDesigner['@:{shared.props}'],
    DesignerProvider['@:{designer#shared.props.spliter}'],
    DesignerProvider['@:{designer#shared.props.ename}'],
    DesignerProvider['@:{designer#shared.props.locked}'],
    DesignerProvider['@:{designer#shared.props.animations}']],
    batches: ['width', 'height', 'alpha', 'rotate', '-', 'fontsize', 'fontfamily', 'letterspacing', 'lineheight', 'background', 'forecolor', '@:{batches#style}', '@:{batches#align}', '@:{batches#unicolor}', '-', 'borderwidth', 'bordercolor', 'bordertype']
});