/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
export default Magix.View.extend({
    tmpl: '@:dshow.html',
    assign(data) {
        this.set(data);
    },
    render() {
        this.digest();
    },
});