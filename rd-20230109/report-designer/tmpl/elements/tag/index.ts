/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { View, applyStyle, isArray, isObject } = Magix;
applyStyle('@:./index.less');
export default View.extend({
    tmpl: '@:index.html',
    assign(data) {
        let { props } = data;
        let { words = [], bind } = props;
        if (bind?.id &&
            bind.fields.length &&
            bind._data) {
            words.length = 0;
            let source = bind._data;
            let key = bind.fields[0].key;
            if (!isArray(source)) {
                source = [source];
            }
            for (let e of source) {
                let dest = e[key];
                if (isObject(dest)) {
                    words.push(dest);
                }
            }
        }
        this.set(data);
    },
    render() {
        this.digest();
    }
});