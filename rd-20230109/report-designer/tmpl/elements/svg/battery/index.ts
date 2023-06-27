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
        if (bind?._data) {
            let src = bind._data;
            if (isArray(src)) {
                src = src[0];
            }
            let fields = bind.fields ?? [];
            let f = fields[0];
            if (f) {
                props.power = src[f.key];
            }
            f = fields[1];
            if (f) {
                props.charging = src[f.key];
            }
        }
        this.set(data);
    },
    render() {
        this.digest();
    }
});