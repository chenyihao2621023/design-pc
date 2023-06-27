/*
    author:https://github.com/xinglie
*/

//显式　隐式
import Magix from 'magix5';
import GenericProvider from '../../provider/generic';
import Const from '../../designer/const';
let { State, View, applyStyle } = Magix;
applyStyle('@:index.less');
export default View.extend({
    tmpl: '@:index.html',
    init() {
        let update = GenericProvider['@:{generic#debounce}'](this.render, 30, this);
        // let checkLocked = e => {
        //     if (e['@:{props}'].locked) {
        //         update();
        //     }
        // };
        State.on('@:{event#stage.select.elements.change}', update);
        State.on('@:{event#history.shift.change}', update);
        //State.on('@:{event#stage.select.element.props.change}', checkLocked);
        this.on('destroy', () => {
            State.off('@:{event#stage.select.elements.change}', update);
            State.off('@:{event#history.shift.change}', update);
            //State.off('@:{event#stage.select.element.props.change}', checkLocked);
        });
    },
    render() {
        let display = State.get<string>('@:{global#panels.props.display}');
        let old = this.get('display');
        if (old != display) {
            this.digest({
                display
            });
            this['@:{to.top}'](1);
        }
    },
    '@:{to.top}'(flag = 2) {
        if (Const['@:{const#panels.prop.auto.scroll.top}'] & flag) {
            //这里进行面板内容切换时，自动滚动到顶部
            this.root.scrollTo(0, 0);
        }
    },
    '@:{to.top}<top>'() {
        this['@:{to.top}'](2);
    }
});