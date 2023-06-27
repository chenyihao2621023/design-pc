/*
    author:https://github.com/xinglie
*/
'ref@:./toolbar.less';
import Magix from 'magix5';
let { View, State } = Magix;
export default View.extend({
    tmpl: '@:toolbar-kr.html',
    init() {
        this.set({
            enable: State.get('@:{global#stage.element.keep.ratio}')
        });
        let updateKeepRatio = () => {
            let enable = !this.get('enable');
            State.set({
                '@:{global#stage.element.keep.ratio}': enable
            });
            this.digest({
                enable
            });
        };
        let updateLang = ({ to }: Report.EventOfLangChange) => {
            this.digest({
                lang: to
            });
        };
        State.on('@:{event#lang.change}', updateLang);
        State.on('@:{event#toggle.element.keep.ratio}', updateKeepRatio);
        this.on('destroy', () => {
            State.off('@:{event#lang.change}', updateLang);
            State.off('@:{event#toggle.element.keep.ratio}', updateKeepRatio);
        });
    },
    render() {
        this.digest();
    },
    '@:{toggle.enable}<click>'() {
        State.fire('@:{event#toggle.element.keep.ratio}');
    }
});