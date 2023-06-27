/*
    author:https://github.com/xinglie
*/
'ref@:../index.less';
import Const from '../../designer/const';
import Dragdrop from '../../gallery/mx-dragdrop/index';
import HodBaseProvider from '../../provider/hodbase';
import HodFlex from '../../provider/hodflex';
import IndexView from './index';
export default IndexView.extend({
    tmpl: '@:dshow.html',
    init() {
        this.set({
            toPx: Const['@:{const#to.px}'],
            toUnit: Const['@:{const#to.unit}'],
        })
    },
}).merge(Dragdrop, HodBaseProvider, HodFlex);