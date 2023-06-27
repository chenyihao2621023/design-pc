/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { View, isArray } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    assign(data) {
        this.set(data);
    },
    render() {
        let props = this.get('props');
        let { bind } = props;
        if (bind &&
            bind._data) {
            let src = bind._data;
            if (isArray(src)) {
                src = src[0];
            }
            props.bwipValue = src[bind.fields[0].key];
        }
        this.digest();
    },
});