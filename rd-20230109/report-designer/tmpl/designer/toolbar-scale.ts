/*
    author:https://github.com/xinglie
*/
'ref@:./toolbar.less';
import Magix from 'magix5';
import Const from './const';
import Keyboard from './keyboard';
let { State, View } = Magix;
export default View.extend({
    tmpl: '@:toolbar-scale.html',
    init() {
        let update = this.render.bind(this);
        let updateLang = ({ to }: Report.EventOfLangChange) => {
            this.digest({
                lang: to
            });
        };
        State.on('@:{event#lang.change}', updateLang);
        State.on('@:{event#stage.scale.change}', update);
        State.on('@:{event#history.shift.change}', update);
        this.on('destroy', () => {
            State.off('@:{event#lang.change}', updateLang);
            State.off('@:{event#stage.scale.change}', update);
            State.off('@:{event#history.shift.change}', update);
        });
    },
    render() {
        this.digest({
            max: Const["@:{const#scale.max}"],
            min: Const["@:{const#scale.min}"],
            scale: State.get('@:{global#stage.scale}')
        });
    },
    '@:{stage.scale}<click>'({ params: { s },
        shiftKey, altKey, metaKey, ctrlKey }: Magix5.MagixPointerEvent) {
        let code,
            alt = altKey || metaKey || ctrlKey,
            shift = !alt && shiftKey;
        if (s == '+') {
            code = Keyboard['@:{key#ctrl.plus}']
        } else if (s == '-') {
            code = Keyboard['@:{key#ctrl.minus}'];
        } else {
            code = Keyboard['@:{key#num.zero}'];
        }
        if (code) {//转为键盘事件
            State.fire('@:{event#key.press}', {
                '@:{keypress#is.key.down}': 1,
                '@:{keypress#ctrl.key}': 1,
                '@:{keypress#shift.key}': shift,
                '@:{keypress#alt.key}': alt,
                '@:{keypress#code}': code,
            });
        }
    }
});