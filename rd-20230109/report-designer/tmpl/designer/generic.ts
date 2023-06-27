import Magix from 'magix5';
import I18n from '../i18n/index';
import Const from './const';
import StageSelection from './selection';
import Transform from './transform';
import DHistory from './history';
import Enum from './enum';
let { node, State, toMap, Vframe, has, parseUrl, toUrl, config,
    //mark, unmark
} = Magix;
let MaxNum = Number.MAX_VALUE;
let READONLY = 1,
    PINED = 2,
    LOCKED = 4;
let { max, min, abs } = Math;
let minPxUnit = 1;
let defaultPageProps;
/**
 * 异步锁对象
 */
//let asyncLocker;
let AllElementsMap,
    AllElementsList,
    AllStageElementsMap,
    AllElementsParentHod;
let ResetAllCache = () => {
    if (AllElementsList) {
        console.log('reset all cache');
        AllElementsList = 0;
        AllElementsMap = 0;
        AllStageElementsMap = 0;
        AllElementsParentHod = 0;
    }
};
let addSizesMap = (sizesMap, h, size, start, end) => {
    if (!sizesMap[size]) {
        sizesMap[size] = {};
    }
    let m = sizesMap[size];
    let beginKey = h ? '@:{left}' : '@:{top}',
        endKey = h ? '@:{right}' : '@:{bottom}';
    if (m[beginKey] == null) {
        m[beginKey] = start;
        m[endKey] = end;
    } else {
        m[beginKey] = min(start, m[beginKey]);
        m[endKey] = max(end, m[endKey]);
    }
};
export default {
    '@:{generic#reset.all.cache}': ResetAllCache,
    /**
     * 安装监听器
     */
    '@:{generic#setup.all.elements.cache.monitor}'() {
        //asyncLocker = {};
        State.on('@:{event#stage.elements.change}', ResetAllCache);
        State.on('@:{event#stage.page.and.elements.change}', ResetAllCache);
        State.on('@:{event#history.shift.change}', ResetAllCache);
    },
    /**
     * 关闭监听器
     */
    '@:{generic#teardown.all.elements.cache.monitor}'() {
        ResetAllCache();
        //unmark(asyncLocker);
        State.off('@:{event#stage.elements.change}', ResetAllCache);
        State.off('@:{event#stage.page.and.elements.change}', ResetAllCache);
        State.off('@:{event#history.shift.change}', ResetAllCache);
    },
    /**
     * 缩放元素
     * @param props 缩放属性
     * @param ctrl 缩放控制对象
     * @param step 缩放比例
     * @param updateProps 是否更新其它属性
     */
    // '@:{generic#scale.element}'(props: Report.StageElementProps,
    //     ctrl: Report.StageElementCtrl,
    //     step: number,
    //     updateProps?: number) {
    //     let scaled = updateProps;
    //     if (ctrl['@:{scale.props}']) {
    //         scaled = 1;
    //         for (let s of ctrl['@:{scale.props}']) {
    //             if (type(s) == 'Function') {
    //                 s(props, step);
    //             } else {
    //                 props[s] *= step;
    //             }
    //         }
    //     }
    //     if (scaled &&
    //         ctrl['@:{update.props}']) {
    //         ctrl['@:{update.props}'](props);
    //     }
    // },
    /**
     * 获取元素坐标及尺寸信息，用于拉框选择
     * @param elements 待获取位置信息的元素列表
     */
    '@:{generic#query.elements.location}'(elements: Report.StageElement[]) {//
        let locations = [];
        if (elements?.length) {
            for (let e of elements) {
                let { props } = e;
                let { rotate, x, y, width, height, readonly } = props;
                if (Const['@:{const#support.readonly.element}'] && readonly) continue;
                let rect = {
                    x: Const['@:{const#to.px}'](x),
                    y: Const['@:{const#to.px}'](y),
                    width: Const['@:{const#to.px}'](width),
                    height: Const['@:{const#to.px}'](height),
                    rotate
                };
                let tsed = Transform["@:{transform#rotate.rect}"](rect);
                let [lt, rt, rb, lb] = tsed['@:{point}'];
                // let tl = lt, tt = lt, tr = lt, tb = lt;
                // for (let p of [rt, lb, rb]) {
                //     if (p.x < tl.x) {
                //         tl = p;
                //     }
                //     if (p.x > tr.x) {
                //         tr = p;
                //     }
                //     if (p.y < tt.y) {
                //         tt = p;
                //     }
                //     if (p.y > tb.y) {
                //         tb = p;
                //     }
                // }
                locations.push({
                    '@:{element}': e,
                    // left: tl,
                    // top: tt,
                    // right: tr,
                    // bottom: tb,
                    // '@:{width}': tsed.width,
                    // '@:{height}': tsed.height,
                    // '@:{left}': tsed.left,
                    // '@:{top}': tsed.top,
                    '@:{points}': [lt, rt, lb, rb],
                    '@:{lines}': [[lt, rt],
                    [rt, rb],
                    [rb, lb],
                    [lb, lt]]
                });
            }
        }
        return locations;
    },
    /**
     * 获取相交的元素
     * @param elementLocations 元素位置
     * @param rect 当前拉框的矩形
     * @param selectElements 拉框前已经选中的元素
     * @param firstElement 第一个元素
     * @param hods 容器集合
     * @param selectElementsIdMap 拉框前选中元素的id对象
     */
    '@:{generic#query.intersect.elements}'(elementLocations,
        rect, selectElements,
        firstElement,
        hods, selectElementsIdMap) {
        let selected = [], find,
            ids = [],
            topHods = {},
            findFirst,
            rectLines = [[{
                x: rect.x,
                y: rect.y
            }, {
                x: rect.x + rect.width,
                y: rect.y
            }], [{
                x: rect.x + rect.width,
                y: rect.y
            }, {
                x: rect.x + rect.width,
                y: rect.y + rect.height
            }], [{
                x: rect.x + rect.width,
                y: rect.y + rect.height
            }, {
                x: rect.x,
                y: rect.y + rect.height
            }], [{
                x: rect.x,
                y: rect.y + rect.height
            }, {
                x: rect.x,
                y: rect.y
            }]],
            interesctElements = {},
            deSelectedIdMap = {};
        for (let e of elementLocations) {
            find = 0;
            for (let p of e['@:{points}']) {
                if (p.x >= rect.x &&
                    p.y >= rect.y &&
                    p.x <= (rect.x + rect.width) &&
                    p.y <= (rect.y + rect.height)) {
                    let m = e['@:{element}'];
                    if (selectElementsIdMap[m.id]) {
                        deSelectedIdMap[m.id] = 1;
                    } else {
                        if (firstElement?.id != m.id) {
                            ids.push(m.id);
                            selected.push(m);
                        } else {
                            findFirst = 1;
                        }
                        interesctElements[m.id] = 1;
                        if (hods?.[m.id]) {
                            topHods[hods[m.id]] = 1;
                        }
                    }
                    find = 1;
                    break;
                }
            }
            if (!find) {
                for (let l of e['@:{lines}']) {
                    for (let rl of rectLines) {
                        if (Transform["@:{transform#is.line.cross}"](l, rl)) {
                            find = 1;
                            let m = e['@:{element}'];
                            if (selectElementsIdMap[m.id]) {
                                deSelectedIdMap[m.id] = 1;
                            } else {
                                if (firstElement?.id != m.id) {
                                    ids.push(m.id);
                                    selected.push(m);
                                } else {
                                    findFirst = 1;
                                }
                                interesctElements[m.id] = 1;
                                if (hods?.[m.id]) {
                                    topHods[hods[m.id]] = 1;
                                }
                            }
                            break;
                        }
                    }
                    if (find) {
                        break;
                    }
                }
            }
        }
        if (hods &&
            selectElements) {
            for (let se of selectElements) {
                if (!interesctElements[se.id] &&
                    !deSelectedIdMap[se.id] &&
                    !topHods[se.id] && (//之前选择的元素是容器不能包含当前元素，需要取消
                        !hods[se.id] ||//之前选择的元素不在容器里
                        !interesctElements[hods[se.id]])) {//之前选择的元素不在当前拉框范围内
                    if (firstElement?.id != se.id) {
                        ids.push(se.id);
                        selected.push(se);
                    } else {
                        findFirst = 1;
                    }
                }
            }
        }
        if (findFirst) {
            ids.unshift(firstElement.id);
            selected.unshift(firstElement);
        } else {
            firstElement = selected[0];
        }
        return {
            '@:{first}': firstElement,
            '@:{selected}': selected,
            '@:{ids}': ids.join(',')
        };
    },
    /**
     * 获取所有元素及map对象
     */
    '@:{generic#query.all.elements.and.map}'(): Report.GenericAllElementsAndMapResult {
        if (!AllElementsMap) {
            console.log('rebuild');
            AllElementsMap = {};
            AllStageElementsMap = {};
            AllElementsList = [];
            AllElementsParentHod = {};
            let stageElements = State.get('@:{global#stage.elements}');
            let walk = (es, fromHod?) => {
                for (let e of es) {
                    AllElementsMap[e.id] = e;
                    AllElementsList.push(e);
                    if (!fromHod) {
                        AllStageElementsMap[e.id] = e;
                    } else {
                        AllElementsParentHod[e.id] = fromHod;
                    }
                    if (e.ctrl.as & Enum['@:{enum#as.hod}']) {
                        for (let row of e.props.rows) {
                            for (let col of row.cols) {
                                if (col.elements) {
                                    walk(col.elements, e.id);
                                }
                            }
                        }
                    }
                }
            };
            walk(stageElements);
        }
        return {
            '@:{generic.all#map}': AllElementsMap,
            '@:{generic.all#stage.elements.map}': AllStageElementsMap,
            '@:{generic.all#elements}': AllElementsList,
            '@:{generic.all#element.hods}': AllElementsParentHod
        };
    },
    /**
     * 查询某个类型元素的个数
     * @param elements 元素集合
     * @param queryType 查询类型
     * @returns 个数
     */
    '@:{generic#query.elements.count.by.type}'(elements: Report.StageElement[],
        queryType: string) {
        let count = 0;
        for (let { type } of elements) {
            if (queryType &&
                queryType != type) {
                continue;
            }
            count++;
        }
        return count;
    },
    /**
     * 查询元素可选中和可移动元素数量
     * @param elements 元素集合
     * @returns 状态数量
     */
    '@:{generic#query.elements.state.count}'(elements: Report.StageElement[]) {
        let movableCount = 0,
            selectableCount = 0;
        for (let e of elements) {
            let { props: { pinX, pinY, readonly, locked }, ctrl } = e;
            let pined = pinX || pinY || !ctrl['@:{move.props}'];
            if (!readonly) {
                selectableCount++;
                if (!pined &&
                    !locked) {
                    movableCount++;
                }
            }
        }
        return {
            '@:{generic#movable.count}': movableCount,
            '@:{generic#selectable.count}': selectableCount,
        };
    },
    /**
     * 查询是否处于同一个分组
     * @param elements 元素集合
     */
    // '@:{generic#query.elements.same.group}'(elements: Report.StageElement[]): boolean | number {
    //     let groups = State.get('@:{global#stage.elements.groups}');
    //     let elementsMap,
    //         same = 1,
    //         grouped;
    //     for (let e of elements) {
    //         let list = groups[e.id];
    //         if (list) {
    //             if (!elementsMap) {
    //                 elementsMap = toMap(elements, 'id');
    //                 grouped = {};
    //             }
    //             for (let g of list) {
    //                 if (!elementsMap[g]) {
    //                     same = 0;
    //                     break;
    //                 }
    //                 grouped[g] = 1;
    //             }
    //         } else if (grouped &&
    //             !grouped[e.id]) {
    //             same = 0
    //         }
    //         if (!same) {
    //             break;
    //         }
    //     }
    //     return same;
    // },
    /**
     * 内部用于删除元素的方法，不触发事件
     * @param idMap id对象
     */
    '@:{generic#internal.delete.element.by.id.map.silent}'(idMap) {
        let stageElements = State.get('@:{global#stage.elements}'),
            deleted = 0;;
        let walk = cs => {
            for (let i = cs.length; i--;) {
                let e = cs[i];
                if (idMap[e.id]) {
                    cs.splice(i, 1);
                    deleted = 1;
                } else if (e.ctrl.as & Enum['@:{enum#as.hod}']) {
                    for (let row of e.props.rows) {
                        for (let col of row.cols) {
                            if (col.elements) {
                                walk(col.elements);
                            }
                        }
                    }
                }
            }
        };
        walk(stageElements);
        if (deleted) {
            ResetAllCache();
        }
    },
    /**
     * 查询组合状态
     */
    '@:{generic#query.group.state}'(): Report.GenericQueryGroupResult {
        let selectedElements = State.get('@:{global#stage.select.elements}');
        let selectedElementsMap = StageSelection['@:{selection#get.selected.map}']();
        let stageElements = State.get('@:{global#stage.elements}');
        let flowProvider = State.get('@:{global#provider.of.flow}');
        if (flowProvider) {
            selectedElements = flowProvider["@:{flow.provider#remove.connector.from.elements}"](selectedElements, 1);
        }
        /**
         * 查找容器元素，跨设计区的元素不支持组合，考虑这样的场景：
         * 容器内的元素与容器外的元素组合，如果移动容器，那么容器外的元素如何移动？
         * 如果容器外的元素与容器一起选中移动，容器内的元素如何移动？
         */
        let findFirstCollectionId,
            findDifferetId;
        let walk = (cs, rootId) => {
            for (let e of cs) {
                if (selectedElementsMap[e.id]) {
                    if (!findFirstCollectionId) {
                        findFirstCollectionId = rootId;
                    }
                    if (rootId != findFirstCollectionId) {
                        findDifferetId = 1;
                        break;
                    }
                }
                if (e.ctrl.as & Enum['@:{enum#as.hod}']) {
                    for (let row of e.props.rows) {
                        for (let col of row.cols) {
                            if (col.elements) {
                                walk(col.elements, e.id);
                            }
                            if (findDifferetId) {
                                break;
                            }
                        }
                        if (findDifferetId) {
                            break;
                        }
                    }
                }
            }
        };
        walk(stageElements, 1);
        let groups = State.get('@:{global#stage.elements.groups}');
        let canGroup = false,
            canUngroup = false,
            findGroupList;
        for (let e of selectedElements) {
            if (groups[e.id]) {
                canUngroup = true;
                findGroupList = groups[e.id];
                break;
            }
        }
        if (!findDifferetId) {
            if (canUngroup) {
                let findGroupMap = toMap(findGroupList);
                for (let e of selectedElements) {
                    if (!findGroupMap[e.id]) {
                        canGroup = true;
                        break;
                    }
                }
            } else {
                canGroup = selectedElements.length > 1;
            }
        }
        return {
            //'@:{selected.length}': selectedElements.length,
            '@:{can.group}': canGroup,
            '@:{can.ungroup}': canUngroup
        };
    },
    /**
     * 查询锁定状态
     */
    '@:{generic#query.lock.state}'(): Report.GenericQueryLockResult {
        let canLock = false,
            canUnlock = false;
        let selectedElements = State.get('@:{global#stage.select.elements}');
        for (let { props } of selectedElements) {
            if (props.locked) {
                canUnlock = true;
            } else {
                canLock = true;
            }
            if (canUnlock && canLock) {
                break;
            }
        }
        return {
            '@:{can.lock}': canLock,
            '@:{can.unlock}': canUnlock
        };
    },
    /**
     * 锁定或解锁选中的元素
     * @param unlock 是否为解锁
     */
    '@:{generic#lock.select.elements}'(unlock?: boolean | number, shortcuts?: number | boolean) {
        let selectElements = State.get<Report.StageElement[]>('@:{global#stage.select.elements}');
        let changed,
            to = !unlock,
            ids = {},
            types = {},
            changedProps: Report.StageElement[] = [];
        if (shortcuts) {
            let {
                '@:{can.lock}': canLock,
                '@:{can.unlock}': canUnlock
            } = this['@:{generic#query.lock.state}']();
            if (unlock &&
                !canUnlock) {
                to = !to;
            } else if (!unlock &&
                !canLock) {
                to = !to;
            }
        }
        for (let e of selectElements) {
            let { props, id } = e;
            if (props.locked != to) {
                ids[id] = 1;
                types[e.type] = 1;
                props.locked = to;
                changedProps.push(e);
                changed = 1;
                let n = node(id);
                let vf = Vframe.byNode(n);
                vf?.invoke('render', e);
            }
        }
        if (changed) {
            State.fire('@:{event#stage.select.element.props.change}', {
                '@:{ids}': ids,
                '@:{types}': types,
                '@:{props}': {
                    locked: 1
                }
            });
            let ename = this['@:{generic#query.element.name}'](changedProps);
            DHistory["@:{history#save}"](to ? DHistory['@:{history#element.locked}'] : DHistory['@:{history#element.unlocked}'], ename);
        }
    },
    /**
     * 组合或取消组合选中的元素
     * @param ungroup 是否为取消组合
     */
    '@:{generic#group.select.elements}'(ungroup?: number | boolean) {
        let selectElements = State.get('@:{global#stage.select.elements}');
        let flowProvider = State.get('@:{global#provider.of.flow}');
        if (flowProvider) {
            selectElements = flowProvider["@:{flow.provider#add.connector.from.elements}"](selectElements);
        }
        let groups = State.get('@:{global#stage.elements.groups}');
        let newGroup = [],
            selectedIds = {};
        for (let { id } of selectElements) {
            selectedIds[id] = 1;
            let oldList = groups[id];
            if (oldList) {
                for (let e of oldList) {
                    if (newGroup.indexOf(e) == -1) {
                        newGroup.push(e);
                    }
                }
            } else if (newGroup.indexOf(id) == -1) {
                newGroup.push(id);
            }
        }
        if (ungroup) {
            this['@:{generic#remove.grouped.element.by.ids}'](selectedIds);
        } else {
            for (let n of newGroup) {
                groups[n] = newGroup;
            }
        }
        State.fire('@:{event#stage.elements.change}');
        DHistory["@:{history#save}"](ungroup ? DHistory['@:{history#element.ungrouped}'] : DHistory['@:{history#element.grouped}']);
    },
    /**
     * 查询元素中的容器元素
     * @param elements 元素集合
     */
    '@:{generic#find.hod.sub.elements.map}'(elements: Report.StageElement[]) {
        let map = {},
            hodsMap = {},
            hodsCount = 0,
            hods = [];
        for (let e of elements) {
            if (e.ctrl.as & Enum['@:{enum#as.hod}']) {
                hods.push(e);
                hodsMap[e.id] = e;
                hodsCount++;
            }
        }
        let walk = (children, hodId?) => {
            for (let c of children) {
                if (hodId) {
                    map[c.id] = hodId;
                }
                if (c.ctrl.as & Enum['@:{enum#as.hod}']) {
                    for (let r of c.props.rows) {
                        for (let d of r.cols) {
                            if (d.elements) {
                                walk(d.elements, hodId || c.id);
                            }
                        }
                    }
                }
            }
        };
        walk(hods);
        return {
            '@:{sub.map}': map,
            '@:{hod.count}': hodsCount,
            '@:{hod.map}': hodsMap
        };
    },
    /**
     * 获取元素所属的集合
     * @param element 待查询的元素
     */
    '@:{generic#find.element.owner.collection}'(element: Report.StageElement): Report.StageElement[] {
        let collection = State.get('@:{global#stage.elements}'),
            find,
            findCollection;
        let walk = coll => {
            for (let e of coll) {
                if (e.id == element.id) {
                    find = 1;
                    findCollection = coll;
                    break;
                }
                if (e.ctrl.as & Enum['@:{enum#as.hod}']) {
                    for (let row of e.props.rows) {
                        for (let col of row.cols) {
                            if (col.elements) {
                                walk(col.elements);
                            }
                            if (find) {
                                break;
                            }
                        }
                        if (find) {
                            break;
                        }
                    }
                }
            }
        }
        walk(collection);
        return findCollection;
    },
    //查询所有容器id
    // '@:{find.all.hod.ids}'() {
    //     let collection = State.get('@:{global#stage.elements}'),
    //         ids = [];
    //     let walk = coll => {
    //         for (let e of coll) {
    //             if (e.ctrl.as & Enum['@:{enum#as.hod}']) {
    //                 let ri = 0;
    //                 for (let row of e.props.rows) {
    //                     let ci = 0;
    //                     for (let col of row.cols) {
    //                         ids.push(`hm_${e.id}_${ri}_${ci}`);
    //                         if (col.elements) {
    //                             walk(col.elements);
    //                         }
    //                         ci++;
    //                     }
    //                     ri++;
    //                 }
    //             }
    //         }
    //     }
    //     walk(collection);
    //     return ids;
    // },
    //
    /**
     * 查询某种元素已在编辑区的列表
     * @param ctrl 元素控制对象
     */
    '@:{generic#query.element.added.list.count}'(ctrl: Report.StageElementCtrl): number {
        let all = this["@:{generic#query.all.elements.and.map}"]();
        let allElements = all["@:{generic.all#elements}"];
        return this["@:{generic#query.elements.count.by.type}"](allElements, ctrl.type);
    },
    /**
     * 过滤列表中包含集合的元素
     * @param list 元素集合
     * @param destId 元素id
     */
    // '@:{generic#filter.list.own.collection}'(list: Report.StageElement[],
    //     destId: string | number): Report.StageElement[] {
    //     let newList = [],
    //         find;
    //     let findSubsHasCollection = dest => {
    //         if (!find) {
    //             if (dest.ctrl.as & Enum['@:{enum#as.hod}']) {
    //                 let { id, props } = dest;
    //                 if (id == destId) {
    //                     find = 1
    //                 } else {
    //                     let { rows } = props;
    //                     for (let row of rows) {
    //                         for (let col of row.cols) {
    //                             if (col.elements) {
    //                                 for (let e of col.elements) {
    //                                     findSubsHasCollection(e);
    //                                 }
    //                             }
    //                         }
    //                         if (find) {
    //                             break;
    //                         }
    //                     }
    //                 }
    //             }
    //         }

    //     };
    //     for (let copy of list) {
    //         find = 0;
    //         findSubsHasCollection(copy);
    //         if (!find) {
    //             newList.push(copy);
    //         }
    //     }
    //     return newList;
    // },
    /**
     * 根据id删除组合中的元素
     * @param ids id对象
     */
    '@:{generic#remove.grouped.element.by.ids}'(ids) {//
        let groups = State.get('@:{global#stage.elements.groups}');
        for (let id in ids) {
            let list = groups[id],
                findIndex;//= list.indexOf(id);
            // list.splice(findIndex, 1);
            // if (list.length == 1) {
            //     delete groups[list[0]];
            // }
            //delete groups[id];
            if (list) {
                delete groups[id];
                for (let g in groups) {
                    list = groups[g];
                    findIndex = list.indexOf(id);
                    if (findIndex > -1) {
                        list.splice(findIndex, 1);
                    }
                    if (list.length == 1) {
                        delete groups[list[0]];
                    }
                }
            }
        }
    },
    /**
     * 删除选中元素
     * @param element 如果传入某个元素，则只删除该元素
     */
    '@:{generic#delete.select.elements}'(element?: Report.StageElement,
        extra?: any) {
        let selectElements = State.get('@:{global#stage.select.elements}');
        let hasSelected = selectElements.length;
        let selectElementsMap = StageSelection['@:{selection#get.selected.map}']();
        if (element) {
            hasSelected = 1;
            selectElementsMap = {
                [element.id]: 1
            };
        }
        if (hasSelected) {
            let stageElements = State.get('@:{global#stage.elements}');
            let update,
                ids = {},
                removedElements = [];
            let walk = es => {
                for (let i = es.length; i--;) {
                    let e = es[i];
                    if (selectElementsMap[e.id]) {
                        update = 1;
                        ids[e.id] = 1;
                        es.splice(i, 1);
                        removedElements.push(e);
                    }
                    if (e.ctrl.as & Enum['@:{enum#as.hod}']) {
                        for (let row of e.props.rows) {
                            for (let col of row.cols) {
                                if (col.elements) {
                                    walk(col.elements);
                                }
                            }
                        }
                    }
                }
            };
            walk(stageElements);
            if (update) {
                this['@:{generic#remove.grouped.element.by.ids}'](ids);
                if (element) {
                    StageSelection['@:{selection#remove}'](element);
                } else {
                    StageSelection['@:{selection#set}']();
                }
                State.fire('@:{event#stage.elements.change}', {
                    '@:{type}': '@:{remove}',
                    '@:{extra}': extra,
                    '@:{changed.ids}': ids
                });
                DHistory["@:{history#save}"](DHistory['@:{history#element.removed}'], this['@:{generic#query.element.name}'](removedElements));
            }
        }
    },
    /**
     * 查询是否支持清空设计区
     */
    '@:{generic#query.can.clear.stage}'(): boolean {
        let xLines = State.get('@:{global#stage.x.help.lines}');
        let yLines = State.get('@:{global#stage.y.help.lines}');
        let stageElements = State.get('@:{global#stage.elements}');
        let elements = Const['@:{const#support.readonly.element}'] ? this['@:{generic#query.all.without.readonly.elements}'](stageElements, 1) : stageElements;
        return xLines.length + yLines.length + elements.length > 0;
    },
    /**
     * 查询是否支持新建
     */
    '@:{generic#query.can.create.new.page}'(): boolean {
        let xLines = State.get('@:{global#stage.x.help.lines}');
        let yLines = State.get('@:{global#stage.y.help.lines}');
        let elements = State.get('@:{global#stage.elements}');
        let canCreate = xLines.length + yLines.length + elements.length > 0;
        if (!canCreate) {
            let pc = State.get('@:{global#stage.page.ctrl}');
            if (!defaultPageProps) {
                defaultPageProps = pc['@:{get.props}']();
            }
            let page = State.get<Report.StagePage>('@:{global#stage.page}');
            for (let { key,
                json,
                '@:{is.scale.and.unit.field}': scaleAndUnit
            } of pc.props) {
                if (json &&
                    page[key] != defaultPageProps[key]) {
                    if (scaleAndUnit) {//如果支持缩放和单位转换，需要考虑取小数位
                        if (Const['@:{const#scale.to.unit}'](page[key]) != Const['@:{const#scale.to.unit}'](defaultPageProps[key])) {
                            canCreate = true;
                            break;
                        }
                    } else {
                        canCreate = true;
                        break;
                    }
                }
            }
        }
        return canCreate;
    },

    /**
     * 查询所有非只读元素
     * @param elements 元素列表
     * @param deep 是否深度查询
     */
    '@:{generic#query.all.without.readonly.elements}'(
        elements?: Report.StageElement[],
        deep?: number | boolean): Report.StageElement[] {
        let newElements = [];
        let walk = (elements, filters) => {
            for (let e of elements) {
                let { props, ctrl } = e;
                if (deep && (ctrl.as & Enum['@:{enum#as.hod}'])) {
                    let { rows, focusRow, focusCol } = props;
                    let after = [];
                    for (let ri = rows.length; ri--;) {
                        let r = rows[ri];
                        for (let ci = r.cols.length; ci--;) {
                            let d = r.cols[ci];
                            if (d.elements &&
                                d.elements.length) {
                                if (ri > focusRow ||
                                    (ri == focusRow && ci >= focusCol)) {
                                    walk(d.elements, after);
                                } else {
                                    walk(d.elements, newElements);
                                }
                            }
                        }
                    }
                    newElements.push(...after);
                }
                if (!Const['@:{const#support.readonly.element}'] ||
                    !e.props.readonly) {
                    filters.push(e);
                }
            }
        };
        walk(elements, newElements);
        return newElements;
    }
    // /**
    //  * 查询在哪个限制区域里
    //  */
    // '@:{query.in.which.area}'(rect) {
    //     let { areas } = State.get('@:{global#stage.page}');
    //     let scale = State.get('@:{global#stage.scale}'),
    //         findArea;
    //     for (let a of areas) {
    //         let copy = { ...a };
    //         copy.x *= scale;
    //         copy.y *= scale;
    //         copy.width *= scale;
    //         copy.height *= scale;
    //         if (Transform["@:{transform#rect.intersect}"](copy, rect)) {
    //             findArea = a;
    //             break;
    //         }
    //     }
    //     return findArea;
    // },
    // /**
    //  * 根据坐标查询限制区域或返回第一个
    //  * @param xy 坐标对象
    //  */
    // '@:{query.area.by.xy.or.return.first}'(xy) {
    //     let { areas } = State.get('@:{global#stage.page}');
    //     let scale = State.get('@:{global#stage.scale}'),
    //         findArea = areas[0];
    //     let center = {
    //         x: xy.x + xy.width / 2,
    //         y: xy.y + xy.height / 2
    //     };
    //     for (let a of areas) {
    //         let copy = { ...a };
    //         copy.x *= scale;
    //         copy.y *= scale;
    //         copy.width *= scale;
    //         copy.height *= scale;
    //         if (Transform["@:{point.in.rect}"](center, copy)) {
    //             findArea = a;
    //             break;
    //         }
    //     }
    //     return findArea;
    // }
    ,
    /**
     * 查询元素的自定义名称
     * @param elements 集合列表
     */
    '@:{generic#query.element.name}'(elements: Report.StageElement[]): string {
        let ename;
        if (elements.length == 1) {
            ename = this['@:{generic#query.ename.by.single}'](elements[0]);
        } else {
            ename = I18n('@:{lang#multi.elements}');
        }
        return ename;
    },
    /**
    /**获取单个元素的名称
     * @param element 单个元素
     * @returns 单个元素的名称
     */
    '@:{generic#query.ename.by.single}'(element: Report.StageElement): string {
        let { props, ctrl } = element;
        let ename = props.ename || I18n(ctrl.title);
        return ename;
    },
    /**
     * 根据差异对象查询对应的历史记录信息
     * @param diff 差异对象
     */
    '@:{generic#query.history.info.by.diff}'(diff: Report.StageSelectionChangeInfo): Report.GenericQueryHistoryByDiffResult {
        let type, ename, { '@:{selection.changed#now.count}': nowCount,
            '@:{selection.changed#selected.elements}': selectedElements,
            '@:{selection.changed#deselected.elements}': deselectedElements
        } = diff;

        if (nowCount) {
            type = DHistory['@:{history#element.get.focus}'];
            ename = this['@:{generic#query.element.name}'](selectedElements)
        } else {
            type = DHistory['@:{history#element.lost.focus}'];
            ename = this['@:{generic#query.element.name}'](deselectedElements)
        }
        return {
            '@:{generic.diff.info#type}': type,
            '@:{generic.diff.info#ename}': ename
        };
    },
    /**
     * 查询能否进行对齐操作
     * @param currentElement 当前参考元素
     */
    '@:{generic#query.can.align}'(currentElement?: Report.StageElement): Report.GenericQueryAlignResult {
        let selectElements = State.get<Report.StageElement[]>('@:{global#stage.select.elements}');
        let groups = State.get('@:{global#stage.elements.groups}');
        let flowProvider = State.get('@:{global#provider.of.flow}');
        if (flowProvider) {//从选中元素中过滤掉流程图连接线元素，因为连接线不支持对齐
            selectElements = flowProvider["@:{flow.provider#remove.connector.from.elements}"](selectElements, 1);
        }
        let xCanAlign = true;
        let yCanAlign = true;
        let queried = {};
        let allElementsMap;
        let underId = currentElement?.id;
        if (selectElements.length < 2) {//如果元素个数少于2个，则不支持对齐
            xCanAlign = false;
            yCanAlign = false;
        } else {
            for (let { props, id, ctrl } of selectElements) {
                //let inSameGroupCount = 0;
                let list = groups[id];
                if (list &&
                    !queried[list]) {//元素处于组合中，且未查询过当前组合
                    queried[list] = 1;
                    if (!allElementsMap) {//获取所有元素对象
                        let i = this["@:{generic#query.all.elements.and.map}"]();
                        allElementsMap = i["@:{generic.all#map}"];
                    }
                    for (let g of list) {
                        // if (selectElementsMap[g]) {
                        //     inSameGroupCount++;
                        // }
                        // if (inSameGroupCount > 1) {//如果集合中的元素有超过1个处于选中状态，则也不支持对齐
                        //     // xCanAlign = false;
                        //     // yCanAlign = false;
                        //     break;
                        // }
                        if (underId != g) {//查询组合中的其它元素，当元素非鼠标下的元素时
                            let { props, ctrl } = allElementsMap[g];
                            let { locked, pinX, pinY } = props;
                            if (locked || !ctrl['@:{move.props}']) {//如果元素locked，则不支持
                                xCanAlign = false;
                                yCanAlign = false;
                            }
                            if (pinX) {//pinX后不支持水平对齐
                                xCanAlign = false;
                            }
                            if (pinY) {//pinY后不支持垂直对齐
                                yCanAlign = false;
                            }
                        }
                    }
                }
                if ((xCanAlign || yCanAlign) &&
                    underId != id) {//查询其它选中的元素是否locked,pinX或pinY来判断禁用哪种对齐
                    let { locked, pinX, pinY } = props;
                    if (locked || !ctrl['@:{move.props}']) {
                        xCanAlign = false;
                        yCanAlign = false;
                    }
                    if (pinX) {
                        xCanAlign = false;
                    }
                    if (pinY) {
                        yCanAlign = false;
                    }
                }
                if (!xCanAlign && !yCanAlign) {
                    break;
                }
            }
        }
        //console.log(xCanAlign, yCanAlign);
        return {
            '@:{generic.align#x.can.align}': xCanAlign,
            '@:{generic.align#y.can.align}': yCanAlign
        };
    },
    '@:{generic#query.can.avg}'() {
        let selectElements = State.get<Report.StageElement[]>('@:{global#stage.select.elements}');
        let selectElementsMap = StageSelection['@:{selection#get.selected.map}']();
        let groups = State.get('@:{global#stage.elements.groups}');
        let flowProvider = State.get('@:{global#provider.of.flow}');
        if (flowProvider) {//从选中元素中过滤掉流程图连接线元素，因为连接线不支持对齐
            selectElements = flowProvider["@:{flow.provider#remove.connector.from.elements}"](selectElements, 1);
        }
        let xCanAvg = true;
        let yCanAvg = true;
        let stageXCanAvg = true;
        let stageYCanAvg = true;
        let queried = {};
        let allElementsMap;
        if (selectElements.length < 3) {//如果元素个数少于2个，则不支持对齐
            xCanAvg = false;
            yCanAvg = false;
            if (selectElements.length < 1) {
                stageXCanAvg = false;
                stageYCanAvg = false;
            }
        }
        let updateByElmenetProps = props => {
            let { locked, pinX, pinY } = props;
            if (locked) {
                xCanAvg = false;
                yCanAvg = false;
                stageXCanAvg = false;
                stageYCanAvg = false;
            }
            if (pinX) {
                xCanAvg = false;
                stageXCanAvg = false;
            }
            if (pinY) {
                yCanAvg = false;
                stageYCanAvg = false;
            }
        };
        let inDifferentGroup = 0;
        let someSelected = 0;
        let fullSelected = 0;
        let inSameGroupCount = 0;
        for (let { props, id } of selectElements) {
            let list = groups[id];
            if (list) {
                if (!queried[list]) {//元素处于组合中，且未查询过当前组合
                    queried[list] = 1;
                    inSameGroupCount = 0;
                    inDifferentGroup++;
                    if (!allElementsMap) {//获取所有元素对象
                        let i = this["@:{generic#query.all.elements.and.map}"]();
                        allElementsMap = i["@:{generic.all#map}"];
                    }
                    for (let g of list) {
                        if (selectElementsMap[g]) {
                            inSameGroupCount++;
                        }
                        let { props } = allElementsMap[g];
                        updateByElmenetProps(props);
                    }
                    if (inSameGroupCount > 1) {
                        someSelected++;
                        if (inSameGroupCount == list.length) {
                            fullSelected++;
                        }
                    }
                }
            } else {
                inDifferentGroup++;
            }
            updateByElmenetProps(props);
            if (!xCanAvg &&
                !yCanAvg &&
                !stageXCanAvg &&
                !stageYCanAvg) {
                break;
            }
        }
        if (someSelected &&
            inDifferentGroup > 1) {
            stageXCanAvg = false;
            stageYCanAvg = false;
            xCanAvg = false;
            yCanAvg = false;
        } else if (inDifferentGroup == 1 &&
            !fullSelected) {
            xCanAvg = false;
            yCanAvg = false;
            if (inSameGroupCount > 1) {
                stageXCanAvg = false;
                stageYCanAvg = false;
            }
        }
        //console.log(stageXCanAvg, stageYCanAvg);
        return {
            '@:{generic.avg#x.can.avg}': xCanAvg,
            '@:{generic.avg#y.can.avg}': yCanAvg,
            '@:{generic.avg#stage.x.can.avg}': stageXCanAvg,
            '@:{generic.avg#stage.y.can.avg}': stageYCanAvg
        };
    },
    '@:{generic#query.element.parent}'(current: Report.StageElement): Report.QueryParentResult {
        let parentElement,
            ri,
            ci;
        let collection = State.get('@:{global#stage.elements}'),
            find;
        let walk = (coll, parent?: Report.StageElement) => {
            for (let e of coll) {
                if (e.id == current.id) {
                    find = 1;
                    parentElement = parent;
                    break;
                }
                if (e.ctrl.as & Enum['@:{enum#as.hod}']) {
                    ri = 0;
                    for (let row of e.props.rows) {
                        ci = 0;
                        for (let col of row.cols) {
                            if (col.elements) {
                                walk(col.elements, e);
                            }
                            if (find) {
                                break;
                            }
                            ci++;
                        }
                        if (find) {
                            break;
                        }
                        ri++;
                    }
                }
            }
        }
        walk(collection);
        return {
            '@:{element}': parentElement,
            '@:{at.row}': ri,
            '@:{at.col}': ci
        };
    },
    /**
     * 获取当前选中元素所在的编辑区
     * @param findEnableParent 是否仅查询可用的父编辑区
     * @param anchorElement 参考元素
     */
    '@:{generic#query.select.elements.stage}'(findEnableParent?: boolean,
        anchorElement?: Report.StageElement): Report.ElementsQuerySelectElementsStageResult[] {
        let selectElementsMap = anchorElement ? { [anchorElement.id]: 1 } : StageSelection['@:{selection#get.selected.map}']();
        let stagesAdded = {},
            stages: Report.ElementsQuerySelectElementsStageResult[] = [];
        let walk = (es: Report.StageElement[],
            stageType: string,
            ownerContainer: string,
            ownerCollection: Report.StageElement[],
            tb?: Report.StageElement,
            hasLocked?: boolean,
            rowIndex?: number,
            colIndex?: number) => {
            for (let e of es) {
                let { id, props, ctrl, type } = e;
                if (has(selectElementsMap, id)) {
                    let sId = tb ? [tb.id, rowIndex, colIndex].join('-') : '@:{stage}';
                    if (!stagesAdded[sId]) {
                        let height = MaxNum,
                            width = MaxNum;
                        if (tb) {
                            let row = tb.props.rows[rowIndex];
                            let cell = row.cols[colIndex];
                            height = row.height != null ? row.height : cell.height;
                            width = row.width != null ? row.width : cell.width;
                        }
                        stages.push(stagesAdded[sId] = {
                            '@:{container}': ownerContainer,
                            '@:{selected}': [],
                            '@:{collection}': ownerCollection,
                            '@:{type}': stageType,
                            '@:{stage.type}': tb ? '@:{hod}' : '@:{stage}',
                            '@:{allowed.elements}': tb && tb.ctrl['@:{allowed.elements}'],
                            '@:{hod}': tb,
                            '@:{width}': width,
                            '@:{height}': height,
                            '@:{row.index}': rowIndex,
                            '@:{col.index}': colIndex
                        });
                    }
                    stagesAdded[sId]['@:{selected}'].push(e);
                }
                if (ctrl.as & Enum['@:{enum#as.hod}']) {
                    let ri = 0,
                        isLocked = hasLocked || props.locked || props.readonly,
                        useParent = isLocked && findEnableParent;
                    for (let r of props.rows) {
                        let ci = 0, currentCollection;
                        for (let d of r.cols) {
                            currentCollection = d.elements;
                            if (currentCollection) {
                                walk(currentCollection, type, useParent ? ownerContainer : `_rd_hm_${id}_${ri}_${ci}`, useParent ? ownerCollection : currentCollection, useParent ? tb : e, isLocked, ri, ci);
                            }
                            ci++;
                        }
                        ri++;
                    }
                }
            }
        };
        let elements = State.get<Report.StageElement[]>('@:{global#stage.elements}');
        walk(elements, 'root', '_rd_sc', elements);
        return stages;
    },

    /**
     * 嵌套的情况下，获取元素最近的设计区
     * @param skipEmptyElements 忽略空元素的格子
     */
    '@:{generic#query.nearest.stage}'(skipEmptyElements?: number,
        currentElement?: Report.StageElement,
        fakeFocusRow?: number,
        fakeFocusCol?: number): Report.ElementsQueryNearestStageResult {
        let selectElements = State.get('@:{global#stage.select.elements}'),
            c = selectElements.length;
        if (c) {
            if (c === 1 ||
                currentElement) {
                let { props, ctrl, id } = currentElement || selectElements[0];
                let { rows, focusRow, focusCol } = props;
                if (currentElement ||
                    fakeFocusRow) {
                    focusRow = fakeFocusRow;
                    focusCol = fakeFocusCol;
                }
                if ((ctrl.as & Enum['@:{enum#as.hod}']) &&
                    focusRow > -1 &&
                    focusCol > -1 &&
                    (skipEmptyElements ||
                        !(props.readonly || props.locked))) {
                    let row = rows[focusRow];
                    let cell = row.cols[focusCol];
                    let height = row.height != null ? row.height : cell.height;
                    let width = row.width != null ? row.width : cell.width;
                    if (cell.elements &&
                        (!skipEmptyElements || cell.elements.length)) {
                        return {
                            //'@:{id}': id,
                            '@:{container}': `_rd_hm_${id}_${focusRow}_${focusCol}`,
                            '@:{collection}': cell.elements,
                            '@:{type}': ctrl.type,
                            '@:{allowed.elements}': ctrl['@:{allowed.elements}'],
                            '@:{width}': width,
                            '@:{height}': height
                        };
                    }
                }
            }
            let stages: Report.ElementsQuerySelectElementsStageResult[] = this['@:{generic#query.select.elements.stage}'](!skipEmptyElements, currentElement);
            if (stages.length === 1) {
                return stages[0];
            }
        }
        let elements = State.get('@:{global#stage.elements}');
        return {
            '@:{container}': '_rd_sc',
            '@:{collection}': elements,
            '@:{type}': 'root',
            '@:{width}': MaxNum,
            '@:{height}': MaxNum
        };
    },
    /**
     * 检查元素是否都在可用的容器内
     * @param elementMap 待查询元素的key value对象
     * @returns
     */
    '@:{generic#query.in.enable.hod}'(elementMap) {
        let stageElements = State.get<Report.StageElement[]>('@:{global#stage.elements}');
        let enable = 1;
        let walk = (elements: Report.StageElement[],
            parentLocked?: boolean) => {
            for (let { props, ctrl, id } of elements) {
                if (parentLocked &&
                    elementMap[id]) {
                    enable = 0;
                    break;
                }
                if (ctrl.as & Enum['@:{enum#as.hod}'] &&
                    enable) {
                    for (let r of props.rows) {
                        for (let d of r.cols) {
                            let c = d.elements;
                            if (enable &&
                                c &&
                                c.length) {
                                walk(c, parentLocked || props.locked || props.readonly);
                            }
                        }
                    }
                }
            }
        };
        walk(stageElements);
        return enable;
    },
    /**
     * 查询是否可以复制、剪切及粘贴
     * @param copyList 复制列表
     * @param current 当前聚焦的元素
     * @param collection 当前环境的元素列表集合
     * @returns
     */
    '@:{generic#query.can.cxv}'(copyList: Report.StageElement[],
        //isCut?: number | boolean,
        current?: Report.StageElement,
        collection?: Report.StageElement[]) {
        let selectElements = State.get('@:{global#stage.select.elements}');
        let flowProvider = State.get<Report.ProviderOfFlow>('@:{global#provider.of.flow}');
        let selectElementsMap;
        if (current) {
            selectElementsMap = {
                [current.id]: 1
            };
        } else {
            selectElementsMap = StageSelection['@:{selection#get.selected.map}']();
        }
        //进行判断时，需要移除流程图中的连线元素
        if (flowProvider) {
            selectElements = flowProvider['@:{flow.provider#remove.connector.from.elements}'](selectElements, 1);
        }
        let selectCount = selectElements.length;
        let copyCount = copyList.length;
        let canPaste = 0,
            canCut = 1,
            canCopy = 1,
            canDuplicate = 1;
        if (selectCount == 0) {//如果未有元素选中，则不能复制及剪切
            canCopy = 0;
            canCut = 0;
            canDuplicate = 0;
            if (copyCount) {//不存在复制列表，禁用粘贴
                canPaste = 1;
                if (current) {
                    let { props, ctrl } = current;
                    if (ctrl.as & Enum['@:{enum#as.hod}']) {//是容器
                        if (props.locked ||
                            props.readonly) {
                            canPaste = 0;
                        }
                    }
                }
            }
        } else {
            canCut = canDuplicate = this['@:{generic#query.in.enable.hod}'](selectElementsMap);
            //选中的元素如果有固定或锁定的，不能使用剪切
            //选中的元素如果有数量限制，到达上限后不能复制
            for (let e of selectElements) {
                let { props, ctrl } = e;
                let total = e.ctrl['@:{allowed.total.count}'];
                if (total >= 0) {//处理复制和剪切，当元素有个数控制时，如果已达上限，则相应的复制和剪切需要禁用
                    let added = this["@:{generic#query.element.added.list.count}"](e);
                    if (added >= total) {
                        canCopy = 0;
                    }
                }
                if (props.locked ||
                    props.pinX ||
                    props.pinY ||
                    !ctrl['@:{move.props}']) {
                    canCut = 0;
                }
                if (props.readonly) {
                    canCut = canCopy = 0;
                }
                if (!canCopy &&
                    !canCut) {
                    break;
                }
            }
            if (copyCount) {
                //查询复制列表，判断是否可以粘贴
                for (let ce of copyList) {
                    let total = ce.ctrl['@:{allowed.total.count}'];
                    if (total >= 0) {
                        let added = this["@:{generic#query.element.added.list.count}"](ce);
                        if (added < total) {
                            canPaste++;
                        }
                    } else {
                        canPaste++;
                    }
                }
                let processed,
                    first = current || selectElements[0];
                if (current ||
                    selectCount == 1) {//如果传递了当前元素或只有一个选中，需要判断是否为容器元素
                    if (canPaste) {
                        let { ctrl, props, type } = first;
                        if (ctrl.as & Enum['@:{enum#as.hod}']) {//是容器
                            if (props.locked ||
                                props.readonly) {//如果禁用，是否可粘贴需要看有没有传递环境元素
                                if (current) {
                                    canPaste = 0;
                                    processed = 1;
                                }
                            } else if (props.focusRow > -1 &&
                                props.focusCol > -1) {
                                processed = 1;
                                canPaste = 0;
                                if (canDuplicate) {
                                    let collection = props.rows[props.focusRow].cols[props.focusCol];
                                    let allowedElements = ctrl['@:{allowed.elements}'];
                                    for (let ce of copyList) {
                                        let allowedToHods = ce.ctrl['@:{allowed.to.hod}'];
                                        if ((!allowedElements ||
                                            allowedElements[ce.type]) &&
                                            (!allowedToHods ||
                                                allowedToHods[type])) {
                                            let total = ce.ctrl['@:{allowed.stage.count}'];
                                            if (total >= 0) {
                                                let added = this["@:{generic#query.elements.count.by.type}"](collection, ce.type);
                                                if (added < total) {
                                                    canPaste++;
                                                }
                                            } else {
                                                canPaste++;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (!processed) {
                    if (canPaste) {
                        canPaste = 0;
                        if (canDuplicate) {
                            if (!collection) {
                                let s = <Report.ElementsQueryNearestStageResult>this['@:{generic#query.nearest.stage}']()
                                collection = s['@:{collection}'];
                            }
                            for (let ce of copyList) {
                                let total = ce.ctrl['@:{allowed.stage.count}'];
                                if (total >= 0) {
                                    let added = this["@:{generic#query.elements.count.by.type}"](collection, ce.type);
                                    if (added < total) {
                                        canPaste++;
                                    }
                                } else {
                                    canPaste++;
                                }
                            }
                        }
                    }
                }
            }
        }
        return {
            '@:{can.paste}': canPaste,
            '@:{can.copy}': canCopy,
            '@:{can.cut}': canCut,
            '@:{can.duplicate}': canDuplicate
        }
    },
    /**
     * 从列表中删除非只读元素
     * @param elements 待删除元素列表
     * @param deep 是否深度遍历
     */
    '@:{generic#remove.nonreadonly.elements}'(elements: Report.StageElement[],
        deep?: number | boolean) {
        let removed = [];
        for (let i = elements.length; i--;) {
            let { ctrl, props } = elements[i];
            let { rows, readonly } = props;
            if (!readonly) {
                removed.push(elements[i]);
                elements.splice(i, 1);
            }
            if (deep && (ctrl.as & Enum['@:{enum#as.hod}'])) {
                for (let r of rows) {
                    for (let d of r.cols) {
                        if (d.elements &&
                            d.elements.length) {
                            this['@:{generic#remove.nonreadonly.elements}'](d.elements);
                        }
                    }
                }
            }
        }
        return removed;
    },
    /**
     * 查询是否有禁用的元素
     * @param elements 元素列表
     * @returns
     */
    '@:{generic#query.has.disabled}'(elements: Report.StageElement[]) {
        let disabled;
        for (let { props } of elements) {
            if (props.locked || props.readonly) {
                disabled = 1;
                break;
            }
        }
        return disabled;
    },
    /**
     * 全选集合中的元素
     * @param collection 元素列表
     */
    '@:{generic#select.all.collection.elements}'(collection: Report.StageElement[],
        reverse?: number | boolean,
        onlyCanMove?: boolean) {
        let flag = READONLY;
        if (onlyCanMove) {
            flag |= PINED;
            flag |= LOCKED;
        }
        let newCollection = [];
        for (let e of collection) {
            let { props: { pinX, pinY, readonly, locked }, ctrl } = e;
            let pined = pinX || pinY || !ctrl['@:{move.props}'];
            if (((flag & READONLY) && readonly) ||
                ((flag & PINED) && pined) ||
                ((flag & LOCKED) && locked)) {
                continue;
            }
            newCollection.push(e);
        }
        let i = newCollection.length;
        if (i) {
            if (reverse) {
                let selectedMap = StageSelection['@:{selection#get.selected.map}']();
                for (let i = newCollection.length; i--;) {
                    let { id } = newCollection[i];
                    if (selectedMap[id]) {
                        newCollection.splice(i, 1);
                    }
                }
            }
        }
        if (StageSelection['@:{selection#set.all}'](newCollection)) {
            let ename = this['@:{generic#query.element.name}'](newCollection);
            DHistory["@:{history#save}"](DHistory['@:{history#element.get.focus}'], ename);
        }
    },
    /**
     * 查询吸附点位置及辅助线尺寸信息
     * @param startX 开始x坐标
     * @param startY 开始y坐标
     * @param others 使用哪些元素的点进行吸附对齐
     * @returns
     */
    '@:{generic#query.test.position.and.sizes}'(
        startX: number,
        startY: number,
        others?: Report.AlignNearestElementRectangle[]) {
        let testX = [], testY = [],
            sizesMap = {};
        if (others?.length) {
            let addToX = {},
                addToY = {};
            for (let s of others) {
                let extraX = [];
                let extraY = [];
                let sx = s['@:{align.queried#left}'];
                let sy = s['@:{align.queried#top}'];
                let sh = s['@:{align.queried#height}'];
                let sw = s['@:{align.queried#width}'];
                let xsd = s['@:{align.queried#x.diffed}'];
                let ysd = s['@:{align.queried#y.diffed}'];
                let ctrl = s['@:{align.queried#ctrl}'];
                let l = sx - startX;
                let t = sy - startY;
                if (sw < Const['@:{const#element.min.px.size}']) {
                    extraX.push(l);
                } else {
                    if (Enum['@:{enum#align.centers}'] & Const['@:{const#align.points}']) {
                        extraX.push(l + sw / 2);
                    }
                    if (Enum['@:{enum#align.line.coners}'] & Const['@:{const#align.points}']) {
                        extraX.push(l, l + sw);
                    }
                    if (xsd) {
                        for (let xd of xsd) {
                            extraX.push(l + xd - sx);
                        }
                    }
                }
                if (sh < Const['@:{const#element.min.px.size}'] ||
                    (ctrl['@:{modifier}'] & Enum['@:{enum#modifier.dheight}'])) {
                    extraY.push(t);
                } else {
                    if (Enum['@:{enum#align.centers}'] & Const['@:{const#align.points}']) {
                        extraY.push(t + sh / 2);
                    }
                    if (Enum['@:{enum#align.line.coners}'] & Const['@:{const#align.points}']) {
                        extraY.push(t, t + sh);
                    }
                    if (ysd) {
                        for (let yd of ysd) {
                            extraY.push(t + yd - sy);
                        }
                    }
                }
                for (let ex of extraX) {
                    let find = ex;
                    if (!has(sizesMap, ex)) {
                        for (let tx of testX) {
                            if (abs(ex - tx) < minPxUnit) {
                                find = tx;
                                break;
                            }
                        }
                    }
                    if (!has(addToX, find)) {
                        addToX[find] = 1;
                        testX.push(find);
                    }
                    addSizesMap(sizesMap, 0, find, t, t + sh);
                }
                for (let ey of extraY) {
                    let find = ey;
                    if (!has(sizesMap, ey)) {
                        for (let ty of testY) {
                            if (abs(ey - ty) < minPxUnit) {
                                find = ty;
                                break
                            }
                        }
                    }
                    if (!has(addToY, find)) {
                        addToY[find] = 1;
                        testY.push(find);
                    }
                    addSizesMap(sizesMap, 1, find, l, l + sw);
                }
            }
        }
        return {
            '@:{test.x}': testX,
            '@:{test.y}': testY,
            '@:{sizes.map}': sizesMap
        };
    },
    /**
     * 对属性进行分组
     * @param ctrl 元素控制对象
     * @returns 分组
     */
    '@:{generic#generate.groups}'(ctrl: Report.StageElementCtrl) {
        let groups = [];
        for (let p of ctrl.props) {
            if (p.group == null) {
                p.group = I18n('@:{lang#panel.basic.prop}');
            }
            if (!groups.includes(p.group)) {
                groups.push(p.group);
            }
        }
        return groups;
    },
    /**
     * 获取滚动偏移量
     * @param e 滚动事件
     * @returns
     */
    '@:{generic#query.delta.by.wheel}'(e: WheelEvent) {
        let { deltaY, deltaX, deltaMode,
            DOM_DELTA_PAGE,
            DOM_DELTA_LINE,
            shiftKey,
            metaKey,
            ctrlKey,
            altKey } = e,
            factor = 1,
            delta,
            meta = metaKey || ctrlKey;
        if (deltaMode == DOM_DELTA_LINE) {
            factor = 20;
        } else if (deltaMode == DOM_DELTA_PAGE) {
            factor = 200;
        }
        //确保只按了shift key
        if (shiftKey &&
            !meta &&
            !altKey &&
            deltaX === 0 &&
            deltaY != 0) {//部分鼠标会在shift的情况下自己转换方向
            delta = deltaY;
            deltaY = deltaX;
            deltaX = delta;
        }
        return {
            meta,
            x: deltaX * factor,
            y: deltaY * factor
        };
    },
    /**
     * 滚动设计区
     * @param e 事件对像
     * @param target 滚动节点
     */
    '@:{generic#scroll.node.by.wheel}'(deltaX: number,
        deltaY: number,
        target: HTMLElement) {
        deltaX *= 1.25;
        deltaY *= 1.25;
        target.scrollBy(deltaX, deltaY);
    },
    /**
     * 获取预览地址
     * @param withVersion 是否带版本号
     */
    '@:{generic#query.preview.url}'(withVersion?: number) {
        let { params } = parseUrl(location.href);
        let previewUrl = config<string>('viewerUrl');
        //if (APPROVE) {//授权后才可以透传参数
        if (withVersion) {
            previewUrl = toUrl(previewUrl, {
                v: config<string>('version') || '',
                ...params,
            });
        } else {
            previewUrl = toUrl(previewUrl, params);
        }
        // } else {//未授权只展示页面不传递任何参数
        //     let i = parseUrl(previewUrl);
        //     previewUrl = i.path;
        // }
        return previewUrl;
    },
    /**
     * 获取吸附后的角度
     * @param degree 当前角度
     */
    '@:{generic#query.snap.degree}'(degree: number) {
        let offset = degree % Const['@:{const#drag.snap.degree}'];
        if (offset <= Const['@:{const#drag.snap.degree.offset}']) {
            degree -= offset;
        } else {
            offset = Const['@:{const#drag.snap.degree}'] - offset;
            if (offset <= Const['@:{const#drag.snap.degree.offset}']) {
                degree += offset;
            }
        }
        return degree;
    },
    async '@:{generic#update.stage.element}'(element: Report.StageElement,
        changedProp?: string,
        vframe?: Magix5.Vframe,
        fromPanel?: number) {
        let { id, ctrl, props, type } = element;
        let cp;
        if (changedProp) {
            cp = {
                [changedProp]: 1
            };
            State.fire('@:{event#stage.select.element.props.change}', {
                '@:{ids}': {
                    [id]: 1
                },
                '@:{types}': {
                    [type]: 1
                },
                '@:{props}': cp
            });
        }
        if (!vframe) {
            let elementNode = node(id);
            if (elementNode) {
                vframe = Vframe.byNode(elementNode);
            }
        }
        if (vframe) {
            if (ctrl['@:{update.props}']) {
                ctrl['@:{update.props}'](props, {
                    '@:{pctrl#from.props.panel}': fromPanel,
                    '@:{pctrl#changed.props}': cp
                });
            }
            await vframe.invoke('render', element);
        }
    },
    /**
     * 根据设计区对象及当前浏览器大小，进行缩放比例检测和居中计算
     * @param page 设计区对象
     * @returns 缩放比例
     */
    '@:{generic#measure.scale}'(page: Report.StagePage) {
        let root = node<HTMLDivElement>('_rd_stage');
        let maxWidth = root.offsetWidth,
            maxHeight = root.offsetHeight;
        let pageWidth = Const['@:{const#to.px}'](page.width),
            pageHeight = Const['@:{const#to.px}'](page.height);
        pageHeight *= (page.pages || 1);
        let scale = Const['@:{const#stage.scale}'];
        let paddings = Const['@:{const#stage.padding}'];
        let topSpace = paddings[0],
            leftSpace = paddings[3],
            rightSpace = paddings[1],
            bottomSpace = paddings[2];
        for (let i = Const['@:{const#scale.min}'];
            i <= Const['@:{const#scale.max}'];
            i += Const['@:{const#scale.step}']) {
            if (i * pageWidth >= (maxWidth - leftSpace - rightSpace) ||
                i * pageHeight >= (maxHeight - topSpace - bottomSpace)) {
                break;
            }
            scale = i;
        }
        //保证最小是预设缩放
        return max(scale, Const['@:{const#stage.scale}']);
    },
    /**
     * 重新排序选中元素
     * @param anchor 参考元素
     * @param selectElements 当前选中元素
     */
    '@:{generic#resort.select.elements}'(anchor: Report.StageElement,
        selectElements: Report.StageElement[]) {
        let newSelect = [];
        if (selectElements.length) {
            newSelect.push(anchor);
            for (let e of selectElements) {
                if (e.id != anchor.id) {
                    newSelect.push(e);
                }
            }
        }
        return newSelect;
    },
    /**
     * 查询元素尺寸边界
     * @param ctrl 元素控制器
     * @param props 元素属性
     */
    '@:{generic#query.size.boundaries}'(ctrl: Report.StageElementCtrl,
        props: Report.StageElementProps) {
        let minWidth = 0, minHeight = 0,
            maxWidth = MaxNum, maxHeight = MaxNum,
            findWidth, findHeight;
        let scale = State.get('@:{global#stage.scale}');
        for (let p of ctrl.props) {
            if (p.key == 'width') {
                findWidth = 1;
                if (has(p, 'min')) {
                    minWidth = p.min(props);
                }
                if (has(p, 'max')) {
                    maxWidth = p.max(props);
                }
            } else if (p.key == 'height') {
                findHeight = 1;
                if (has(p, 'min')) {
                    minHeight = p.min(props);
                }
                if (has(p, 'max')) {
                    maxHeight = p.max(props);
                }
            }
            if (findWidth &&
                findHeight) {
                break;
            }
        }
        return {
            '@:{generic#min.w}': minWidth * scale,
            '@:{generic#max.w}': maxWidth * scale,
            '@:{generic#min.h}': minHeight * scale,
            '@:{generic#max.h}': maxHeight * scale
        };
    }
};