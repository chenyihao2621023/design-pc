/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
let { applyStyle, View, dispatch } = Magix;
applyStyle('@:./index.less');
export default View.extend({
    tmpl: '@:./index.html',
    assign(data) {
        let { props, defined, disabled } = data;
        this.set({
            disabled,
            min: defined.min,
            max: defined.max,
            step: () => Const["@:{const#unit.step}"](),
            fixed: () => Const["@:{const#unit.fixed}"](),
            columns: props[defined.key],
            fields: props.bind.fields ?? []
        });
    },
    '@:{notify.change}'() {
        let columns = this.get('columns');
        //console.log(columns, this.root.parentNode);
        dispatch(this.root, 'change', {
            use: 'columns',
            columns
        });
    },
    render() {
        this.digest();
        //this['@:{notify.change}']();
    },
    '@:{update.width}<input>'(e: KeyboardEvent & Magix5.MagixKeyboardEvent & {
        value: number
    }) {
        this['@:{stop.propagation}'](e);
        let columns = this.get('columns');
        let { id } = e.params;
        columns[id] = e.value;
        this['@:{notify.change}']();
    }
});