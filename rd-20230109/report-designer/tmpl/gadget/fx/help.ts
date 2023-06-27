/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { View, dispatch } = Magix;
let LineTypes = [{
    text: 'X轴',
    value: 'x'
}, {
    text: 'Y轴',
    value: 'y'
}];
export default View.extend({
    tmpl: '@:./help.html',
    init() {
        this.set({
            lineTypes: LineTypes
        });
    },
    assign(extra) {
        let { disabled, props, defined } = extra;
        let data = props[defined.key];
        this.set({
            disabled,
            data
        });
    },
    render() {
        this.digest();
    },
    '@:{update.line.type}<change>'(e) {
        this['@:{stop.propagation}'](e);
        let { i } = e.params;
        let data = this.get('data');
        let dest = data[i];
        if (e.value == 'x') {
            dest.x = dest.y;
            delete dest.y;
        } else {
            dest.y = dest.x;
            delete dest.x;
        }
        dispatch(this.root, 'change', {
            use: 'data',
            data
        });
    },
    '@:{update.line.value}<input>'(e) {
        this['@:{stop.propagation}'](e);
        let { i } = e.params;
        let data = this.get('data');
        let dest = data[i];
        if (dest.x != null) {
            dest.x = e.value;
        } else {
            dest.y = e.value;
        }
        dispatch(this.root, 'change', {
            use: 'data',
            data
        });
    },
    '@:{update.line.text}<input>'(e) {
        this['@:{stop.propagation}'](e);
        let { i } = e.params;
        let data = this.get('data');
        let dest = data[i];
        dest.text = e.eventTarget.value;
        dispatch(this.root, 'change', {
            use: 'data',
            data
        });
    },
    '@:{add.fx}<click>'() {
        let data = this.get('data');
        data.push({
            x: 1,
            text: ''
        });
        dispatch(this.root, 'change', {
            use: 'data',
            data
        });
    },
    '@:{remove.fx}<click>'(e) {
        let { i } = e.params;
        let data = this.get('data');
        data.splice(i, 1);
        dispatch(this.root, 'change', {
            use: 'data',
            data
        });
    },
});