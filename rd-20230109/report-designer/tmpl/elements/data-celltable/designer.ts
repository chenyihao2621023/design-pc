/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import CellProvider from '../../provider/cell';
import DesignerProvider from '../../provider/designer';
import TableProvider from '../../provider/table';
import Normal from '../designer';
let { mix } = Magix;
let transformFields = ['width', 'height', 'paddingLeft', 'paddingTop', 'paddingBottom', 'paddingRight', 'textFontsize', 'textLetterspacing', 'barcodeFontsize', 'barcodeLineWidth', 'barcodeTextMargin', 'imageWidth', 'imageHeight'];
let isCellFocused = CellProvider['@:{cell#is.cell.focused}'];
export default Normal.extend({
    ctor() {
        this.set({
            view: '@:./dshow'
        });
    }
}).static({
    type: 'data-celltable',
    title: '@:{lang#elements.data.celltable}',
    as: Enum['@:{enum#as.cells}'],
    icon: '&#xe63c;',
    '@:{modifier}': Enum['@:{enum#modifier.icon}'] |
        Enum['@:{enum#modifier.rotate}'] |
        Enum['@:{enum#modifier.nomask}'],
    '@:{allowed.to.hod}': {//当前元素允许添加到的其它容器，这里只允许单元格表格添加到设计区或者数据表格里
        root: 1,
        'data-dtable': 1,
        'hod-col-table': 1
    },
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{update.props}'(props) {
        TableProvider["@:{table.provider#add.ext.meta}"](props, true);
        let { borderwidth, borderdeed } = props;
        if (!props['@:{row.max}'] ||
            !props['@:{col.max}']) {
            props = TableProvider["@:{table.provider#add.ext.meta}"](props);
        }
        let sizes = TableProvider["@:{table.provider#get.sizes}"](props);
        let height = 0,
            width = 0;
        for (let w of sizes["@:{col.widths}"]) {
            width += w;
        }
        for (let h of sizes["@:{row.heights}"]) {
            height += h;
        }
        //表格宽：所以列宽＋一个边框宽
        //表格高：所以行高＋一个边框宽
        let bw = borderwidth;
        if (borderdeed == 'separate') {
            let sizes = TableProvider["@:{table.provider#get.sizes}"](props);
            height += 2 * Const['@:{const#to.unit}'](sizes["@:{row.heights}"].length + 1);
            width += 2 * Const['@:{const#to.unit}'](sizes["@:{col.widths}"].length + 1);
        } else {
            height += bw;
            width += bw;
        }
        props.width = width;
        props.height = height;
    },
    '@:{get.bind.info}'(props) {
        let { rows, bind } = props;
        let fields = [];
        for (let row of rows) {
            for (let col of row.cols) {
                if (col.bindKey) {
                    fields.push({
                        key: col.bindKey,
                        name: col.bindName
                    });
                }
            }
        }
        return {
            id: bind.id,
            fields
        };
    },
    '@:{get.props}'(x, y) {
        let cellProps = mix({
            height: Const['@:{const#to.unit}'](30),
            width: Const['@:{const#to.unit}'](150),
            rowspan: 1,
            colspan: 1,
            paddingLeft: Const['@:{const#to.unit}'](5),
            paddingTop: Const['@:{const#to.unit}'](5),
            paddingRight: Const['@:{const#to.unit}'](5),
            paddingBottom: Const['@:{const#to.unit}'](5),
            bLeft: true,
            bTop: true,
            bRight: true,
            bBottom: true,
            hpos: 'flex-start',
            vpos: 'flex-start',
            alpha: 1,
            type: 'text'
        }, CellProvider['@:{cell#text}']);
        cellProps.textFontsize = Const['@:{const#to.unit}'](cellProps.textFontsize);
        return {
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            alpha: 1,
            borderwidth: Const['@:{const#to.unit}'](1),
            bordercolor: '#000',
            bordertype: 'solid',
            borderdeed: 'collapse',
            focusRow: -1,
            focusCol: -1,
            bind: {},
            help: 'github.com/xinglie/report-designer/issues/25',
            rows: [{
                cols: [{ ...cellProps }, { ...cellProps }]
            }, {
                cols: [{ ...cellProps }, { ...cellProps }]
            }],
            animations: [],
            locked: false
        };
    },
    props: [{
        '@:{json.encode}'(dest, { rows }, toNormalScale) {
            CellProvider['@:{cell#json.encode.cells}'](dest, rows, transformFields, toNormalScale);
        },
        '@:{unit.convert}'({ rows }, toUnit) {
            CellProvider['@:{cell#unit.convert.cells}'](rows, toUnit, transformFields);
        },
        '@:{stage.scale}'(props, step, dest) {
            CellProvider['@:{cell#stage.scale.cells}'](props, step, transformFields, dest);
        }
    }, {
        key: 'bind',
        json: 1
    },
    DesignerProvider['@:{designer#shared.props.x}'],
    DesignerProvider['@:{designer#shared.props.y}'],
    DesignerProvider['@:{designer#shared.props.label.width}'],
    DesignerProvider['@:{designer#shared.props.label.height}'],
    DesignerProvider['@:{designer#shared.props.alpha}'],
    DesignerProvider['@:{designer#shared.props.rotate}'], {
        tip: '@:{lang#props.cell.share}',
        type: Enum['@:{enum#prop.table.cell.share}'],
        //'@:{dock.top}': 1,
    },
    DesignerProvider['@:{designer#shared.props.spliter}'],
    DesignerProvider['@:{designer#shared.props.border.width}'],
    DesignerProvider['@:{designer#shared.props.border.type}'](),
    DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.border.color}', 'bordercolor'),
    DesignerProvider['@:{designer#shared.props.border.deed}'], {
        type: Enum["@:{enum#prop.spliter}"],
        '@:{if.show}': isCellFocused,
    }, {
        tip: '@:{lang#props.cell.size}',
        type: Enum["@:{enum#prop.table.cell.size}"],
        //'@:{dock.top}': 1,
        //'@:{auto.height}': 1,
        '@:{if.show}': isCellFocused
    }, {
        tip: '@:{lang#props.table.cell.border}',
        type: Enum["@:{enum#prop.table.cell.border}"],
        '@:{if.show}': isCellFocused
    }, {
        tip: '@:{lang#props.cell.operate}',
        type: Enum["@:{enum#prop.table.cell.operate}"],
        //'@:{dock.top}': 1,
        '@:{if.show}': isCellFocused
    }, {
        type: Enum["@:{enum#prop.spliter}"],
        '@:{if.show}': isCellFocused
    }, {
        type: Enum["@:{enum#prop.table.cell.content}"],
        '@:{if.show}': isCellFocused
    },
    DesignerProvider['@:{designer#shared.props.spliter}'],
    DesignerProvider['@:{designer#shared.props.help}'],
    DesignerProvider['@:{designer#shared.props.ename}'],
    DesignerProvider['@:{designer#shared.props.locked}'],
    DesignerProvider['@:{designer#shared.props.animations}']]
});