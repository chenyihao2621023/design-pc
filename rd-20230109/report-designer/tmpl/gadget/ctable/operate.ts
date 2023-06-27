/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import CellProvider from '../../provider/cell';
import TableProvider from '../../provider/table';
let { View, dispatch, State } = Magix;
let defaultCellHeight = 35;
let defaultCellWidth = 150;
let minCellSize = 20;
let defaultCellProps = {
    bLeft: true,
    bTop: true,
    bRight: true,
    bBottom: true,
};
let toUnits = ['paddingBottom', 'paddingTop', 'paddingLeft', 'paddingRight', 'textFontsize'];
let getDefaultProps = () => {
    let scale = State.get('@:{global#stage.scale}');
    let defaultCellContentProps = {
        paddingBottom: 5,
        paddingTop: 5,
        paddingLeft: 5,
        paddingRight: 5,
        hpos: 'flex-start',
        vpos: 'flex-start',
        alpha: 1,
        type: 'text',
        ...defaultCellProps,
        ...CellProvider['@:{cell#text}']
    };
    for (let e of toUnits) {
        defaultCellContentProps[e] = Const['@:{const#to.unit}'](defaultCellContentProps[e] * scale);
    }
    return defaultCellContentProps;
}
let queryCellStatus = (table) => {
    let { rows,
        focusRow,
        focusCol,
        '@:{row.max}': rowMax,
        '@:{col.max}': colMax } = table;
    let canDeleteRow = false,
        canDeleteCol = false,
        canMergeLeft = false,
        canMergeTop = false,
        canMergeRight = false,
        canMergeBottom = false,
        canSplitH = false,
        canSplitV = false,
        canInsertRowBottom = true,
        canInsertRowTop = true;
    if (focusRow > -1 &&
        focusCol > -1) {
        let destRow = rows[focusRow];
        let dest = destRow.cols[focusCol];
        let rowSpanned = dest['@:{end.row.index}'] - dest['@:{start.row.index}'] + 1;
        let colSpanned = dest['@:{end.col.index}'] - dest['@:{start.col.index}'] + 1;
        let totalRowIndex = -1;
        let labelRowIndex = -1;
        let dataRowIndex = -1;
        let headRows = 0,
            labelRows = 0,
            footRows = 0,
            dataRows = 0;
        let ri = 0;
        for (let row of rows) {
            if (totalRowIndex != -1) {
                footRows++;
            }
            if (row.label) {
                if (!labelRows) {
                    labelRowIndex = ri;
                }
                labelRows++;
            } else if (row.total) {
                totalRowIndex = ri;
            } else if (row.data) {
                dataRows++;
            }
            if (labelRowIndex == -1) {
                headRows++;
            }
            ri++;
        }
        canInsertRowTop = canInsertRowBottom = dest['@:{start.row.index}'] > totalRowIndex || dest['@:{end.row.index}'] < totalRowIndex;

        dataRowIndex = labelRowIndex + labelRows;
        canSplitV = dest['@:{end.row.index}'] < dataRowIndex ||
            dest['@:{start.row.index}'] > totalRowIndex;
        //canInsertRowTop = dest['@:{end.row.index}'] <= labelRowIndex ||
        //dest['@:{start.row.index}'] > totalRowIndex;
        canSplitH = canSplitV;
        //canInsertRowBottom = dest['@:{end.row.index}'] < labelRowIndex ||
        //dest['@:{start.row.index}'] >= totalRowIndex;;
        canDeleteRow = rowSpanned < rowMax &&
            ((headRows > 1 && dest['@:{end.row.index}'] < labelRowIndex && rowSpanned < headRows) ||
                (labelRows > 1 && dest['@:{start.row.index}'] >= labelRowIndex && rowSpanned < labelRows && dest['@:{end.row.index}'] < dataRowIndex) ||
                (footRows > 1 && dest['@:{start.row.index}'] > totalRowIndex && rowSpanned < footRows) ||
                (dataRows > 1 && rowSpanned < dataRows && dest['@:{start.row.index}'] >= dataRowIndex && dest['@:{end.row.index}'] < totalRowIndex));
        canDeleteCol = colSpanned < colMax;
        let maxRowIndex = dest['@:{end.row.index}'] + 1,
            maxColIndex = dest['@:{end.col.index}'] + 1;
        for (let rowIndex = 0; rowIndex <= maxRowIndex; rowIndex++) {
            for (let colIndex = 0; colIndex <= maxColIndex; colIndex++) {
                let row = rows[rowIndex];
                if (row) {
                    let cell = row.cols[colIndex];
                    if (cell &&
                        cell != dest) {
                        if (cell['@:{start.col.index}'] == dest['@:{start.col.index}'] &&
                            cell['@:{end.col.index}'] == dest['@:{end.col.index}']) {
                            if (cell['@:{end.row.index}'] + 1 == dest['@:{start.row.index}']) {
                                canMergeTop = true;
                            } else if (dest['@:{end.row.index}'] + 1 == cell['@:{start.row.index}']) {
                                canMergeBottom = true;
                            }
                        }
                        if (cell['@:{start.row.index}'] == dest['@:{start.row.index}'] &&
                            cell['@:{end.row.index}'] == dest['@:{end.row.index}']) {
                            if (cell['@:{end.col.index}'] + 1 == dest['@:{start.col.index}']) {
                                canMergeLeft = true;
                            } else if (dest['@:{end.col.index}'] + 1 == cell['@:{start.col.index}']) {
                                canMergeRight = true;
                            }
                        }
                    }
                }
            }
        }
        canMergeLeft = canMergeLeft && canSplitV;
        canMergeRight = canMergeRight && canSplitV;
        canMergeTop = canMergeTop &&
            (dest['@:{start.row.index}'] < labelRowIndex ||
                (dest['@:{start.row.index}'] > labelRowIndex && dest['@:{end.row.index}'] < dataRowIndex) ||
                dest['@:{start.row.index}'] > totalRowIndex + 1);
        canMergeBottom = canMergeBottom &&
            (dest['@:{end.row.index}'] < labelRowIndex - 1 ||
                (dest['@:{start.row.index}'] >= labelRowIndex && dest['@:{end.row.index}'] < dataRowIndex - 1) ||
                dest['@:{start.row.index}'] > totalRowIndex);
    }
    return {
        '@:{table.cell#can.delete.row}': canDeleteRow,
        '@:{table.cell#can.delete.col}': canDeleteCol,
        '@:{table.cell#can.mrege.left}': canMergeLeft,
        '@:{table.cell#can.merge.top}': canMergeTop,
        '@:{table.cell#can.merge.right}': canMergeRight,
        '@:{table.cell#can.merge.bottom}': canMergeBottom,
        '@:{can.insert.row.bottom}': canInsertRowBottom,
        '@:{can.insert.row.top}': canInsertRowTop,
        '@:{can.split.h}': canSplitH,
        '@:{can.split.v}': canSplitV
    };
}
export default View.extend({
    tmpl: '@:./operate.html',
    assign(data) {
        TableProvider["@:{table.provider#add.ext.meta}"](data.props, 1);
        let state = queryCellStatus(data.props);
        this.set({
            props: data.props,
            disabled: data.disabled,
            splitH: state["@:{can.split.h}"],
            splitV: state["@:{can.split.v}"],
            bottomRow: state["@:{can.insert.row.bottom}"],
            topRow: state["@:{can.insert.row.top}"],
            deleteRow: state["@:{table.cell#can.delete.row}"],
            deleteCol: state["@:{table.cell#can.delete.col}"],
            mergeLeft: state["@:{table.cell#can.mrege.left}"],
            mergeTop: state["@:{table.cell#can.merge.top}"],
            mergeRight: state["@:{table.cell#can.merge.right}"],
            mergeBottom: state["@:{table.cell#can.merge.bottom}"]
        });
    },
    render() {
        this.digest();
    },
    '@:{add.row}<click>'(e) {
        let { to } = e.params;
        let props = this.get('props');
        let { focusRow, focusCol, rows } = props;
        let scale = State.get('@:{global#stage.scale}');
        if (focusRow != -1 &&
            focusCol != -1) {
            let currentRow = rows[focusRow];
            let dest = currentRow.cols[focusCol];
            let startIndx = dest['@:{start.col.index}'];
            let index = to == 'top' ? focusRow : dest['@:{end.row.index}'] + 1;
            TableProvider["@:{table.provider#insert.row.at}"](props, index, getDefaultProps(), Const['@:{const#to.unit}'](defaultCellHeight * scale));
            TableProvider["@:{table.provider#add.ext.meta}"](props);
            props.focusRow = index;
            dest = rows[index];
            for (let c of dest.cols) {
                if (c['@:{start.col.index}'] >= startIndx) {
                    props.focusCol = c['@:{col.index}'];
                    break;
                }
            }
            let findLabelRow = 0;
            let findTotalRow = 0;
            for (let row of rows) {
                if (row.total) {
                    findTotalRow = 1;
                    continue;
                } else if (row.label) {
                    findLabelRow = 1;
                    continue;
                }
                if (findLabelRow) {
                    if (!findTotalRow) {
                        row.data = true;
                    } else {
                        row.foot = true;
                    }
                } else {
                    row.head = true;
                }
            }
            dispatch(this.root, 'change', {
                use: 'rows',
                isOperate: 1,
                isSize: 1,
                rows
            });
        }
    },
    '@:{add.col}<click>'(e) {
        let { to } = e.params;
        let props = this.get('props');
        let { focusRow, focusCol, rows } = props;
        let scale = State.get('@:{global#stage.scale}');
        if (focusRow != -1 &&
            focusCol != -1) {
            let dest = rows[focusRow].cols[focusCol];
            //let startIndx = dest['@:{start.col.index}'];
            let index = to == 'left' ? focusCol : dest['@:{end.col.index}'] + 1;
            TableProvider["@:{table.provider#insert.col.at}"](props, index, getDefaultProps(), Const['@:{const#to.unit}'](defaultCellWidth * scale));
            TableProvider["@:{table.provider#add.ext.meta}"](props);
            dest = rows[focusRow];
            if (to != 'left') {
                //let ci = 0;
                for (let c of dest.cols) {
                    if (c['@:{start.col.index}'] >= index) {
                        props.focusCol = c['@:{col.index}'];
                        break;
                    }
                }
            } else {
                props.focusCol = index;
            }
            dispatch(this.root, 'change', {
                use: 'rows',
                isOperate: 1,
                isSize: 1,
                rows
            });
        }
    },
    '@:{del.row}<click>'() {
        let props = this.get('props');
        let { focusRow, focusCol, rows } = props;
        if (focusRow != -1 &&
            focusCol != -1) {
            TableProvider["@:{table.provider#delete.row}"](props);
            TableProvider["@:{table.provider#add.ext.meta}"](props);
            props.focusCol = 0;
            if (focusRow >= props['@:{row.max}']) {
                props.focusRow = props['@:{row.max}'] - 1;
            }
            dispatch(this.root, 'change', {
                use: 'rows',
                isOperate: 1,
                isSize: 1,
                rows
            });
        }
    },
    '@:{del.col}<click>'() {
        let props = this.get('props');
        let { focusRow, focusCol, rows } = props;
        let max = this.get('mmax');
        if (focusRow != -1 &&
            focusCol != -1) {
            TableProvider["@:{table.provider#delete.col}"](props);
            TableProvider["@:{table.provider#add.ext.meta}"](props);
            props.focusCol = max(0, props.focusCol - 1);
            dispatch(this.root, 'change', {
                use: 'rows',
                isOperate: 1,
                isSize: 1,
                rows
            });
        }
    },
    '@:{merge.cell}<click>'(e) {
        let { to } = e.params;
        let props = this.get('props');
        let { focusRow, focusCol, rows } = props;
        if (focusRow != -1 &&
            focusCol != -1) {
            TableProvider["@:{table.provider#merge.cell}"](props, to);
            TableProvider["@:{table.provider#add.ext.meta}"](props);
            dispatch(this.root, 'change', {
                use: 'rows',
                isOperate: 1,
                isSize: 1,
                rows
            });
        }
    },
    '@:{split.cell}<click>'(e) {
        let props = this.get('props');
        let { focusRow, focusCol, rows } = props;
        let scale = State.get('@:{global#stage.scale}');
        if (focusRow != -1 &&
            focusCol != -1) {
            let { h } = e.params;
            let min = Const['@:{const#to.unit}'](minCellSize * scale);
            TableProvider["@:{table.provider#split.cell}"](props, h, getDefaultProps(), min, min);
            TableProvider["@:{table.provider#add.ext.meta}"](props);
            dispatch(this.root, 'change', {
                use: 'rows',
                isOperate: 1,
                isSize: 1,
                rows
            });
        }
    }
});