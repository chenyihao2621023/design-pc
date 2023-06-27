/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../../designer/const';
import Transform from '../../../designer/transform';
let { State, View } = Magix;
let getPath = props => {
    let ox = State.get('@:{global#stage.page.x.offset}') || 0;
    let oy = State.get('@:{global#stage.page.y.offset}') || 0;
    let keyPoints = Transform['@:{transform#get.key.point}'](props);
    let first = 0, path = [];
    for (let kp of keyPoints) {
        path.push(first ? 'L' : 'M');
        first = 1;
        path.push(`${Const['@:{const#to.px}'](props[kp + 'X'] - props.x + ox)} ${Const['@:{const#to.px}'](props[kp + 'Y'] - props.y + oy)}`);
    }
    path.push('z');
    return path.join('');
};
export default View.extend({
    tmpl: '@:index.html',
    assign(data) {
        let { props, unit } = data;
        let path = getPath(props);
        this.set({
            unit,
            props,
            path
        });
    },
    render() {
        this.digest();
    }
});