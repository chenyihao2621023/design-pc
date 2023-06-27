/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../../designer/const';
import Transform from '../../../designer/transform';
export default Magix.View.extend({
    tmpl: '@:index.html',
    assign(data) {
        let { props, unit } = data;
        let path = 'M';
        let { width, height, mod1X, mod1Y, stail } = props;
        let pxOfWidth = Const['@:{const#to.px}'](width);
        let pxOfHeight = Const['@:{const#to.px}'](height);
        let halfHeight = pxOfHeight / 2;
        let x = 0,
            y = halfHeight * mod1Y;
        path += x + ' ' + y;
        x = pxOfWidth * mod1X;
        path += 'L' + x + ' ' + y;
        path += 'L' + x + ' 0';
        path += 'L' + pxOfWidth + ' ' + halfHeight;
        path += 'L' + x + ' ' + pxOfHeight;
        path += 'L' + x + ' ' + (pxOfHeight - y);
        path += `L0 ${pxOfHeight - y}`;
        if (stail) {
            let { k } = Transform['@:{transform#get.linear.equation.by.point}'](x, 0, pxOfWidth, halfHeight);
            let innerX = (halfHeight - y) / k;
            path += `L${innerX} ${halfHeight}`;
        }
        path += 'z';
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