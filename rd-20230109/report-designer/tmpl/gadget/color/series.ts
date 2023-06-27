/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Color from '../../designer/color';
let { applyStyle, View, dispatch } = Magix;
applyStyle('@:series.less');
export default View.extend({
    tmpl: '@:series.html',
    init() {
        this.set({
            max: 9
        });
    },
    assign({ props, defined, disabled }) {
        this.set({
            colors: props[defined.key],
            disabled,
            multi: defined.multi
        });
    },
    render() {
        this.digest();
    },
    '@:{dispatch}'() {
        dispatch(this.root, 'change', {
            use: 'colors'
        });
    },
    '@:{update.colors}<input>'(e) {
        let colors = this.get('colors');
        let { index } = e.params;
        colors[index] = e.color;
        this['@:{dispatch}']();
    },
    '@:{add.color}<click>'() {
        if (!this.get('disabled')) {
            let colors = this.get('colors');
            let max = this.get<number>('max');
            if (colors.length <= max) {
                let color = Color['@:{c#random.color}']();
                colors.push(color);
                this['@:{dispatch}']();
            }
        }
    },
    '@:{remove.color}<click>'(e) {
        if (!this.get('disabled')) {
            let colors = this.get('colors');
            let { index } = e.params;
            colors.splice(index, 1);
            this['@:{dispatch}']();
        }
    },
    '@:{random.color}<click>'(e) {
        if (!this.get('disabled')) {
            let colors = this.get('colors');
            let { index } = e.params;
            let color = Color['@:{c#random.color}']();
            colors[index] = color;
            this['@:{dispatch}']();
        }
    }
});