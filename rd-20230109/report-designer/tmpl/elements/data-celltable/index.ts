/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import FormatProvider from '../../provider/format';
import GenericProvider from '../../provider/generic';
export default Magix.View.extend({
    tmpl: '@:index.html',
    init() {
        this.set({
            toUnit: Const['@:{const#to.unit}'],
            format: FormatProvider["@:{format}"].bind(FormatProvider),
            td: GenericProvider['@:{generate.text.decoration}'],
        });
    },
    assign(data) {
        this.set(data);
    },
    render() {
        this.digest();
    },
});