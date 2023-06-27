/*
    author:https://github.com/xinglie
*/
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import BarcodeProvider from '../../provider/barcode';
import DesignerProvider from '../../provider/designer';
import Designer from '../designer';
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:../barcode/dshow'
        });
    }
}).static({
    type: 'batch-barcode',//元素类型，程序识别使用，需要与文件夹同名
    title: '@:{lang#elements.batch.barcode}',//元素显示的名称
    icon: '&#xe6c8;',//使用的icon
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'] |
        Enum['@:{enum#modifier.nomask}'],
    '@:{allowed.to.hod}': {//只允许放设计区
        root: 1
    },
    //哪些属性参与移动，大部分元素只有x y参与移动，但对于svg元素，会有多个点参与移动
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    //获取元素默认的属性
    '@:{get.props}'(x, y) {
        return {
            height: Const['@:{const#to.unit}'](80),
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            width: Const['@:{const#to.unit}'](200),
            tfs: Const['@:{const#to.unit}'](14),
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
            render: 'img',
            fill: 'full',
            hspace: Const['@:{const#to.unit}'](10),
            vspace: Const['@:{const#to.unit}'](20),
            ow: 'github.com/lindell/JsBarcode',
            help: 'github.com/xinglie/report-designer/issues/31',
            locked: false,
            animations: [],
            bind: {},
        }
    },
    //属性面板中的控制列表
    props: [
        DesignerProvider['@:{designer#shared.props.tfs}'],
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.width}'](20),
        DesignerProvider['@:{designer#shared.props.height}'](20),
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.rotate}'],
        DesignerProvider['@:{designer#shared.props.data.source.spliter}'],
        DesignerProvider['@:{designer#shared.props.bind}'](),
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.h.space}',
            key: 'hspace',
            min: 0,
            max: () => Const['@:{const#to.unit}'](50)
        }, {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.v.space}',
            key: 'vspace',
            min: 0,
            max: () => Const['@:{const#to.unit}'](50)
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
            '@:{json.encode}'(dest, props) {
                dest.styleBold = props.styleBold;
                dest.styleItalic = props.styleItalic;
            },
            shows: BarcodeProvider['@:{text.style}']
        }, {
            tip: '@:{lang#props.text.align}',
            key: 'textAlign',
            type: Enum['@:{enum#prop.font.align}'],
            json: 1,
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ow}'],
        DesignerProvider['@:{designer#shared.props.help}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});