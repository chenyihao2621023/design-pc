/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import FormatProvider from '../../provider/format';
import GenericProvider from '../../provider/generic';
let firstToUppercase = str => {
    str += '';
    if (str.length) {
        return str[0].toUpperCase() + str.substring(1);
    }
    return str;
};
export default Magix.View.extend({
    tmpl: '@:index.html',
    init() {
        this.set({
            td: GenericProvider['@:{generate.text.decoration}'],
            format: FormatProvider["@:{format}"].bind(FormatProvider),
            toPx: Const['@:{const#to.px}'],
            toUnit: Const['@:{const#to.unit}'],
            ftu: firstToUppercase,
        });
    },
    assign(data) {
        this.set(data);
    },
    render() {
        this.digest();
    },
});