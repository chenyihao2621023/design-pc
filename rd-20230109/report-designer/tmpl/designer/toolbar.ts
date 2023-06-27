/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Panels from '../panels/index';
let { State, View, applyStyle, config } = Magix;
applyStyle('@:toolbar.less');
export default View.extend({
    tmpl: '@:toolbar.html',
    init() {
        let update = this.render.bind(this);
        let { root: { classList } } = this;
        let toggle = ({ active }: Report.EventOfStageScrolling) => {
            classList[active ? 'add' : 'remove']('@:scoped.style:pointer-events-none');
        };
        let updateLang = ({ to }: Report.EventOfLangChange) => {
            this.digest({
                lang: to
            });
        };
        State.on('@:{event#lang.change}', updateLang);
        State.on('@:{event#panel.change}', update);
        State.on('@:{event#pointer.using}', toggle);
        this.on('destroy', () => {
            State.off('@:{event#lang.change}', updateLang);
            State.off('@:{event#panel.change}', update);
            State.off('@:{event#pointer.using}', toggle);
        });
        this.set({
            mini: config('mini'),
        });
    },
    render() {
        this.digest({
            panels: Panels['@:{panels#get.panels}'](),
            allOpen: Panels["@:{panels#is.all.opened}"]()
        });
    },
    '@:{close.all.panel}<click>'() {
        let allOpen = this.get('allOpen');
        if (allOpen) {
            Panels["@:{panels#close.all.panels}"]();
        } else {
            Panels["@:{panels#open.all.panels}"]();
        }
    },
    '@:{toggle.panel}<click>'(e) {
        let { p } = e.params;
        Panels["@:{panels#toggle.panel}"](p);
    }
});