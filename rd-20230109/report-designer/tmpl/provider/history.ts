/**
 * 历史记录
 */
import Magix from 'magix5';
import Const from '../designer/const';
import Enum from '../designer/enum';
import StageSelection from '../designer/selection';
import Elements from '../elements/index';
let { State, mix } = Magix;
let emptyArray = [];

let CellAndHod = Enum['@:{enum#as.hod}'] | Enum['@:{enum#as.cells}'];
/**
 * 历史记录还原时，需要清除未选中状态下的容器元素的格子聚焦状态
 * @param elements 当前设计区内的所有元素
 * @param selectMap 选中对象的id集合对象
 */
let resetBoxFocus = (elements: Report.StageElement[],
    selectMap: Report.StageElementMapObject) => {
    if (elements) {
        for (let { ctrl, id, props } of elements) {
            if (ctrl.as & CellAndHod) {
                if (!selectMap[id]) {
                    props.focusRow = -1;
                    props.focusCol = -1;
                } else {
                    for (let row of props.rows) {
                        for (let col of row.cols) {
                            let elements = col.elements;
                            resetBoxFocus(elements, selectMap);
                        }
                    }
                }
            }
        }
    }
};

/**
 * 更新设计区到某个状态
 * @param param0 应用的状态对象
 */
let applyState = ({
    a: jsonUnit = Const['@:{const#unit}'],
    b: jsonPage,
    c: jsonScale = 1,
    d: jsonElements,
    e: jsonSelects = emptyArray,
    f: jsonGroups,
    g: jsonXLines = emptyArray,
    h: jsonYLines = emptyArray,
    i: jsonClipboard,
}: Report.EventOfHistoryShiftChagne) => {
    let page = State.get('@:{global#stage.page}');
    let elements = State.get('@:{global#stage.elements}');
    let select = State.get('@:{global#stage.select.elements}');
    let xLines = State.get('@:{global#stage.x.help.lines}');
    let yLines = State.get('@:{global#stage.y.help.lines}');
    mix(page, jsonPage);
    let {
        '@:{emanager#elements}': translatedElements,
        '@:{emanager#map}': map
    } = Elements["@:{element.manager#by.json}"](jsonElements, page);
    elements.length = 0;
    elements.push(...translatedElements);//设计区元素

    xLines.length = 0;//水平辅助线
    xLines.push(...jsonXLines);

    yLines.length = 0;//垂直辅助线
    yLines.push(...jsonYLines);
    let sMap = {};
    select.length = 0;
    for (let s of jsonSelects) {
        let e = map[s.id];
        if (e) {
            sMap[e.id] = 1;
            select.push(e);
        }
    }
    StageSelection['@:{selection#reset.map}']();
    resetBoxFocus(elements, sMap);
    //用于还原剪切板中的列表，附加上ctrl等函数控制对象等信息，json序列化不包含函数等对象
    if (jsonClipboard.c) {
        let {
            '@:{emanager#elements}': translatedElements
        } = Elements['@:{element.manager#by.json}'](jsonClipboard.c, page);
        jsonClipboard.c = translatedElements;
    }
    State.set({
        '@:{global#stage.unit}': jsonUnit,
        '@:{global#stage.scale}': jsonScale,
        '@:{global#stage.clipboard}': jsonClipboard,
        '@:{global#stage.elements.groups}': jsonGroups
    });
};

export default {
    /**
     * 插件安装
     */
    '@:{history#setup}'() {
        State.on('@:{event#history.shift.change}', applyState);
    },
    /**
     * 插件卸载
     */
    '@:{history#teardown}'() {
        State.off('@:{event#history.shift.change}', applyState);
    }
};