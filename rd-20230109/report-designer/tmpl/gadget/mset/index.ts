/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { View, dispatch } = Magix;
export default View.extend({
    tmpl: '@:./index.html',
    assign(extra) {
        let { props, disabled, defined } = extra;
        let src = props[defined.key];
        let rules = [];
        if (src) {
            rules = src.split(defined.join);
        }
        this.set({
            defined,
            items: defined.items,
            rules,
            disabled,
        });
    },
    render() {
        this.digest();
    },
    '@:{update.prop}<click>'(e) {
        let rules = this.get('rules');
        let { key, join } = this.get('defined');
        let { rule } = e.params;
        let ri = rules.indexOf(rule);
        if (ri == -1) {
            rules.push(rule);
        } else {
            rules.splice(ri, 1);
        }
        dispatch(this.root, 'change', {
            use: key,
            pkey: key,
            [key]: rules.join(join)
        });
    }
});