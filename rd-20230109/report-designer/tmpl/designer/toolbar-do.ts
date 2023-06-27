/*
    author:https://github.com/xinglie
*/
'ref@:./toolbar.less';
import Magix from 'magix5';
import DHistory from './history';
let { State, View } = Magix;
export default View.extend({
    tmpl: '@:toolbar-do.html',
    init() {
        let update = this.render.bind(this);
        let updateLang = ({ to }: Report.EventOfLangChange) => {
            this.digest({
                lang: to
            });
        };
        State.on('@:{event#lang.change}', updateLang);
        State.on('@:{event#history.shift.change}', update);
        State.on('@:{event#history.list.change}', update);
        this.on('destroy', () => {
            State.off('@:{event#lang.change}', updateLang);
            State.off('@:{event#history.shift.change}', update);
            State.off('@:{event#history.list.change}', update);
        });
    },
    render() {
        this.digest(DHistory["@:{history#query.status}"]());
    },
    '@:{do.exec}<click>'(e) {
        //if (e.eventTarget.classList.contains('@:toolbar.less:toolbar-item-disabled')) {
        //return;
        //}
        let { s, b } = e.params;
        if (b) {
            if (s == '-') {
                DHistory["@:{history#undo}"]();
            } else {
                DHistory["@:{history#redo}"]();
            }
        }
    }
});