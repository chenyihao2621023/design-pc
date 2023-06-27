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
    type: 'xsheet',
    title: '@:{lang#elements.xsheet}',
    icon: '&#xe600;',
    '@:{allowed.total.count}': 1,//总共允许多少个
    '@:{allowed.to.hod}': { //当前元素允许添加到的容器元素
        root: 1,//编辑区
    },
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'] |
        Enum['@:{enum#modifier.nomask}'] |
        Enum['@:{enum#modifier.icon}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            height: Const['@:{const#to.unit}'](400),
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            sheetData: null,
            //rotate: 0,
            width: Const['@:{const#to.unit}'](500),
            locked: false,
            ow: 'github.com/mengshukeji/Luckysheet',
            animations: []
        }
    },
    props: [{
        key: 'sheetData',
        json: 1
    },
    DesignerProvider['@:{designer#shared.props.x}'],
    DesignerProvider['@:{designer#shared.props.y}'],
    DesignerProvider['@:{designer#shared.props.width}'](500),
    DesignerProvider['@:{designer#shared.props.height}'](400),
    DesignerProvider['@:{designer#shared.props.alpha}'],
    DesignerProvider['@:{designer#shared.props.spliter}'],
    DesignerProvider['@:{designer#shared.props.ow}'],
    DesignerProvider['@:{designer#shared.props.ename}'],
    DesignerProvider['@:{designer#shared.props.locked}'],
    DesignerProvider['@:{designer#shared.props.animations}']]
});