
import Magix from 'magix5';
import View from '../../designer/header';
import Elements from '../../elements/index';
import GenericProvider from '../../provider/generic';
let { applyStyle, State } = Magix;
applyStyle('@:./index.less');
export default View.extend({
    tmpl: '@:index.html',
    init() {
        let update = GenericProvider['@:{generic#debounce}'](this.render, 30, this);
        let toggleReadonly = GenericProvider['@:{generic#debounce}'](() => {
            let page = State.get<Report.StagePage>('@:{global#stage.page}');
            this.digest({
                readonly: page.readonly
            });
        }, 30);
        let updateLang = ({ to }: Report.EventOfLangChange) => {
            this.digest({
                lang: to
            });
        };
        State.on('@:{event#lang.change}', updateLang);
        State.on('@:{event#panel.of.element.toggle.change}', update);
        State.on('@:{event#history.shift.change}', toggleReadonly);
        State.on('@:{event#stage.page.change}', toggleReadonly);
        State.on('@:{event#stage.page.and.elements.change}', toggleReadonly);
        this.on('destroy', () => {
            State.off('@:{event#lang.change}', updateLang);
            State.off('@:{event#panel.of.element.toggle.change}', update);
            State.off('@:{event#history.shift.change}', toggleReadonly);
            State.off('@:{event#stage.page.change}', toggleReadonly);
            State.off('@:{event#stage.page.and.elements.change}', toggleReadonly);
        });
    },
    render() {
        let elements = Elements["@:{element.manager#element.list}"]();
        let page = State.get<Report.StagePage>('@:{global#stage.page}');
        this.digest({
            elements,
            readonly: page.readonly
        });
    },
    '@:{toggle.children}<click>'({ params }: Magix5.MagixPointerEvent) {
        params.item.opened = !params.item.opened;
        State.fire('@:{event#panel.of.element.toggle.change}');
    }
});