/*
    author:https://github.com/xinglie
*/
import EBind from '../../provider/ebind';
import IndexView from './index';
export default IndexView.extend({
    '@:{has.contents}'() {

    },
    tmpl: '@:dshow.html',
}).merge(EBind);