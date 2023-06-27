/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { State, View } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    init() {
        this.set({
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