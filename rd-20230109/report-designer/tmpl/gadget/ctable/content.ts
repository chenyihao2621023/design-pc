/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import BarcodeProvider from '../../provider/barcode';
import CellProvider from '../../provider/cell';
import DesignerProvider from '../../provider/designer';
import GenericProvider from '../../provider/generic';
import QRCodeProvider from '../../provider/qrcode';
import TableProvider from '../../provider/table';
let { View, dispatch, config, mix } = Magix;
let textFontsizeIfShow = ({ textFontsize }) => textFontsize != null;
let imageIfShow = ({ type }) => config('getImageUrl') && type == 'image';
let barcodeIfShow = ({ type }) => type == 'barcode';
let qrcodeIfShow = ({ type }) => type == 'qrcode';
let inputIfShow = ({ type }) => type == 'input';
let dropdownIfShow = ({ type }) => type == 'dropdown';
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
    }, {
        text: '@:{lang#elements.form.input}',
        value: 'input'
    }, {
        text: '@:{lang#elements.form.dropdown}',
        value: 'dropdown'
    }],
    omit: 1,
    '@:{if.show}'(cell, props) {
        let { focusRow, rows } = props;
        TableProvider["@:{table.provider#add.ext.meta}"](props, true);
        let ri = 0;
        let totalRowIndex = -1;
        for (let row of rows) {
            if (row.total) {
                totalRowIndex = ri;
            }
            ri++;
        }
        return focusRow != totalRowIndex;
    }
}, {
    tip: '@:{lang#props.cell.compute}',
    key: 'type',
    type: Enum["@:{enum#prop.collection}"],
    items: [{
        text: '@:{lang#cell.static.text}',
        value: 'text'
    }, {
        text: '@:{lang#cell.sum}',
        value: 'sum'
    }, {
        text: '@:{lang#cell.avg}',
        value: 'avg'
    }, {
        text: '@:{lang#custom}',
        value: 'custom'
    }],
    omit: 0,
    '@:{if.show}'(cell, props) {
        let { focusRow, rows } = props;
        TableProvider["@:{table.provider#add.ext.meta}"](props, true);
        let ri = 0;
        let totalRowIndex = -1;
        for (let row of rows) {
            if (row.total) {
                totalRowIndex = ri;
            }
            ri++;
        }
        return focusRow == totalRowIndex;
    }
}, {
    tip: '@:{lang#props.content.align}',
    type: Enum["@:{enum#prop.align}"],
    '@:{if.show}'({ type }) {
        return type != 'input' &&
            type != 'dropdown';
    }
}, {
    tip: '@:{lang#props.text.align}',
    key: 'inputTextAlign',
    type: Enum["@:{enum#prop.font.align}"],
    '@:{if.show}': inputIfShow
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
    type: Enum["@:{enum#prop.text.area}"],
    key: 'textContent',
    '@:{if.show}'({ type }) {
        return type == 'text';
    }
}, {
    tip: '@:{lang#props.format}',
    type: Enum["@:{enum#prop.format}"],
    key: 'textFormat',
    '@:{if.show}'(cell, props) {
        //console.log(cell);
        let { focusRow, rows } = props;
        TableProvider["@:{table.provider#add.ext.meta}"](props, true);
        let ri = 0;
        let totalRowIndex = -1;
        for (let row of rows) {
            if (row.total) {
                totalRowIndex = ri;
                break;
            }
            ri++;
        }
        return (focusRow == totalRowIndex &&
            (cell.type == 'sum' ||
                cell.type == 'avg'))
    }
}, {
    tip: '@:{lang#props.format.fx}',
    type: Enum["@:{enum#prop.format.fx}"],
    key: 'textFormat',
    '@:{if.show}'({ type }) {
        return type == 'custom';
    }
}, {
    tip: '@:{lang#props.richtext}',
    type: Enum['@:{enum#prop.boolean}'],
    key: 'textRichText',
    '@:{if.show}': textFontsizeIfShow
}, {
    ...DesignerProvider['@:{designer#shared.props.partial.number}'],
    tip: '@:{lang#props.font.size}',
    key: 'textFontsize',
    min: 0,
    '@:{if.show}': textFontsizeIfShow
}, {
    tip: '@:{lang#props.font.family}',
    key: 'textFontfamily',
    type: Enum["@:{enum#prop.collection}"],
    items: Const["@:{const#font.family}"],
    '@:{if.show}': textFontsizeIfShow
}, {
    ...DesignerProvider['@:{designer#shared.props.partial.number}'],
    tip: '@:{lang#props.letter.spacing}',
    key: 'textLetterspacing',
    min: 0,
    '@:{if.show}': textFontsizeIfShow
}, {
    tip: '@:{lang#props.forecolor}',
    key: 'textForecolor',
    type: Enum["@:{enum#prop.color}"],
    '@:{if.show}': textFontsizeIfShow
}, {
    tip: '@:{lang#props.font.style}',
    type: Enum["@:{enum#prop.font.style}"],
    prefix: 'textStyle',
    '@:{if.show}': textFontsizeIfShow
}, {
    tip: '@:{lang#props.image}',
    type: Enum["@:{enum#prop.image}"],
    key: 'imageContent',
    write(v, cell, e) {
        cell.imageWidth = Const['@:{const#to.unit}'](e.width);
        cell.imageHeight = Const['@:{const#to.unit}'](e.height);
        return v;
    },
    '@:{if.show}': imageIfShow
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
    '@:{if.show}': barcodeIfShow
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
        return type == 'barcode' &&
            barcodeRender == 'img';
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
    '@:{if.show}': qrcodeIfShow
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
}, {
    tip: '@:{lang#props.placeholder}',
    key: 'inputPlaceholder',
    type: Enum["@:{enum#prop.text.input}"],
    '@:{if.show}': inputIfShow
}, {
    tip: '@:{lang#props.default.text}',
    key: 'inputText',
    type({ inputMultiline }) {
        return inputMultiline ? Enum['@:{enum#prop.text.area}'] : Enum["@:{enum#prop.text.input}"];
    },
    '@:{is.dynamic.type}': 1,
    '@:{if.show}': inputIfShow
}, {
    tip: '@:{lang#props.extend.mark}',
    key: 'inputMarkAs',
    type: Enum["@:{enum#prop.text.input}"],
    '@:{if.show}': inputIfShow
}, {
    tip: '@:{lang#props.extend.class.name}',
    key: 'inputClassName',
    type: Enum["@:{enum#prop.text.input}"],
    '@:{if.show}': inputIfShow
}, {
    tip: '@:{lang#props.element.name}',
    key: 'inputName',
    type: Enum["@:{enum#prop.text.input}"],
    '@:{if.show}': inputIfShow
}, {
    tip: '@:{lang#props.multiline}',
    key: 'inputMultiline',
    type: Enum["@:{enum#prop.boolean}"],
    '@:{if.show}': inputIfShow
}, {
    ...DesignerProvider['@:{designer#shared.props.partial.number}'],
    tip: '@:{lang#props.font.size}',
    key: 'inputFontsize',
    min: 0,
    '@:{if.show}': inputIfShow
}, {
    tip: '@:{lang#props.font.family}',
    key: 'inputFontfamily',
    type: Enum["@:{enum#prop.collection}"],
    items: Const["@:{const#font.family}"],
    '@:{if.show}': inputIfShow
}, {
    ...DesignerProvider['@:{designer#shared.props.partial.number}'],
    tip: '@:{lang#props.letter.spacing}',
    key: 'inputLetterspacing',
    min: 0,
    '@:{if.show}': inputIfShow
}, {
    tip: '@:{lang#props.forecolor}',
    key: 'inputForecolor',
    type: Enum["@:{enum#prop.color}"],
    '@:{if.show}': inputIfShow
}, {
    tip: '@:{lang#props.extend.mark}',
    key: 'dropdownMarkAs',
    type: Enum["@:{enum#prop.text.input}"],
    '@:{if.show}': dropdownIfShow
}, {
    tip: '@:{lang#props.extend.class.name}',
    key: 'dropdownClassName',
    type: Enum["@:{enum#prop.text.input}"],
    '@:{if.show}': dropdownIfShow
}, {
    tip: '@:{lang#props.element.name}',
    key: 'dropdownName',
    type: Enum["@:{enum#prop.text.input}"],
    '@:{if.show}': dropdownIfShow
}, {
    ...DesignerProvider['@:{designer#shared.props.partial.number}'],
    tip: '@:{lang#props.font.size}',
    key: 'dropdownFontsize',
    min: 0,
    '@:{if.show}': dropdownIfShow
}, {
    tip: '@:{lang#props.font.family}',
    key: 'dropdownFontfamily',
    type: Enum["@:{enum#prop.collection}"],
    items: Const["@:{const#font.family}"],
    '@:{if.show}': dropdownIfShow
}, {
    ...DesignerProvider['@:{designer#shared.props.partial.number}'],
    tip: '@:{lang#props.letter.spacing}',
    key: 'dropdownLetterspacing',
    min: 0,
    '@:{if.show}': dropdownIfShow
}, {
    tip: '@:{lang#props.forecolor}',
    key: 'dropdownForecolor',
    type: Enum["@:{enum#prop.color}"],
    '@:{if.show}': dropdownIfShow
}, {
    tip: '@:{lang#props.multile.selected}',
    key: 'dropdownMultipleSelect',
    type: Enum["@:{enum#prop.boolean}"],
    '@:{if.show}': dropdownIfShow,
    write(v, props) {
        if (!v) {
            let { dropdownItems } = props;
            let findSelect;
            for (let e of dropdownItems) {
                if (e.checked) {
                    if (findSelect) {
                        e.checked = false;
                    } else {
                        findSelect = 1;
                    }
                }
            }
            if (!findSelect) {
                dropdownItems[0].checked = true;
            }
        }
        return v;
    }
}, {
    type: Enum['@:{enum#prop.spliter}'],
    '@:{if.show}': dropdownIfShow
}, {
    key: 'dropdownItems',
    type: Enum['@:{enum#prop.form.items}'],
    mutual({ dropdownMultipleSelect }) {
        return dropdownMultipleSelect;
    },
    '@:{if.show}': dropdownIfShow
}];

let translateUnits = ['textFontsize', 'textLetterspacing', 'barcodeFontsize', 'barcodeLineWidth', 'barcodeTextMargin', 'dropdownFontsize', 'dropdownLetterspacing', 'inputFontsize', 'inputLetterspacing', 'imageWidth', 'imageHeight'];
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
        if (focusRow < 0) {
            focusRow = 0;
        }
        if (focusCol < 0) {
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
        let { key, use, write, native, omit } = e.params;
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
                if (prev &&
                    omit) {
                    for (let p in cell) {
                        if (p.startsWith(prev)) {
                            delete cell[p];
                        }
                    }
                }
                let initial = CellProvider[CellProvider['@:{cell#map}'][v]];
                if (initial) {
                    mix(cell, GenericProvider['@:{generic#clone}'](initial));
                    for (let u of translateUnits) {
                        if (cell[u]) {
                            cell[u] = Const['@:{const#to.unit}'](cell[u]);
                        }
                    }
                }
                if (v == 'custom' ||
                    prev == 'custom') {
                    cell.textFormat = '';
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
    }
});