/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { View, dispatch } = Magix;
export default View.extend({
    tmpl: '@:align.html',
    assign(data) {
        this.set(data);
    },
    render() {
        this.digest();
    },
    '@:{set}<click>'(e) {
        let me = this;
        if (!me.get('disabled')) {
            let { v } = e.params;
            let { key } = me.get('defined');
            dispatch(me.root, 'change', {
                use: key,
                [key]: v,
                pkey: key
            });
        }
    }
});