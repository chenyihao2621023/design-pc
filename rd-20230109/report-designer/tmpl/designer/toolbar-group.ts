/*
    author:https://github.com/xinglie
*/
'ref@:./toolbar.less';
import Magix from 'magix5';
import StageGeneric from './generic';
let { State, View } = Magix;
export default View.extend({
    tmpl: '@:toolbar-group.html',
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
        State.on('@:{event#stage.elements.change}', update);
        this.on('destroy', () => {
            State.off('@:{event#lang.change}', updateLang);
            State.off('@:{event#history.shift.change}', update);
            State.off('@:{event#stage.select.elements.change}', update);
            State.off('@:{event#stage.elements.change}', update);
        });
    },
    render() {
        let { '@:{can.group}': canGroup,
            '@:{can.ungroup}': canUngroup } = StageGeneric["@:{generic#query.group.state}"]();
        let linkEnable = State.get('@:{global#stage.elements.groups.linked}');
        this.digest({
            linkEnable,
            canGroup,
            canUngroup
        });
    },
    '@:{group.elements}<click>'(e) {
        let { un } = e.params;
        StageGeneric["@:{generic#group.select.elements}"](un);
    },
    '@:{toggle.enable}<click>'() {
        let linkEnable = State.get('@:{global#stage.elements.groups.linked}');
        State.set({
            '@:{global#stage.elements.groups.linked}': !linkEnable
        });
        this.digest({
            linkEnable: !linkEnable
        });
    }
});