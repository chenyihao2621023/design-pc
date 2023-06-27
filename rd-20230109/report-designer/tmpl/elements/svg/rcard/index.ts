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
        let { width, height, mod1X, mod2Y } = props;
        let pxOfWidth = Const['@:{const#to.px}'](width),
            pxOfHeight = Const['@:{const#to.px}'](height);
        let x = pxOfWidth * mod1X;
        let y = pxOfHeight * mod2Y;
        path += x + ' 0';
        path += 'L' + pxOfWidth + ' 0';
        path += 'L' + pxOfWidth + ' ' + pxOfHeight;
        path += 'L0 ' + pxOfHeight;
        path += 'L0 ' + y + 'z';
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