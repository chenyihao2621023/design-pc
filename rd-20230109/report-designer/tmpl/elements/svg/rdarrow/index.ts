/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../../designer/const';
export default Magix.View.extend({
    tmpl: '@:index.html',
    assign(data) {
        let { props, unit } = data;
        let path = 'M';
        let { width, height, mod1X, mod1Y } = props;
        width = Const['@:{const#to.px}'](width);
        height = Const['@:{const#to.px}'](height);
        let halfHeight = height / 2;
        let halfWidth = width / 2;
        let y = halfHeight * mod1Y,
            x = halfWidth * mod1X;
        path += '0 ' + halfHeight;
        path += 'L' + x + ' 0';
        path += 'L' + x + ' ' + y;
        path += 'L' + (width - x) + ' ' + y;
        path += 'L' + (width - x) + ' 0';
        path += 'L' + width + ' ' + halfHeight;
        path += 'L' + (width - x) + ' ' + height;
        path += 'L' + (width - x) + ' ' + (height - y);
        path += 'L' + x + ' ' + (height - y);
        path += 'L' + x + ' ' + height + 'z';
        // path += x + ' ' + y;
        // x = width * mod1X;
        // path += 'L' + x + ' ' + y;
        // path += 'L' + x + ' 0';
        // path += 'L' + width + ' ' + halfHeight;
        // path += 'L' + x + ' ' + height;
        // path += 'L' + x + ' ' + (height - y);
        // path += 'L0 ' + (height - y) + 'z';
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