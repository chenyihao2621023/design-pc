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
import TableProvider from '../../provider/table';
let { config, View, dispatch, mix } = Magix;
let textFontsizeIfShow = ({ textFontsize }) => textFontsize != null;
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
        text: '@:{lang#cell.sum.current.page}',
        value: 'sumpage'
    }, {
        text: '@:{lang#cell.sum.table}',
        value: 'sum'
    }, {
        text: '@:{lang#cell.sum.acc}',
        value: 'acc'
    }, {
        text: '@:{lang#cell.avg.table}',
        value: 'avg'
    }, {
        text: '@:{lang#cell.avg.current.page}',
        value: 'avgpage'
    }, {
        text: '@:{lang#cell.avg.acc}',
        value: 'avgacc'
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
    type: Enum["@:{enum#prop.text.area}"],
    key: 'textContent',
    '@:{if.show}'(cell, props) {
        let { focusRow, rows } = props;
        TableProvider["@:{table.provider#add.ext.meta}"](props, 1);
        let ri = 0;
        //let totalRowIndex = -1;
        let dataRowIndex = -1;
        for (let row of rows) {
            if (row.total) {
                //totalRowIndex = ri;
            } else if (row.data) {
                dataRowIndex = ri;
            }
            ri++;
        }
        return focusRow != dataRowIndex && cell.type == 'text';
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
        let dataRowIndex = -1;
        for (let row of rows) {
            if (row.total) {
                totalRowIndex = ri;
            } else if (row.data) {
                dataRowIndex = ri;
            }
            ri++;
        }
        return (focusRow == totalRowIndex &&
            cell.type != 'text' &&
            cell.type != 'custom') ||
            (cell.type == 'text' &&
                focusRow == dataRowIndex);
    }
}, {
    tip: '@:{lang#props.format.fx}',
    type: Enum["@:{enum#prop.format.fx}"],
    key: 'textFormat',
    '@:{if.show}'({ type }) {
        return type == 'custom';
    }
}, {
    tip: '@:{lang#props.auto.height}',
    type: Enum['@:{enum#prop.boolean}'],
    key: 'textAutoHeight',
    '@:{if.show}'(cell, props) {
        let { focusRow, rows } = props;
        TableProvider["@:{table.provider#add.ext.meta}"](props, true);
        let ri = 0;
        let totalRowIndex = -1;
        let dataRowIndex = -1;
        let labelRowIndex = -1;
        for (let row of rows) {
            if (row.total) {
                totalRowIndex = ri;
            } else if (row.data) {
                dataRowIndex = ri;
            } else if (row.label) {
                if (labelRowIndex == -1) {
                    labelRowIndex = ri;
                }
            }
            ri++;
        }
        return (cell.textFontsize != null) && (focusRow == dataRowIndex || (focusRow >= labelRowIndex && focusRow < dataRowIndex) || focusRow == totalRowIndex);
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
    '@:{if.show}'(cell, props) {
        let { focusRow, rows } = props;
        TableProvider["@:{table.provider#add.ext.meta}"](props, true);
        let ri = 0;
        let totalRowIndex = -1;
        let dataRowIndex = -1;
        for (let row of rows) {
            if (row.total) {
                totalRowIndex = ri;
            } else if (row.data) {
                dataRowIndex = ri;
            }
            ri++;
        }
        return config('getImageUrl') && cell.type == 'image' && focusRow != totalRowIndex && focusRow != dataRowIndex;
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
    '@:{if.show}'(cell, props) {
        let { focusRow, rows } = props;
        TableProvider["@:{table.provider#add.ext.meta}"](props, true);
        let ri = 0;
        let totalRowIndex = -1;
        let dataRowIndex = -1;
        for (let row of rows) {
            if (row.total) {
                totalRowIndex = ri;
            } else if (row.data) {
                dataRowIndex = ri;
            }
            ri++;
        }
        return cell.type == 'barcode' && focusRow != totalRowIndex && focusRow != dataRowIndex;
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
    '@:{if.show}'({ type, bindKey }) {
        return type == 'qrcode' && !bindKey;;
    }
}, {
    tip: '@:{lang#props.text.content}',
    type: Enum["@:{enum#prop.text.area}"],
    key: 'qrcodeContent',
    '@:{if.show}'(cell, props) {
        let { focusRow, rows } = props;
        TableProvider["@:{table.provider#add.ext.meta}"](props, true);
        let ri = 0;
        let totalRowIndex = -1;
        let dataRowIndex = -1;
        for (let row of rows) {
            if (row.total) {
                totalRowIndex = ri;
            } else if (row.data) {
                dataRowIndex = ri;
            }
            ri++;
        }
        return cell.type == 'qrcode' && focusRow != totalRowIndex && focusRow != dataRowIndex;
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
}];

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
                    mix(cell, initial);
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