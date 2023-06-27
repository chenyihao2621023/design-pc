/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import CellProvider from '../../provider/cell';
let { View, dispatch, mix } = Magix;
let toUnits = ['height', 'borderLeftWidth', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth'];
let getCellProps = () => {
    let initialCell = {
        height: CellProvider["@:{cell#default.width}"],
        borderRadius: '0% 0% 0% 0%/0% 0% 0% 0%',
        borderLeftStyle: 'solid',
        borderLeftWidth: 1,
        borderLeftColor: '#000000',
        borderTopStyle: 'solid',
        borderTopWidth: 1,
        borderTopColor: '#000000',
        borderRightStyle: 'solid',
        borderRightWidth: 1,
        borderRightColor: '#000000',
        borderBottomStyle: 'solid',
        borderBottomWidth: 1,
        borderBottomColor: '#000000'
    };
    for (let e of toUnits) {
        initialCell[e] = Const['@:{const#to.unit}'](initialCell[e]);
    }
    return initialCell;
};
export default View.extend({
    tmpl: '@:./v-operate.html',
    assign(data) {
        let canDel = true;
        let canMergeTop = true;
        let canMergeBottom = true;
        let { props } = data;
        let { rows, focusRow, focusCol } = props;
        if (focusRow != -1 &&
            focusCol != -1) {
            if (rows.length == 1 &&
                rows[0].cols.length == 1) {
                canDel = false;
            }
            if (focusCol == 0) {
                canMergeTop = false;
            }
            let row = rows[focusRow];
            if (focusCol == row.cols.length - 1) {
                canMergeBottom = false;
            }
            this.set(data,{
                canMergeTop,
                canMergeBottom,
                canDel
            });
        }
    },
    render() {
        this.digest();
    },
    '@:{add.row}<click>'(e) {
        let { to } = e.params;
        let props = this.get('props');
        let { focusRow, rows } = props;
        if (focusRow != -1) {
            let index = to == 'left' ? focusRow : focusRow + 1;
            rows.splice(index, 0, {
                width: Const['@:{const#to.unit}'](CellProvider["@:{cell#default.height}"]),
                cols: [mix({
                    elements: []
                }, getCellProps())]
            });
            props.focusRow = index;
            props.focusCol = 0;
            dispatch(this.root, 'change', {
                use: 'rows',
                pkey: 'rows',
                isOperate: 1,
                rows
            });
        }
    },
    '@:{add.col}<click>'(e) {
        let { to } = e.params;
        let props = this.get('props');
        let { focusRow, focusCol, rows } = props;
        if (focusRow != -1 &&
            focusCol != -1) {
            let index = to == 'top' ? focusCol : focusCol + 1;
            let row = rows[focusRow];
            row.cols.splice(index, 0, mix({
                elements: []
            }, getCellProps()));
            props.focusCol = index;
            dispatch(this.root, 'change', {
                use: 'rows',
                pkey: 'rows',
                isOperate: 1,
                rows
            });
        }
    },
    '@:{del.cell}<click>'() {
        let props = this.get('props');
        let { focusRow, focusCol, rows } = props;
        if (focusRow != -1 &&
            focusCol != -1) {
            let row = rows[focusRow];
            row.cols.splice(focusCol, 1);
            if (!row.cols.length) {
                rows.splice(focusRow, 1);
                props.focusCol = 0;
            } else if (focusCol >= row.cols.length) {
                props.focusCol = row.cols.length - 1;
            }
            if (focusRow >= rows.length) {
                props.focusRow = rows.length - 1;
                props.focusCol = 0;
            }
            dispatch(this.root, 'change', {
                use: 'rows',
                pkey: 'rows',
                isOperate: 1,
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
            let index = to == 'top' ? focusCol - 1 : focusCol + 1;
            let row = rows[focusRow];
            let dest = row.cols[index];
            let src = row.cols[focusCol];
            dest.elements.push(...src.elements);
            dest.height += src.height;
            row.cols.splice(focusCol, 1);
            props.focusCol = to == 'top' ? index : index - 1;
            dispatch(this.root, 'change', {
                use: 'rows',
                pkey: 'rows',
                isOperate: 1,
                rows
            });
        }
    },
    '@:{split.cell}<click>'() {
        let props = this.get('props');
        let { focusRow, focusCol, rows } = props;
        if (focusRow != -1 &&
            focusCol != -1) {
            let row = rows[focusRow];
            let src = row.cols[focusCol];
            let max = this.get('mmax');
            let halfHeight = max(src.height / 2, Const['@:{const#to.unit}'](CellProvider["@:{min.width}"]));
            src.height = halfHeight;
            let destCell = mix({
                elements: []
            }, getCellProps());
            destCell.height = halfHeight;
            row.cols.splice(focusCol + 1, 0, destCell);
            dispatch(this.root, 'change', {
                use: 'rows',
                pkey: 'rows',
                isOperate: 1,
                rows
            });
        }
    }
});