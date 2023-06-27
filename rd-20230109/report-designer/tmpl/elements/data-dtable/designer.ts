/*
    author:https://github.com/xinglie
*/
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import CellProvider from '../../provider/cell';
import DesignerProvider from '../../provider/designer';
import TableProvider from '../../provider/table';
import Normal from '../designer';
let { max } = Math;
let transformFields = ['width', 'height', 'paddingLeft', 'paddingTop', 'paddingBottom', 'paddingRight', 'textFontsize', 'textLetterspacing', 'barcodeFontsize', 'barcodeLineWidth', 'barcodeTextMargin', 'imageWidth', 'imageHeight'];

let isShowContentCell = (props) => {
    let { focusRow, focusCol, rows } = props;
    let show = false;
    if (focusCol > -1 &&
        focusCol > -1) {
        let cell = rows[focusRow].cols[focusCol];
        show = !cell?.elements?.length;
    }
    return show;
};
let isCellFocused = CellProvider['@:{cell#is.cell.focused}'];
export default Normal.extend({
    ctor() {
        this.set({
            view: '@:./dshow'
        });
    }
}).static({
    type: 'data-dtable',
    as: Enum['@:{enum#as.hod}'],//容器元素特有的标识
    title: '@:{lang#elements.data.dtable}',
    icon: '&#xe674;',
    '@:{modifier}': Enum['@:{enum#modifier.icon}'] |
        Enum['@:{enum#modifier.nomask}'] |
        Enum['@:{enum#modifier.top.icon}'],
    '@:{allowed.to.hod}': {//当前元素允许添加到的其它容器，这里只允许数据表格添加到设计区，不能添加到其它容器里
        root: 1
    },
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{update.props}'(props) {
        let { borderwidth: bw,
            tfootSpacing,
            rows,
            borderdeed,
            hideFoot,
            hideTotal,
            hideHead,
            hideLabel } = props;
        TableProvider["@:{table.provider#add.ext.meta}"](props, true);
        let sizes = TableProvider["@:{table.provider#get.sizes}"](props);
        let height = 0,
            width = 0;
        for (let w of sizes["@:{col.widths}"]) {
            width += w;
            //width += (w - trunc(w)) > 0 ? 1 : 0;
        }
        let heights = sizes["@:{row.heights}"];
        let total = heights.length;
        let headStart,
            headEnd,
            headHeight,
            labelStart,
            labelHeight,
            bodyStart,
            bodyHeight,
            totalStart,
            footStart,
            spacingStart,
            totalHeight = 0,
            footHeight = 0,
            spacingHeight = tfootSpacing,
            headRows = 0,
            footRows = 0;
        for (let i = 0; i < total; i++) {
            let row = rows[i];
            let h = heights[i];
            if (row.label &&
                !headHeight) {
                headEnd = height;
                headHeight = height;
            } else if (row.data) {
                labelHeight = (height - headHeight);
            } else if (!headEnd) {
                headRows++;
            } else if (totalHeight) {
                footRows++;
            }
            height += h;
            if (row.data) {
                props.tipTop = height + h;
                height += 2 * h;
                bodyHeight = (height - labelHeight - headHeight);
            } else if (row.total) {
                totalHeight = h;
            } else if (totalHeight) {
                footHeight += h;
            }
        }
        //表格宽：所以列宽＋一个边框宽
        //表格高：所以行高＋一个边框宽
        height += tfootSpacing;
        let tableHeight,
            tableWidth;
        let oneBorder = Const['@:{const#to.unit}'](1);
        if (borderdeed == 'separate') {
            tableHeight = height + 2 * (sizes["@:{row.heights}"].length + 3) * oneBorder;
            tableWidth = width + 2 * (sizes["@:{col.widths}"].length + 2) * oneBorder;
            headStart = 4 * oneBorder;
            headHeight += 2 * (headRows - 1) * oneBorder;
            if (hideHead) {
                tableHeight -= headHeight + 2 * oneBorder;
                labelStart = headStart;
                props.tipTop -= headHeight + oneBorder;
            } else {
                labelStart = headStart + headHeight + 2 * oneBorder;
            }
            if (hideLabel) {
                bodyStart = labelStart;
                tableHeight -= labelHeight + 2 * oneBorder;
                props.tipTop -= labelHeight + oneBorder;
            } else {
                bodyStart = labelStart + labelHeight;
            }

            bodyHeight += 2 * 2 * oneBorder;

            if (hideTotal) {
                tableHeight -= totalHeight + 2 * oneBorder;
                totalHeight = bodyHeight
                totalStart = bodyStart;
            } else {
                totalStart = bodyStart + bodyHeight + 2 * oneBorder;
            }

            footHeight += 2 * (footRows - 1) * oneBorder;
            if (hideFoot) {
                tableHeight -= footHeight + 2 * oneBorder;
                footStart = totalStart;
                footHeight = totalHeight;
            } else {
                footStart = totalStart + totalHeight + 2 * oneBorder;
            }
            spacingStart = footStart + footHeight;


            headHeight -= 4 * oneBorder;
            labelHeight -= 4 * oneBorder;
            bodyHeight -= 4 * oneBorder;
            totalHeight -= 4 * oneBorder;
            footHeight -= 4 * oneBorder;
        } else {
            tableHeight = height + bw;
            tableWidth = width + bw;
            headStart = bw + oneBorder;
            if (hideHead) {
                tableHeight -= headHeight;
                labelStart = headStart;
                props.tipTop -= headHeight
            } else {
                labelStart = headStart + headHeight;
                headHeight -= bw + 2 * oneBorder;
            }
            if (hideLabel) {
                bodyStart = labelStart;
                tableHeight -= labelHeight;
                props.tipTop -= labelHeight
            } else {
                bodyStart = labelStart + labelHeight - 2 * oneBorder;
                labelHeight -= bw + 2 * oneBorder;
            }

            if (hideTotal) {
                tableHeight -= totalHeight;
                totalStart = bodyStart;
                totalHeight = bodyHeight;
            } else {
                totalStart = bodyStart + bodyHeight;
            }

            if (hideFoot) {
                tableHeight -= footHeight;
                footStart = totalStart;
                footHeight = totalHeight;
            } else {
                footStart = totalStart + totalHeight;
            }

            spacingStart = footStart + footHeight;
            bodyHeight -= bw + 2 * oneBorder;
            totalHeight -= bw + 2 * oneBorder;
            footHeight -= bw + 2 * oneBorder;
        }
        props.width = tableWidth;
        props.height = tableHeight;

        props.headStart = headStart;
        props.headHeight = headHeight;

        props.labelStart = labelStart;
        props.labelHeight = labelHeight;

        props.bodyStart = bodyStart;
        props.bodyHeight = bodyHeight;

        props.totalStart = totalStart;
        props.totalHeight = totalHeight;

        props.footStart = footStart;
        props.footHeight = footHeight;

        props.spacingStart = spacingStart;
        props.spacingHeight = max(spacingHeight, 0);
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
        let defaultProps = {
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
            alpha: 1
        };
        let cellProps = {
            ...defaultProps,
            type: 'text',
            ...CellProvider['@:{cell#text}']
        };
        cellProps.textFontsize = Const['@:{const#to.unit}'](cellProps.textFontsize);
        return {
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            //rotate: 0,
            alpha: 1,
            borderwidth: Const['@:{const#to.unit}'](1),
            bordercolor: '#000',
            bordertype: 'solid',
            borderdeed: 'collapse',
            focusRow: -1,
            focusCol: -1,
            columnsPrint: false,
            hspace: Const['@:{const#to.unit}'](20),
            tfs: Const['@:{const#to.unit}'](16),
            tfootSpacing: Const['@:{const#to.unit}'](30),
            hideTotal: false,
            hideFoot: false,
            hideHead: false,
            hideLabel: false,
            eachPageLabel: true,
            headFirst: true,
            footLast: true,
            dynamicCols: true,
            avgDynamicColsWidth: 'percent',
            bind: {},
            help: 'github.com/xinglie/report-designer/issues/26',
            rows: [{
                cols: [{
                    ...cellProps,
                    textAutoHeight: true,
                    elements: []
                }, {
                    ...cellProps,
                    textAutoHeight: true,
                    elements: []
                }, {
                    ...cellProps,
                    textAutoHeight: true,
                    elements: []
                }]
            }, {
                label: true,
                cols: [{
                    ...cellProps
                }, {
                    ...cellProps
                }, {
                    ...cellProps
                }]
            }, {
                data: true,
                cols: [{
                    ...cellProps
                }, {
                    ...cellProps
                }, {
                    ...cellProps
                }]
            }, {
                total: true,
                cols: [{
                    ...cellProps
                }, {
                    ...cellProps
                }, {
                    ...cellProps
                }]
            }, {
                cols: [{
                    ...cellProps,
                    elements: []
                }, {
                    ...cellProps,
                    elements: []
                }, {
                    ...cellProps,
                    elements: []
                }]
            }],
            animations: [],
            locked: false
        };
    },
    props: [
        DesignerProvider['@:{designer#shared.props.tfs}'], {
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
        DesignerProvider['@:{designer#shared.props.alpha}'], {
            tip: '@:{lang#props.cell.share}',
            type: Enum['@:{enum#prop.table.cell.share}'],
            dataPad: 2
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.border.width}'],
        DesignerProvider['@:{designer#shared.props.border.type}'](),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.border.color}', 'bordercolor'),
        DesignerProvider['@:{designer#shared.props.border.deed}'], {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.table.foot.spacing}',
            min: 0,
            key: 'tfootSpacing',
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.head.first.page}', 'headFirst'),
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.foot.last.page}', 'footLast'), {
            tip: '@:{lang#props.hide.head}',
            key: 'hideHead',
            type: Enum["@:{enum#prop.boolean}"],
            json: 1,
            write(v, props) {
                let { focusRow, rows } = props;
                TableProvider["@:{table.provider#add.ext.meta}"](props, true);
                let ri = 0,
                    labelRowIndex = -1;
                for (let row of rows) {
                    if (row.label) {
                        labelRowIndex = ri;
                        break;
                    }
                    ri++;
                }
                if (focusRow < labelRowIndex) {
                    props.focusRow = -1;
                    props.focusCol = -1;
                }
            }
        }, {
            tip: '@:{lang#props.hide.label}',
            key: 'hideLabel',
            type: Enum['@:{enum#prop.boolean}'],
            json: 1,
            write(v, props) {
                let { focusRow, rows } = props;
                TableProvider["@:{table.provider#add.ext.meta}"](props, true);
                let ri = 0,
                    labelRowIndex = -1;
                for (let row of rows) {
                    if (row.label) {
                        labelRowIndex = ri;
                        break;
                    }
                    ri++;
                }
                if (focusRow == labelRowIndex) {
                    props.focusRow = -1;
                    props.focusCol = -1;
                }
            }
        },
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.show.label.every.page}', 'eachPageLabel'), {
            tip: '@:{lang#props.hide.total}',
            key: 'hideTotal',
            type: Enum["@:{enum#prop.boolean}"],
            json: 1,
            write(v, props) {
                let { focusRow, rows } = props;
                TableProvider["@:{table.provider#add.ext.meta}"](props, true);
                let ri = 0,
                    totalRowIndex = -1;
                for (let row of rows) {
                    if (row.total) {
                        totalRowIndex = ri;
                        break;
                    }
                    ri++;
                }
                if (focusRow == totalRowIndex) {
                    props.focusRow = -1;
                    props.focusCol = -1;
                }
            }
        }, {
            tip: '@:{lang#props.hide.foot}',
            key: 'hideFoot',
            type: Enum["@:{enum#prop.boolean}"],
            json: 1,
            write(v, props) {
                let { focusRow, rows } = props;
                TableProvider["@:{table.provider#add.ext.meta}"](props, true);
                let ri = 0,
                    totalRowIndex = -1;
                for (let row of rows) {
                    if (row.total) {
                        totalRowIndex = ri;
                        break;
                    }
                    ri++;
                }
                if (focusRow > totalRowIndex) {
                    props.focusRow = -1;
                    props.focusCol = -1;
                }
            }
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.cell.dynamic.cols}', 'dynamicCols'), {
            tip: '@:{lang#props.cell.avg.dynamic.cols.width}',
            key: 'avgDynamicColsWidth',
            type: Enum['@:{enum#prop.collection}'],
            items: [{
                'text': '@:{lang#props.cell.avg.dynamic.cols.width.percent}',
                'value': 'percent'
            }, {
                'text': '@:{lang#props.cell.avg.dynamic.cols.width.direct}',
                'value': 'direct'
            }, {
                'text': '@:{lang#props.cell.avg.dynamic.cols.width.none}',
                'value': 'none'
            }],
            json: 1,
            '@:{if.show}'({ dynamicCols }) {
                return dynamicCols;
            }
        },
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.multiple.columns.print}', 'columnsPrint'), {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.h.space}',
            key: 'hspace',
            min: 0,
            max: () => Const['@:{const#to.unit}'](200),
            '@:{if.show}'({ columnsPrint }) {
                return columnsPrint;
            }
        }, {
            type: Enum["@:{enum#prop.spliter}"],
            '@:{if.show}': isCellFocused
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
            type: Enum["@:{enum#prop.dtable.cell.operate}"],
            //'@:{dock.top}': 1,
            '@:{if.show}': isCellFocused
        }, {
            type: Enum["@:{enum#prop.spliter}"],
            '@:{if.show}': isShowContentCell
        }, {
            type: Enum["@:{enum#prop.dtable.cell.content}"],
            '@:{if.show}': isShowContentCell
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.help}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});