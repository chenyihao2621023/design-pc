/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../../designer/const';
import Enum from '../../../designer/enum';
import DesignerProvider from '../../../provider/designer';
import GenericProvider from '../../../provider/generic';
import Designer from '../../designer';
let { config } = Magix;
//当数据绑定与x轴绑定的数据源不一致时自动清空另外一个
let resetOtherBindInfo = (current, check) => {
    if (check.id &&
        current.id &&
        current.id != check.id) {
        check.id = '';
        check.tag = '';
        check.fields.length = 0;
    }
};
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./index'
        });
    }
}).static({
    type: 'chart/line',
    title: '@:{lang#elements.chart-line}',
    icon: '&#xeb98;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.bind.info}'(props) {
        let { bind, xBind } = props;
        let fields = [];
        if (bind.fields) {
            fields.push(...bind.fields);
        }
        if (bind.id == xBind.id &&
            xBind.fields) {
            fields.push(...xBind.fields);
        }
        return {
            id: bind.id,
            fields
        };
    },
    '@:{get.props}'(x, y) {
        return {
            background: '',
            alpha: 1,
            width: Const['@:{const#to.unit}'](500),
            height: Const['@:{const#to.unit}'](300),
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            title: '',
            titleAlign: 'left',
            rotate: 0,
            animations: [],
            bind: {},
            xBind: {},
            ow: 'echarts.apache.org',
            locked: false,
            colors: [GenericProvider['@:{generic#get.brand.color}']()]
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.width}'](),
        DesignerProvider['@:{designer#shared.props.height}'](),
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.rotate}'],
        DesignerProvider['@:{designer#shared.props.data.source.spliter}'], {
            tip: '@:{lang#props.bind.y.fields}',
            key: 'bind',
            type: Enum["@:{enum#prop.bind.field}"],
            json: 1,
            '@:{if.show}'() {
                return config('getFieldUrl');
            },
            write(v, { xBind }) {
                resetOtherBindInfo(v, xBind);
            }
        }, {
            tip: '@:{lang#props.bind.x.fields}',
            key: 'xBind',
            type: Enum["@:{enum#prop.bind.field}"],
            json: 1,
            max: 1,
            '@:{if.show}'() {
                return config('getFieldUrl');
            },
            write(v, { bind }) {
                resetOtherBindInfo(v, bind);
            }
        },
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            tip: '@:{lang#props.chart.title}',
            key: 'title',
            type: Enum["@:{enum#prop.text.input}"],
            json: 1
        }, {
            tip: '@:{lang#props.title.align}',
            key: 'titleAlign',
            type: Enum['@:{enum#prop.font.align}'],
            json: 1
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.background}', 'background', 1, 1), {
            tip: '@:{lang#props.color.series}',
            key: 'colors',
            type: Enum['@:{enum#prop.color.series}'],
            json: 1,
            multi: 1,
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ow}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});