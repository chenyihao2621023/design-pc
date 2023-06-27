import Magix from 'magix';
import Const from '../designer/const';
let { View, State } = Magix;
export default View.extend({
    tmpl: '@:./index.html',
    init() {
        //设置全局数据
        State.set({
            '@:{global#stage.unit}': Const['@:{const#unit}'],
        });
        let pageCtrl = State.get('@:{global#stage.page.ctrl}');
        State.set({
            '@:{global#env.dpr}': devicePixelRatio,
            '@:{global#stage.page}': pageCtrl['@:{get.props}'](),
            '@:{global#stage.scale}': Const['@:{const#stage.scale}'],
            '@:{global#stage.elements}': [],
            '@:{global#stage.select.elements}': [],
            '@:{global#stage.elements.groups}': {},
            '@:{global#stage.elements.groups.linked}': false,
            '@:{global#stage.x.help.lines}': [],
            '@:{global#stage.y.help.lines}': [],
            '@:{global#stage.clipboard}': {}
        });
    },
    render() {
        this.digest();
    }
});