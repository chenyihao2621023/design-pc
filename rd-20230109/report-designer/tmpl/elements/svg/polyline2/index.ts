/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../../designer/const';
import Transform from '../../../designer/transform';
let { State, View } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    init() {
        this.set({
            mu: Const['@:{const#to.unit}'](1),
        });
    },
    assign(data) {
        let { props, unit } = data;
        let { x, y } = props;
        let ox = State.get('@:{global#stage.page.x.offset}') || 0;
        let oy = State.get('@:{global#stage.page.y.offset}') || 0;
        x -= ox;
        y -= oy;
        let keyPoints = Transform['@:{transform#get.key.point}'](props);
        let path;
        for (let key of keyPoints) {
            let xValue = props[key + 'X'],
                yValue = props[key + 'Y'];
            if (path) {
                path += 'L'
            } else {
                path = 'M';
            }
            path += Const['@:{const#to.px}'](xValue - x) + ',' + Const['@:{const#to.px}'](yValue - y);
        }

        this.set({
            unit,
            props,
            path,
        });
    },
    render() {
        this.digest();
    }
});