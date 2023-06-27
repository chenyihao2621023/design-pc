/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
export default Magix.View.extend({
    tmpl: '@:index.html',
    assign(data) {
        let { props } = data;
        let { borderwidth: bw, width, height } = props;
        let min = this.get('mmin');
        let minSize = min(width, height);
        let half = minSize / 2;
        if (bw > half) {
            bw = half;
        }
        this.set(data, {
            bw
        });
    },
    render() {
        this.digest();
    }
});