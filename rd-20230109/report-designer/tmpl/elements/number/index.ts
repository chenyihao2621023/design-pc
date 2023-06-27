/*
    author:https://github.com/xinglie
*/
import TextIndexView from '../text/index';
let holderReg = /\{#\}/g;
let { pow } = Math;
export default TextIndexView.extend({
    tmpl: '@:./index.html',
    assign(data) {
        let { props } = data;
        let { text, ext, } = props;
        if (ext._fill) {
            let padLen = 0,
                code;
            if (ext.pad) {
                let max;
                if (ext.fx == 'AP') {
                    max = ext.start + (ext._total - 1) * ext.step;
                } else if (ext.fx == 'GP') {
                    max = ext.start * pow(ext.step, ext._total);
                }
                padLen = (max + '').length;
            }
            let index = ext._index;
            if (ext.reverse) {
                index = ext._total - index - 1;
            }
            if (ext.fx == 'AP') {
                code = ext.start + index * ext.step;
            } else if (ext.fx == 'GP') {
                code = ext.start * pow(ext.step, index);
            }
            if (ext.pad) {
                code = (code + '').padStart(padLen, '0');
            }
            text = text.replace(holderReg, code);
        }
        this.set(data, {
            text,
        });
        this['@:{set.border}'](props);
    },
});