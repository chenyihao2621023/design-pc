/*
    author:https://github.com/xinglie
*/
'ref@:./index.less';
import EBind from '../../provider/ebind';
import IndexView from './index';
export default IndexView.extend({
    tmpl: '@:dshow.html',
    '@:{has.contents}'({ words }) {
        return words?.length;
    },
}).merge(EBind);