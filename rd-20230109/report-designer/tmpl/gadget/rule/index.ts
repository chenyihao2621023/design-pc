/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { View, dispatch } = Magix;
let numberGenerateMethods = [{
    text: '等差数列',
    value: 'AP'
}, {
    text: '等比数列',
    value: 'GP'
}];
export default View.extend({
    tmpl: '@:./index.html',
    assign(extra) {
        let { props, disabled } = extra;
        this.set({
            fxs: numberGenerateMethods,
            disabled,
            props
        });
    },
    render() {
        this.digest();
    },
    '@:{update.prop}<input,change>'(e) {
        let { ext } = this.get('props');
        let { key, use, native } = e.params;
        if (use || native) {
            let v = native ? e.eventTarget[native] : e[use];
            ext[key] = v;
        }
        dispatch(this.root, 'change', {
            use: 'ext',
            ext
        });
    }
});