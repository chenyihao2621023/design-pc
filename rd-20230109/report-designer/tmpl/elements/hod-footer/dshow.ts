/*
    author:https://github.com/xinglie
*/
'ref@:../index.less';
import Magix from 'magix5';
import Const from '../../designer/const';
import Dragdrop from '../../gallery/mx-dragdrop/index';
import HodBaseProvider from '../../provider/hodbase';
import HodFlex from '../../provider/hodflex';
let { View ,State} = Magix;
export default View.extend({
    tmpl: '@:dshow.html',
    init() {
        this.set({
            toPx: Const['@:{const#to.px}'],
            toUnit: Const['@:{const#to.unit}'],
        });
    },
    assign(data) {
        this.set(data);
    },
    render() {
        this.digest();
        State.fire('@:{event#stage.footer.}')
    },
}).merge(Dragdrop, HodBaseProvider,HodFlex);