/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { View, dispatch } = Magix;
let imageDefined = {
    key: 'image',
    im: 1
};
export default View.extend({
    tmpl: '@:./index.html',
    init() {
        this.set({
            idf: imageDefined,
        });
    },
    assign(data) {
        this.set(data);
    },
    render() {
        this.digest();
    },
    '@:{update.prop}<change>'(e) {
        this['@:{stop.propagation}'](e);
        let { rules, at } = e.params;
        let rule = rules[at];
        rule.image = e[e.use];
        dispatch(this.root, 'change', {
            use: 'rules',
            rules
        });
    },
    '@:{change.value}<change,input>'(e) {
        this['@:{stop.propagation}'](e);
        let { rules, at, key } = e.params;
        let rule = rules[at];
        rule[key] = e.value;
        dispatch(this.root, 'change', {
            use: 'rules',
            rules
        });
    },
    '@:{update.textarea}<input>'(e) {
        this['@:{stop.propagation}'](e);
        let { rules, at } = e.params;
        let rule = rules[at];
        rule.sval = e.eventTarget.value;
        dispatch(this.root, 'change', {
            use: 'rules',
            rules
        });
    },
    '@:{update.mirror}<change>'(e: Magix5.MagixPointerEvent) {
        this['@:{stop.propagation}'](e);
        let { eventTarget, params } = e;
        let target = eventTarget as HTMLInputElement;
        let { rules, at, key } = params;
        let rule = rules[at];
        rule[`m${key}`] = target.checked;
        dispatch(this.root, 'change', {
            use: 'rules',
            rules
        });
    }
});