/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../../designer/const';
let { State, View } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    init() {
        this.set({
            mu: Const['@:{const#to.unit}'](1),
            toPx: Const['@:{const#to.px}'],
            ox: State.get('@:{global#stage.page.x.offset}') || 0,
            oy: State.get('@:{global#stage.page.y.offset}') || 0,
        });
    },
    assign(data) {
        this.set(data);
    },
    render() {
        this.digest();
    }
});