/*
    author:https://github.com/xinglie
*/
/**
 * 显示对齐辅助线的view
 */
import Magix from 'magix5';
let { State, View } = Magix;
export default View.extend({
    tmpl: '@:align.html',
    init() {
        let update = e => {
            this.digest({
                x: e.x,
                y: e.y
            });
        };
        State.on('@:{event#stage.snap.element.find}', update);
        this.on('destroy', () => {
            State.off('@:{event#stage.snap.element.find}', update);
        });
    },
    render() {
        this.digest({
            dpr: State.get('@:{global#env.dpr}'),
        });
    }
});