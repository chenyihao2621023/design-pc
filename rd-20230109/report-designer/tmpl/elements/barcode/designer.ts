/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import BarcodeProvider from '../../provider/barcode';
import DesignerProvider from '../../provider/designer';
import Designer from '../designer';
let { config } = Magix;
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./dshow'
        });
    }
}).static({
    type: 'barcode',//元素类型，程序识别使用，需要与文件夹同名
    title: '@:{lang#elements.barcode}',//元素显示的名称
    icon: '&#xe6c8;',//使用的icon
    //元素在设计器里，支持哪些修改操作。特指在设计区中能快捷修改的，非属性面板中的修改。
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |//允许修改宽
        Enum['@:{enum#modifier.height}'] |//允许修改高
        Enum['@:{enum#modifier.rotate}'] |//允许旋转
        Enum['@:{enum#modifier.nomask}'],//是否使用一个di˝v盖在上面，默认使用一个div盖在元素上，主要是防止可设计元素内部的事件与设计器中的事件冲突
    //哪些属性参与移动，大部分元素只有x y参与移动，但对于svg元素，会有多个点参与移动
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    //'@:{allowed.total.count}':3,
    //获取元素默认的属性
    '@:{get.props}'(x, y) {
        return {
            height: Const['@:{const#to.unit}'](80),
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            width: Const['@:{const#to.unit}'](200),
            text: '',
            linewidth: Const['@:{const#to.unit}'](2),
            color: '#000',
            format: 'code128',
            showText: true,
            styleBold: false,
            styleItalic: false,
            textPosition: 'bottom',
            textAlign: 'center',
            textMargin: Const['@:{const#to.unit}'](2),
            fontsize: Const['@:{const#to.unit}'](20),
            font: 'tahoma',
            print: 'each',
            render: 'img',
            fill: 'full',
            ow: 'github.com/lindell/JsBarcode',
            help: 'github.com/xinglie/report-designer/issues/31',
            animations: [],
            locked: false,
            bind: {},
        }
    },
    //属性面板中的控制列表
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.width}'](20),
        DesignerProvider['@:{designer#shared.props.height}'](20),
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.rotate}'],
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.print.options}'],
        DesignerProvider['@:{designer#shared.props.bind.spliter}'], {
            tip: '@:{lang#props.text.content}',
            key: 'text',
            type: Enum["@:{enum#prop.text.area}"],
            json: 1,
            '@:{if.show}'({ bind }) {
                return !bind.id;
            }
        }, {
            type: Enum["@:{enum#prop.spliter}"],
            '@:{if.show}'({ text }) {
                return !text && config('getFieldUrl');
            }
        }, {
            tip: '@:{lang#props.bind.fields}',
            key: 'bind',
            type: Enum["@:{enum#prop.bind.field}"],
            json: 1,
            max: 1,
            '@:{if.show}'({ text }) {
                return !text && config('getFieldUrl');
            }
        },
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            tip: '@:{lang#props.barcode.format}',
            key: 'format',
            type: Enum["@:{enum#prop.collection}"],
            items: BarcodeProvider["@:{types}"],
            json: 1
        }, {
            tip: '@:{lang#props.render}',
            key: 'render',
            type: Enum['@:{enum#prop.collection}'],
            json: 1,
            items: BarcodeProvider['@:{render.types}']
        }, {
            tip: '@:{lang#props.fill.style}',
            key: 'fill',
            type: Enum['@:{enum#prop.collection}'],
            json: 1,
            items: BarcodeProvider['@:{fill.types}'],
            '@:{if.show}'({ render }) {
                return render == 'img';
            }
        },
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.show.text}', 'showText'),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.line.color}', 'color'),
        DesignerProvider['@:{designer#shared.props.fontfamily}']('font'),
        DesignerProvider['@:{designer#shared.props.fontsize}'](8, 100), {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.line.width}',
            key: 'linewidth',
            min: () => Const['@:{const#to.unit}'](1),
            max: () => Const['@:{const#to.unit}'](8),
        }, {
            tip: '@:{lang#props.text.position}',
            key: 'textPosition',
            type: Enum['@:{enum#prop.collection}'],
            json: 1,
            items: BarcodeProvider['@:{text.positions}']
        }, {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.text.margin}',
            key: 'textMargin',
            min: () => Const['@:{const#to.unit}'](-20),
            max: () => Const['@:{const#to.unit}'](20),
        }, {
            tip: '@:{lang#props.font.style}',
            type: Enum["@:{enum#prop.font.style}"],
            ref: '@:{batches#style}',
            keys: ['styleBold', 'styleItalic'],
            json: 1,
            shows: BarcodeProvider['@:{text.style}']
        }, {
            tip: '@:{lang#props.text.align}',
            key: 'textAlign',
            type: Enum['@:{enum#prop.font.align}'],
            json: 1,
        }, DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ow}'],
        DesignerProvider['@:{designer#shared.props.help}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']],
    batches: ['width', 'height', 'alpha', 'rotate', '-', 'print', '-', 'format', 'render', 'fill', 'showText', 'color', 'linewidth', 'font', '@:{batches#style}', 'textPosition', 'textAlign', 'textMargin']
});