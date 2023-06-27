/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { View, isArray } = Magix;
export default Magix.View.extend({
    tmpl: '@:index.html',
    assign(data) {
        let { props } = data;
        let { bind } = props;
        let text = '';
        if (bind.id) {
            let bindField = bind.fields[0];
            if (bind._tip) {
                text = bind._tip;
            } else if (bind._data) {
                let src = bind._data;
                if (isArray(src)) {
                    src = src[0];
                }
                props.image = src[bindField.key];
            } else if (this['@:{has.contents}']) {
                text = `[绑定:${bindField.name}]`;
            }
        }
        this.set(data, {
            text
        });
    },
    render() {
        this.digest();
    }
});