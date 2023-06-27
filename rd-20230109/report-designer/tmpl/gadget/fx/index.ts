/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { floor, random } = Math;
let { View, dispatch } = Magix;
let LineTypes = [{
    text: '线',
    value: 'interval'
}, {
    text: '散点',
    value: 'scatter'
}];
let Colors = ['d81e06', 'f4ea2a', '1afa29', '1296db', '13227a', 'd4237a', '707070', '515151', '2c2c2c', '000000', 'ea986c', 'eeb174', 'f3ca7e', 'f9f28b', 'c8db8c', 'aad08f', '87c38f', '83c6c2', '7dc5eb', '87a7d6', '8992c8', 'a686ba', 'bd8cbb', 'be8dbd', 'e89abe', 'e8989a', 'e16632', 'e98f36', 'efb336', 'f6ef37', 'afcd51', '7cba59', '36ab60', '1baba8', '17ace3', '3f81c1', '4f68b0', '594d9c', '82529d', 'a4579d', 'db649b', 'dd6572', 'd84e06', 'e0620d', 'ea9518', 'f4ea2a', '8cbb1a', '2ba515', '0e932e', '0c9890', '1295db', '0061b2', '0061b0', '004198', '122179', '88147f', 'd3227b', 'd6204b'];
let Fx = ['x', 'sin(x)', 'cos(x)+5', 'sqrt(20-x*x)', 'x^3', 'x^4', 'x^3/3-2x^2+3x+2', 'x^2-4x+3'];
export default View.extend({
    tmpl: '@:./index.html',
    init() {
        this.set({
            lineTypes: LineTypes
        });
    },
    assign(extra) {
        let { disabled, props, defined } = extra;
        let data = props[defined.key];
        this.set({
            disabled,
            data
        });
    },
    render() {
        this.digest();
    },
    '@:{update.prop}<change,input>'(e) {
        this['@:{stop.propagation}'](e);
        let { i, native, key, use } = e.params;
        let data = this.get('data');
        let dest = data[i];
        let v = native ? e.eventTarget[native] : e[use];
        dest[key] = v;
        dispatch(this.root, 'change', {
            use: 'data',
            data
        });
    },
    '@:{update.range.setting}<change>'(e) {
        this['@:{stop.propagation}'](e);
        let { i } = e.params;
        let data = this.get('data');
        let dest = data[i];
        if (e.eventTarget.checked) {
            dest.range = [0, 100];
        } else {
            delete dest.range;
        }
        dispatch(this.root, 'change', {
            use: 'data',
            data
        });
    },
    '@:{update.samples.setting}<change>'(e) {
        this['@:{stop.propagation}'](e);
        let { i } = e.params;
        let data = this.get('data');
        let dest = data[i];
        if (e.eventTarget.checked) {
            dest.nSamples = 1000;
        } else {
            delete dest.nSamples;
        }
        dispatch(this.root, 'change', {
            use: 'data',
            data
        });
    },
    '@:{add.fx}<click>'() {
        let data = this.get('data');
        data.push({
            color: '#' + Colors[floor(random() * Colors.length)],
            fn: Fx[floor(random() * Fx.length)],
            graphType: 'interval',
            closed: false
        });
        dispatch(this.root, 'change', {
            use: 'data',
            data
        });
    },
    '@:{remove.fx}<click>'(e) {
        let { i } = e.params;
        let data = this.get('data');
        data.splice(i, 1);
        dispatch(this.root, 'change', {
            use: 'data',
            data
        });
    },
});