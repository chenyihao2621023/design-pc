/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Tranform from '../../designer/transform';
import CellProvider from '../../provider/cell';
import TableProvider from '../../provider/table';
let { View, dispatch, State } = Magix;
export default View.extend({
    tmpl: '@:./size.html',
    init() {
        this.set({
            mw: cell => Const["@:{const#to.unit}"](CellProvider["@:{cell#min.width}"] * (cell.colspan || 1)),
            mxw: cell => Const["@:{const#to.unit}"](CellProvider['@:{cell#max.width}'] * (cell.colspan || 1)),
            mh: cell => Const["@:{const#to.unit}"](CellProvider["@:{cell#min.height}"] * (cell.rowspan || 1)),
            mxh: cell => Const["@:{const#to.unit}"](CellProvider["@:{cell#max.height}"] * (cell.rowspan || 1)),
            step: () => Const["@:{const#unit.step}"](),
            fixed: () => Const["@:{const#unit.fixed}"](),
            read: Tranform["@:{transform#to.show.value}"]
        });
    },
    assign(data) {
        let { props, disabled } = data;
        let { rows, focusRow, focusCol } = props;
        if (focusRow == -1) {
            focusRow = 0;
        }
        if (focusCol == -1) {
            focusCol = 0;
        }
        let cell = rows[focusRow].cols[focusCol];
        this.set({
            //useAH: defined['@:{auto.height}'],
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
    '@:{update.cell}<input>'(e) {
        this['@:{stop.propagation}'](e);
        let { props, rows, cell, mw, mh, mxw, mxh, mmax, mmin } = this.get();
        let { k } = e.params;
        let r = cell.width / cell.height;
        cell[k] = Tranform["@:{transform#to.real.value}"](e.value);
        if (State.get('@:{global#stage.element.keep.ratio}')) {
            if (k == 'width') {
                cell.height = cell.width / r;
                let h = mh(cell);
                if (cell.height < h) {
                    cell.height = h;
                    cell.width = h * r;
                } else {
                    h = mxh(cell);
                    if (cell.height > h) {
                        cell.height = h;
                        cell.width = h * r;
                    }
                }
            } else {
                cell.width = cell.height * r;
                let w = mw(cell);
                if (cell.width < w) {
                    cell.width = w;
                    cell.height = w * r;
                } else {
                    w = mxw(cell);
                    if (cell.width > w) {
                        cell.width = w;
                        cell.height = w * r;
                    }
                }
            }
        }
        TableProvider["@:{table.provider#update.cell.size}"](props, cell);
        dispatch(this.root, 'change', {
            use: 'rows',
            pkey: 'rows',
            isSize: 1,
            rows
        });
    },
    // '@:{update.auto.height}<change>'(e) {
    //     let rows = this.get('rows');
    //     let cell = this.get('cell');
    //     let checked = e.eventTarget.checked;
    //     cell.fixedHeight = !checked;
    //     dispatch(this.root, 'change', {
    //         use: 'rows',
    //         isSize: 1,
    //         rows
    //     });
    // }
});