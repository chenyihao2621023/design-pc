/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../../designer/const';
export default Magix.View.extend({
    tmpl: '@:index.html',
    assign(data) {
        let { props, unit } = data;
        let { width, height, mod1Y } = props;
        width = Const['@:{const#to.px}'](width);
        height = Const['@:{const#to.px}'](height);
        let y = height * mod1Y;
        if (y > width) {
            y = width;
        }
        let path1 = `M${y},0L${width},0L${width - y},${y}L0,${y}z`;

        let path2 = `M0,${y}L0,${height}L${width - y},${height}L${width - y},${y}z`;

        let path3 = `M${width},0L${width},${height - y}L${width - y},${height}L${width - y},${y}z`;

        let path4 = `M0,${y}L0,${height}L${width - y},${height}L${width},${height - y}L${width},0L${y},0zM${width},0L${width - y},${y}L${width - y},${height}M${width - y},${y}L0,${y}`;
        this.set({
            unit,
            props,
            path1,
            path2,
            path3,
            path4
        });
    },
    render() {
        this.digest();
    }
});