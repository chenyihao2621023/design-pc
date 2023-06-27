/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Tranform from '../../designer/transform';
import CellProvider from '../../provider/cell';
import Const from '../../designer/const';
let { View, dispatch } = Magix;
export default View.extend({
    tmpl: '@:./v-size.html',
    init() {
        this.set({
            fixed: () => Const["@:{const#unit.fixed}"](),
            step: () => Const["@:{const#unit.step}"](),
            mw: () => Const["@:{const#to.unit}"](CellProvider["@:{min.width}"]),
            mh: () => Const["@:{const#to.unit}"](CellProvider["@:{min.height}"]),
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
            row: rows[focusRow],
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
    '@:{update.cell.height}<input>'(e) {
        this['@:{stop.propagation}'](e);
        let rows = this.get('rows');
        let cell = this.get('cell');
        cell.height = Tranform["@:{transform#to.real.value}"](e.value);
        dispatch(this.root, 'change', {
            use: 'rows',
            isSize: 1,
            rows
        });
    },
    '@:{update.row.width}<input>'(e) {
        this['@:{stop.propagation}'](e);
        let rows = this.get('rows');
        let row = this.get('row');
        row.width = Tranform["@:{transform#to.real.value}"](e.value);
        dispatch(this.root, 'change', {
            use: 'rows',
            isSize: 1,
            rows
        });
    }
});