/*
    author:https://github.com/xinglie
*/
'ref@:./toolbar.less';
import Magix from 'magix5';
import GenericProvider from '../provider/generic';
import Enum from './enum';
import Keyboard from './keyboard';
let { State, View } = Magix;
export default View.extend({
    tmpl: '@:toolbar-rotate.html',
    init() {
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
        State.on('@:{event#stage.select.elements.change}', update);
        State.on('@:{event#stage.elements.change}', update);
        State.on('@:{event#stage.select.element.props.change}', checkLocked);
        this.on('destroy', () => {
            State.off('@:{event#lang.change}', updateLang);
            State.off('@:{event#history.shift.change}', update);
            State.off('@:{event#stage.select.elements.change}', update);
            State.off('@:{event#stage.elements.change}', update);
            State.off('@:{event#stage.select.element.props.change}', checkLocked);
        });
    },
    render() {
        let canRotate = false;
        let selectedElements = State.get<Report.StageElement[]>('@:{global#stage.select.elements}');
        for (let e of selectedElements) {
            let { props, ctrl } = e;
            //选中的元素必须未锁定且支持旋转，只要有一个元素能旋转工具栏就启用
            if (!props.locked &&
                (ctrl['@:{modifier}'] & Enum['@:{enum#modifier.rotate}'])) {
                canRotate = true;
                break;
            }
        }
        this.digest({
            canRotate
        });
    },
    '@:{rotate}<click>'({ params: { to }, shiftKey,
        metaKey, ctrlKey }: Magix5.MagixPointerEvent) {
        if (metaKey || ctrlKey) {
            to /= 2;
        }
        State.fire('@:{event#key.press}', {
            '@:{keypress#ctrl.key}': 1,
            '@:{keypress#shift.key}': shiftKey,
            '@:{keypress#is.key.down}': 1,
            '@:{keypress#code}': Keyboard['@:{key#custom.rotate}'],
            '@:{keypress#data}': to
        });
    }
});