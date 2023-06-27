/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { View, isArray } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    '@:{set.value.and.text}'({ props }) {
        let { bind, value, } = props;
        let text = '';
        if (bind.id) {
            let bindField = bind.fields[0];
            if (bind._tip) {
                text = bind._tip;
                value = 60;
            } else if (bind._data) {
                let src = bind._data;
                if (isArray(src)) {
                    src = src[0];
                }
                value = src[bindField.key];
                if (isNaN(value) ||
                    !isFinite(value)) {
                    value = 0;
                }
                if (value < 0) {
                    value = 0;
                } else if (value > 100) {
                    value = 100;
                }
            } else if (this['@:{from.desinger}']) {
                text = `[绑定:${bindField.name}]`;
            }
        }
        this.set({
            value,
            text
        });
        return value;
    },
    assign(data) {
        this.set(data);
        this['@:{set.value.and.text}'](data);
    },
    render() {
        this.digest();
    }
});