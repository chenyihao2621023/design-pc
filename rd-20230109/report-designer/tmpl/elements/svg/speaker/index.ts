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
        if (bind._data &&
            bind.fields?.length) {
            let src = bind._data;
            if (isArray(src)) {
                src = src[0];
            }
            let mutedField = bind.fields[0];
            if (mutedField?.key) {
                props.muted = src?.[mutedField.key];
            }
            let volumeField = bind.fields[1];
            if (volumeField?.key) {
                props.volume = src?.[volumeField.key];
            }
        }
        this.set(data);
    },
    render() {
        this.digest();
    }
});