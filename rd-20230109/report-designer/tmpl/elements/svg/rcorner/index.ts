/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../../designer/const';
export default Magix.View.extend({
    tmpl: '@:index.html',
    assign(data) {
        let { props,unit } = data;
        let path = 'M';
        let { width, height, mod1Y, mod2X, mod2Y, mod3X } = props;
        let pxOfWidth = Const['@:{const#to.px}'](width),
            pxOfHeight = Const['@:{const#to.px}'](height);
        let halfHeight = pxOfHeight / 2;
        let halfWidth = pxOfWidth / 2;
        path += '0 0';
        path += 'L0 ' + pxOfHeight;
        path += 'L' + (mod2X * halfWidth) + ' ' + (pxOfHeight - mod1Y * halfHeight);
        path += 'L' + (mod2X * halfWidth) + ' ' + (mod2Y * halfHeight);
        path += 'L' + (pxOfWidth - mod3X * halfWidth) + ' ' + (mod2Y * halfHeight);
        path += 'L' + pxOfWidth + ' 0z';
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