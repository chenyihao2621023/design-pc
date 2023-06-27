/**
 * 模板插件
 */
import Magix from 'magix5';
import StageClipboard from '../designer/clipboard';
import Const from '../designer/const';
import StageGeneric from '../designer/generic';
import DHistory from '../designer/history';
import Keyboard from '../designer/keyboard';
import StageSelection from '../designer/selection';
import Elements from '../elements/index';

let markOwner;
let { State, node, mark, mix,
    lowTaskFinale, delay } = Magix;
let emptyArray = [];

let changeSize = async () => {
    let m = mark(markOwner, '@:{change.example}');
    let scaleChange,
        x = 0, y = 0,
        page = State.get('@:{global#stage.page}');
    let stageNode = node<HTMLDivElement>('_rd_stage');
    if (Const['@:{const#stage.auto.scale.when.change}']) {
        let oldScale = State.get<number>('@:{global#stage.scale}');
        let scale = StageGeneric['@:{generic#measure.scale}'](page);
        if (oldScale != scale) {
            State.set({
                '@:{global#stage.scale}': scale
            });
            scaleChange = 1;
        }
    }
    if (scaleChange) {
        State.fire('@:{event#stage.scale.change}');
    }
    await delay(50);
    await lowTaskFinale();
    if (stageNode &&
        m()) {
        stageNode.scrollTo(x, y);
    }
};

/**
 * 切换示例
 * @param e 切换示例事件对象
 */
let changeExample = async (e: Report.EventOfExampleChange) => {
    let m = mark(markOwner, '@:{change.example}');
    let stageNode = node<HTMLDivElement>('_rd_stage');
    let { page,
        groups = emptyArray,
        elements = [],
        unit = Const['@:{const#unit}'],
        panels = emptyArray,
        xs = emptyArray,
        ys = emptyArray } = e['@:{example.change.event#stage}'];
    State.set({
        '@:{global#stage.unit}': unit
    });
    let xLines = State.get<number[]>('@:{global#stage.x.help.lines}');
    let yLines = State.get<number[]>('@:{global#stage.y.help.lines}');
    xLines.length = 0;
    for (let x of xs) {
        xLines.push(Const['@:{const#to.px}'](x));
    }
    yLines.length = 0;
    for (let y of ys) {
        yLines.push(Const['@:{const#to.px}'](y));
    }
    if (panels?.length) {
        State.fire('@:{event#key.press}', {
            '@:{keypress#is.key.down}': 1,
            '@:{keypress#code}': Keyboard['@:{key#custom.force.open.panel}'],
            '@:{keypress#data}': panels
        });
    }
    let scaleChange,
        x = 0, y = 0;

    let pageCtrl = State.get<Report.StagePageCtrl>('@:{global#stage.page.ctrl}');
    let newPage = pageCtrl["@:{get.props}"]();
    mix(newPage, page);//更新设计区属性
    pageCtrl['@:{update.computed.props}'](newPage);
    if (Const['@:{const#stage.auto.scale.when.change}']) {
        let oldScale = State.get<number>('@:{global#stage.scale}');
        let scale = StageGeneric['@:{generic#measure.scale}'](newPage);
        if (oldScale != scale) {
            State.set({
                '@:{global#stage.scale}': scale
            });
            scaleChange = 1;
        }
    }

    let {
        '@:{emanager#elements}': translatedElements,
        '@:{emanager#props}': delayUpdateProps,
        //'@:{emanager#id.map}': idMap
    } = Elements["@:{element.manager#by.json}"](elements, newPage, 1);
    let newGroups = {};//生成新的组合信息
    for (let list of groups) {
        let newList = [];
        for (let id of list) {
            //let mId = idMap[id];
            newList.push(id);
            newGroups[id] = newList;
        }
    }
    State.set({
        '@:{global#stage.page}': newPage,
        '@:{global#stage.elements}': translatedElements,
        '@:{global#stage.elements.groups}': newGroups
    });
    StageSelection["@:{selection#set}"]();//取消选择元素
    StageClipboard['@:{clear}']();
    State.fire('@:{event#stage.page.and.elements.change}');
    if (scaleChange) {
        State.fire('@:{event#stage.scale.change}');
    }
    if (delayUpdateProps) {//更新所有元素的动态计算属性
        for (let [ctrl, ps] of delayUpdateProps) {
            ctrl['@:{update.props}'](ps);
        }
    }
    //保存历史记录
    DHistory["@:{history#save}"](e['@:{example.change.event#type}'], e['@:{example.change.event#title}']);
    await delay(50);
    await lowTaskFinale();
    if (stageNode &&
        m()) {
        stageNode.scrollTo(x, y);
    }
};

export default {
    '@:{example#setup}'(owner) {
        markOwner = owner;
        //更换模板
        State.on('@:{event#example.change}', changeExample);
        State.on('@:{event#stage.preset.size.change}', changeSize);
    },
    '@:{example#teardown}'() {
        markOwner = null;
        //更换模板
        State.off('@:{event#example.change}', changeExample);
        State.off('@:{event#stage.preset.size.change}', changeSize);
    }
};