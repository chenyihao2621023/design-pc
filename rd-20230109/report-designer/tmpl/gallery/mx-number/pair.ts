/*
    author:https://github.com/xinglie
*/
'ref@:./index.less';
import Magix from 'magix5';

let { View, dispatch } = Magix;
export default View.extend({
    tmpl: '@:./pair.html',
    assign(data) {
        if (!data.value) {
            data.value = [];
        }
        this.set(data);
    },
    render() {
        this.digest();
    },
    '@:{num.input}<input>'(e) {
        this['@:{stop.propagation}'](e);
        let { i } = e.params;
        let value = this.get('value');
        value[i] = e.value;
        dispatch(this.root, 'input', {
            pair: value
        });
    },
});