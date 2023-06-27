/*
    author:https://github.com/xinglie
*/
import Enum from '../../designer/enum';
import BWIP from '../../provider/bwip';
import DesignerProvider from '../../provider/designer';
import QRCodeProvider from '../../provider/qrcode';
import Designer from '../designer';
import TextDesigner from '../text/designer';

let textIfShow = ({ type }) => type == 'text';
let qrcodeIfShow = ({ type }) => type == 'qrcode';
let bwipIfShow = ({ type }) => type == 'bwip';
let bwipTextIfShow = ({ type, bwipFormat }) => type == 'bwip' && !BWIP['@:{no.text.options}'][bwipFormat];
let textProps = [{
    type: Enum['@:{enum#prop.boolean}'],
    key: 'richText',
    tip: '@:{lang#props.richtext}',
    json: 1,
    '@:{if.show}': textIfShow
}, {
    type: Enum['@:{enum#prop.boolean}'],
    key: 'autoHeight',
    tip: '@:{lang#props.auto.height}',
    json: 1,
    '@:{if.show}': textIfShow
}];
for (let e of TextDesigner['@:{shared.props}']) {
    textProps.push({
        ...e,
        '@:{if.show}': textIfShow
    });
}

let qrcodeProps = [{
    tip: '@:{lang#props.qrcode.color.dark}',
    key: 'qrcodeColorDark',
    json: 1,
    type: Enum['@:{enum#prop.color}'],
    '@:{if.show}': qrcodeIfShow,
}, {
    tip: '@:{lang#props.qrcode.color.light}',
    key: 'qrcodeColorLight',
    json: 1,
    type: Enum['@:{enum#prop.color}'],
    '@:{if.show}': qrcodeIfShow,
}, {
    tip: '@:{lang#props.qrcode.correct.level}',
    type: Enum['@:{enum#prop.collection}'],
    json: 1,
    key: 'qrcodeCorrectLevel',
    items: QRCodeProvider['@:{correct.levels}'],
    '@:{if.show}': qrcodeIfShow,
}];

let bwipProps = [{
    tip: '@:{lang#props.barcode.format}',
    type: Enum['@:{enum#prop.collection}'],
    json: 1,
    items: BWIP['@:{types}'],
    key: 'bwipFormat',
    write(value, props, changed, { item }) {
        props.bwipValue = item.fill || 'rd designer';
    },
    '@:{if.show}': bwipIfShow,
}, {
    tip: '@:{lang#props.preview.value}',
    key: 'bwipValue',
    type: Enum['@:{enum#prop.text.area}'],
    json: 1,
    '@:{if.show}': bwipIfShow,
}, {
    tip: '@:{lang#props.check}',
    key: 'bwipIncludecheck',
    type: Enum['@:{enum#prop.boolean}'],
    json: 1,
    '@:{if.show}': bwipIfShow,
}, {
    tip: '@:{lang#props.code.color}',
    clear: 1,
    type: Enum['@:{enum#prop.color}'],
    json: 1,
    key: 'bwipBarcolor',
    '@:{if.show}': bwipIfShow,
}, {
    tip: '@:{lang#props.background}',
    clear: 1,
    type: Enum['@:{enum#prop.color}'],
    json: 1,
    key: 'bwipBackgroundcolor',
    '@:{if.show}': bwipIfShow,
}, {
    tip: '@:{lang#props.line.spread}',
    key: 'bwipInkspread',
    json: 1,
    type: Enum['@:{enum#prop.number}'],
    step: 0.1,
    fixed: 2,
    min: 0,
    max: 10,
    '@:{if.show}': bwipIfShow,
}, {
    tip: '@:{lang#props.show.text}',
    key: 'bwipIncludetext',
    json: 1,
    type: Enum['@:{enum#prop.boolean}'],
    '@:{if.show}': bwipTextIfShow
}, {
    tip: '@:{lang#props.check.text}',
    key: 'bwipIncludecheckintext',
    json: 1,
    type: Enum['@:{enum#prop.boolean}'],
    '@:{if.show}': bwipTextIfShow
}, {
    tip: '@:{lang#props.forecolor}',
    key: 'bwipTextcolor',
    json: 1,
    type: Enum['@:{enum#prop.color}'],
    clear: 1,
    '@:{if.show}': bwipTextIfShow
}, {
    tip: '@:{lang#props.font.size}',
    key: 'bwipTextsize',
    json: 1,
    min: 1,
    type: Enum['@:{enum#prop.number}'],
    '@:{if.show}': bwipTextIfShow
}, {
    tip: '@:{lang#props.text.x.align}',
    key: 'bwipTextxalign',
    json: 1,
    type: Enum['@:{enum#prop.collection}'],
    items: [{
        text: '@:{lang#props.text.left}',
        value: 'left'
    }, {
        text: '@:{lang#props.text.center}',
        value: 'center'
    }, {
        text: '@:{lang#props.text.right}',
        value: 'right'
    }, {
        text: '@:{lang#props.text.justify}',
        value: 'justify'
    }],
    '@:{if.show}': bwipTextIfShow
}, {
    tip: '@:{lang#props.text.y.align}',
    key: 'bwipTextyalign',
    json: 1,
    type: Enum['@:{enum#prop.collection}'],
    items: [{
        text: '@:{lang#props.text.above}',
        value: 'above'
    }, {
        text: '@:{lang#props.text.below}',
        value: 'below'
    }],
    '@:{if.show}': bwipTextIfShow
}, {
    tip: '@:{lang#props.text.gap}',
    key: 'bwipTextgaps',
    json: 1,
    // fixed: 1,
    // step: 0.1,
    type: Enum['@:{enum#prop.number}'],
    //min: 0,
    '@:{if.show}': bwipTextIfShow
}, {
    tip: '@:{lang#props.text.offset}',
    key: 'bwipTextyoffset',
    json: 1,
    type: Enum['@:{enum#prop.number}'],
    //min: 0,
    fixed: 1,
    step: 0.1,
    '@:{if.show}': bwipTextIfShow
}, {
    tip: '@:{lang#props.url.params}',
    type: Enum['@:{enum#prop.text.area}'],
    json: 1,
    key: 'bwipParams',
    '@:{if.show}': bwipIfShow
}];
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./dshow'
        });
    }
}).static({
    type: 'number',
    title: '@:{lang#elements.number}',
    icon: '&#xe605;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        let shared = TextDesigner['@:{get.shared.props}'](x, y, 200, 25);
        let first = BWIP['@:{types}'][0];
        return {
            ...shared,
            text: '{#}',
            hpos: 'center',
            vpos: 'center',
            type: 'text',

            qrcodeColorDark: '#000000',
            qrcodeColorLight: '#ffffff',
            qrcodeCorrectLevel: 'H',

            bwipFormat: first.value,
            bwipValue: first.fill,
            bwipParams: '',
            bwipIncludecheckintext: false,
            bwipIncludecheck: false,
            bwipBarcolor: '',
            bwipBackgroundcolor: '',
            bwipInkspread: 0,
            bwipIncludetext: true,
            bwipTextcolor: '',
            bwipTextsize: 10,
            bwipTextxalign: 'left',
            bwipTextyalign: 'above',
            bwipTextgaps: 0,
            bwipTextyoffset: 0,

            ext: {
                type: 'number',//类型
                pad: false,//数字类型展示是否填充0
                fx: 'AP',//计算公式
                step: 1,//步长或公差公比等
                start: 1,//起始值
                reverse: false,//是否倒序
            },
            help: '//github.com/xinglie/report-designer/issues/59',
            locked: false
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
    DesignerProvider['@:{designer#shared.props.spliter}'], {
        type: Enum['@:{enum#prop.number.rule}'],
        key: 'ext',
        json: 1
    },
    DesignerProvider['@:{designer#shared.props.spliter}'], {
        tip: '@:{lang#props.format}',
        type: Enum['@:{enum#prop.text.area}'],
        key: 'text',
        json: 1
    }, {
        tip: '@:{lang#props.render.as}',
        type: Enum['@:{enum#prop.collection}'],
        key: 'type',
        json: 1,
        items: [{
            text: '@:{lang#elements.text}',
            value: 'text'
        }, {
            text: '@:{lang#elements.bwip}',
            value: 'bwip'
        }, {
            text: '@:{lang#elements.qrcode}',
            value: 'qrcode'
        }]
    },
    DesignerProvider['@:{designer#shared.props.spliter}'],
    ...textProps,
    ...qrcodeProps,
    ...bwipProps,
    DesignerProvider['@:{designer#shared.props.spliter}'],
    DesignerProvider['@:{designer#shared.props.help}'],
    DesignerProvider['@:{designer#shared.props.ename}'],
    DesignerProvider['@:{designer#shared.props.locked}']],
});