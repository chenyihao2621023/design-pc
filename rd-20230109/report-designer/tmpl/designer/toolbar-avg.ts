/*
    author:https://github.com/xinglie
*/
'ref@:toolbar.less';
import Magix from 'magix5';
import StageElements from './elements';
import StageGeneric from './generic';
let { State, View } = Magix;
let actions = [{
    icon: '&#xe61f;',
    to: 'h',
    r90: 1,
    title: '@:{lang#avg.h}',
    use: 'canX'
}, {
    icon: '&#xe61f;',
    to: 'v',
    title: '@:{lang#avg.v}',
    use: 'canY'
}, {
    icon: '&#xe659;',
    to: 'sh',
    title: '@:{lang#avg.stage.h}',
    use: 'stageCanX'
}, {
    icon: '&#xe659;',
    to: 'sv',
    r90: 1,
    title: '@:{lang#avg.stage.v}',
    use: 'stageCanY'
}];
export default View.extend({
    tmpl: '@:toolbar-avg.html',
    init() {
        this.set({
            actions
        });
        let update = this.render.bind(this);
        let checkLocked = e => {
            if (e['@:{props}'].locked) {
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
        State.on('@:{event#stage.elements.change}', update);
        State.on('@:{event#stage.select.elements.change}', update);
        State.on('@:{event#stage.select.element.props.change}', checkLocked);
        this.on('destroy', () => {
            State.off('@:{event#lang.change}', updateLang);
            State.off('@:{event#history.shift.change}', update);
            State.off('@:{event#stage.elements.change}', update);
            State.off('@:{event#stage.select.elements.change}', update);
            State.off('@:{event#stage.select.element.props.change}', checkLocked);
        });
    },
    render() {
        let avgInfo = StageGeneric['@:{generic#query.can.avg}']();
        this.digest({
            canX: avgInfo['@:{generic.avg#x.can.avg}'],
            canY: avgInfo['@:{generic.avg#y.can.avg}'],
            stageCanX: avgInfo['@:{generic.avg#stage.x.can.avg}'],
            stageCanY: avgInfo['@:{generic.avg#stage.y.can.avg}']
        });
    },
    '@:{align.elements}<click>'(e: Magix5.MagixPointerEvent) {
        if (!e.eventTarget.classList.contains('@:toolbar.less:toolbar-item-disabled')) {
            let { to } = e.params;
            let use;
            if (to.startsWith('s')) {
                use = '@:{elements#stage.avg.elements}';
            } else {
                use = '@:{elements#avg.elements}';
            }
            StageElements[use](to, e.shiftKey, e.metaKey || e.ctrlKey);
        }
    }
});