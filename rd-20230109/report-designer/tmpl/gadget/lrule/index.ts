/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import GenericProvider from '../../provider/generic';
import Color from '../../designer/color';
let { View, dispatch } = Magix;
let cd = {
    key: 'colors',
    multi: 1
};
export default View.extend({
    tmpl: '@:./index.html',
    init() {
        this.set({
            cRules: GenericProvider['@:{generic#compare.rules}'],
            cd
        });
    },
    assign(data) {
        this.set(data);
    },
    render() {
        this.digest();
    },
    '@:{add.rule}<click>'({ params, ctrlKey, metaKey }: Magix5.MagixPointerEvent) {
        let { rules } = params;
        let rule = {
            use: '==',
            value: 0,
            colors: [Color['@:{c#random.color}']()],
            speed: 5,
        };
        if (ctrlKey || metaKey) {
            rules.unshift(rule);
        } else {
            rules.push(rule);
        }
        dispatch(this.root, 'change', {
            use: 'rules',
            rules
        });
    },
    '@:{remove.at}<click>'({ params }) {
        let { rules, at } = params;
        rules.splice(at, 1);
        dispatch(this.root, 'change', {
            use: 'rules',
            rules
        });
    },
    '@:{move.at}<click>'({ params }) {
        let { rules, at, d: direction } = params;
        let now = rules[at];
        rules[at] = rules[at + direction];
        rules[at + direction] = now;
        dispatch(this.root, 'change', {
            use: 'rules',
            rules
        });
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
});