/*
    author:https://github.com/xinglie
*/
'ref@:../index.less';
import Magix from 'magix5';
import Const from '../../designer/const';
import StageGeneric from '../../designer/generic';
import DHistory from '../../designer/history';
import StageSelection from '../../designer/selection';
import Dragdrop from '../../gallery/mx-dragdrop/index';
import HodBaseProvider from '../../provider/hodbase';
import HodFlex from '../../provider/hodflex';
let { View, applyStyle } = Magix;
applyStyle('@:./index.less');
export default View.extend({
    tmpl: '@:dshow.html',
    init() {
        this.set({
            toPx: Const['@:{const#to.px}'],
            toUnit: Const['@:{const#to.unit}'],
        })
    },
    assign(data) {
        this.set(data);
    },
    render() {
        this.digest();
    },
    '@:{active.down}<pointerdown>'(e: Magix5.MagixPointerEvent) {
        e['@:{halt}'] = 1;
    },
    '@:{active.tab}<click>'(e: Magix5.MagixPointerEvent) {
        let { to } = e.params;
        let props = this.get('props');
        let element = this.get('element');
        if (to != props.activeTab) {
            props.activeTab = to;
            props.focusRow = 0;
            props.focusCol = to;
            StageSelection["@:{selection#set}"](element);
            StageGeneric['@:{generic#update.stage.element}'](element, '@:{active.tab}');
            let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
            DHistory["@:{history#save}"](DHistory['@:{history#element.modified.props}'], ename);
        } else if (StageSelection["@:{selection#set}"](element)) {
            let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
            DHistory["@:{history#save}"](DHistory['@:{history#element.get.focus}'], ename);
        }
    }
}).merge(Dragdrop, HodBaseProvider, HodFlex);