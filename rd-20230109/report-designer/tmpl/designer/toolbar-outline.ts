/*
    author:https://github.com/xinglie
*/
'ref@:./toolbar.less';
import Magix from 'magix5';
import Const from './const';
let { View, node, State } = Magix;
export default View.extend({
    tmpl: '@:toolbar-outline.html',
    init() {
        this.set({
            enable: Const['@:{const#element.show.normal.outline}']
        });
        let updateOutline = () => {
            let enable = !this.get('enable');
            this.digest({
                enable
            });
            let cssVar = '@:scoped.style:var(--scoped-element-outline-color)';
            let stageNode = node<HTMLDivElement>(`_rd_stage`);
            stageNode?.style.setProperty(cssVar, enable ? '' : '#0000');
        };
        let updateLang = ({ to }: Report.EventOfLangChange) => {
            this.digest({
                lang: to
            });
        };
        State.on('@:{event#lang.change}', updateLang);
        State.on('@:{event#toggle.element.outline}', updateOutline);
        this.on('destroy', () => {
            State.off('@:{event#lang.change}', updateLang);
            State.off('@:{event#toggle.element.outline}', updateOutline);
        });
    },
    render() {
        this.digest();
    },
    '@:{toggle.enable}<click>'() {
        State.fire('@:{event#toggle.element.outline}');
    }
});