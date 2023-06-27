/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import DHistory from '../../designer/history';
import StageGeneric from '../../designer/generic';
import StageSelection from '../../designer/selection';
let { View } = Magix;
export default View.extend({
    tmpl: '@:./dshow.html',
    assign(data) {
        this.set(data);
    },
    render() {
        this.digest();
    },
    '@:{update.value}<cmchange>'(e) {
        let props = this.get('props');
        if (props.text != e.value) {
            props.text = e.value;
        }
    },
    '@:{stop}<pointerdown,contextmenu>'(e: PointerEvent) {
        if (!e['@:{halt}']) {
            // let { target } = e;
            // if (target.id != `${this.id}_pv`) {
            e['@:{halt}'] = 1;
            let element = this.get('element');
            if (StageSelection["@:{selection#set}"](element)) {
                let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
                DHistory["@:{history#save}"](DHistory['@:{history#element.get.focus}'], ename);
            }
        }
        //}
    }
});