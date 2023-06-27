/*
    author:https://github.com/xinglie
*/
'ref@:./toolbar.less';
import Magix from 'magix5';
import StageGeneric from './generic';
let { State, View } = Magix;
export default View.extend({
    tmpl: '@:toolbar-start.html',
    init() {
        let update = this.render.bind(this);
        let updateLang = ({ to }: Report.EventOfLangChange) => {
            this.digest({
                lang: to
            });
        };
        State.on('@:{event#lang.change}', updateLang);
        State.on('@:{event#history.shift.change}', update);
        State.on('@:{event#stage.select.elements.change}', update);
        State.on('@:{event#stage.axis.help.lines.change}', update);
        State.on('@:{event#stage.elements.change}', update);
        State.on('@:{event#stage.page.and.elements.change}', update);
        State.on('@:{event#stage.page.change}', update);
        this.on('destroy', () => {
            State.off('@:{event#lang.change}', updateLang);
            State.off('@:{event#history.shift.change}', update);
            State.off('@:{event#stage.select.elements.change}', update);
            State.off('@:{event#stage.axis.help.lines.change}', update);
            State.off('@:{event#stage.elements.change}', update);
            State.off('@:{event#stage.page.and.elements.change}', update);
            State.off('@:{event#stage.page.change}', update);
        });
    },
    render() {
        this.digest({
            canClear: StageGeneric['@:{generic#query.can.clear.stage}'](),
            canCreate: StageGeneric['@:{generic#query.can.create.new.page}']()
        });
    },
    '@:{clear.elements}<click>'() {
        State.fire('@:{event#stage.clear}');
    },
    '@:{new.page}<click>'() {
        State.fire('@:{event#stage.clear}', {
            '@:{clear.events#action}': '@:{clear.events#new}'
        });
    }
});