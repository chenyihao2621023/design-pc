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
    '@:{add.rule}<click>'({ params, metaKey, ctrlKey }: Magix5.MagixPointerEvent) {
        let { rules } = params;
        let rule = {
            image: '',
            mx: false,
            my: false,
            link: ''
        };
        if (metaKey || ctrlKey) {
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
    '@:{update.textarea}<input>'(e) {
        this['@:{stop.propagation}'](e);
        let { rules, at } = e.params;
        let rule = rules[at];
        rule.link = e.eventTarget.value;
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