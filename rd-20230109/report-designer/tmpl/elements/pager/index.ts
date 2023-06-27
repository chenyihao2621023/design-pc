/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import TextIndexView from '../text/index';
let { has } = Magix;
let wrapReg = /\$\{([a-zA-z0-9_]+)\}/g;
export default TextIndexView.extend({
    assign(data) {
        let { props } = data;
        let { text, ext, } = props;
        if (ext._totalPage == null) {
            ext._totalPage = 'Y';
        }
        if (ext._currentPage == null) {
            ext._currentPage = 'X';
        }
        text = text.replace(wrapReg, (_, $1) => {
            let k = '_' + $1;
            return has(ext, k) ? ext[k] : _;
        });
        this.set(data, {
            text
        });
        this['@:{set.text.decoration}'](props);
        this['@:{set.border}'](props);
    },
});