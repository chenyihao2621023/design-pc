/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { View } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    assign(data) {
        this.set(data);
    },
    render() {
        this.digest();
    }
});