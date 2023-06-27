/*
    author:https://github.com/xinglie
*/
'ref@:toolbar.less';
import Magix from 'magix5';
import StageElements from './elements';
import StageGeneric from './generic';
let { State, View } = Magix;
let actions = [{
    icon: '&#xe70b;',
    to: '@:{align#left}',
    title: '@:{lang#align.left}',
    short: '(Alt+L)',
    use: 'canX'
}, {
    icon: '&#xe711;',
    to: '@:{align#center}',
    title: '@:{lang#align.center}',
    short: '(Alt+C)',
    use: 'canX'
}, {
    icon: '&#xe70b;',
    to: '@:{align#right}',
    r180: 1,
    title: '@:{lang#align.right}',
    short: '(Alt+R)',
    use: 'canX'
}, {
    icon: '&#xe70d;',
    to: '@:{align#top}',
    title: '@:{lang#align.top}',
    short: '(Alt+T)',
    use: 'canY'
}, {
    icon: '&#xe711;',
    to: '@:{align#middle}',
    r90: 1,
    title: '@:{lang#align.middle}',
    short: '(Alt+M)',
    use: 'canY'
}, {
    icon: '&#xe70d;',
    to: '@:{align#bottom}',
    r180: 1,
    title: '@:{lang#align.bottom}',
    short: '(Alt+B)',
    use: 'canY'
}];
export default View.extend({
    tmpl: '@:toolbar-align.html',
    init(data) {
        this.set({
            actions
        }, data);
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
        let alignInfo = StageGeneric['@:{generic#query.can.align}']();
        this.digest({
            canX: alignInfo['@:{generic.align#x.can.align}'],
            canY: alignInfo['@:{generic.align#y.can.align}']
        });
    },
    '@:{align.elements}<click>'(e: Magix5.MagixPointerEvent) {
        if (!e.eventTarget.classList.contains('@:toolbar.less:toolbar-item-disabled')) {
            let { to } = e.params;
            StageElements["@:{elements#align.elements}"](to);
        }
    }
});