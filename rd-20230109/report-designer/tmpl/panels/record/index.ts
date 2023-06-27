/**
 * 历史记录
 */
import Magix from 'magix5';
import DHistory from '../../designer/history';
import GenericProvider from '../../provider/generic';
let { State, View, applyStyle, mark, } = Magix;
applyStyle('@:index.less');

export default View.extend({
    tmpl: '@:index.html',
    init() {
        let update = GenericProvider['@:{generic#debounce}'](this.render, 30, this);let updateLang = ({ to }: Report.EventOfLangChange) => {
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
    async render(e) {
        let renderMark = mark(this, '@:{render.mark}');
        let {
            '@:{list}': list,
            '@:{index}': index,
            '@:{bottom}': bottom
        } = DHistory['@:{history#get.history.info}']();
        if (bottom) {
            await this.digest({
                list,
                index,
                bottom
            });
            if (renderMark() &&
                (!e || e['@:{action.by}'] != '@:{remove}')) {
                GenericProvider['@:{generic#scroll.into.view}'](`_rdh_${this.id}_${index}`, this.root);
            }
        }
    },
    '@:{set.history}<click>'(e: Magix5.MagixPointerEvent) {
        if (!e['@:{halt}']) {
            let { at } = e.params;
            DHistory['@:{history#set.history}'](at);
        }
    },
    '@:{remove.history}<click>'(e: Magix5.MagixPointerEvent) {
        e['@:{halt}'] = 1;
        let { at } = e.params;
        DHistory['@:{history#remove.at}'](at);
    }
});