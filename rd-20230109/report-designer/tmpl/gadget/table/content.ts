/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import BarcodeProvider from '../../provider/barcode';
import CellProvider from '../../provider/cell';
import DesignerProvider from '../../provider/designer';
import QRCodeProvider from '../../provider/qrcode';
let { View, config, dispatch, mix } = Magix;
let textIfShow = ({ type }) => type == 'text';
let imageIfShow = ({ type }) => config('getImageUrl') && type == 'image';
let barcodeIfShow = ({ type }) => type == 'barcode';
let qrcodeIfShow = ({ type }) => type == 'qrcode';
let PList = [{
    tip: '@:{lang#props.cell.content}',
    key: 'type',
    type: Enum["@:{enum#prop.collection}"],
    items: [{
        text: '@:{lang#elements.text}',
        value: 'text'
    }, {
        text: '@:{lang#elements.image}',
        value: 'image'
    }, {
        text: '@:{lang#elements.barcode}',
        value: 'barcode'
    }, {
        text: '@:{lang#elements.qrcode}',
        value: 'qrcode'
    }]
}, {
    tip: '@:{lang#props.content.align}',
    type: Enum["@:{enum#prop.align}"]
}, {
    ...DesignerProvider['@:{designer#shared.props.partial.number}'],
    tip: '@:{lang#props.paddint.top}',
    key: 'paddingTop',
    min: 0,
    max: () => Const["@:{const#to.unit}"](100)
}, {
    ...DesignerProvider['@:{designer#shared.props.partial.number}'],
    tip: '@:{lang#props.paddint.right}',
    key: 'paddingRight',
    min: 0,
    max: () => Const["@:{const#to.unit}"](100)
}, {
    ...DesignerProvider['@:{designer#shared.props.partial.number}'],
    tip: '@:{lang#props.paddint.bottom}',
    key: 'paddingBottom',
    min: 0,
    max: () => Const["@:{const#to.unit}"](100)
}, {
    ...DesignerProvider['@:{designer#shared.props.partial.number}'],
    tip: '@:{lang#props.paddint.left}',
    key: 'paddingLeft',
    min: 0,
    max: () => Const["@:{const#to.unit}"](100)
}, {
    tip: '@:{lang#props.alpha}',
    key: 'alpha',
    type: Enum["@:{enum#prop.number}"],
    step: 0.01,
    fixed: 2,
    min: 0,
    max: 1
}, DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.cell.background}', 'background', 0, 1), {
    tip: '@:{lang#props.text}',
    type: Enum['@:{enum#prop.text.area}'],
    key: 'textContent',
    '@:{if.show}'({ type, bindKey }) {
        return type == 'text' && !bindKey;
    }
}, {
    tip: '@:{lang#props.richtext}',
    type: Enum['@:{enum#prop.boolean}'],
    key: 'textRichText',
    '@:{if.show}': textIfShow
}, {
    tip: '@:{lang#props.auto.height}',
    type: Enum['@:{enum#prop.boolean}'],
    key: 'textAutoHeight',
    '@:{if.show}': textIfShow
}, {
    tip: '@:{lang#props.format}',
    type: Enum["@:{enum#prop.format}"],
    key: 'textFormat',
    '@:{if.show}'({ type, bindKey }) {
        return type == 'text' && bindKey;
    }
}, {
    ...DesignerProvider['@:{designer#shared.props.partial.number}'],
    tip: '@:{lang#props.font.size}',
    key: 'textFontsize',
    min: 0,
    '@:{if.show}': textIfShow
}, {
    tip: '@:{lang#props.font.family}',
    key: 'textFontfamily',
    type: Enum["@:{enum#prop.collection}"],
    items: Const["@:{const#font.family}"],
    '@:{if.show}': textIfShow
}, {
    ...DesignerProvider['@:{designer#shared.props.partial.number}'],
    tip: '@:{lang#props.letter.spacing}',
    key: 'textLetterspacing',
    min: 0,
    '@:{if.show}': textIfShow
}, {
    tip: '@:{lang#props.forecolor}',
    key: 'textForecolor',
    type: Enum["@:{enum#prop.color}"],
    '@:{if.show}': textIfShow
}, {
    tip: '@:{lang#props.font.style}',
    type: Enum["@:{enum#prop.font.style}"],
    prefix: 'textStyle',
    '@:{if.show}': textIfShow
}, {
    tip: '@:{lang#props.image}',
    type: Enum["@:{enum#prop.image}"],
    key: 'imageContent',
    write(v, cell, e) {
        cell.imageWidth = Const['@:{const#to.unit}'](e.width);
        cell.imageHeight = Const['@:{const#to.unit}'](e.height);
        return v;
    },
    '@:{if.show}'({ type, bindKey }) {
        return type == 'image' &&
            config('getImageUrl') &&
            !bindKey;;
    }
}, {
    tip: '@:{lang#props.rotate.x}',
    type: Enum["@:{enum#prop.boolean}"],
    key: 'imageRotateX',
    '@:{if.show}': imageIfShow
}, {
    tip: '@:{lang#props.rotate.y}',
    type: Enum["@:{enum#prop.boolean}"],
    key: 'imageRotateY',
    '@:{if.show}': imageIfShow
}, {
    tip: '@:{lang#props.text.content}',
    type: Enum["@:{enum#prop.text.area}"],
    key: 'barcodeContent',
    '@:{if.show}'({ type, bindKey }) {
        return type == 'barcode' && !bindKey;
    }
}, {
    tip: '@:{lang#props.render}',
    key: 'barcodeRender',
    type: Enum['@:{enum#prop.collection}'],
    items: BarcodeProvider['@:{render.types}'],
    '@:{if.show}': barcodeIfShow
}, {
    tip: '@:{lang#props.fill.style}',
    key: 'barcodeFill',
    type: Enum['@:{enum#prop.collection}'],
    items: BarcodeProvider['@:{fill.types}'],
    '@:{if.show}'({ type, barcodeRender }) {
        return type == 'barcode' && barcodeRender == 'img';
    }
}, {
    tip: '@:{lang#props.barcode.format}',
    key: 'barcodeFormat',
    type: Enum["@:{enum#prop.collection}"],
    items: BarcodeProvider["@:{types}"],
    '@:{if.show}': barcodeIfShow
}, {
    tip: '@:{lang#props.show.text}',
    key: 'barcodeShowText',
    type: Enum["@:{enum#prop.boolean}"],
    '@:{if.show}': barcodeIfShow
}, {
    tip: '@:{lang#props.line.color}',
    key: 'barcodeColor',
    type: Enum["@:{enum#prop.color}"],
    '@:{if.show}': barcodeIfShow
}, {
    ...DesignerProvider['@:{designer#shared.props.partial.number}'],
    tip: '@:{lang#props.line.width}',
    key: 'barcodeLineWidth',
    min: () => Const['@:{const#to.unit}'](1),
    max: () => Const['@:{const#to.unit}'](8),
    '@:{if.show}': barcodeIfShow
}, {
    tip: '@:{lang#props.font.family}',
    key: 'barcodeFont',
    type: Enum['@:{enum#prop.collection}'],
    items: Const['@:{const#font.family}'],
    '@:{if.show}': barcodeIfShow
}, {
    ...DesignerProvider['@:{designer#shared.props.partial.number}'],
    tip: '@:{lang#props.font.size}',
    key: 'barcodeFontsize',
    min: () => Const['@:{const#to.unit}'](8),
    max: () => Const['@:{const#to.unit}'](100),
    '@:{if.show}': barcodeIfShow
}, {
    tip: '@:{lang#props.font.style}',
    type: Enum["@:{enum#prop.font.style}"],
    prefix: 'barcodeStyle',
    shows: BarcodeProvider['@:{text.style}'],
    '@:{if.show}': barcodeIfShow
}, {
    tip: '@:{lang#props.text.align}',
    key: 'barcodeTextAlign',
    type: Enum['@:{enum#prop.font.align}'],
    '@:{if.show}': barcodeIfShow
}, {
    tip: '@:{lang#props.text.position}',
    key: 'barcodeTextPosition',
    type: Enum['@:{enum#prop.collection}'],
    items: BarcodeProvider['@:{text.positions}'],
    '@:{if.show}': barcodeIfShow
}, {
    ...DesignerProvider['@:{designer#shared.props.partial.number}'],
    tip: '@:{lang#props.text.margin}',
    key: 'barcodeTextMargin',
    min: () => Const['@:{const#to.unit}'](-20),
    max: () => Const['@:{const#to.unit}'](20),
    '@:{if.show}': barcodeIfShow
}, {
    tip: '@:{lang#props.text.content}',
    type: Enum["@:{enum#prop.text.area}"],
    key: 'qrcodeContent',
    '@:{if.show}'({ type, bindKey }) {
        return type == 'qrcode' && !bindKey;;
    }
}, {
    tip: '@:{lang#props.qrcode.color.dark}',
    type: Enum['@:{enum#prop.color}'],
    key: 'qrcodeColorDark',
    '@:{if.show}': qrcodeIfShow
}, {
    tip: '@:{lang#props.qrcode.color.light}',
    type: Enum['@:{enum#prop.color}'],
    key: 'qrcodeColorLight',
    '@:{if.show}': qrcodeIfShow
}, {
    tip: '@:{lang#props.qrcode.correct.level}',
    type: Enum['@:{enum#prop.collection}'],
    key: 'qrcodeCorrectLevel',
    items: QRCodeProvider['@:{correct.levels}'],
    '@:{if.show}': qrcodeIfShow
},];
let translateUnits = ['textFontsize', 'textLetterspacing', 'barcodeFontsize', 'barcodeLineWidth', 'barcodeTextMargin', 'imageWidth', 'imageHeight'];
export default View.extend({
    tmpl: '@:./content.html',
    init() {
        this.set({
            list: PList,
            types: Enum
        });
    },
    assign(data) {
        let { props, disabled, l } = data;
        let { rows, focusRow, focusCol } = props;
        if (focusRow == -1) {
            focusRow = 0;
        }
        if (focusCol == -1) {
            focusCol = 0;
        }
        let cell = rows[focusRow].cols[focusCol];
        this.set({
            l,
            props,
            disabled,
            cell,
            rows,
            focusRow,
            focusCol
        });
    },
    render() {
        this.digest();
    },
    '@:{update.prop}<input,change>'(e) {
        let cell = this.get('cell');
        let rows = this.get('rows');
        let { key, use, write, native } = e.params;
        if (!use) {
            use = e.use;
        }
        if (!key) {
            key = e.pkey;
        }
        if (use || native) {
            let v = native ? e.eventTarget[native] : e[use];
            if (write) {
                v = write(v, cell, e);
            }
            if (key == 'type') {
                let prev = cell[key];
                if (prev) {
                    for (let p in cell) {
                        if (p.startsWith(prev)) {
                            delete cell[p];
                        }
                    }
                }
                let initial = CellProvider[CellProvider['@:{cell#map}'][v]];
                if (initial) {
                    mix(cell, initial);
                    for (let u of translateUnits) {
                        if (cell[u]) {
                            cell[u] = Const['@:{const#to.unit}'](cell[u]);
                        }
                    }
                }
            }
            if (key) {
                cell[key] = v;
            }
        }
        dispatch(this.root, 'change', {
            use: 'rows',
            rows
        });
    },
});