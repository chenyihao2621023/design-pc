/*
    author:https://github.com/xinglie
*/
import StageGeneric from '../../designer/generic';
import DHistory from '../../designer/history';
import StageSelection from '../../designer/selection';
import Index from './index';
let Base = Index.prototype;
export default Index.extend({
    '@:{update.size}'() {
        Base['@:{update.size}'].call(this);
        let element = this.get('element');
        StageGeneric['@:{generic#update.stage.element}'](element, '@:{size}');
        let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
        DHistory['@:{history#save}'](DHistory['@:{history#element.modified.props}'], ename);
    },
    '@:{change.task.status}<change>'(e) {
        Base['@:{change.task.status}<change>'].call(this, e);
        let element = this.get('element');
        let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
        DHistory['@:{history#save}'](DHistory['@:{history#element.modified.props}'], ename);
    },
    '@:{stop}<pointerdown,contextmenu>'(e: PointerEvent) {
        Base['@:{stop}<pointerdown,contextmenu>'].call(this, e);
        let element = this.get('element');
        if (element &&
            StageSelection["@:{selection#set}"](element)) {
            let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
            DHistory["@:{history#save}"](DHistory['@:{history#element.get.focus}'], ename);
        }
    }
});