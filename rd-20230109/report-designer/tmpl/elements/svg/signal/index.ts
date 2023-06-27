/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { View, isArray } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    assign(data) {
        let { props } = data;
        let { bind } = props;
        if (bind._data &&
            bind.fields?.length) {
            let src = bind._data;
            if (isArray(src)) {
                src = src[0];
            }
            let connectField = bind.fields[0];
            if (connectField?.key) {
                props.connected = src?.[connectField.key];
            }
            let strengthField = bind.fields[1];
            if (strengthField?.key) {
                props.strength = src?.[strengthField.key];
            }
        }
        this.set(data);
    },
    render() {
        this.digest();
    }
});