/**
 * 设计区拖放插件
 */
import Magix from 'magix5';
import Const from '../designer/const';
import StageElements from '../designer/elements';
import GenericProvider from './generic';
let { State, has } = Magix;
let watchDrop = (e: DragEvent) => {
    if (!e['@:{halt}']) {
        e.preventDefault();
        let bindData = State.get('@:{global#bind.field.drag.data}');
        let target = e.target as HTMLElement;
        if (bindData) {
            let { id, tag, field: fieldInfo, name } = bindData;
            let elementsMap = State.get('@:{global#stage.elements.map}');
            let xCtrl: Report.StageElementCtrl = elementsMap[fieldInfo.use] || elementsMap.text;
            if (xCtrl) {
                let props = GenericProvider['@:{generic#clone}'](fieldInfo.props) || {};
                let unit = State.get('@:{global#stage.unit}');
                for (let {
                    key,
                    '@:{is.scale.and.unit.field}': unitField,
                    "@:{unit.convert}": convert
                } of xCtrl.props) {
                    if (has(props, key) && (
                        unitField ||
                        convert
                    )) {
                        if (convert) {
                            convert(props, unit);
                        } else {
                            props[key] = Const['@:{const#to.unit}'](props[key]);
                        }
                    }
                }
                props.bind = {
                    id,
                    tag,
                    name,
                    fields: [{
                        key: fieldInfo.key,
                        name: fieldInfo.name
                    }]
                };
                State.set({
                    '@:{global#memory.cache.element}': [{
                        ctrl: xCtrl,
                        props
                    }]
                });
                let fromEventOffset = State.get('@:{global#bind.field.drag.event.offset}');
                State.fire('@:{event#starter.element.add}', {
                    node: target,
                    pageX: e.pageX - fromEventOffset['@:{offset.x}'],
                    pageY: e.pageY - fromEventOffset['@:{offset.y}'],
                });
            }
        }
    }
};
let watchMove = (e: DragEvent) => {
    let bindData = State.get('@:{global#bind.field.drag.data}');
    if (bindData) {
        let elementsMap = State.get('@:{global#stage.elements.map}');
        let target = e.target as HTMLElement;
        let lastHod;
        //尝试使用字段指定的类型或默认文本类型
        let xCtrl = elementsMap[bindData.field.use] || elementsMap.text;
        if (xCtrl) {//有控制器才进入处理
            if (!e['@:{halt}']) {
                lastHod = StageElements['@:{elements#get.best.hod}'](target, xCtrl);;
            }
            State.fire('@:{event#starter.element.drag.move}', {
                ctrl: xCtrl,
                stage: 1,
                hod: lastHod,
                node: target
            });
        }
    }
};
export default {
    '@:{sdrop#setup}'() {
        State.set({
            '@:{global#provider.of.stage.drop}': 1
        });
    },
    '@:{sdrop#teardown}'() {
        State.set({
            '@:{global#provider.of.stage.drop}': null
        });
    },
    '@:{sdrop#drag.enter}': watchMove,
    '@:{sdrop#drop}': watchDrop
}