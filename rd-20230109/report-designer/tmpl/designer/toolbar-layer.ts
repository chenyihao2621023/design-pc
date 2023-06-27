/*
    author:https://github.com/xinglie
*/
'ref@:./toolbar.less';
import Magix from 'magix5';
import GenericProvider from '../provider/generic';
import StageElements from './elements';
import StageGeneric from './generic';
let { State, View } = Magix;
export default View.extend({
    tmpl: '@:toolbar-layer.html',
    init(data) {
        this.set(data);
        let update = GenericProvider['@:{generic#debounce}'](this.render, 30, this);
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
        let selectedElements = State.get('@:{global#stage.select.elements}');
        let toTop = false,
            toBottom = false,
            first = selectedElements[0];
        if (selectedElements.length == 1) {
            if (!first.props.locked) {
                let collection = StageGeneric["@:{generic#find.element.owner.collection}"](first);
                if (collection) {
                    let top = collection.at(-1);
                    let bottom = collection[0];
                    toTop = first.id != top.id;
                    toBottom = first.id != bottom.id;
                }
            }
        }
        this.digest({
            current: first,
            toTop,
            toBottom
        });
    },
    '@:{move.element}<click>'(e) {
        let { to } = e.params;
        let element = this.get('current');
        StageElements["@:{elements#modify.element.z.index}"](to, element);
    }
});