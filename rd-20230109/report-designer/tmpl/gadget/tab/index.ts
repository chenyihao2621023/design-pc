/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { View, dispatch } = Magix;
export default View.extend({
    tmpl: '@:./index.html',
    assign(extra) {
        let { props, disabled } = extra;
        this.set({
            disabled,
            props
        });
    },
    render() {
        this.digest();
    },
    '@:{update.tab}<input>'(e: Magix5.MagixPointerEvent) {
        let { at } = e.params;
        let props = this.get('props');
        let items = props.rows;
        let row = items[0];
        row.cols[at].text = (e.eventTarget as HTMLInputElement).value;
        dispatch(this.root, 'change', {
            use: 'rows',
            rows: items
        });
    },
    '@:{remove.tab}<click>'(e: Magix5.MagixPointerEvent) {
        let { at } = e.params;
        let props = this.get('props');
        let items = props.rows;
        let activeTab = props.activeTab;
        let row = items[0];
        row.cols.splice(at, 1);
        if (activeTab >= row.cols.length) {
            props.activeTab = row.cols.length - 1;
            props.focusCol = props.activeTab;
            props.focusRow = 0;
        }
        dispatch(this.root, 'change', {
            use: 'rows',
            rows: items
        });
    },
    '@:{add.tab}<click>'() {
        let { rows } = this.get('props');
        let row = rows[0];
        let anchor = row.cols[0];
        row.cols.push({
            width: anchor.width,
            elements: [],
            text: 'New Tab'
        });
        dispatch(this.root, 'change', {
            use: 'rows',
            rows
        });
    }
});