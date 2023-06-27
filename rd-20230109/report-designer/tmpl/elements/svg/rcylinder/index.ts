/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../../designer/const';
export default Magix.View.extend({
    tmpl: '@:index.html',
    assign(data) {
        let { props,unit } = data;
        let { width, height, mod1Y } = props;
        width = Const['@:{const#to.px}'](width);
        height = Const['@:{const#to.px}'](height);
        let halfHeight = height / 2;
        let cx = width / 2,
            cy = halfHeight / 2 * mod1Y;
        let path = 'M0,' + cy;
        path += 'L0,' + (height - cy);
        path += 'A' + cx + ',' + cy + ',0 0 0,' + width + ',' + (height - cy);
        path += 'L' + width + ',' + cy;
        path += 'A' + cx + ',' + cy + ',0 0 1,0,' + cy;

        this.set({
            unit,
            props,
            cx, cy,
            path
        });
    },
    render() {
        this.digest();
    }
});