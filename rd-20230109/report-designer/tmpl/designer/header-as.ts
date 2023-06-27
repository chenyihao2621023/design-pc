/**
 * author:kooboy_li@163.com
 * 自动保存
 */
'ref@:./header.less';
import Magix from 'magix5';
import GenericProvider from '../provider/generic';
import Const from './const';
import ToJSON from './tojson';
let { View, State, LOW } = Magix;
export default View.extend({
    tmpl: '@:./header-as.html',
    init() {
        this.set({
            enable: true,//是否开启自动保存
            last: ''//上次保存的时间，时:分:秒格式
        });
        let lastJSON = ToJSON(1);//用于优化保存，只有内容不同时才进行保存
        let reset = () => {
            lastJSON = ToJSON(1);
        };
        let updateSaveTime = () => {
            let now = new Date();
            this.digest({
                last: [GenericProvider['@:{generic#pad.start}'](now.getHours()),
                GenericProvider['@:{generic#pad.start}'](now.getMinutes()),
                GenericProvider['@:{generic#pad.start}'](now.getSeconds())].join(':')
            });
        };
        let watch = GenericProvider['@:{generic#debounce}'](() => {
            let enable = this.get('enable');
            let prevent = State.get<boolean>('@:{global#pointer.is.active}');
            if (enable &&
                !prevent) {//启用保存
                //使用保存JSON字符串进行比较，防止其它不必要的状态改变触发保存动作，比如元素选中
                let newJSON = ToJSON(1);
                if (lastJSON != newJSON) {
                    //我们这里仅派发事件，不管外部是否保存成功
                    //如果需要感知外部的保存，则需要事件派发这里稍加调整
                    State.fire('@:{event#stage.content.save}', {
                        '@:{save.content.event#auto.save}': 1
                    });
                    lastJSON = newJSON;
                }
            }
        }, Const['@:{const#auto.save.debouce.duration}']);
        State.on('@:{event#history.shift.change}', watch, LOW);
        State.on('@:{event#history.list.change}', watch, LOW);
        State.on('@:{event#stage.select.element.props.change}', watch, LOW);
        State.on('@:{event#example.change}', reset, LOW);
        State.on('@:{event#stage.content.save}', updateSaveTime, LOW);
        this.on('destroy', () => {
            State.off('@:{event#history.shift.change}', watch, LOW);
            State.off('@:{event#history.list.change}', watch, LOW);
            State.off('@:{event#stage.select.element.props.change}', watch, LOW);
            State.off('@:{event#example.change}', reset, LOW);
            State.off('@:{event#stage.content.save}', updateSaveTime, LOW);
        });
    },
    render() {
        this.digest();
    },
    '@:{toggle.auto.save}<change>'(e: Magix5.MagixPointerEvent) {
        let input = e.eventTarget as HTMLInputElement;
        let enable = input.checked;
        //每次打开或关闭我们清空上次保存的时间
        this.digest({
            enable,
        });
    }
})