/**
 * 普通元素通用数据绑定
 */
import Magix from 'magix5';
import DHistory from '../designer/history';
import StageGeneric from '../designer/generic';
import StageSelection from '../designer/selection';
import Dragdrop from '../gallery/mx-dragdrop/index';
let { State } = Magix;
export default {
    '@:{when.data.field.enter}<dragenter>'(e) {
        let props = this.get('props');
        if (!props.locked &&
            !this['@:{has.contents}']?.(props)) {
            e['@:{halt}'] = 1;
            if (Dragdrop['@:{is.dragenter}'](this)) {
                let src = State.get('@:{global#bind.field.drag.data}');
                if (src) {
                    this.digest({
                        enter: 1
                    });
                }
            }
        }
    },
    '@:{when.data.field.leave}<dragleave>'(e) {
        let enter = this.get('enter');
        if (Dragdrop['@:{is.dragleave}'](this)) {
            if (enter) {
                this.digest({
                    enter: 0
                });
            }
        }
    },
    '@:{when.data.field.drop}<drop>&{passive:false}'(e) {
        this['@:{prevent.default}'](e);
        Dragdrop['@:{clear.drag}'](this);
        let enter = this.get('enter');
        let src = State.get('@:{global#bind.field.drag.data}');
        if (src &&
            enter) {
            e['@:{halt}'] = 1;
            let props = this.get('props');
            let { bind } = props;
            let element = this.get('element');
            let { id = '', tag = '', fields = [] } = bind;
            let oldStringify = JSON.stringify([id, tag, ...fields]);
            let { id: sId, tag: sUrl, field } = src;
            let destField = {
                key: field.key,
                name: field.name
            };
            let newStringify = JSON.stringify([sId, sUrl, destField]);
            console.log(newStringify, oldStringify);
            this.set({
                enter: 0
            });
            if (oldStringify != newStringify) {
                bind.id = sId;
                bind.tag = sUrl;
                bind.fields = [destField];

                StageSelection["@:{selection#set}"](element);
                StageGeneric['@:{generic#update.stage.element}'](element, '@:{bind}');
                DHistory["@:{history#save}"](DHistory['@:{history#element.modified.props}'], StageGeneric['@:{generic#query.ename.by.single}'](element));
            } else if (StageSelection["@:{selection#set}"](element)) {
                let ename = StageGeneric['@:{generic#query.ename.by.single}'](element)
                DHistory["@:{history#save}"](DHistory['@:{history#element.get.focus}'], ename);
                this.render();
            }
        }
    }
}