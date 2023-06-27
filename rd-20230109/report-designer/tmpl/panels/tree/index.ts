/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import StageGeneric from '../../designer/generic';
import DHistory from '../../designer/history';
import StageSelection from '../../designer/selection';
import GenericProvider from '../../provider/generic';
import SpotProvider from '../../provider/spot';
import BranchView from './branch';
let { State, applyStyle, mark, lowTaskFinale } = Magix;
applyStyle('@:index.less');

export default BranchView.extend({
    tmpl: '@:index.html',
    init() {
        this.set({
            icon: Const['@:{const#panels.tree.show.icon}'],
            hodEnum: Enum['@:{enum#as.hod}']
        });
        SpotProvider['@:{setup}'](this);
        let update = GenericProvider['@:{generic#debounce}'](this.render, 30, this);
        let checkLocked = e => {
            let props = e['@:{props}'];
            if (props.locked ||
                props.ename ||
                props.rows) {
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
        State.on('@:{event#stage.page.and.elements.change}', update);
        State.on('@:{event#stage.select.element.props.change}', checkLocked);
        this.on('destroy', () => {
            SpotProvider['@:{teardown}'](this);
            State.off('@:{event#lang.change}', updateLang);
            State.off('@:{event#history.shift.change}', update);
            State.off('@:{event#stage.elements.change}', update);
            State.off('@:{event#stage.select.elements.change}', update);
            State.off('@:{event#stage.page.and.elements.change}', update);
            State.off('@:{event#stage.select.element.props.change}', checkLocked);
        });
    },
    async render(e) {
        let elements = State.get<Report.StageElement[]>('@:{global#stage.elements}');
        let map = StageSelection['@:{selection#get.selected.map}']();
        let selectElements = State.get<Report.StageElement[]>('@:{global#stage.select.elements}');
        let renderMark = mark(this, '@:{render.mark}');
        await this.digest({
            map,
            elements
        });
        await lowTaskFinale();
        let highlight = renderMark() && selectElements.length == 1;
        if (e?.type == '@:{event#stage.elements.change}' &&
            (e['@:{extra}'] == '@:{delete.from.tree.panel}' ||
                e['@:{extra}'] == '@:{dragsort.from.tree.panel}')) {
            highlight = false;
        }
        //console.log(e);
        //setTimeout(() => {
        if (highlight) {
            let first = selectElements[0];
            GenericProvider['@:{generic#scroll.into.view}'](`_rdte_${first.id}`, this.root);
        }
        //}, 50);
    },
    '@:{drag.end}<dragend>'(e: Magix5.MagixPointerEvent) {
        let dest = State.get('@:{global#panels.elements.drag.view}');
        if (dest == this.id) {
            let me = this;
            let { drag, elements, onTop, index } = me.get();
            if (drag) {
                let startIndex = me['@:{drag.index}'];
                let drag = elements[startIndex];
                elements.splice(index + (onTop ? 1 : 0), 0, drag);
                if (index < startIndex) {
                    elements.splice(startIndex + 1, 1);
                } else {
                    elements.splice(startIndex, 1);
                }
                me.set({
                    elements
                });
                State.fire('@:{event#stage.elements.change}', {
                    '@:{extra}': '@:{dragsort.from.tree.panel}'
                });
                let ename = StageGeneric['@:{generic#query.ename.by.single}'](drag);
                DHistory['@:{history#save}'](DHistory['@:{history#element.z.index}'], ename);
            }
            me.digest({
                current: -1,
                drag: 0
            });
            this['@:{hide}']();
            State.set({
                '@:{global#panels.elements.drag.view}': null
            });
        }
    },
    '@:{fix.drag.clip.bug}<pointerdown,treeitemdown>'(e: Magix5.MagixPointerEvent & {
        node: HTMLElement
    }) {
        GenericProvider['@:{generic#fix.drag.clip.element.bug}'](e.node || e.eventTarget, this.root);
    },
});