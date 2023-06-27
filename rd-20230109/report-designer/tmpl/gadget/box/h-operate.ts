/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import CellProvider from '../../provider/cell';
let { View, dispatch, mix } = Magix;
let toUnits = ['width', 'borderLeftWidth', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth'];
let getCellProps = () => {
    let initialCell = {
        width: CellProvider['@:{cell#default.width}'],
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
    tmpl: '@:./h-operate.html',
    assign(data) {
        let canDel = true;
        let canMergeLeft = true;
        let canMergeRight = true;
        let { props } = data;
        let { rows, focusRow, focusCol } = props;
        if (focusRow != -1 &&
            focusCol != -1) {
            if (rows.length == 1 &&
                rows[0].cols.length == 1) {
                canDel = false;
            }
            if (focusCol == 0) {
                canMergeLeft = false;
            }
            let row = rows[focusRow];
            if (focusCol == row.cols.length - 1) {
                canMergeRight = false;
            }
            this.set(data, {
                canMergeLeft,
                canMergeRight,
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
            let index = to == 'top' ? focusRow : focusRow + 1;
            rows.splice(index, 0, {
                height: Const['@:{const#to.unit}'](CellProvider['@:{cell#default.height}']),
                cols: [mix({
                    elements: []
                }, getCellProps())]
            });
            props.focusRow = index;
            props.focusCol = 0;
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
        if (focusRow != -1 &&
            focusCol != -1) {
            let index = to == 'left' ? focusCol : focusCol + 1;
            let row = rows[focusRow];
            row.cols.splice(index, 0, mix({
                elements: []
            }, getCellProps()));
            props.focusCol = index;
            dispatch(this.root, 'change', {
                use: 'rows',
                isOperate: 1,
                isSize: 1,
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
            let index = to == 'left' ? focusCol - 1 : focusCol + 1;
            let row = rows[focusRow];
            let dest = row.cols[index];
            let src = row.cols[focusCol];
            dest.elements.push(...src.elements);
            dest.width += src.width;
            row.cols.splice(focusCol, 1);
            props.focusCol = to == 'left' ? index : index - 1;
            dispatch(this.root, 'change', {
                use: 'rows',
                isOperate: 1,
                isSize: 1,
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
            let halfWidth = max(src.width / 2, Const['@:{const#to.unit}'](CellProvider['@:{cell#min.width}']));
            src.width = halfWidth;
            let destCell = mix({
                elements: []
            }, getCellProps());
            destCell.width = halfWidth;
            row.cols.splice(focusCol + 1, 0, destCell);
            dispatch(this.root, 'change', {
                use: 'rows',
                isOperate: 1,
                isSize: 1,
                rows
            });
        }
    }
});