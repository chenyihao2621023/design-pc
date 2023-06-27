/*
    author:https://github.com/xinglie
*/
'ref@:./toolbar.less';
import Magix from 'magix5';
import StageGeneric from './generic';
import StageSelection from './selection';
let { State, View } = Magix;
export default View.extend({
    tmpl: '@:toolbar-del.html',
    init() {
        let update = this.render.bind(this);
        /**
         * 
         * @param e 属性改变时，我们进行检测，只有locked属性才更新界面
         */
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
        //因为元素选中与否也会进历史记录，所以当历史记录改变时，我们进行界面更新
        State.on('@:{event#history.shift.change}', update);
        //选中元素发生改变
        State.on('@:{event#stage.select.elements.change}', update);
        //选中元素属性发生改变
        State.on('@:{event#stage.select.element.props.change}', checkLocked);
        this.on('destroy', () => {
            State.off('@:{event#lang.change}', updateLang);
            State.off('@:{event#history.shift.change}', update);
            State.off('@:{event#stage.select.elements.change}', update);
            State.off('@:{event#stage.select.element.props.change}', checkLocked);
        });
    },
    render() {
        let selectElements = State.get('@:{global#stage.select.elements}');
        let selectElementsMap = StageSelection['@:{selection#get.selected.map}']();
        let enable = 0,
            disabeld;
        if (selectElements.length > 0) {
            disabeld = StageGeneric['@:{generic#query.has.disabled}'](selectElements);
            if (!disabeld) {
                enable = StageGeneric['@:{generic#query.in.enable.hod}'](selectElementsMap);
            }
        }
        this.digest({
            canDel: enable == 1,
        });
    },
    '@:{remove.elements}<click>'() {
        StageGeneric["@:{generic#delete.select.elements}"]();
    }
});