/**
 * 为属性面板服务的插件，决定是否展示页面、单个或多选面板
 */
import Magix from 'magix5';
import Designer from './designer';
let { State, keys } = Magix;
/**
 * 获取多选元素的通用属性
 * @param elements 选中元素
 * @returns 通用属性
 */
let getSharedPropsAndKey = (elements: Report.StageElement[]) => {
    let sharedProps: Report.PanelOfPropsType[] = [];
    let types = {},
        count = 0,
        //disabledX,
        //disabledY,
        lastCtrl: Report.StageElementCtrl,
        key = '';
    for (let { ctrl, type, props, id } of elements) {
        types[type] = 1;
        lastCtrl = ctrl;
        count++;
        key += id + ':';
        // if (props.pinX) {
        //     disabledX = props.pinX;
        // }
        // if (props.pinY) {
        //     disabledY = props.pinY;
        // }
    }
    let typeList = keys(types);
    if (lastCtrl) {
        let { props, batches } = lastCtrl;
        let propsMap = lastCtrl['@:{props.map}'];
        if (!propsMap) {
            propsMap = {};
            for (let p of props) {
                let key = p.key || p.ref;
                if (key) {
                    propsMap[key] = p;
                }
            }
            lastCtrl['@:{props.map}'] = propsMap;
        }
        if (typeList.length == 1 &&
            count > 1 &&
            batches) {
            for (let b of batches) {
                // if ((b == 'x' && disabledX) ||
                //     (b == 'y' && disabledY)) {
                //     continue;
                // }
                if (b == '-') {
                    sharedProps.push(Designer['@:{designer#shared.props.spliter}']);
                } else if (propsMap[b]) {
                    sharedProps.push(propsMap[b]);
                }
            }
        }
    }
    return {
        '@:{shared.props}': sharedProps,
        '@:{elements.guid.key}': key
    };
};
/**
 * 根据元素选中的情况，计算需要展示哪种类型的面板
 */
let update = () => {
    let selectElements = State.get<Report.StageElement[]>('@:{global#stage.select.elements}');
    let display,
        total = selectElements.length,
        props,
        key;
    if (total) {//有元素选中
        if (total == 1) {//只有一个，展示单个
            display = '@:{panels#props.display.single}';
        } else {//多个，计算是否有批量设置的属性
            let i = getSharedPropsAndKey(selectElements);
            props = i['@:{shared.props}'];
            key = i['@:{shared.props}'];
            if (props.length) {//展示批量设置
                display = '@:{panels#props.display.multiple}';
            } else {//多选中无批量属性，展示编辑区
                display = '@:{panels#props.display.page}';
            }
        }
    } else {//展示编辑区
        display = '@:{panels#props.display.page}';
    }
    State.set({
        '@:{global#panels.props.display}': display,
        '@:{global#panels.props.multiple.props}': props,
        '@:{global#panels.props.multiple.key}': key,
    });
};
/**
 * 对锁定或解锁进行处理
 * @param e 锁事件
 */
// let checkLocked = e => {
//     if (e['@:{props}'].locked) {
//         update();
//     }
// };
export default {
    /**
     * 安装
     */
    '@:{prop#setup}'() {
        update();
        State.on('@:{event#stage.select.elements.change}', update);
        State.on('@:{event#history.shift.change}', update);
        //State.on('@:{event#stage.select.element.props.change}', checkLocked);
    },
    /**
     * 卸载
     */
    '@:{prop#teardown}'() {
        State.off('@:{event#stage.select.elements.change}', update);
        State.off('@:{event#history.shift.change}', update);
        //State.off('@:{event#stage.select.element.props.change}', checkLocked);
    }
};