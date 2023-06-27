/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../../designer/const';
export default Magix.View.extend({
    tmpl: '@:index.html',
    assign(data) {
        let { props, unit } = data;
        let { width, height, mod1X } = props;
        width = Const['@:{const#to.px}'](width);
        height = Const['@:{const#to.px}'](height);
        let cy = height / 2;
        let inner = mod1X * width;
        let path = 'M0,0';
        path += 'A' + width + ',' + cy + ',0 0 1 0,' + height;
        path += 'A' + inner + ',' + cy + ',0 0 0 0 0z';
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