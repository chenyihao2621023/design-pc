import Magix from 'magix5';
let { View, dispatch } = Magix;
export default View.extend({
    tmpl: '@:./border.html',
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
            rows,
            cell,
            props,
            disabled
        });
    },
    render() {
        this.digest();
    },
    '@:{toggle.border}<click>'(e) {
        let rows = this.get('rows');
        let cell = this.get('cell');
        let key = 'b' + e.params.to;
        cell[key] = !cell[key];
        dispatch(this.root, 'change', {
            use: 'rows',
            rows
        });
    },
})