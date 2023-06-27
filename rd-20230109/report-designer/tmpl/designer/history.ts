/**
 * 历史记录
 */
import Magix from 'magix5';
import Const from './const';
let { State, toMap } = Magix;
/**
 * 以下常量用于对存放的历史记录增加相应的描述，用于历史面板的展示。比如用户清除了所有辅助线，则记录历史时，声明当前历史记录是类型10，则记录10对应的历史描述
 */
let Enum_History_Init = 0;
//1*分配给辅助线
let Enum_Clear_Help_Line = 10;
let Enum_Add_Help_Line = 11;
let Enum_Delete_Help_Line = 12;
let Enum_Move_Help_Line = 13;

//2*分配给设计区
let Enum_Clear_Stage = 20;
let Enum_Zoomin_Stage = 21;
let Enum_Zoomout_Stage = 22;
let Enum_ZoomresetStage = 23;
let Enum_Create_Page = 24;

//5*~8*分配给元素
let Enum_Element_Lost_Focus = 50;
let Enum_Element_Get_Focus = 51;
let Enum_Element_Moved = 52;
let Enum_Element_Aligned = 53;
let Enum_Element_Sync_Size = 54;
let Enum_Element_Added = 56;
let Enum_Element_Removed = 57;
let Enum_Element_Grouped = 58;
let Enum_Element_Ungrouped = 59;
let Enum_Element_Locked = 60;
let Enum_Element_Unlocked = 61;
let Enum_Element_ZIndex = 62;
let Enum_Element_Pasted = 63;
let Enum_Element_Rotated = 64;
let Enum_Element_Modified_Ctrl_Point = 65;
let Enum_Element_Modified_Size = 66;
let Enum_Element_Modified_Mod_Point = 67;
let Enum_Element_Props = 68;
let Enum_Element_Cut = 69;
let Enum_Element_Duplicate = 70;
let Enum_Element_Avg_Hor = 71;
let Enum_Element_Avg_Ver = 72;
let Enum_Element_Sync_Props = 73;

let Enum_Element_Animation_Add = 74;
let Enum_Element_Animation_Remove = 75;
let Enum_Element_Animation_Modify = 76;

//9*分配给示例
let Enum_Example_From_List = 90;
let Enum_Example_From_Remote = 91;
let Enum_Example_From_Custom = 92;

/**
 * 以下用于对数字类型翻译成相应的描述及icon
 */
let HistoryActions = [{
    '@:{history.action#description}': '@:{lang#history.action.init}',
    '@:{history.action#icon}': '&#xe667;',
    '@:{history.action#type}': Enum_History_Init
}, {
    '@:{history.action#description}': '@:{lang#history.action.clear.help.line}',
    '@:{history.action#icon}': '&#xe68b;',
    '@:{history.action#type}': Enum_Clear_Help_Line
}, {
    '@:{history.action#description}': '@:{lang#history.action.add.help.line}',
    '@:{history.action#icon}': '&#xe68b;',
    '@:{history.action#type}': Enum_Add_Help_Line
}, {
    '@:{history.action#description}': '@:{lang#history.action.delete.help.line}',
    '@:{history.action#icon}': '&#xe68b;',
    '@:{history.action#type}': Enum_Delete_Help_Line
}, {
    '@:{history.action#description}': '@:{lang#history.action.move.help.line}',
    '@:{history.action#icon}': '&#xe68b;',
    '@:{history.action#type}': Enum_Move_Help_Line
}, {
    '@:{history.action#description}': '@:{lang#history.action.clear.stage}',
    '@:{history.action#icon}': '&#xe7db;',
    '@:{history.action#type}': Enum_Clear_Stage
}, {
    '@:{history.action#description}': '@:{lang#history.action.zoomin.stage}',
    '@:{history.action#icon}': '&#xe681;',
    '@:{history.action#type}': Enum_Zoomin_Stage
}, {
    '@:{history.action#description}': '@:{lang#history.action.zoomout.stage}',
    '@:{history.action#icon}': '&#xe680;',
    '@:{history.action#type}': Enum_Zoomout_Stage
}, {
    '@:{history.action#description}': '@:{lang#history.action.zoomreset.stage}',
    '@:{history.action#icon}': '&#xe67b;',
    '@:{history.action#type}': Enum_ZoomresetStage
}, {
    '@:{history.action#description}': '@:{lang#history.action.new.page}',
    '@:{history.action#icon}': '&#xe612;',
    '@:{history.action#type}': Enum_Create_Page
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.lost.focus}',
    '@:{history.action#icon}': '&#xe65d;',
    '@:{history.action#type}': Enum_Element_Lost_Focus
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.get.focus}',
    '@:{history.action#icon}': '&#xe65d;',
    '@:{history.action#type}': Enum_Element_Get_Focus
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.moved}',
    '@:{history.action#icon}': '&#xe648;',
    '@:{history.action#type}': Enum_Element_Moved
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.aligned}',
    '@:{history.action#icon}': '&#xe694;',
    '@:{history.action#type}': Enum_Element_Aligned
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.sync.size}',
    '@:{history.action#icon}': '&#xe662;',
    '@:{history.action#type}': Enum_Element_Sync_Size
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.added}',
    '@:{history.action#icon}': '&#xe652;',
    '@:{history.action#type}': Enum_Element_Added
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.removed}',
    '@:{history.action#icon}': '&#xe6b3;',
    '@:{history.action#type}': Enum_Element_Removed
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.grouped}',
    '@:{history.action#icon}': '&#xe669;',
    '@:{history.action#type}': Enum_Element_Grouped
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.ungrouped}',
    '@:{history.action#icon}': '&#xe684;',
    '@:{history.action#type}': Enum_Element_Ungrouped
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.locked}',
    '@:{history.action#icon}': '&#xe63e;',
    '@:{history.action#type}': Enum_Element_Locked
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.unlocked}',
    '@:{history.action#icon}': '&#xe637;',
    '@:{history.action#type}': Enum_Element_Unlocked
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.zindex}',
    '@:{history.action#icon}': '&#xe656;',
    '@:{history.action#type}': Enum_Element_ZIndex
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.pasted}',
    '@:{history.action#icon}': '&#xe6c1;',
    '@:{history.action#type}': Enum_Element_Pasted
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.rotated}',
    '@:{history.action#icon}': '&#xe641;',
    '@:{history.action#type}': Enum_Element_Rotated
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.modified.ctrl.point}',
    '@:{history.action#icon}': '&#xe6da;',
    '@:{history.action#type}': Enum_Element_Modified_Ctrl_Point
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.modified.mod.point}',
    '@:{history.action#icon}': '&#xe6da;',
    '@:{history.action#type}': Enum_Element_Modified_Mod_Point
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.modified.size}',
    '@:{history.action#icon}': '&#xe673;',
    '@:{history.action#type}': Enum_Element_Modified_Size
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.modified.props}',
    '@:{history.action#icon}': '&#xe655;',
    '@:{history.action#type}': Enum_Element_Props
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.cut}',
    '@:{history.action#icon}': '&#xe6bf;',
    '@:{history.action#type}': Enum_Element_Cut
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.duplicate}',
    '@:{history.action#icon}': '&#xe6b1;',
    '@:{history.action#type}': Enum_Element_Duplicate
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.avg.h}',
    '@:{history.action#icon}': '&#xe6bb;',
    '@:{history.action#type}': Enum_Element_Avg_Hor
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.avg.v}',
    '@:{history.action#icon}': '&#xe6cf;',
    '@:{history.action#type}': Enum_Element_Avg_Ver
}, {
    '@:{history.action#description}': '@:{lang#history.sync.props}',
    '@:{history.action#icon}': '&#xe655;',
    '@:{history.action#type}': Enum_Element_Sync_Props
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.animation.add}',
    '@:{history.action#icon}': '&#xe692;',
    '@:{history.action#type}': Enum_Element_Animation_Add
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.animation.remove}',
    '@:{history.action#icon}': '&#xe692;',
    '@:{history.action#type}': Enum_Element_Animation_Remove
}, {
    '@:{history.action#description}': '@:{lang#history.action.element.animation.modify}',
    '@:{history.action#icon}': '&#xe692;',
    '@:{history.action#type}': Enum_Element_Animation_Modify
}, {
    '@:{history.action#description}': '@:{lang#history.action.example.from.list}',
    '@:{history.action#icon}': '&#xe63f;',
    '@:{history.action#type}': Enum_Example_From_List
}, {
    '@:{history.action#description}': '@:{lang#history.action.example.from.remote}',
    '@:{history.action#icon}': '&#xe63f;',
    '@:{history.action#type}': Enum_Example_From_Remote
}, {
    '@:{history.action#description}': '@:{lang#history.action.example.from.custom}',
    '@:{history.action#icon}': '&#xe63f;',
    '@:{history.action#type}': Enum_Example_From_Custom
}];
let HistoryActionsMap = toMap(HistoryActions, '@:{history.action#type}');
let HistoryList = [];//历史记录
let HistoryIndex = -1;//当前索引

let BuferStage = null;//对于连续操作的动作，比如按下键盘移动，并不是每次都记录历史记录。会采用延迟多少毫秒后未有新的动作则进行记录
let BuferTimer;//缓存定时器
let LastType = '';//根据类型来决定是否把上一次的记录立即存储到列表中
//历史记录只能还原到的编辑区状态
let DefaultStage = null;
/**
 * 过滤器
 */
let filter = DEBUG ? (key, value) => {
    if (key.startsWith('@:') ||
        key.startsWith('_')) {
        return undefined;
    }
    return value
} : (key, value) => key.startsWith('_') ? undefined : value;
/**
 * 获取当前设计区的快照
 * @param type 历史类型
 * @param extDescription 历史扩展描述
 */
let getSnapshot = (type: number = Enum_History_Init,
    extDescription = '') => {
    let i = HistoryActionsMap[type];
    return {
        '@:{history#icon}': i['@:{history.action#icon}'],
        '@:{history#description}': i['@:{history.action#description}'],
        '@:{history#ext.description}': extDescription,
        '@:{history#content}': JSON.stringify({
            a: State.get('@:{global#stage.unit}'),
            b: State.get('@:{global#stage.page}'),
            c: State.get('@:{global#stage.scale}'),
            d: State.get('@:{global#stage.elements}'),
            e: State.get('@:{global#stage.select.elements}'),
            f: State.get('@:{global#stage.elements.groups}'),
            g: State.get('@:{global#stage.x.help.lines}'),
            h: State.get('@:{global#stage.y.help.lines}'),
            i: State.get('@:{global#stage.clipboard}')
        }, filter)
    };
};
/**
 * 记录历史
 * @param history 历史记录 
 */
let pushUndo = history => {//记录
    if (DefaultStage) {
        let prev = HistoryList[HistoryIndex];
        let nextIndex = HistoryIndex + 1;
        HistoryList.splice(nextIndex, Const["@:{const#history.max.count}"]);
        if (prev?.['@:{history#content}'] != history['@:{history#content}']) {
            HistoryList[nextIndex] = history;
        }
        while (HistoryList.length > Const["@:{const#history.max.count}"]) {
            DefaultStage = HistoryList.shift();
        }
        HistoryIndex = HistoryList.length - 1;
        BuferStage = null;
    } else {
        DefaultStage = history;
    }
    State.fire('@:{event#history.list.change}');
};

/**
 * 检查是否有等待中的历史记录，比如快速输入,500ms延迟记录历史，如果这时有其它不同类型的历史记录进来，则需要立即推入延迟等待中的历史
 * @param type 当前要记录的历史类型
 */
let checkWaitingHistory = (type = '@:{history#default.check.save.type}') => {
    if (type != LastType) {//如果当前类型不与最后一个类型相同
        if (BuferStage) {//如果有缓存记录，则立即记录到历史记录里
            clearTimeout(BuferTimer);
            pushUndo(BuferStage);
        }
        LastType = type;
    }
};
/**
 * 还原任意历史记录为当前状态
 * @param index 历史索引
 * @param preventUseDefault 是否可使用默认的历史记录
 */
let setHistory = (index: number, preventUseDefault?: number) => {
    let current = HistoryList[index];
    if (!current &&
        !preventUseDefault) {
        current = DefaultStage;
    }
    if (current) {
        State.fire('@:{event#history.shift.change}', JSON.parse(current['@:{history#content}']));
    }
};
export default {
    /**
     * 以下把定义的数字常量转成字符串导出，方便外部使用
     */
    '@:{history#clear.help.line}': Enum_Clear_Help_Line,
    '@:{history#add.help.line}': Enum_Add_Help_Line,
    '@:{history#delete.help.line}': Enum_Delete_Help_Line,
    '@:{history#move.help.line}': Enum_Move_Help_Line,

    '@:{history#clear.stage}': Enum_Clear_Stage,
    '@:{history#new.page}': Enum_Create_Page,
    '@:{history#zoomin.stage}': Enum_Zoomin_Stage,
    '@:{history#zoomout.stage}': Enum_Zoomout_Stage,
    '@:{history#zoomreset.stage}': Enum_ZoomresetStage,

    '@:{history#element.lost.focus}': Enum_Element_Lost_Focus,
    '@:{history#element.get.focus}': Enum_Element_Get_Focus,
    '@:{history#element.moved}': Enum_Element_Moved,
    '@:{history#element.aligned}': Enum_Element_Aligned,
    '@:{history#element.sync.size}': Enum_Element_Sync_Size,
    '@:{history#element.added}': Enum_Element_Added,
    '@:{history#element.removed}': Enum_Element_Removed,
    '@:{history#element.grouped}': Enum_Element_Grouped,
    '@:{history#element.ungrouped}': Enum_Element_Ungrouped,
    '@:{history#element.locked}': Enum_Element_Locked,
    '@:{history#element.unlocked}': Enum_Element_Unlocked,
    '@:{history#element.z.index}': Enum_Element_ZIndex,
    '@:{history#element.pasted}': Enum_Element_Pasted,
    '@:{history#element.rotated}': Enum_Element_Rotated,
    '@:{history#element.modified.ctrl.point}': Enum_Element_Modified_Ctrl_Point,
    '@:{history#element.modified.mod.point}': Enum_Element_Modified_Mod_Point,
    '@:{history#element.modified.size}': Enum_Element_Modified_Size,
    '@:{history#element.modified.props}': Enum_Element_Props,
    '@:{history#element.cut}': Enum_Element_Cut,
    '@:{history#element.duplicate}': Enum_Element_Duplicate,
    '@:{history#element.avg.h}': Enum_Element_Avg_Hor,
    '@:{history#element.avg.v}': Enum_Element_Avg_Ver,
    '@:{history#element.sync.props}': Enum_Element_Sync_Props,
    '@:{history#element.animation.add}': Enum_Element_Animation_Add,
    '@:{history#element.animation.remove}': Enum_Element_Animation_Remove,
    '@:{history#element.animation.modify}': Enum_Element_Animation_Modify,

    '@:{history#example.from.list}': Enum_Example_From_List,
    '@:{history#example.from.remote}': Enum_Example_From_Remote,
    '@:{history#example.from.custom}': Enum_Example_From_Custom,
    /**
     * 设计器初始化时，需要先保存一下默认状态
     */
    '@:{history#save.default}'() {
        if (!DefaultStage) {
            DefaultStage = getSnapshot();
            State.fire('@:{event#history.list.change}');
        }
    },
    /**
     * 查询当前能否进行undo与redo
     */
    '@:{history#query.status}'() {
        return {
            canRedo: HistoryList.length - 1 > HistoryIndex,
            canUndo: HistoryIndex >= 0
        };
    },
    /**
     * 获取历史记录当前状态，历史列表、当前历史状态和最原始的历史状态
     */
    '@:{history#get.history.info}'() {
        return {
            '@:{list}': HistoryList,
            '@:{index}': HistoryIndex,
            '@:{bottom}': DefaultStage
        };
    },
    /**
     * 通过索引更新历史
     * @param index 历史索引
     */
    '@:{history#set.history}'(index: number) {
        if (HistoryIndex != index) {
            HistoryIndex = index;
            setHistory(index);
        }
    },
    /**
     * 清空历史记录
     */
    '@:{history#clear}'() {
        clearTimeout(BuferTimer);
        HistoryIndex = -1;
        HistoryList.length = 0;
        DefaultStage = null;
        LastType = '';
    },
    /**
     * 撤销操作
     */
    '@:{history#undo}'() {
        checkWaitingHistory();
        let c = HistoryList.length;
        //当有历史记录时我们才进行还原操作
        if (c > 0 &&
            HistoryIndex > -1) {
            //如果剩余列表已经没了，则使用默认的
            HistoryIndex -= 1;
            setHistory(HistoryIndex);
        }
    },
    /**
     * 重做操作
     */
    '@:{history#redo}'() {
        checkWaitingHistory();
        let c = HistoryList.length;
        if (c &&
            HistoryIndex < c - 1) {
            HistoryIndex += 1;
            setHistory(HistoryIndex, 1);
        }
    },
    /**
     * 替换当前状态
     */
    '@:{history#replace.state}'() {
        let current = HistoryList[HistoryIndex];
        let stage = getSnapshot();
        console.log('replace state at', HistoryIndex);
        current['@:{history#content}'] = stage['@:{history#content}'];
    },
    /**
     * 删除指定位置的历史记录
     * @param at 历史记录位置
     */
    '@:{history#remove.at}'(at: number) {
        //如果有缓存中的历史记录，则直接进入历史列表
        checkWaitingHistory();
        //删除指定的历史记录
        HistoryList.splice(at, 1);
        //删除的是当前选中的历史记录
        if (at == HistoryIndex) {
            //最后一个时前移
            if (HistoryIndex >= HistoryList.length) {
                //选中前一个
                HistoryIndex -= 1
            }
            setHistory(HistoryIndex);
        } else {
            //删除选中历史前面的记录
            if (at < HistoryIndex) {
                HistoryIndex -= 1;
            }
            State.fire('@:{event#history.list.change}', {
                '@:{action.by}': '@:{remove}'
            });
        }
    },
    /**
     * 保存历史记录
     * @param action 保存动作类型
     * @param extTitle 扩展标题描述
     * @param type 历史类型，配合waiting使用
     * @param waiting 延迟多少毫秒后写入历史记录，即一定时间内type相同的历史只记录一次，比如按下键盘箭头进行元素位置移动。
     */
    '@:{history#save}'(action: number, extTitle = '', type = '@:{history#default.save.type}', waiting = 0) {//保存历史记录
        //State.fire('@:{event#history.immediate.change}');
        checkWaitingHistory(type);
        let stage = getSnapshot(action, extTitle);//获取当前快照
        if (waiting) {//如果有等待
            BuferStage = stage;//缓存
            clearTimeout(BuferTimer);
            //到达一定时间如果没有新的相似记录进来，则记录
            BuferTimer = setTimeout(pushUndo, waiting, BuferStage);
        } else {
            pushUndo(stage);
        }
    },
};