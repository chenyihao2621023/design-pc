/*
    author:https://github.com/xinglie
*/
import EBind from '../../provider/ebind';
import IndexView from './index';
export default IndexView.extend({
    tmpl: '@:dshow.html',
    '@:{has.contents}'({ text }) {
        return text;
    },
}).merge(EBind);