/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { View, dispatch } = Magix;
export default View.extend({
    tmpl: '@:./style.html',
    init() {
        this.set({
            defined: {
                key: 'borderRadius',
                scale: 1
            },
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
            disabled,
            cell,
            rows,
        });
    },
    render() {
        this.digest();
    },
    '@:{update.radius}<change>'(e) {
        this['@:{stop.propagation}'](e);
        let rows = this.get('rows');
        let cell = this.get('cell');
        let radius = e[e.use];
        cell.borderRadius = radius;
        dispatch(this.root, 'change', {
            use: 'rows',
            rows
        });
    },
    '@:{update.border}<change>'(e) {
        this['@:{stop.propagation}'](e);
        let rows = this.get('rows');
        dispatch(this.root, 'change', {
            use: 'rows',
            rows
        });
    },
});