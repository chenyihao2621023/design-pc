/*
    author:https://github.com/xinglie
*/
import Enum from '../../designer/enum';
import DesignerProvider from '../../provider/designer';
import Designer from '../designer';
import TextDesigner from '../text/designer';
import QRCodeProvider from '../../provider/qrcode';
import Magix from 'magix5';
let { toMap, } = Magix;
let shortFormatter = [{
    text: 'YYYY-MM-DD',
    value: 'YYYY-MM-DD'
}, {
    text: 'YYYY-MM-DD HH:mm:ss',
    value: 'YYYY-MM-DD HH:mm:ss'
}, {
    text: 'MM/DD ddd',
    value: 'MM/DD ddd'
}, {
    text: 'MM/DD HH:mm',
    value: 'MM/DD HH:mm'
}, {
    text: 'HH:mm A',
    value: 'HH:mm A'
}, {
    text: 'HH:mm',
    value: 'HH:mm'
}, {
    text: 'HH:mm:ss',
    value: 'HH:mm:ss'
}];
let textIfShow = ({ type }) => type == 'text';
let qrcodeIfShow = ({ type }) => type == 'qrcode';
let shortFormatterMap = toMap(shortFormatter, 'value');
let textProps = [];
for (let e of TextDesigner['@:{shared.props}']) {
    textProps.push({
        ...e,
        '@:{if.show}': textIfShow
    });
}
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./dshow'
        });
    }
}).static({
    type: 'datetime',
    title: '@:{lang#elements.datetime}',
    icon: '&#xe6a6;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        let shared = TextDesigner['@:{get.shared.props}'](x, y, 200, 25);
        return {
            ...shared,
            qrcodeColorDark: '#000000',
            qrcodeColorLight: '#ffffff',
            qrcodeCorrectLevel: 'H',
            lang: 'zh',
            text: 'YYYY-MM-DD HH:mm:ss',
            type: 'text',
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
        tip: '@:{lang#lang.choose}',
        key: 'lang',
        type: Enum['@:{enum#prop.collection}'],
        json: 1,
        items() {
            return [{
                text: '@:{lang#lang.zh}',
                value: 'zh'
            }, {
                text: '@:{lang#lang.en}',
                value: 'en'
            }];
        }
    }, {
        tip: '@:{lang#props.format.short}',
        key: 'text',
        type: Enum['@:{enum#prop.collection}'],
        json: 1,
        items({ text }) {
            if (!shortFormatterMap[text]) {
                return [{
                    text: '@:{lang#custom}',
                    value: text
                }, ...shortFormatter];
            }
            return shortFormatter;
        }
    }, {
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
            text: '@:{lang#elements.qrcode}',
            value: 'qrcode'
        }]
    },
    DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.richtext}', 'richText'),
    DesignerProvider['@:{designer#shared.props.spliter}'], {
        ...DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.auto.height}', 'autoHeight'),
        '@:{if.show}': textIfShow
    },
    ...textProps, {
        ...DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.qrcode.color.dark}', 'qrcodeColorDark'),
        '@:{if.show}': qrcodeIfShow,
    }, {
        ...DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.qrcode.color.light}', 'qrcodeColorLight'),
        '@:{if.show}': qrcodeIfShow,
    }, {
        tip: '@:{lang#props.qrcode.correct.level}',
        type: Enum['@:{enum#prop.collection}'],
        json: 1,
        key: 'qrcodeCorrectLevel',
        items: QRCodeProvider['@:{correct.levels}'],
        '@:{if.show}': qrcodeIfShow,
    },
    DesignerProvider['@:{designer#shared.props.spliter}'],
    DesignerProvider['@:{designer#shared.props.ename}'],
    DesignerProvider['@:{designer#shared.props.locked}']],
});