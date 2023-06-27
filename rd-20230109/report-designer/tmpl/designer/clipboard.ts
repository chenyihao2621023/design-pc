/**
 * 剪切板管理对象
 */
import Magix from 'magix5';
import GenericProvider from '../provider/generic';
import Const from './const';
import Enum from './enum';
import StageGeneric from './generic';
import DHistory from './history';
import StageSelection from './selection';
import Transform from './transform';
let { abs } = Math;
let { State, node, guid, mix, isFunction } = Magix;
//let { MAX_VALUE } = Number;
/**
 * 检测是否有相同宽度和旋转角度的元素在目标位置上
 * @param elements 检测哪些元素
 * @param compareX 比较的x坐标
 * @param compareY 比较的y坐标
 * @param width 比较的宽度
 * @param height 比较的高度
 * @param rotate 旋转角度
 * @param aberration 误差
 * @returns 在比较的位置上是否已经有了元素
 */
let hasSameXY = (elements,
    compareX,
    compareY,
    width,
    height,
    rotate,
    aberration) => {//如果位置相同，则自动有一定的偏移量，防止显示在同一个位置上，让使用者不容易看出来
    for (let { props } of elements) {
        if (abs(props.x - compareX) < aberration &&
            abs(props.y - compareY) < aberration &&
            abs(props.width - width) < aberration &&
            abs(props.height - height) < aberration &&
            Const['@:{const#approach}'](props.rotate || 0, rotate || 0)) {
            return 1;
        }
    }
};
/**
 * 获取相对偏移量
 * @param props 元素属性
 * @param xy 鼠标位置
 * @param stage 设计区
 * @param aberration 误差
 * @returns 
 */
let getDiff = (props: Report.StageElementProps,
    xy: Report.Point,
    stage: Report.ElementsQueryNearestStageResult,
    aberration: number,
    moveX: number,
    moveY: number) => {
    let diffX,
        diffY,
        elements = stage['@:{collection}'],
        { x, y, width, height, rotate } = props;
    let rect = Transform['@:{transform#rotate.rect}'](props);
    if (xy) {
        let lt = rect['@:{point}'][0];
        diffX = Const['@:{const#to.unit}'](xy.x) - lt.x;
        diffY = Const['@:{const#to.unit}'](xy.y) - lt.y;
    } else {
        let canvas = node<HTMLDivElement>(stage['@:{container}']);
        let canRect = {
            x: 0,
            y: 0,
            width: Const['@:{const#to.unit}'](canvas.offsetWidth) - 2 * aberration,
            height: Const['@:{const#to.unit}'](canvas.offsetHeight) - 2 * aberration
        };
        let newRect = {
            x: rect['@:{left}'] - aberration,
            y: rect['@:{top}'] - aberration,
            width: rect['@:{width}'],
            height: rect['@:{height}']
        };
        if (!Transform["@:{transform#rect.intersect}"](newRect, canRect)) {
            x = canRect.x + (x - newRect.x - aberration);
            y = canRect.y + (y - newRect.y - aberration);
            if (moveX) {
                x += Const['@:{const#to.unit}'](moveX);
            }
            if (moveY) {
                y += Const['@:{const#to.unit}'](moveY);
            }
        }
        let moved = Const['@:{const#to.unit}'](Const['@:{const#element.same.position.offset}']);
        while (hasSameXY(elements, x, y, width, height, rotate, aberration)) {
            x += moved;
            y += moved;
        }
        diffX = x - props.x;
        diffY = y - props.y;
    }
    return {
        x: diffX,
        y: diffY
    };
};
/**
 * 深度遍历元素
 * @param from 来源元素
 * @param to 目标元素
 * @param elements 其它元素
 */
let walkElements = (from: Report.StageElement,
    to: Report.StageElement,
    elements: Report.StageElement[]) => {
    to.type = from.type;
    to.ctrl = from.ctrl;
    to.props = GenericProvider['@:{generic#clone}'](from.props);
    to.id = guid(State.get<string>('@:{global#stage.element.id.prefix}'));
    if (from.ctrl.as & Enum['@:{enum#as.hod}']) {
        to.props.rows = [];
        to.props.focusRow = -1;
        to.props.focusCol = -1;
        for (let r of from.props.rows) {
            let record = { ...r };
            let cols = [];
            for (let c of r.cols) {
                let ci = { ...c };
                if (c.elements) {
                    ci.elements = [];
                    for (let cc of c.elements) {
                        let canPaste = 1;
                        let count = cc.ctrl['@:{allowed.stage.count}'];
                        if (count >= 0) {
                            let cn = StageGeneric["@:{generic#query.elements.count.by.type}"](elements, cc.type);
                            if (cn >= count) {
                                canPaste = 0;
                            }
                        }
                        if (canPaste) {
                            let x = <Report.StageElement>{};
                            walkElements(cc, x, elements);
                            ci.elements.push(x);
                        }
                    }
                }
                cols.push(ci);
            }
            record.cols = cols;
            to.props.rows.push(record);
        }
    }
};
/**
 * 粘贴元素
 * @param stage 粘贴到哪个设计区
 * @param list 粘贴的元素列表
 * @param relationships 存放流程图关系的对象
 * @param xy 在哪个位置粘贴
 * @param anchor 参考元素
 * @param moveX 如果位置上有相同元素，则x移动距离
 * @param moveY 如果位置上有相同元素，则y移动距离
 * @returns 
 */
let PasteElements = (stage,
    list,
    relationships,
    xy?: Report.Point,
    anchor?: string,
    moveX?: number,
    moveY?: number) => {
    let elements = stage['@:{collection}'];
    let allowedElements = stage['@:{allowed.elements}'];
    let stageType = stage['@:{type}'];
    let groups = State.get('@:{global#stage.elements.groups}');
    let update, selected = [];
    let changedIds = {};
    if (list?.length) {
        list = GenericProvider['@:{generic#clone}'](list);
        let diffX = 0, diffY = 0;
        let ab = Const['@:{const#unit.step}']();
        let container = node<HTMLDivElement>(stage['@:{container}']);
        let cb = container.getBoundingClientRect();
        let stageBound = Transform['@:{transform#get.stage.dom.rect}']();
        let dx = Const['@:{const#to.unit}'](cb.x - stageBound.x);
        let dy = Const['@:{const#to.unit}'](cb.y - stageBound.y);
        let { '@:{generic.all#elements}': allElements } = StageGeneric['@:{generic#query.all.elements.and.map}']();
        for (let i = list.length; i--;) {
            let m = list[i];
            if (!(m.ctrl['@:{modifier}'] & Enum['@:{enum#modifier.linkage}'])) {
                let cloned = {
                    ...m,
                    props: {
                        ...m.props,
                        ename: GenericProvider['@:{generic#generate.ename}'](m.ctrl, allElements),
                    }
                };
                allElements.push(cloned);
                let { props } = cloned;
                props.x -= dx;
                props.y -= dy;
                if (!anchor) {
                    anchor = m.id;
                }
                if (anchor == m.id) {
                    let diff = getDiff(props, xy, stage, ab, moveX, moveY);
                    diffX = diff.x;
                    diffY = diff.y;
                }
                list[i] = cloned;
            }
        }
        for (let m of list) {
            let canPaste = 1;
            let allowedToHods = m.ctrl['@:{allowed.to.hod}'];
            if (allowedElements
                && !allowedElements[m.type]) {
                canPaste = 0;
            }
            if (canPaste &&
                allowedToHods &&
                !allowedToHods[stageType]) {
                canPaste = 0
            }
            if (canPaste) {
                let total = m.ctrl['@:{allowed.total.count}'];
                if (total >= 0) {
                    let added = StageGeneric["@:{generic#query.element.added.list.count}"](m.ctrl);
                    if (added >= total) {
                        canPaste = 0;
                    }
                }
            }
            if (canPaste) {
                let count = m.ctrl['@:{allowed.stage.count}'];
                if (count >= 0) {
                    let cc = StageGeneric["@:{generic#query.elements.count.by.type}"](elements, m.type);
                    if (cc >= count) {
                        canPaste = 0;
                    }
                }
            }
            if (canPaste) {
                update = 1;
                let nm = {} as Report.StageElement;
                walkElements(m, nm, elements);
                let { props, ctrl } = nm;

                let moveProps = ctrl['@:{move.props}'];
                if (isFunction(moveProps)) {
                    moveProps = moveProps(props);
                }
                if (moveProps) {
                    for (let x of moveProps) {
                        props[x.key] += x.use == 'x' ? diffX : diffY;
                    }
                }
                props.locked = false;
                props.pinX = false;
                props.pinY = false;
                if (ctrl['@:{update.props}'] &&
                    !(ctrl['@:{modifier}'] & Enum['@:{enum#modifier.linkage}'])) {
                    ctrl['@:{update.props}'](props);
                }

                //自动重连相应的关系
                if (relationships?.[m.id]) {
                    relationships[m.id] = nm.id;
                }
                elements.push(nm);
                selected.push(nm);
                changedIds[m.id] = nm.id;
                StageGeneric['@:{generic#reset.all.cache}']();
            }
        }
        if (update) {
            for (let g in groups) {
                let list = groups[g];
                let dest = changedIds[g];
                if (dest) {
                    let newGroup = [];
                    for (let e of list) {
                        let exist = changedIds[e];
                        if (exist) {
                            newGroup.push(exist);
                        }
                    }
                    if (newGroup.length > 1) {
                        groups[dest] = newGroup;
                    }
                }
            }
        }
    }
    return {
        '@:{update}': update,
        '@:{added}': selected,
        '@:{change.ids}': changedIds,
        '@:{relationships}': relationships
    };
};
let emptyArray = [];
export default {
    /**
     * 获取复制列表
     */
    '@:{get.copy.list}'() {
        let clipboard = State.get('@:{global#stage.clipboard}');
        return clipboard.c || emptyArray;
    },
    /**
     * 清空剪切板信息
     */
    '@:{clear}'() {
        let clipboard = State.get('@:{global#stage.clipboard}');
        if (clipboard.c) {
            State.set({
                '@:{global#stage.clipboard}': {}
            });
            State.fire('@:{event#stage.clipboard.change}');
        }
    },
    /**
     * 是否剪切动作
     */
    '@:{is.cut}'(): boolean | number {
        let clipboard = State.get('@:{global#stage.clipboard}');
        return clipboard.cut;
    },
    /**
     * 缓存元素
     * @param sourceList 源列表
     */
    '@:{cache.elements}'(sourceList: Report.StageElement[],
        isCut?: number | boolean,
        e?: Magix5.MagixPointerEvent) {
        let list, relationships;
        if (sourceList.length) {
            let underElement = State.get<Report.StageElement>('@:{global#stage.contextmenu.under.item}');
            let offsetX = 0,
                offsetY = 0;
            list = GenericProvider['@:{generic#clone}'](sourceList);//获取当前所有选中元素
            let flowProvider = State.get<Report.ProviderOfFlow>('@:{global#provider.of.flow}');
            if (flowProvider) {//剪切时，如果是流程图元素，自动添加所包含的连接线一起移动
                if (isCut) {
                    list = flowProvider["@:{flow.provider#add.connector.from.elements}"](list);
                }
                else {//复制时，对于连接线虽然也选中，但只要它连接的元素不全部在复制的元素内，则从复制元素中移除连接线
                    list = flowProvider["@:{flow.provider#remove.connector.from.elements}"](list);
                }
                relationships = flowProvider["@:{flow.provider#collect.before.clone.relationships}"](list);
            }
            let { x, y } = Transform['@:{transform#get.stage.dom.rect}']();
            //let offset = isCut ? 0 : Const['@:{const#to.unit}'](Const['@:{const#element.same.position.offset}']);
            let ab = Const['@:{const#unit.step}']();
            let minLeft,
                minLeftBound,
                minTop,
                minTopBound;
            for (let m of list) {
                let { id, props } = m;
                let mk = node<HTMLElement>(`_rdm_${id}`);
                if (mk) {
                    let mkb = mk.getBoundingClientRect();
                    let cx = mkb.x + mkb.width / 2 - x,
                        cy = mkb.y + mkb.height / 2 - y;
                    let rect = Transform['@:{transform#rotate.rect}'](props);
                    let dx = rect['@:{center.x}'] - Const['@:{const#to.unit}'](cx);
                    let dy = rect['@:{center.y}'] - Const['@:{const#to.unit}'](cy);
                    if (abs(dx) > ab) {
                        props.x -= dx;
                    }
                    if (abs(dy) > ab) {
                        props.y -= dy;
                    }

                    if (e &&
                        Const['@:{const#contextmenu.paste.exactly.source.position}'] &&
                        id == underElement.id) {
                        let lt = rect['@:{point}'][0];
                        offsetX = e.pageX - x - Const['@:{const#to.px}'](lt.x - dx);
                        offsetY = e.pageY - y - Const['@:{const#to.px}'](lt.y - dy);
                    }

                    if (!minLeft ||
                        mkb.x < minLeftBound.x) {
                        minLeft = id;
                        minLeftBound = mkb;
                    }
                    if (!minTop ||
                        mkb.y < minTopBound.y) {
                        minTop = id;
                        minTopBound = mkb;
                    }
                }
            }
            /**
             * 粘贴时，需要整体考虑，使用最左侧或最顶部的元素为参考元素，把这2个元素尽可能的露一点在设计区
             */
            let scElement,
                moveX = 0,
                moveY = 0;
            if (minLeft != minTop) {
                let mx = minTopBound.x - minLeftBound.right;
                let my = minLeftBound.y - minTopBound.bottom;
                if (mx > my) {
                    scElement = minLeft;
                    if (my > 0) {
                        moveY = my + Const['@:{const#element.same.position.offset}'];
                    }
                } else {
                    scElement = minTop;
                    if (mx > 0) {
                        moveX = mx + Const['@:{const#element.same.position.offset}'];
                    }
                }
            } else {
                scElement = minTop;
            }
            let clipboard = State.get('@:{global#stage.clipboard}');
            clipboard.se = scElement;
            clipboard.ue = underElement?.id;
            clipboard.ox = offsetX;
            clipboard.oy = offsetY;
            clipboard.mx = moveX;
            clipboard.my = moveY;
        }
        return {
            '@:{relationships}': relationships,
            '@:{list}': list
        };
    },
    /**
     * 复制元素
     */
    '@:{copy.elements}'(e?: Magix5.MagixPointerEvent) {
        let sourceList = State.get<Report.StageElement[]>('@:{global#stage.select.elements}');
        let clipboard = State.get('@:{global#stage.clipboard}');
        clipboard.cut = 0;
        let {
            '@:{relationships}': relationships,
            '@:{list}': list
        } = this['@:{cache.elements}'](sourceList, 0, e);
        if (list?.length) {
            clipboard.fr = relationships;
            clipboard.c = list;
            State.fire('@:{event#stage.clipboard.change}');
        }
    },
    /**
     * 剪切元素
     */
    '@:{cut.elements}'(e?: Magix5.MagixPointerEvent) {
        let sourceList = State.get<Report.StageElement[]>('@:{global#stage.select.elements}');
        let clipboard = State.get('@:{global#stage.clipboard}');
        clipboard.cut = 1;
        let {
            '@:{relationships}': relationships,
            '@:{list}': list
        } = this['@:{cache.elements}'](sourceList, 1, e);
        if (list?.length) {
            clipboard.fr = relationships;
            clipboard.c = list;

            let ids = {};
            let flowProvider = State.get<Report.ProviderOfFlow>('@:{global#provider.of.flow}');
            let changedElements = [];
            for (let e of list) {
                let { props } = e;
                if (!props.locked &&
                    !props.pinX &&
                    !props.pinY) {
                    changedElements.push(e);
                    ids[e.id] = 1;
                }
            }
            if (flowProvider) {
                let { //'@:{generic.all#map}': all,
                    '@:{generic.all#elements}': stageElements
                } = StageGeneric['@:{generic#query.all.elements.and.map}']();
                for (let element of stageElements) {
                    let { props, id, ctrl } = element;
                    if ((ctrl['@:{modifier}'] & Enum['@:{enum#modifier.linkage}']) &&
                        (ids[props.linkFromId] ||
                            ids[props.linkToId])) {
                        ids[id] = 1;
                    }
                }
            }
            if (changedElements.length) {
                StageGeneric['@:{generic#remove.grouped.element.by.ids}'](ids);
                StageGeneric["@:{generic#internal.delete.element.by.id.map.silent}"](ids);
                StageSelection['@:{selection#set}']();
                DHistory['@:{history#save}'](DHistory['@:{history#element.cut}'], StageGeneric['@:{generic#query.element.name}'](changedElements));
                State.fire('@:{event#stage.elements.change}');
            }
        }
    },
    /**
     * 克隆元素
     * @param stages 选中元素处在哪些设计区里
     * @returns 
     */
    '@:{duplicate.elements}'(stages: Report.ElementsQuerySelectElementsStageResult[]) {
        let page = State.get<Report.StagePage>('@:{global#stage.page}');
        if (!page.readonly) {
            let rs = {}, selected = [];
            let flowProvider = State.get<Report.ProviderOfFlow>('@:{global#provider.of.flow}');
            for (let stage of stages) {
                let {
                    '@:{relationships}': preRel,
                    '@:{list}': list
                } = this['@:{cache.elements}'](stage['@:{selected}']);
                let {
                    '@:{relationships}': relationships,
                    '@:{added}': added,
                    '@:{update}': update
                } = PasteElements(stage, list, preRel);
                if (update) {
                    mix(rs, relationships);
                    selected.push(...added);
                }
            }
            if (selected.length) {
                if (flowProvider) {
                    StageGeneric['@:{generic#reset.all.cache}']();
                    flowProvider["@:{flow.provider#rebuild.relationship.after.clone}"](selected, rs);
                }
                State.fire('@:{event#stage.elements.change}');
                StageSelection['@:{selection#set.all}'](selected);
                DHistory['@:{history#save}'](DHistory['@:{history#element.duplicate}'], StageGeneric['@:{generic#query.element.name}'](selected));
            }
        }
    },
    /**
     * 粘贴元素
     * @param stage 设计区对象，每一个容器的格子也是一个设计区,使用该对象表示粘贴到哪个设计区里
     * @param xy 粘贴坐标
     */
    '@:{paste.elements}'(stage: Report.StageZoneInfo,
        xy?: Report.Point) {
        let page = State.get<Report.StagePage>('@:{global#stage.page}');
        if (!page.readonly) {
            let flowProvider = State.get<Report.ProviderOfFlow>('@:{global#provider.of.flow}');

            let clipboard = State.get('@:{global#stage.clipboard}');
            let under = clipboard.ue;
            let short = clipboard.se,
                moveX,
                moveY;
            if (under && xy) {
                let offsetX = clipboard.ox;
                let offsetY = clipboard.oy;
                xy.x -= offsetX;
                xy.y -= offsetY;
            } else {
                under = short;
                moveX = clipboard.mx;
                moveY = clipboard.my;
            }
            let {
                '@:{relationships}': relationships,
                '@:{added}': selected,
                '@:{update}': update
            } = PasteElements(stage, clipboard.c, clipboard.fr, xy, under, moveX, moveY);
            if (update) {
                if (clipboard.cut &&
                    Const['@:{const#clear.copy.list.when.cut.action}']) {
                    this['@:{clear}']();
                }
                if (flowProvider) {
                    StageGeneric['@:{generic#reset.all.cache}']();
                    flowProvider["@:{flow.provider#rebuild.relationship.after.clone}"](selected, relationships);
                }
                State.fire('@:{event#stage.elements.change}');
                StageSelection['@:{selection#set.all}'](selected);
                DHistory['@:{history#save}'](DHistory['@:{history#element.pasted}'], StageGeneric['@:{generic#query.element.name}'](selected));
            }
        }
    }
};