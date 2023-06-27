/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../../designer/const';
export default Magix.View.extend({
    tmpl: '@:index.html',
    init() {
        this.set({
            toPx: Const['@:{const#to.px}'],
        });
    },
    assign(data) {
        this.set(data);
    },
    render() {
        this.digest();
    }
});