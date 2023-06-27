/*
    author:https://github.com/xinglie
*/
'ref@:./toolbar.less';
import Magix from 'magix5';
import StageClipboard from './clipboard';
import StageGeneric from './generic';
import GenericProvider from '../provider/generic';
let { State, View } = Magix;
export default View.extend({
    tmpl: '@:toolbar-cxv.html',
    init(data) {
        this.set(data);
        let update = GenericProvider['@:{generic#debounce}'](this.render, 30, this);
        let checkEnable = ({ '@:{props}': changedProps }: Report.EventOfSelectElementsPropsChange) => {
            if (changedProps.locked ||
                changedProps['@:{focus.cell}']) {
                update();
            }
        };
        let updateLang = ({ to }: Report.EventOfLangChange) => {
            this.digest({
                lang: to
            });
        };
        State.on('@:{event#lang.change}', updateLang);
        State.on('@:{event#history.shift.change}', update);
        State.on('@:{event#stage.select.elements.change}', update);
        //State.on('@:{event#stage.page.and.elements.change}', update);
        State.on('@:{event#stage.select.element.props.change}', checkEnable);
        State.on('@:{event#stage.clipboard.change}', update);
        // State.on('@:{event#stage.elements.change}', update);
        this.on('destroy', () => {
            State.off('@:{event#lang.change}', updateLang);
            State.off('@:{event#history.shift.change}', update);
            State.off('@:{event#stage.select.elements.change}', update);
            //State.off('@:{event#stage.page.and.elements.change}', update);
            State.off('@:{event#stage.select.element.props.change}', checkEnable);
            State.off('@:{event#stage.clipboard.change}', update);
            // State.off('@:{event#stage.elements.change}', update);
        });
    },
    render() {
        let copyList = StageClipboard['@:{get.copy.list}']();
        let canInfo = StageGeneric['@:{generic#query.can.cxv}'](copyList);
        this.digest({
            canCopy: canInfo['@:{can.copy}'] > 0,
            canCut: canInfo['@:{can.cut}'] > 0,
            canPaste: canInfo['@:{can.paste}'] > 0,
            canDuplicate: canInfo['@:{can.copy}'] > 0 &&
                canInfo['@:{can.duplicate}'] > 0
        });
    },
    '@:{copy}<click>'() {
        StageClipboard['@:{copy.elements}']();
    },
    '@:{duplicate}<click>'() {
        let stages = StageGeneric['@:{generic#query.select.elements.stage}']();
        StageClipboard['@:{duplicate.elements}'](stages);
    },
    '@:{cut}<click>'() {
        StageClipboard['@:{cut.elements}']();
    },
    '@:{paste}<click>'() {
        let stage = StageGeneric['@:{generic#query.nearest.stage}']();
        StageClipboard['@:{paste.elements}'](stage);
    }
});