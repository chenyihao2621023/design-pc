/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
export default Magix.View.extend({
    tmpl: '@:index.html',
    assign(data) {
        let { props } = data;
        let { borderTopWidth: btWidth,
            borderRightWidth: brWidth,
            borderBottomWidth: bbWidth,
            borderLeftWidth: blWidth,
            width, height } = props;
        let h = btWidth + bbWidth,
            w = brWidth + blWidth;
        if (h > height) {
            btWidth = btWidth / h * height;
            bbWidth = bbWidth / h * height;
        }
        if (w > width) {
            brWidth = brWidth / w * width;
            blWidth = blWidth / w * width;
        }
        this.set(data, {
            btWidth,
            brWidth,
            bbWidth,
            blWidth
        });
    },
    render() {
        this.digest();
    }
});