import Magix from 'magix5';
import Menu from '../gallery/mx-menu/index';
import Cursor from '../gallery/mx-pointer/cursor';
import PointerTip from '../gallery/mx-pointer/tip';
import I18n from '../i18n/index';
import GenericProvider from '../provider/generic';
import StageClipboard from './clipboard';
import Const from './const';
import Contextmenu from './contextmenu';
import Enum from './enum';
import StageGeneric from './generic';
import DHistory from './history';
import StageSelection from './selection';
import StageAlign from './snap';
import Transform from './transform';
let { random, abs, round, floor, min, max, ceil } = Math;
let { has, node, mix,
    State, Vframe,
    guid, taskFinale, inside, config,
    isFunction } = Magix;
let MaxNum = Number.MAX_VALUE;
let MinNum = -MaxNum;
let nowTime = Date.now;
let contextMenuId = guid('_rdcm_');
let sortAlignCenters = (a, b) => a.v - b.v;
let INITIAL = 1,
    WIDTH = 2,
    HEIGHT = 4;
/**
 * 根据节点矩形范围查询对应的元素id
 * @param sizes 尺寸id映射对象
 * @param elements 元素id集合
 * @param to 对齐方式
 */
let queryElementIdByBound = (sizes, elements, to) => {
    let minLeft = MaxNum;
    let minTop = MaxNum;
    let maxRight = MinNum;
    let maxBottom = MinNum;
    let centers = [];
    let findId,
        len;
    for (let m of elements) {
        let { top,
            bottom,
            left,
            right } = sizes[m];
        if (to == '@:{align#right}') {
            if (right > maxRight) {
                maxRight = right;
                findId = m;
            }
        } else if (to == '@:{align#left}') {
            if (left < minLeft) {
                minLeft = left;
                findId = m;
            }
        } else if (to == '@:{align#top}') {
            if (top < minTop) {
                minTop = top;
                findId = m;
            }
        } else if (to == '@:{align#bottom}') {
            if (bottom > maxBottom) {
                maxBottom = bottom;
                findId = m;
            }
        } else if (to == '@:{align#middle}') {
            //中间对齐的，找界面上中间点居中的元素
            let half = (bottom - top) / 2;
            centers.push({
                v: top + half,
                m
            });
        } else if (to == '@:{align#center}') {
            let half = (right - left) / 2;
            centers.push({
                v: left + half,
                m
            });
        }
    }
    len = centers.length;
    if (len) {
        centers.sort(sortAlignCenters);
        findId = centers[ceil(len / 2) - 1].m;
    }
    return findId;
};
/**
 * 获取元素在容器中的偏移量
 * @param destNode 目标dom节点
 * @param page 设计器page对象
 * @param scale 当前缩放
 */
// let GetHodOffset = (destNode, page, scale) => {
//     let x = 0,
//         y = 0;
//     if (destNode) {
//         let bound = destNode.getBoundingClientRect();
//         let stageNode = node('_rd_sc');
//         let stageBound = stageNode.getBoundingClientRect();
//         let left = bound.left - stageBound.left;
//         let top = bound.top - stageBound.top;
//         let realWidth = Const['@:{const#to.px}'](page.gridWidth) * scale;
//         let realHeight = Const['@:{const#to.px}'](page.gridHeight) * scale;
//         x = left % realWidth;
//         y = top % realHeight;
//     }
//     return { x, y };
// };
/**
 * 获取距离差异
 * @param scaledProps 保存缩放属性的对象
 * @param key 某一个参与缩放的key
 * @param diff 偏移量
 * @param hodOffset 格子偏移量
 * @param rest 剩余距离
 */
let getDisatance = (scaledProps, key, diff/*, hodOffset, rest*/) => {
    let src = scaledProps[key];
    let old = src;
    src -= diff;
    // src += hodOffset;
    // if (rest > 0) {
    //     let r = src % rest;
    //     src -= r;
    //     if (r > rest / 2) {
    //         src += rest;
    //     }
    // }
    // src -= hodOffset;
    return src - old;
};

/**
 * 拖动对齐时，如果拖动容器元素，它所有子元素因一起移除，也不能成为对齐元素
 * @param e 元素
 */
let recordHodElements = (e, movedMap, parentHods) => {
    if (e.ctrl.as & Enum['@:{enum#as.hod}']) {
        for (let row of e.props.rows) {
            for (let col of row.cols) {
                if (col.elements?.length) {
                    for (let ce of col.elements) {
                        if (!movedMap[ce.id]) {
                            movedMap[ce.id] = -1;
                        }
                        recordHodElements(ce, movedMap, parentHods);
                    }
                }
            }
        }
    }
    let start = parentHods[e.id];
    while (start) {
        if (!movedMap[start]) {
            movedMap[start] = -1;
        }
        start = parentHods[start];
    }
};
let avgVertialSort = (a, b) => {
    return a[1] - b[1] || b[0] - a[0];
};
let avgHorizontalSort = (a, b) => {
    return a[0] - b[0] || b[1] - a[1];
};
export default {
    /**
     * 添加元素
     * @param e 添加元素时额外的信息
     */
    '@:{elements#add.element}'(e: Report.StageAddElementInfo) {
        /**
         * 元素允许添加的个数
         * '@:{allowed.total.count}':2,//总共允许多少个
         * '@:{allowed.stage.count}':2 //一个编辑区允许多少个
         * '@:{allowed.to.hod}':{ //当前元素允许添加到的容器元素
         *   root:1,//编辑区
         *   table:1,//表格
         *   'h-flexbox':1
         * },
         * '@:{allowed.elements}':{//容器元素允许放置的其它元素
         *  barcode:1,
         *  qrcode:1
         * }
         */
        //从内存中取出缓存的元素对象
        let srcArray = State.get<Report.WaitingAddElementInMemory[]>('@:{global#memory.cache.element}');
        if (srcArray) {
            //用完即删
            State.set({
                '@:{global#memory.cache.element}': null
            });
            let returned = [];
            let selected = [];
            let scale = State.get('@:{global#stage.scale}');
            let page = State.get('@:{global#stage.page}');
            if (!page.readonly) {
                let index = 0,
                    { '@:{generic.all#elements}': allElements } = StageGeneric['@:{generic#query.all.elements.and.map}']();
                for (let src of srcArray) {
                    let { props: definedProps,
                        ctrl,
                        silent,
                        first } = src;//获取元素控制器和预定义属性
                    // let hodOffsetX = 0,
                    //     hodOffsetY = 0;
                    let cell;
                    if (e.node) {//如果有参考节点，则表示鼠标拖动添加元素，此时需要获取当前鼠标下可能存在的容器，以便把拖动的元素放进容器格子里
                        cell = this['@:{elements#get.best.hod}'](e.node, ctrl);
                    }
                    //获取元素需要放置到的集合对象，设计区、容器的每一个格子用来存放子元素的地方均是互相独立的集合
                    let dest = this['@:{elements#get.best.collection}'](e, silent, cell, ctrl);
                    let coll = dest['@:{collection}'];
                    if (!coll) continue;
                    //总共允许几个
                    let total = ctrl['@:{allowed.total.count}'];
                    if (total >= 0) {
                        let all = StageGeneric["@:{generic#query.elements.count.by.type}"](allElements, ctrl.type);
                        if (all >= total) continue;
                    }
                    //一个编辑区允许几个
                    let count = ctrl['@:{allowed.stage.count}'];
                    if (count >= 0) {
                        let all = StageGeneric["@:{generic#query.elements.count.by.type}"](coll, ctrl.type);
                        if (all >= count) continue;
                    }
                    let pos = dest['@:{position.xy}'];
                    let props = ctrl['@:{get.props}'](pos.x + index * Const['@:{const#element.same.position.offset}'], pos.y + index * Const['@:{const#element.same.position.offset}']);
                    if (!has(props, 'ename')) {//补充组件树名称
                        props.ename = GenericProvider['@:{generic#generate.ename}'](ctrl, allElements);
                    }
                    if (definedProps) {
                        if (isFunction(definedProps)) {
                            definedProps = (definedProps as Function)();
                        }
                        mix(props, definedProps);
                    }
                    //缩放属性处理
                    let scaledProps = {} as { x: number, y: number };
                    for (let s of ctrl.props) {
                        if (isFunction(s['@:{stage.scale}'])) {
                            s['@:{stage.scale}'](props, scale, scaledProps);
                        } else if (s['@:{is.scale.and.unit.field}']) {
                            scaledProps[s.key] = props[s.key] * scale;
                        }
                    }
                    let diffX = scaledProps.x - props.x;
                    let diffY = scaledProps.y - props.y;
                    let xDiffed = 0,
                        yDiffed = 0;//,
                    //hasXAP = 0,
                    // hasYAP = 0;
                    //元素自身的有哪些位置信息属性
                    let moveProps = ctrl['@:{move.props}'];
                    if (isFunction(moveProps)) {
                        moveProps = moveProps(props);
                    }
                    //查找参考点进行平移
                    //像svg有多个点，只需要计算一次
                    //if (ctrl['@:{find.anchor.point}']) {
                    xDiffed = getDisatance(scaledProps, 'x', diffX/*, hodOffsetX, restWidth*/);
                    //hasXAP = 1;
                    yDiffed = getDisatance(scaledProps, 'y', diffY/*, hodOffsetY, restHeight*/);
                    // hasYAP = 1;
                    //}
                    //需要对所有可移除的属性进行平移
                    //普通元素只需要移动xy坐标即可
                    //svg元素需要平移所有的点
                    if (moveProps) {
                        for (let m of moveProps) {
                            if (m.use == 'x') {
                                // if (!hasXAP) {//未查找过参考点，则需要计算
                                //     scaledProps[m.key] += getDisatance(scaledProps, m.key, diffX, hodOffsetX, restWidth);
                                // } else {
                                scaledProps[m.key] += xDiffed;
                                //}
                            } else {
                                // if (!hasYAP) {
                                //     scaledProps[m.key] += getDisatance(scaledProps, m.key, diffY, hodOffsetY, restHeight);
                                // } else {
                                scaledProps[m.key] += yDiffed;
                                //}
                            }
                        }
                    }
                    //同步缩放状态的属性
                    for (let p in scaledProps) {
                        props[p] = scaledProps[p];
                    }
                    //如果元素自身有其它更新属性的逻辑，则调用
                    if (ctrl['@:{update.props}']) {
                        ctrl['@:{update.props}'](props);
                    }
                    // let area = dest['@:{area}'];
                    // if (area) {
                    //     if (props.x + props.width >
                    //         (area.x + area.width) * scale) {
                    //         props.x = (area.x + area.width) * scale - props.width;
                    //     }
                    //     if (props.y + props.height >
                    //         (area.y + area.height) * scale) {
                    //         props.y = (area.y + area.height) * scale - props.height;
                    //     }
                    //     if (props.x < area.x) {
                    //         props.x = area.x;
                    //     }
                    //     if (props.y < area.y) {
                    //         props.y = area.y;
                    //     }
                    // }
                    let em = {
                        id: guid(State.get<string>('@:{global#stage.element.id.prefix}')),
                        ctrl,
                        type: ctrl.type,
                        props
                    };
                    //把新加入的元素放到所有元素列表里，供生成ename时判断使用
                    allElements.push(em);
                    //添加到最前面
                    if (first) {
                        coll.unshift(em);
                    } else {
                        coll.push(em);
                    }
                    //如果允许对新增加的元素聚焦
                    if (dest['@:{focus.add.element}']) {
                        selected.push(em);
                    }
                    let currentBind = props.bind;
                    if (currentBind?.id) {//如果添加的元素有绑定数据源
                        let {
                            '@:{element}': pElement,
                            '@:{at.row}': atRow,
                            '@:{at.col}': atCol
                        } = StageGeneric['@:{generic#query.element.parent}'](em);
                        if (pElement) {//检查父元素是否为数据容器
                            let { ctrl: pCtrl, props: pProps } = pElement;
                            if (pCtrl.as & Enum['@:{enum#as.data.hod}']) {
                                let bindAdded = pCtrl['@:{bind.data.added}'];
                                if (bindAdded) {
                                    bindAdded(pProps, em, atRow, atCol);
                                }
                                let updateProps = pCtrl['@:{update.props}'];
                                if (updateProps) {
                                    updateProps(pProps);
                                }
                            }
                        }
                    }
                    returned.push(em);
                    index++;
                }
            }
            return {
                '@:{add.elements}': returned,
                '@:{select.elements}': selected
            };
        }
    },
    /**
     * 单选或多选元素
     * @param element 当前待处理的元素
     * @param isMulti 是否多选
     * @param scrollToElement 是否滚动到元素位置
     */
    '@:{elements#single.or.multi.select}'(element: Report.StageElement,
        isMulti: boolean | number,
        scrollToElement: boolean = true) {
        let {
            '@:{generic.all#map}': allMap
        } = StageGeneric['@:{generic#query.all.elements.and.map}']();
        if (allMap[element.id]) {
            if (isMulti) {//多选逻辑
                //if (!element.props.locked) {
                let elements = State.get<Report.StageElement[]>('@:{global#stage.select.elements}');
                let exists,
                    map = {},
                    elementsToHods = {},
                    hods = [];
                //容器元素需要处理自身和内容元素的关系
                if (element.ctrl.as & Enum['@:{enum#as.hod}']) {
                    hods.push(element);
                }
                for (let i = elements.length; i--;) {
                    let m = elements[i];
                    if (m.id == element.id) {
                        exists = 1;
                    }
                    if (m.ctrl.as & Enum['@:{enum#as.hod}']) {
                        hods.push(m);
                    }
                }
                //取消选择
                //放开注释则保持至少选中一个
                if (exists /*&&
                elements.length > 1*/) {
                    if (StageSelection['@:{selection#remove}'](element)) {
                        let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
                        DHistory["@:{history#save}"](DHistory['@:{history#element.lost.focus}'], ename);
                    }
                } else {
                    let groups = State.get('@:{global#stage.elements.groups}');
                    let added = {},
                        selectAndCurrentElements = [...elements, element];
                    for (let e of selectAndCurrentElements) {
                        let list = groups[e.id];
                        if (list) {//处理组合
                            for (let g of list) {
                                if (!added[g]) {
                                    added[g] = 1;
                                    let dest = allMap[g];
                                    if (dest.ctrl.as & Enum['@:{enum#as.hod}']) {
                                        hods.push(dest);
                                    }
                                }
                            }
                        }
                    }
                    /**
                     * 递归遍历所有子元素
                     * @param children 子元素
                     * @param hodId 容器id
                     */
                    let walk = (children: Report.StageElement[],
                        hodId?: string) => {
                        for (let c of children) {
                            if (hodId) {
                                map[c.id] = 1;
                                elementsToHods[c.id] = hodId;
                            }
                            if (c.ctrl.as & Enum['@:{enum#as.hod}']) {
                                for (let r of c.props.rows) {
                                    for (let d of r.cols) {
                                        if (d.elements) {
                                            walk(d.elements, c.id);
                                        }
                                    }
                                }
                            }
                        }
                    };
                    walk(hods);
                    if (has(map, element.id)) {//选择的元素在选中的表格内，取消表格的选择
                        let sId = element.id;
                        do {
                            let tId = elementsToHods[sId];
                            if (tId) {
                                map[tId] = 1;
                                let list = groups[tId];
                                if (list) {
                                    for (let g of list) {
                                        map[g] = 1;
                                    }
                                }
                                sId = tId;
                            } else {
                                break;
                            }
                        } while (1);
                    }
                    for (let i = elements.length; i--;) {
                        let m = elements[i];
                        if (has(map, m.id)) {
                            elements.splice(i, 1);
                        }
                    }
                    if (StageSelection['@:{selection#add}'](element)) {
                        let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
                        DHistory["@:{history#save}"](DHistory['@:{history#element.get.focus}'], ename);
                    }
                }
                //}
                //如果是单选且当前未选中该元素
            } else if (StageSelection["@:{selection#set}"](element)) {
                if (scrollToElement) {
                    GenericProvider['@:{generic#scroll.into.view}'](element.id);
                }
                let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
                DHistory["@:{history#save}"](DHistory['@:{history#element.get.focus}'], ename);
            }
        }
    },
    /**
     * 空格快捷键或双击行为
     * @param m 处理行为的元素
     * @param e 键盘事件
     */
    '@:{elements#space.or.double.click.action}'(m: Report.StageElement,
        prevent?: Function,
        elementVframe?: Magix5.Vframe) {
        let { props, ctrl, id } = m;
        let modifier = ctrl['@:{modifier}'];
        if (modifier) {//元素上有修改指示器
            let find;//查没查到相应的处理方式
            // if (modifier & Enum['@:{enum#modifier.dblclick}']) {//如果有双击行为
            //     find = 1;
            //     props['@:{dblclick}'] = 1;
            // } else

            if ((modifier & Enum['@:{enum#modifier.inputext}']) &&//如果有显示文本输入框的行为
                (!ctrl['@:{can.show.text}'] ||
                    ctrl['@:{can.show.text}'](props))) {
                find = 1;
                props['@:{show.text}'] = 1;
            }
            if (find &&
                prevent) {//查找到就阻止默认行为，阻止页面滚动
                prevent();
            }
            if (find) {
                StageGeneric['@:{generic#update.stage.element}'](m, '', elementVframe);
            }
        }
    },
    /**
     * 选中或移动选中的元素
     * @param event pointerdown事件对象
     * @param view 调用该方法的Magix.View对象
     */
    '@:{elements#select.or.move.elements}'(event: Magix5.MagixMixedEvent,
        view: Magix5.View) {//选择或移动元素
        let { params, button,
            shiftKey, ctrlKey, metaKey, altKey,
            target,
            pageX,
            pageY } = event;
        let { element, maskId } = params;
        let { props: elementProps, id } = element as Report.StageElement;
        if (!elementProps.readonly) {
            let elementNode = node(id),
                elementVframe;
            if (elementNode) {
                elementVframe = Vframe.byNode(elementNode);
            }
            if ((target as HTMLElement).dataset.as == 'icon' &&
                elementVframe) {
                elementVframe.invoke('@:{icon.pointer.down}', element);
            }
            let { '@:{generic.all#map}': elementsMap,
                //'@:{stage.elements.map}': stageElementsMap,
                '@:{generic.all#elements}': allElements,
                '@:{generic.all#element.hods}': parentHods,
            } = StageGeneric['@:{generic#query.all.elements.and.map}']();
            if (elementsMap[id]) {
                let elements = State.get('@:{global#stage.select.elements}');
                State.set({
                    '@:{global#stage.contextmenu.under.item}': null
                });
                let exist = 0;
                for (let m of elements) {
                    if (m.id === element.id) {
                        exist = 1;
                        break;
                    }
                }
                if (button) {//如果不是左键
                    if (!exist) {//如果在当前选中的元素内找不到当前的，则激活当前
                        if (StageSelection["@:{selection#set}"](element)) {
                            let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
                            DHistory["@:{history#save}"](DHistory['@:{history#element.get.focus}'], ename);
                        }
                    }
                    State.set({
                        '@:{global#stage.contextmenu.under.item}': element
                    });
                } else if (shiftKey || ctrlKey || metaKey) {//多选
                    this["@:{elements#single.or.multi.select}"](element, 1, false);
                } else {
                    let startInfos = [],
                        movedMap = {},
                        //currentProps,
                        //currentCtrl,
                        //currentProps,
                        isNowAdded;//临时聚焦的
                    //hodOffsetX = 0,
                    //hodOffsetY = 0;//容器偏移量，对于吸附格子，格子内要进行修正才能对应到背景网格上
                    if (!exist) {
                        isNowAdded = StageSelection["@:{selection#set}"](element);
                        elements.length = 0;
                        elements.push(element);
                    }
                    let groups = State.get('@:{global#stage.elements.groups}');
                    let nearestElements = [];
                    let newElements = [];
                    let moveInfo,
                        offsetInfo: Report.EventOfStageAutoScroll,
                        page = State.get('@:{global#stage.page}'),
                        scale = State.get('@:{global#stage.scale}');
                    let snapElement = page.snap,
                        supportSnapElement = Const['@:{const#page.enable.snap.align.elements}'];
                    //snapGrid = page.grid && page.snapGrid;

                    for (let e of elements) {
                        if (!movedMap[e.id]) {
                            if (!(e.ctrl['@:{modifier}'] & Enum['@:{enum#modifier.linkage}'])) {
                                movedMap[e.id] = Enum['@:{enum#follow.align.selected}'];
                                newElements.push(e);
                                if (supportSnapElement) {
                                    recordHodElements(e, movedMap, parentHods);
                                }
                            }
                        }
                        let list = groups[e.id];
                        if (list) {
                            for (let n of list) {
                                if (!movedMap[n]) {
                                    let e = elementsMap[n];
                                    if (!(e.ctrl['@:{modifier}'] & Enum['@:{enum#modifier.linkage}'])) {
                                        movedMap[n] = Enum['@:{enum#follow.align.grouped}'];
                                        newElements.push(e);
                                        if (supportSnapElement) {
                                            recordHodElements(e, movedMap, parentHods);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    //console.log(movedMap);
                    let pinX = 0,
                        pinY = 0;
                    // let minLeftDistance = MaxNum;
                    // let minTopDistance = MaxNum;
                    // let minRightDistance = MaxNum;
                    // let minBottomDistance = MaxNum;

                    //let currentNode = node(element.id);
                    // let hod = this['@:{elements#get.best.hod}'](currentNode);
                    // let h = Const['@:{const#to.px}'](page.gridHeight) * scale,
                    //     w = Const['@:{const#to.px}'](page.gridWidth) * scale;
                    for (let e of newElements) {
                        let { id, ctrl, props } = e;
                        if (props.locked) {
                            pinX = 1;
                            pinY = 1;
                        } else {
                            if (props.pinX) {
                                pinX = 1;
                            }
                            if (props.pinY) {
                                pinY = 1;
                            }
                        }
                        let i = {};
                        let moveProps = ctrl['@:{move.props}'];
                        if (moveProps) {
                            if (isFunction(moveProps)) {
                                moveProps = moveProps(props);
                            }
                            for (let m of moveProps) {
                                i[m.key] = Const['@:{const#to.px}'](props[m.key]);
                            }
                        } else {//无移动属性，则为固定
                            pinX = 1;
                            pinY = 1;
                        }
                        // if (id == element.id) {
                        //     currentProps = props;
                        // }
                        startInfos.push(i);
                        // if (stageElementsMap[id]) {
                        //     let area = StageGeneric["@:{query.area.by.xy.or.return.first}"](props);
                        //     if (area) {
                        //         let rect = Transform["@:{transform#rotate.rect}"](props, props.rotate || 0);
                        //         let leftDistance = rect.left - area.x * scale;
                        //         if (leftDistance < minLeftDistance) {
                        //             minLeftDistance = leftDistance;
                        //         }
                        //         let rightDistance = (area.x + area.width) * scale - rect.right;
                        //         if (rightDistance < minRightDistance) {
                        //             minRightDistance = rightDistance;
                        //         }
                        //         let topDistance = rect.top - area.y * scale;
                        //         if (topDistance < minTopDistance) {
                        //             minTopDistance = topDistance;
                        //         }
                        //         let bottomDistance = (area.y + area.height) * scale - rect.bottom;
                        //         if (bottomDistance < minBottomDistance) {
                        //             minBottomDistance = bottomDistance;
                        //         }
                        //     }
                        // }
                    }
                    if (pinX &&
                        pinY) {
                        return;
                    }
                    Cursor["@:{show.by.type}"]('move');
                    //console.log(startInfos);
                    // if (hod) {
                    //     let destNode = hod['@:{node}'];
                    //     let offset = GetHodOffset(destNode, page, scale);
                    //     hodOffsetX = -offset.x;
                    //     hodOffsetY = -offset.y;
                    //     if (offset.x > w / 2) {
                    //         hodOffsetX = w - offset.x;
                    //     }
                    //     if (offset.y > h / 2) {
                    //         hodOffsetY = h - offset.y;
                    //     }
                    // }
                    let elementMoved = 0,
                        moveMinSize = Const['@:{const#unit.px.aberration}'](),
                        startX,
                        startY,
                        sizesMap,
                        testX,
                        testY,
                        altPressed = snapElement ? altKey : !altKey,
                        snapOffset = Const['@:{const#drag.snap.to.other.element.offset}'] * scale;
                    State.fire('@:{event#pointer.using}', {
                        active: 1
                    });
                    State.fire('@:{event#stage.scrolling}', {
                        active: 1,
                    });
                    if (supportSnapElement) {
                        let alignElements = StageAlign['@:{align#query.align.elements}'](allElements, maskId, element, movedMap);
                        nearestElements = alignElements['@:{align.queried#align.elements.sizes}'];
                        startX = alignElements['@:{align.queried#start.x}'];
                        startY = alignElements['@:{align.queried#start.y}'];

                        let others = alignElements['@:{align.queried#together.elements.sizes}'];

                        let sInfo = StageGeneric['@:{generic#query.test.position.and.sizes}'](startX, startY, others);
                        //console.log(sInfo);
                        testX = sInfo['@:{test.x}'];
                        testY = sInfo['@:{test.y}'];
                        sizesMap = sInfo['@:{sizes.map}'];
                        //console.log(testX);
                    }
                    //console.log(testX, fixTestX);
                    //console.log(startInfos, newElements);
                    let offsetX;
                    let offsetY;
                    let moveElements = async () => {
                        //console.log('enter');
                        if (moveInfo) {
                            let { pageX: movePageX,
                                pageY: movePageY } = moveInfo;
                            offsetX = movePageX - pageX;
                            offsetY = movePageY - pageY;
                            //console.log('real move', offsetX, offsetY);
                            if (offsetInfo) {
                                offsetY += offsetInfo['@:{interval.move.event#y}'];
                                offsetX += offsetInfo['@:{interval.move.event#x}'];
                            }
                            // if (snapGrid) {
                            //     let s = startInfos[currentIndex],
                            //         findX = 0,
                            //         findY = 0;
                            //     let moveProps = currentCtrl['@:{move.props}'];
                            //     if (currentCtrl['@:{move.props.is.function}']) {
                            //         moveProps = currentCtrl['@:{move.props}'](currentProps);
                            //     }
                            //     for (let m of moveProps) {
                            //         let v, r;
                            //         if (m.use == 'x') {
                            //             findX = 1;
                            //             v = s[m.key] - hodOffsetX + offsetX;
                            //             //console.log(s[m.key], hodOffsetX, offsetX);
                            //             r = v % w;
                            //             v = v - r;
                            //             if (r > (w / 2)) {
                            //                 v = v + w;
                            //             }
                            //             offsetX = v - s[m.key] + hodOffsetX;
                            //             //offsetX += hodOffsetX;
                            //         } else if (m.use == 'y') {
                            //             findY = 1;
                            //             v = s[m.key] + offsetY - hodOffsetY;
                            //             r = v % h;
                            //             v = v - r;
                            //             if (r > (h / 2)) {
                            //                 v = v + h;
                            //             }
                            //             offsetY = v - s[m.key] + hodOffsetY;
                            //         }
                            //         if (findX &&
                            //             findY) {
                            //             break;
                            //         }
                            //     }
                            //     if (!findX) {
                            //         offsetX = 0
                            //     }
                            //     if (!findY) {
                            //         offsetY = 0;
                            //     }
                            // }
                            if (pinX) {
                                offsetX = 0;
                            }
                            if (pinY) {
                                offsetY = 0;
                            }
                            //吸附逻辑可参考./header.ts中的注释
                            if (supportSnapElement &&
                                testX &&
                                (offsetX || offsetY)) {
                                let snapInfo = StageAlign['@:{align#find.and.fire.align.position}'](nearestElements, startX, offsetX, startY, offsetY, sizesMap, testX, testY, pinX, pinY, altPressed, snapOffset, moveMinSize);
                                offsetX = snapInfo['@:{align#new.offset.x}'];
                                offsetY = snapInfo['@:{align#new.offset.y}'];
                                //console.log('y',offsetY);
                            }
                            let index = 0,
                                ids = {},
                                types = {},
                                absX = abs(offsetX),
                                absY = abs(offsetY);
                            if (Const['@:{const#great.than.or.approach}'](absX, moveMinSize) ||
                                Const['@:{const#great.than.or.approach}'](absY, moveMinSize) ||
                                elementMoved) {
                                for (let e of newElements) {
                                    let s = startInfos[index++];
                                    let { props, id, ctrl, type } = e;
                                    let moveProps = ctrl['@:{move.props}'];
                                    if (isFunction(moveProps)) {
                                        moveProps = moveProps(props);
                                    }
                                    if (moveProps) {
                                        for (let m of moveProps) {
                                            let offset = (m.use == 'x' ? offsetX : offsetY);

                                            props[m.key] = Const['@:{const#to.unit}'](s[m.key] + offset);
                                            elementMoved = 1;
                                        }
                                    }
                                    if (id == element.id) {
                                        let tipMsg = `${Transform['@:{transform#to.show.value}'](props.x)} , ${Transform['@:{transform#to.show.value}'](props.y)}`;
                                        PointerTip['@:{show.text}'](tipMsg);
                                        PointerTip['@:{update.position}'](movePageX, movePageY);
                                    }
                                    StageGeneric['@:{generic#update.stage.element}'](e);
                                    ids[id] = 1;
                                    types[type] = 1;
                                }
                                if (offsetInfo &&
                                    !offsetInfo['@:{interval.move.event#called}']) {
                                    offsetInfo['@:{interval.move.event#called}'] = 1;
                                    await taskFinale();
                                    //await sleep(3000);
                                    offsetInfo['@:{interval.move.event#ready}']();
                                }
                                State.fire('@:{event#stage.select.element.props.change}', {
                                    '@:{ids}': ids,
                                    '@:{types}': types,
                                    '@:{props}': {
                                        '@:{position}': 1
                                    }
                                });
                            }
                        }
                    };
                    /**
                     * 监听设计器贴边滚动事件
                     * @param e 内部滚动事件对象
                     */
                    let watchIntervalMove = (e: Report.EventOfStageAutoScroll) => {
                        offsetInfo = e;
                        moveElements();
                    };
                    /**
                     * 监听键盘按键的按下抬起
                     * @param e 按键按下抬起事件
                     */
                    let watchKeypress = (e: Report.EventOfKeyboardPress) => {
                        altPressed = snapElement ? e['@:{keypress#alt.key}'] : !e['@:{keypress#alt.key}'];
                        moveElements();
                    };
                    //处理按键
                    State.on('@:{event#key.press}', watchKeypress);
                    //处理贴边滚动
                    State.on('@:{event#stage.auto.scroll}', watchIntervalMove);
                    view['@:{drag.drop}'](event, evt => {
                        State.fire('@:{event#drag.element.move}', evt);
                        moveInfo = evt;
                        moveElements();
                    }, () => {
                        State.off('@:{event#key.press}', watchKeypress);
                        State.off('@:{event#stage.auto.scroll}', watchIntervalMove);
                        //console.log(offsetX, offsetY)
                        if (elementMoved) {
                            this['@:{elements#last.pointer.down.event}'] = null;
                            if (Const['@:{const#great.than.or.approach}'](abs(offsetX), moveMinSize) ||
                                Const['@:{const#great.than.or.approach}'](abs(offsetY), moveMinSize)) {
                                let ename = StageGeneric['@:{generic#query.element.name}'](newElements);
                                DHistory["@:{history#save}"](DHistory['@:{history#element.moved}'], ename);
                            }
                        } else if (!exist &&
                            isNowAdded) {
                            let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
                            DHistory["@:{history#save}"](DHistory['@:{history#element.get.focus}'], ename);
                        }
                        if (!elementMoved) {
                            if (elementVframe) {
                                //元素单击事件
                                elementVframe.invoke('@:{pointer.click}', element);
                            }
                            let lastEvent = this['@:{elements#last.pointer.down.event}'] as PointerEvent;
                            if (lastEvent) {
                                //检测鼠标位置是否移动过
                                let distanceDiff = event.pageX - lastEvent.pageX + event.pageY - lastEvent.pageY;
                                //检测两次时间差
                                let timeDiff = nowTime() - this['@:{elements#last.pointer.down.time}'];
                                if (!distanceDiff &&//未移动过
                                    timeDiff < Const['@:{const#element.dblclick.interval.ms.time}']) {//2次间隔
                                    if (elementVframe) {
                                        //元素双击事件
                                        elementVframe.invoke('@:{pointer.dblclick}', element);
                                    }
                                    this['@:{elements#space.or.double.click.action}'](element, 0, elementVframe);
                                }
                            }
                            this['@:{elements#last.pointer.down.event}'] = event;
                            this['@:{elements#last.pointer.down.time}'] = nowTime();
                        }
                        State.fire('@:{event#pointer.using}');
                        State.fire('@:{event#stage.scrolling}');
                        State.fire('@:{event#drag.element.stop}');
                        if (supportSnapElement) {
                            State.fire('@:{event#stage.snap.element.find}');
                        }
                        Cursor["@:{hide}"]();
                        PointerTip['@:{hide}']();
                    });
                }
            }
        }
    },

    /**
     * 聚焦选择元素的格子
     */
    '@:{elements#focus.select.element.hod}'() {
        let stages: Report.ElementsQuerySelectElementsStageResult[] = StageGeneric['@:{generic#query.select.elements.stage}']();
        if (stages.length === 1) {
            let f = stages[0];
            if (f['@:{stage.type}'] == '@:{hod}') {
                let table = f['@:{hod}'];
                let { props } = table;
                if (!props.readonly) {
                    props.focusRow = f['@:{row.index}'];
                    props.focusCol = f['@:{col.index}'];
                    StageGeneric['@:{generic#update.stage.element}'](table, '@:{focus.hod}');
                    // State.fire('@:{event#stage.select.element.props.change}', {
                    //     '@:{ids}': {
                    //         [table.id]: 1
                    //     },
                    //     '@:{types}': {
                    //         [table.type]: 1
                    //     },
                    //     '@:{props}': {
                    //         '@:{focus.hod}': 1
                    //     }
                    // });
                    // let n = node(table.id);
                    // if (n) {
                    //     let vf = Vframe.byNode(n);
                    //     if (vf) {
                    //         vf.invoke('render', table);
                    //     }
                    // }
                    if (StageSelection["@:{selection#set}"](table)) {
                        let ename = StageGeneric['@:{generic#query.ename.by.single}'](table);
                        DHistory["@:{history#save}"](DHistory['@:{history#element.get.focus}'], ename);
                    }
                }
            }
        }
    },
    /**
     * 移动元素的z轴
     * @param to 移动方向
     * @param element 移动的元素
     */
    '@:{elements#modify.element.z.index}'(to: number, element: Report.StageElement): void {
        //3 top 4 bottom 5 to up 6 to down
        let selectElements = State.get('@:{global#stage.select.elements}');
        let index = -1;
        if (element &&
            !element.props.locked &&
            selectElements.length) {
            let elements = StageGeneric["@:{generic#find.element.owner.collection}"](selectElements[0]);
            let topElement = elements.at(-1),
                bottomElement = elements[0];
            if (((to == 4 || to == 6) &&
                element.id != bottomElement.id) ||
                ((to == 3 || to == 5) &&
                    element.id != topElement.id)) {
                for (let i = elements.length; i--;) {
                    let e = elements[i];
                    if (e.id === element.id) {
                        elements.splice(index = i, 1);
                        break;
                    }
                }
                if (to == 3) {
                    elements.push(element);
                } else if (to == 4) {
                    elements.unshift(element);
                } else if (to == 5) {
                    elements.splice(index + 1, 0, element);
                } else if (to == 6) {
                    if (index === 0) index = 1;
                    elements.splice(index - 1, 0, element);
                }
                let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
                DHistory["@:{history#save}"](DHistory['@:{history#element.z.index}'], ename);
                State.fire('@:{event#stage.elements.change}');
            }
        }
    },
    /**
     * tab按键选择元素
     * @param revert 是否反向选择
     */
    '@:{elements#handle.key.tab}'(revert: boolean | number) {
        let selectElements = State.get('@:{global#stage.select.elements}');
        let c = selectElements.length,
            current,
            select,
            stageElements = State.get('@:{global#stage.elements}'),
            newElements = StageGeneric['@:{generic#query.all.without.readonly.elements}'](stageElements, 1);
        //未选或多选2个以上的我们取消多选，然后从头选择一个
        if (c != 1) {
            let first = newElements.at(revert ? 0 : -1);
            if (first) {
                select = first;
            }
        } else {
            current = selectElements[0];
            let findIndex = newElements.length;
            for (; findIndex--;) {
                let ne = newElements[findIndex];
                if (current.id == ne.id) {
                    break;
                }
            }
            if (revert) {
                findIndex++;
                if (findIndex >= newElements.length) {
                    findIndex = 0;
                }
            } else {
                findIndex--;
                if (findIndex < 0) {
                    findIndex = -1;
                }
            }
            select = newElements.at(findIndex);
        }
        if (select &&
            (!current ||
                select.id != current.id)) {
            GenericProvider['@:{generic#scroll.into.view}'](select.id);
            StageSelection["@:{selection#set}"](select);
            let ename = StageGeneric['@:{generic#query.ename.by.single}'](select);
            DHistory["@:{history#save}"](DHistory['@:{history#element.get.focus}'], ename);
        }
    },
    /**
     * 移动元素及它所在的组合列表
     * @param groupList 组合元素id列表
     * @param use 使用x还是y进行移动
     * @param diff 移动距离
     * @param ids id对象，用于记录哪些元素进行了移动
     * @param groupListIsElement 指示groupList是否为元素数组
     */
    '@:{elements#move.elements.by.ids}'(groupList: unknown[],
        use: string,
        diff: number,
        ids?: Report.NumberMapObject,
        groupListIsElement?: number) {
        let { '@:{generic.all#map}': elementsMap } = StageGeneric['@:{generic#query.all.elements.and.map}']();
        //diff = Const['@:{const#to.unit}'](diff);
        for (let ge of groupList) {
            let m = groupListIsElement ? ge as Report.StageElement : elementsMap[ge as string];
            let { ctrl, props, id } = m;
            if (ids) {
                ids[id] = 1;
            }
            let moveProps = ctrl['@:{move.props}'];
            if (isFunction(moveProps)) {
                moveProps = moveProps(props);
            }
            if (moveProps) {
                for (let x of moveProps) {
                    if (x.use == use) {
                        props[x.key] += diff;
                    }
                }
            }
            StageGeneric['@:{generic#update.stage.element}'](m);
        }
    },
    /**
     * 对齐元素
     * @param to 对齐方式
     */
    '@:{elements#align.elements}'(to: string) {
        let elements = State.get('@:{global#stage.select.elements}');
        let underElement = State.get('@:{global#stage.contextmenu.under.item}');
        let selectedElementsMap = StageSelection['@:{selection#get.selected.map}']();
        let groups = State.get('@:{global#stage.elements.groups}');
        let { '@:{generic.all#map}': elementsMap,
            '@:{generic.all#elements}': stageElements } = StageGeneric['@:{generic#query.all.elements.and.map}']();
        let flowProvider = State.get('@:{global#provider.of.flow}');
        let maxRight = MinNum;
        let minLeft = MaxNum;
        let minTop = MaxNum;
        let maxBottom = MinNum;
        let minVCenter = MaxNum;
        let minHCenter = MaxNum;
        let compareId;
        State.set({
            '@:{global#stage.contextmenu.under.item}': null
        });
        if (flowProvider) {
            elements = flowProvider["@:{flow.provider#remove.connector.from.elements}"](elements, 1);
        }
        //console.log(underElement);
        let sizes = {};
        for (let m of stageElements) {
            let n = node<HTMLElement>('_rdm_' + m.id);
            let b = n.getBoundingClientRect();
            sizes[m.id] = {
                left: Const['@:{const#to.unit}'](b.x),
                top: Const['@:{const#to.unit}'](b.y),
                right: Const['@:{const#to.unit}'](b.right),
                bottom: Const['@:{const#to.unit}'](b.bottom),
                width: Const['@:{const#to.unit}'](b.width),
                height: Const['@:{const#to.unit}'](b.height)
            };
        }
        if (underElement) {
            compareId = underElement.id;
        } else {
            let elementIds = [];
            for (let m of elements) {
                elementIds.push(m.id);
            }
            compareId = queryElementIdByBound(sizes, elementIds, to);
        }
        let {
            top,
            bottom,
            left,
            right
        } = sizes[compareId];
        maxRight = right;
        minLeft = left;
        minTop = top;
        maxBottom = bottom;
        minVCenter = top + (bottom - top) / 2;
        minHCenter = left + (right - left) / 2;

        let isChanged = 0;
        let newElements = [];
        let group = groups[compareId];
        let added = { [compareId]: 1 };
        let pinX = 0, pinY = 0;
        let moveWithGroup = 1;
        if (group) {
            for (let e of group) {
                added[e] = 1;
            }
        }
        for (let e of elements) {
            group = groups[e.id];
            if (group) {
                let newList = [];
                for (let g of group) {
                    if (selectedElementsMap[g] &&
                        !added[g]) {
                        newList.push(g);
                    }
                }
                if (newList.length) {
                    let cId = queryElementIdByBound(sizes, newList, to);
                    if (!added[cId]) {
                        added[cId] = 1;
                        newElements.push(elementsMap[cId]);
                        for (let n of newList) {
                            added[n] = 1;
                        }
                    }
                }
            } else if (!added[e.id]) {
                added[e.id] = 1;
                newElements.push(e);
            }
        }
        if (!newElements.length &&
            group) {
            moveWithGroup = 0;
            for (let e of elements) {
                if (e.id != compareId) {
                    newElements.push(e);
                }
            }
        }
        for (let { props } of newElements) {
            if (props.locked) {
                pinX = 1;
                pinY = 1;
            } else {
                if (props.pinX) {
                    pinX = 1;
                }
                if (props.pinY) {
                    pinY = 1;
                }
            }
            if (pinX &&
                pinY) {
                break;
            }
        }
        //分组后的移动
        /**
         * 如果选中的元素处于同一分组中，则只对齐当前选中的元素，分组中的其它元素则不移动，可以理解为分组内的操作只影响选中的元素
         * 如果选中的元素处于不同分组中，则从中挑出固定对齐元素，其所在分组中的元素均不移动，其它分组中的元素则全部移动相应的距离
         */
        let ids = {},
            types = {};
        for (let m of newElements) {
            let bound = sizes[m.id];
            let use,
                diff = 0;
            if (to == '@:{align#right}' && !pinX) {
                diff = maxRight - bound.right;
                use = 'x';
            } else if (to == '@:{align#left}' && !pinX) {
                diff = minLeft - bound.left;
                use = 'x';
            } else if (to == '@:{align#top}' && !pinY) {
                diff = minTop - bound.top;
                use = 'y';
            } else if (to == '@:{align#bottom}' && !pinY) {
                diff = maxBottom - bound.bottom;
                use = 'y';
            } else if (to == '@:{align#middle}' && !pinY) {
                diff = minVCenter - (bound.top + bound.height / 2);
                use = 'y';
            } else if (to == '@:{align#center}' && !pinX) {
                diff = minHCenter - (bound.left + bound.width / 2);
                use = 'x';
            }
            let mDiff = Const['@:{const#scale.to.unit}'](diff);
            //console.log(mDiff);
            if (mDiff) {
                ids[m.id] = 1;
                types[m.type] = 1;
                isChanged = 1;
                let groupList = moveWithGroup && groups[m.id] || [m.id];
                this['@:{elements#move.elements.by.ids}'](groupList, use, diff, ids);
            }
        }
        if (isChanged) {
            State.fire('@:{event#stage.select.element.props.change}', {
                '@:{ids}': ids,
                '@:{types}': types,
                '@:{props}': {
                    '@:{position}': 1
                }
            });
            DHistory["@:{history#save}"](DHistory['@:{history#element.aligned}']);
        }
    },
    // async '@:{same.size.elements}'(to, shiftKey) {
    //     let elements = State.get('@:{global#stage.select.elements}');
    //     let maxWidth = MinNum,
    //         maxHeight = MinNum,
    //         minWidth = MaxNum,
    //         minHeight = MaxNum;
    //     for (let m of elements) {
    //         let props = m.props;
    //         if (props.width > maxWidth) {
    //             maxWidth = props.width;
    //         }
    //         if (props.width < minWidth) {
    //             minWidth = props.width;
    //         }
    //         if (props.height > maxHeight) {
    //             maxHeight = props.height;
    //         }
    //         if (props.height < minHeight) {
    //             minHeight = props.height;
    //         }
    //     }
    //     let isChanged = 0;
    //     let ids = {},
    //         types = {};
    //     for (let m of elements) {
    //         let { props, ctrl } = m,
    //             lChanged = 0,
    //             temp,
    //             old = Transform["@:{transform#get.rect.xy}"](props);
    //         if (to == 'width') {
    //             temp = shiftKey ? minWidth : maxWidth;
    //             if (props.width != temp) {
    //                 lChanged = 1;
    //                 props.width = temp;
    //             }
    //         } else {
    //             temp = shiftKey ? minHeight : maxHeight;
    //             if (props.height != temp) {
    //                 lChanged = 1;
    //                 props.height = temp;
    //             }
    //         }
    //         if (lChanged) {
    //             ids[m.id] = 1;
    //             types[m.type] = 1;
    //             isChanged = 1;
    //             let syncProps = ctrl['@:{sync.props}'];
    //             let syncTo = syncProps && syncProps[to];
    //             if (syncTo) {
    //                 props[syncTo] = props[to];
    //             }
    //             let n = Transform["@:{transform#get.rect.xy}"](props);
    //             //console.log(old, n);
    //             props.x += old.x - n.x;
    //             props.y += old.y - n.y;
    //             if (ctrl['@:{update.props}']) {
    //                 ctrl['@:{update.props}'](props);
    //             }
    //             let vf = Vframe.byNode(node(m.id));
    //             if (vf) {
    //                 let r = await vf.invoke('assign', { element: m });
    //                 if (r !== false) {
    //                     vf.invoke('render');
    //                 }
    //             }
    //         }
    //     }
    //     if (isChanged) {
    //         State.fire('@:{event#stage.select.element.props.change}', {
    //             '@:{ids}': ids,
    //             '@:{types}': types,
    //             '@:{props}': {
    //                 '@:{position}': 1
    //             }
    //         });
    //         DHistory["@:{history#save}"](54);
    //     }
    // },
    /**
     * 同步宽高或把某个元素的宽同步为高
     * @param from from为1时代表宽，否则为高
     * @param to to为1时代表宽，否则为高
     */
    '@:{elements#sync.or.reverse.size.elements}'(from: number, to: number): number {
        let elements = State.get<Report.StageElement[]>('@:{global#stage.select.elements}');
        if (elements.length == 2) {
            let underElement = State.get<Report.StageElement>('@:{global#stage.contextmenu.under.item}');
            let [first, second] = elements;
            let source = first == underElement ? second : first;
            State.set({
                '@:{global#stage.contextmenu.under.item}': null
            });
            let { props: destProps, ctrl, id } = underElement;
            let fromKey = from == 1 ? 'width' : 'height';
            let destKey = to == 1 ? 'width' : 'height';
            //console.log(fromKey, destKey);
            let sourceProps = source.props;
            if (sourceProps[fromKey] != destProps[destKey]) {
                let oldRotatedRect = Transform['@:{transform#rotate.rect}'](destProps);
                let old = oldRotatedRect['@:{point}'][0];
                let r;
                if (ctrl['@:{modifier}'] & Enum['@:{enum#modifier.sync.size}']) {
                    r = destProps.height ? destProps.width / destProps.height : 0;
                }
                destProps[destKey] = sourceProps[fromKey];
                if (r) {
                    if (to == 1) {
                        destProps.height = destProps.width / r;
                    } else {
                        destProps.width = destProps.height * r;
                    }
                }
                let newRotated = Transform['@:{transform#rotate.rect}'](destProps);
                let n = newRotated['@:{point}'][0];
                //console.log(old, n);
                destProps.x += old.x - n.x;
                destProps.y += old.y - n.y;
                StageGeneric['@:{generic#update.stage.element}'](underElement, '@:{size}');
                return 1;
            }
        }
        return 0;
    },
    /**
     * 均匀分布元素
     * @param to 如何均分
     * @param shift 是否使用元素中心点
     */
    '@:{elements#avg.elements}'(to, shift) {
        let elements = State.get('@:{global#stage.select.elements}');
        let flowProvider = State.get('@:{global#provider.of.flow}');
        let groups = State.get('@:{global#stage.elements.groups}');
        if (flowProvider) {
            elements = flowProvider["@:{flow.provider#remove.connector.from.elements}"](elements, 1);
        }
        let avgY;
        let avgX;
        let vertical = to == 'v',
            canAvg = 1, sort;
        let maxCX = MinNum,
            minCX = MaxNum,
            maxCY = MinNum,
            minCY = MaxNum,
            maxBottom = MinNum,
            maxRight = MinNum,
            tempArray = [],
            differentGroups = 0,
            moveWithGroup = 1,
            queried = {};
        for (let m of elements) {
            let group = groups[m.id];
            if (group) {
                if (!queried[group]) {
                    queried[group] = 1;
                    differentGroups++;
                }
            } else {
                differentGroups++;
            }
            let bound = node<HTMLElement>('_rdm_' + m.id).getBoundingClientRect();
            let { x, y,
                width, height,
                bottom, right } = bound;
            let mx = x,
                my = y;
            if (shift) {
                mx += width / 2;
                my += height / 2;
            }
            if (mx > maxCX) {
                maxCX = mx;
            }
            if (mx < minCX) {
                minCX = mx;
            }
            if (my > maxCY) {
                maxCY = my;
            }
            if (my < minCY) {
                minCY = my;
            }
            if (right > maxRight) {
                maxRight = right;
            }
            if (bottom > maxBottom) {
                maxBottom = bottom;
            }
            tempArray.push([mx, my, m, width, height, right, bottom]);
        }
        if (differentGroups < 2) {
            moveWithGroup = 0;
        }
        let isChanged;
        let ids = {},
            types = {};
        let startIndex = 1;
        let endIndex = tempArray.length - 1;
        let count = endIndex;


        if (vertical) {
            sort = (a, b) => {
                if (!shift) {
                    if (a[6] == maxBottom) {
                        return 1;
                    } else if (b[6] == maxBottom) {
                        return -1;
                    }
                }
                return a[1] - b[1] || b[0] - a[0];
            };
        } else {
            sort = (a, b) => {
                if (!shift) {
                    if (a[5] == maxRight) {
                        return 1;
                    } else if (b[5] == maxRight) {
                        return -1;
                    }
                }
                return a[0] - b[0] || b[1] - a[1];
            };
        }
        tempArray.sort(sort);
        let prev = tempArray[0];
        if (shift) {
            avgY = round((maxCY - minCY) / count);
            avgX = round((maxCX - minCX) / count);
        } else {
            let totalInnerWidth = 0,
                totalInnerHeight = 0,
                maxHeight = maxBottom - minCY,
                maxWith = maxRight - minCX;
            for (let e of tempArray) {
                if ((vertical && Const['@:{const#approach}'](maxHeight, e[4])) ||
                    (!vertical && Const['@:{const#approach}'](maxWith, e[3]))) {
                    canAvg = 0;
                    break;
                }
                totalInnerWidth += e[3];
                totalInnerHeight += e[4];
            }
            avgY = round((maxHeight - totalInnerHeight) / count);
            avgX = round((maxWith - totalInnerWidth) / count);
        }
        if (canAvg) {
            for (let i = startIndex; i < endIndex; i++) {
                let now = tempArray[i],
                    m = now[2],
                    dest, current,
                    use;
                if (shift) {
                    if (vertical) {
                        dest = i * avgY + minCY;
                        current = now[1];
                        use = 'y';
                    } else {
                        dest = i * avgX + minCX;
                        current = now[0];
                        use = 'x';
                    }
                } else {
                    if (vertical) {
                        dest = prev[1] + prev[4] + avgY;
                        current = now[1];
                        now[1] = dest;
                        use = 'y';
                    } else {
                        dest = prev[0] + prev[3] + avgX;
                        current = now[0];
                        now[0] = dest;
                        use = 'x';
                    }
                }
                prev = now;
                let d = Const['@:{const#scale.to.unit}'](Const['@:{const#to.unit}'](dest - current));
                if (d) {
                    ids[m.id] = 1;
                    types[m.type] = 1;
                    isChanged = 1;
                    let groupList = moveWithGroup && groups[m.id] || [m.id];
                    this['@:{elements#move.elements.by.ids}'](groupList, use, d, ids);
                }
            }
        }
        if (isChanged) {
            State.fire('@:{event#stage.select.element.props.change}', {
                '@:{ids}': ids,
                '@:{types}': types,
                '@:{props}': {
                    '@:{position}': 1
                }
            });
            DHistory['@:{history#save}'](vertical ? DHistory['@:{history#element.avg.v}'] : DHistory['@:{history#element.avg.h}']);
        }
    },
    /**
     * 设计区内均匀分布元素
     * @param to 如何均分
     * @param shift 是否使用元素中心点
     */
    '@:{elements#stage.avg.elements}'(to, shift, control) {
        let stages = StageGeneric['@:{generic#query.select.elements.stage}']();
        let groups = State.get('@:{global#stage.elements.groups}');
        let flowProvider = State.get('@:{global#provider.of.flow}');
        let page = State.get<Report.StagePage>('@:{global#stage.page}');
        let selectElementsMap = StageSelection['@:{selection#get.selected.map}']();
        let isChanged;
        let ids = {},
            types = {},
            vertical = to == 'sv',
            maxPages = page.pages;
        if (control) {
            shift = 0;
        }
        let newStages = [],
            elementInPages = {}
        for (let stage of stages) {
            let rootBound = node<HTMLDivElement>(stage['@:{container}']).getBoundingClientRect();
            let one = {
                '@:{bound.x}': rootBound.x,
                '@:{bound.y}': rootBound.y,
                '@:{bound.width}': rootBound.width,
                '@:{bound.height}': rootBound.height,
                '@:{move.with.group}': 1,
                '@:{selected}': [],
                '@:{offset.y}': 0
            };
            let selectedElements = stage['@:{selected}'];
            if (flowProvider) {
                selectedElements = flowProvider["@:{flow.provider#remove.connector.from.elements}"](selectedElements, 1);
            }
            let differentGroups = 0,
                sameGroupCount = 0,
                fullSelected = 0,
                queried = {};
            for (let e of selectedElements) {
                let group = groups[e.id];
                if (group) {
                    if (!queried[group]) {
                        queried[group] = 1;
                        sameGroupCount = 0;
                        differentGroups++;
                        for (let g of group) {
                            if (selectElementsMap[g]) {
                                sameGroupCount++;
                            }
                        }
                        if (sameGroupCount == group.length) {
                            fullSelected++;
                        }
                    }
                } else {
                    differentGroups++;
                }
            }
            if (fullSelected) {
                //one['@:{select.all.grouped}'] = 1;
                if (differentGroups == 1) {
                    one['@:{move.with.group}'] = 0;
                }
            }
            let pre = one;
            for (let e of selectedElements) {
                let bound = node<HTMLElement>('_rdm_' + e.id).getBoundingClientRect();
                if (stage['@:{stage.type}'] == '@:{stage}') {
                    let single = (rootBound.height / maxPages);
                    let whichPages = floor((bound.y - rootBound.y) / single);
                    whichPages = max(min(whichPages, maxPages - 1), 0);
                    let inPage = whichPages * single;
                    if (!has(elementInPages, inPage)) {
                        pre = GenericProvider['@:{generic#clone}'](one);
                        pre['@:{offset.y}'] = inPage;
                        pre['@:{bound.height}'] = single;
                        newStages.push(elementInPages[inPage] = pre);
                    } else {
                        pre = elementInPages[inPage];
                    }
                }
                pre['@:{selected}'].push({
                    '@:{bound}': bound,
                    '@:{element}': e
                });
            }
            if (stage['@:{stage.type}'] == '@:{hod}') {
                newStages.push(pre);
            }
        }
        for (let stage of newStages) {
            let rootBoundX = stage['@:{bound.x}'];
            let rootBoundY = stage['@:{bound.y}'];
            let stageWidth = stage['@:{bound.width}'];
            let stageHeight = stage['@:{bound.height}'];
            let prev = [rootBoundX, rootBoundY + stage['@:{offset.y}'], 0, 0, 0];

            let selectedElements = stage['@:{selected}'];
            let maxCX = MinNum,
                minCX = MaxNum,
                maxCY = MinNum,
                minCY = MaxNum,
                maxRight = MinNum,
                maxBottom = MinNum,
                moveWithGroup = stage['@:{move.with.group}'],
                tempArray = [];
            for (let { '@:{bound}': bound,
                '@:{element}': m
            } of selectedElements) {
                let { x, y,
                    width, height,
                    right, bottom } = bound;
                let mx = x,
                    my = y;
                if (shift) {
                    mx += width / 2;
                    my += height / 2;
                }
                if (mx > maxCX) {
                    maxCX = mx;
                }
                if (mx < minCX) {
                    minCX = mx;
                }
                if (my > maxCY) {
                    maxCY = my;
                }
                if (my < minCY) {
                    minCY = my;
                }
                if (bottom > maxBottom) {
                    maxBottom = bottom;
                }
                if (right > maxRight) {
                    maxRight = right;
                }
                tempArray.push([mx, my, m, width, height]);
            }
            let count = tempArray.length;

            let avgY;
            let avgX;
            tempArray.sort(vertical ? avgVertialSort : avgHorizontalSort);
            if (control) {
                avgY = (rootBoundY + stageHeight / 2) - (minCY + (maxBottom - minCY) / 2);
                avgX = (rootBoundX + stageWidth / 2) - (minCX + (maxRight - minCX) / 2);
            } else if (shift) {
                avgY = stageHeight / (count + 1);
                avgX = stageWidth / (count + 1);
            } else {
                let totalInnerWidth = 0,
                    totalInnerHeight = 0;
                for (let e of tempArray) {
                    totalInnerWidth += e[3];
                    totalInnerHeight += e[4];
                }
                avgY = (stageHeight - totalInnerHeight) / (count + 1);
                avgX = (stageWidth - totalInnerWidth) / (count + 1);
            }
            for (let now of tempArray) {
                let m = now[2],
                    dest, current,
                    use;
                if (shift) {
                    if (vertical) {
                        dest = prev[1] + avgY;
                        current = now[1];
                        now[1] = dest;
                        use = 'y';
                    } else {
                        dest = prev[0] + avgX;
                        current = now[0];
                        now[0] = dest;
                        use = 'x';
                    }
                } else {
                    if (vertical) {
                        if (control) {
                            dest = now[1] + avgY;
                        } else {
                            dest = prev[1] + prev[4] + avgY;
                        }
                        current = now[1];
                        now[1] = dest;
                        use = 'y';
                    } else {
                        if (control) {
                            dest = now[0] + avgX;
                        } else {
                            dest = prev[0] + prev[3] + avgX;
                        }
                        current = now[0];
                        now[0] = dest;
                        use = 'x';
                    }
                }
                prev = now;
                let d = Const['@:{const#scale.to.unit}'](Const['@:{const#to.unit}'](dest - current));
                if (d) {
                    ids[m.id] = 1;
                    types[m.type] = 1;
                    isChanged = 1;
                    let groupList = moveWithGroup && groups[m.id] || [m.id];
                    this['@:{elements#move.elements.by.ids}'](groupList, use, d, ids);
                }
            }
        }

        if (isChanged) {
            State.fire('@:{event#stage.select.element.props.change}', {
                '@:{ids}': ids,
                '@:{types}': types,
                '@:{props}': {
                    '@:{position}': 1
                }
            });
            DHistory['@:{history#save}'](vertical ? DHistory['@:{history#element.avg.v}'] : DHistory['@:{history#element.avg.h}']);
        }
    },
    /**
     * 获取最佳的设计区元素列表对象
     * @param e 添加元素事件对象
     * @param silent 是否静默添加
     * @param cell 格子对象
     * @param srcCtrl 当前元素的ctrl对象
     */
    '@:{elements#get.best.collection}'(e: Report.StageAddElementInfo,
        silent: number | boolean,
        cell: Report.ElementsQueryBestHodResult,
        srcCtrl: Report.StageElementCtrl): Report.ElementsQueryBestCollectionResult {
        let current = State.get('@:{global#stage.select.elements}');
        let clicked = !e.node;
        //let { areas } = State.get('@:{global#stage.page}');
        // let collectionType = '@:{stage}';
        // let area;
        let first = current[0],
            xy = {
                x: e.pageX,
                y: e.pageY
            },
            collection = State.get('@:{global#stage.elements}'),
            find = 0,
            focus = 1;//,
        if (clicked &&
            current.length == 1 &&
            (first.ctrl.as & Enum['@:{enum#as.hod}']) &&
            first.props.focusRow > -1) {
            let { rows, focusRow, focusCol } = first.props;
            let row = rows[focusRow];
            if (row &&
                (!first.ctrl['@:{allowed.elements}'] ||
                    first.ctrl['@:{allowed.elements}'][srcCtrl.type]) &&
                (!srcCtrl['@:{allowed.to.hod}'] ||
                    srcCtrl['@:{allowed.to.hod}'][first.type])) {
                let cell = row.cols[focusCol];
                let n = node<HTMLElement>(`_rd_h_${first.id}_${focusRow}_${focusCol}`);
                if (n) {
                    collection = cell.elements;
                    let height = row.height != null ? row.height : cell.height;
                    let width = row.width != null ? row.width : cell.width;
                    xy = {
                        x: random() * width / 4,
                        y: random() * height / 4
                    };
                    focus = 0;
                    find = 1;
                }
            }
        } else if (!clicked && cell) {
            let maskNode = node<HTMLElement>(cell['@:{mask.id}']);
            if (maskNode) {
                let bound = maskNode.getBoundingClientRect();
                xy = {
                    x: e.pageX - bound.x - scrollX,
                    y: e.pageY - bound.y - scrollY
                };
                collection = cell['@:{elements}'];
                find = 1;
            }
        }
        if (!find) {
            if (!clicked) {
                xy = Transform['@:{transform#real.to.stage.coord}'](xy);
            }
            if (srcCtrl['@:{allowed.to.hod}'] &&
                !srcCtrl['@:{allowed.to.hod}'].root) {
                collection = 0;
            }
            // if (collection &&
            //     areas.length) {
            //     xy.width = e.width;
            //     xy.height = e.height;
            //     area = StageGeneric["@:{query.in.which.area}"](xy);
            //     if (clicked) {
            //         if (!area) {
            //             area = areas[0];
            //         }
            //     } else if (!area) {
            //         collection = 0;
            //     }
            // }
        }
        if (silent) {
            focus = 0;
        }
        return {
            '@:{collection}': collection,
            '@:{position.xy}': xy,
            '@:{focus.add.element}': focus,
            //'@:{collection.type}': collectionType,
            //'@:{area}': area
        };
    },
    /**
     * 获取最佳格子
     * @param testNode 待检测dom节点
     * @param ctrl 当前元素的ctrl对象
     */
    '@:{elements#get.best.hod}'(testNode: Element,
        ctrl?: Report.StageElementCtrl): Report.ElementsQueryBestHodResult {
        let elements = State.get('@:{global#stage.elements}'),
            cell = null;
        let walk = es => {
            for (let e of es) {
                let { type, id, ctrl: elementCtrl, props } = e;
                let n = node(id);
                if (inside(testNode, n)) {
                    //consolex.log(elementCtrl['@:{allowed.elements}'],ctrl.type);
                    if ((elementCtrl.as & Enum['@:{enum#as.hod}']) &&
                        (!ctrl ||
                            !elementCtrl['@:{allowed.elements}'] ||
                            elementCtrl['@:{allowed.elements}'][ctrl.type])) {
                        let rows = props.rows;
                        for (let i = rows.length; i--;) {
                            let row = rows[i];
                            for (let j = row.cols.length; j--;) {
                                let cellId = `_${id}_${i}_${j}`;
                                let n = node(`_rd_h${cellId}`);
                                let c = row.cols[j];
                                let { elements } = c;
                                if (inside(testNode, n) &&
                                    !props.locked) {
                                    if (!ctrl ||
                                        !ctrl['@:{allowed.to.hod}'] ||
                                        ctrl['@:{allowed.to.hod}'][type]) {
                                        let canGenerateCell = true;
                                        if (ctrl) {
                                            let counter = ctrl['@:{allowed.stage.count}'];
                                            if (counter >= 0) {
                                                let t = 0;
                                                if (elements) {
                                                    for (let x of elements) {
                                                        if (x.type == ctrl.type) {
                                                            t++;
                                                        }
                                                    }
                                                }
                                                canGenerateCell = t < counter;
                                            }
                                        }
                                        if (canGenerateCell) {
                                            cell = {
                                                '@:{owner.type}': type,
                                                '@:{node}': n,
                                                '@:{dashed.id}': `_rd_dm${cellId}`,
                                                '@:{mask.id}': `_rd_hm${cellId}`,
                                                '@:{elements}': elements
                                            };
                                        }
                                    }
                                    if (elements) {
                                        walk(elements);
                                    }
                                }
                            }
                        }
                    }
                    break;
                }
            }
        };
        walk(elements);
        return cell;
    },
    /**
     * 展示右键菜单
     * @param view Magix.View对象
     * @param event 鼠标事件对象
     * @param collection 当前触发事件所对应的元素集合
     * @param hodId 格子id
     * @param picked 右键菜单点击时的回调
     */
    '@:{elements#show.contextmenu}'(view: Magix5.View,
        event: Magix5.MagixMixedEvent,
        collection: Report.StageElement[],
        hodId: string | number | null,
        picked: (e) => void) {
        //右键菜单
        let lang = config('lang');
        let list;
        let disabled = {};
        let selectElements = State.get('@:{global#stage.select.elements}');
        let selectElementsMap = StageSelection['@:{selection#get.selected.map}']();
        let selectCount = selectElements.length;
        //element : 右键时，处于右键下的文件
        let element = selectElements[0] || view.get('element');
        let eleProps = element?.props;
        let readonly,
            locked,
            state;
        if (eleProps) {
            readonly = eleProps.readonly;
            locked = readonly || eleProps.locked;
        }
        let currentCollection = collection;
        if (hodId && hodId == element.id) {
            selectCount = 0;
        }
        if (selectCount == 1) {//只有一个元素处于选中状态
            list = Contextmenu["@:{cm#single.element}"](lang);//获取相应的菜单列表
            let topElement = collection.at(-1);//处理z轴关系
            let bottomElement = collection[0];
            let atTop = topElement.id == element.id;
            let atBottom = bottomElement.id == element.id;
            let enable = StageGeneric['@:{generic#query.in.enable.hod}'](selectElementsMap);
            disabled[Contextmenu["@:{cm#up.id}"]] = locked || atTop;
            disabled[Contextmenu["@:{cm#top.id}"]] = locked || atTop;
            disabled[Contextmenu["@:{cm#bottom.id}"]] = locked || atBottom;
            disabled[Contextmenu["@:{cm#down.id}"]] = locked || atBottom;
            disabled[Contextmenu['@:{cm#delete.id}']] = enable != 1 || locked;
        } else if (selectCount > 1) {//多选
            let syncDisabled,
                syncWidth = 1,
                syncHeight = 1,
                syncWidthAsHeight = 1,
                syncHeightAsWidth = 1;
            if (selectCount == 2) {//如果有2个元素处于选中
                //开启尺寸同步功能
                syncDisabled = 0;
                //2个元素显示的右键菜单
                list = Contextmenu['@:{cm#double.element}'](lang);
            } else {
                syncDisabled = 1;
                //3个元素
                list = Contextmenu["@:{cm#multiple.element}"](lang);
            }
            let underElement = State.get('@:{global#stage.contextmenu.under.item}');
            if (!syncDisabled) {//正好有2个元素
                let [first, second] = selectElements;
                let from = first == underElement ? second : first;
                let fromCtrlModifier = from.ctrl['@:{modifier}'],
                    toCtrlModifier = underElement.ctrl['@:{modifier}'];
                let fromFlag = INITIAL,
                    toFlag = INITIAL;
                //根据元素控制器提供的相应的能否修改宽高能力，决定元素之间的宽高菜单项能否工作
                if ((fromCtrlModifier & Enum['@:{enum#modifier.width}']) ||
                    (fromCtrlModifier & Enum['@:{enum#modifier.size}'])) {
                    fromFlag |= WIDTH;
                }
                if ((fromCtrlModifier & Enum['@:{enum#modifier.height}']) ||
                    (fromCtrlModifier & Enum['@:{enum#modifier.size}'])) {
                    fromFlag |= HEIGHT;
                }
                //鼠标下的元素未处于锁定状态
                if (!underElement.props.locked) {
                    if ((toCtrlModifier & Enum['@:{enum#modifier.width}']) ||
                        (toCtrlModifier & Enum['@:{enum#modifier.size}'])) {
                        toFlag |= WIDTH;
                    }
                    if ((toCtrlModifier & Enum['@:{enum#modifier.height}']) ||
                        (toCtrlModifier & Enum['@:{enum#modifier.size}'])) {
                        toFlag |= HEIGHT;
                    }
                }
                //检查相应的同步宽高是否可用
                if (fromFlag & WIDTH) {
                    if (toFlag & WIDTH) {
                        syncWidth = 0;
                    }
                    if (toFlag & HEIGHT) {
                        syncWidthAsHeight = 0;
                    }
                }
                if (fromFlag & HEIGHT) {
                    if (toFlag & HEIGHT) {
                        syncHeight = 0;
                    }
                    if (toFlag & WIDTH) {
                        syncHeightAsWidth = 0;
                    }
                }
            }
            let alignInfo = StageGeneric['@:{generic#query.can.align}'](underElement),
                xCanotAlign = !alignInfo['@:{generic.align#x.can.align}'],
                yCanotAlign = !alignInfo['@:{generic.align#y.can.align}'];
            let enable = StageGeneric['@:{generic#query.in.enable.hod}'](selectElementsMap);
            let hasDisabled = StageGeneric['@:{generic#query.has.disabled}'](selectElements);
            disabled[Contextmenu["@:{cm#sync.height.as.width.id}"]] = syncHeightAsWidth;
            disabled[Contextmenu["@:{cm#sync.width.as.height.id}"]] = syncWidthAsHeight;
            disabled[Contextmenu["@:{cm#sync.height.id}"]] = syncHeight;
            disabled[Contextmenu["@:{cm#sync.width.id}"]] = syncWidth;
            disabled[Contextmenu["@:{cm#align.bottom.id}"]] = yCanotAlign;
            disabled[Contextmenu["@:{cm#align.left.id}"]] = xCanotAlign;
            disabled[Contextmenu["@:{cm#align.top.id}"]] = yCanotAlign;
            disabled[Contextmenu["@:{cm#align.right.id}"]] = xCanotAlign;
            disabled[Contextmenu["@:{cm#align.center.id}"]] = xCanotAlign;
            disabled[Contextmenu["@:{cm#align.middle.id}"]] = yCanotAlign;
            disabled[Contextmenu['@:{cm#delete.id}']] = enable != 1 || hasDisabled;
        } else {
            if (hodId) {//容器格子的右键菜单需要查询z轴
                list = Contextmenu["@:{cm#hod.stage}"](lang);
                let ownerColl = StageGeneric["@:{generic#find.element.owner.collection}"](element);
                let topElement = ownerColl.at(-1);
                let bottomElement = ownerColl[0];
                let atTop = topElement.id == element.id;
                let atBottom = bottomElement.id == element.id;
                disabled[Contextmenu["@:{cm#up.id}"]] = locked || atTop;
                disabled[Contextmenu["@:{cm#top.id}"]] = locked || atTop;
                disabled[Contextmenu["@:{cm#bottom.id}"]] = locked || atBottom;
                disabled[Contextmenu["@:{cm#down.id}"]] = locked || atBottom;
                let nonreadonlyElements = StageGeneric['@:{generic#query.all.without.readonly.elements}'](collection);
                disabled[Contextmenu['@:{cm#clear.hod.stage.id}']] = !nonreadonlyElements.length;
                disabled[Contextmenu['@:{cm#reverse.id}']] = readonly;
            } else {
                list = Contextmenu["@:{cm#stage}"](lang);
                disabled[Contextmenu['@:{cm#clear.id}']] = !StageGeneric['@:{generic#query.can.clear.stage}']();
                disabled[Contextmenu['@:{cm#new.id}']] = !StageGeneric['@:{generic#query.can.create.new.page}']();
                currentCollection = State.get('@:{global#stage.elements}');
            }
            state = StageGeneric['@:{generic#query.elements.state.count}'](collection);
            disabled[Contextmenu["@:{cm#all.id}"]] = !state['@:{generic#selectable.count}'];
            disabled[Contextmenu['@:{cm#all.movable.id}']] = !state['@:{generic#movable.count}'];
            disabled[Contextmenu["@:{cm#delete.id}"]] = !hodId || readonly || locked;
            let max = Const["@:{const#scale.max}"],
                min = Const["@:{const#scale.min}"],
                scale = State.get('@:{global#stage.scale}');
            disabled[Contextmenu['@:{cm#zoom.in.id}']] = scale == max;
            disabled[Contextmenu['@:{cm#zoom.out.id}']] = scale == min;
            disabled[Contextmenu['@:{cm#zoom.reset.id}']] = scale == 1;
        }
        if (selectCount) {
            let { '@:{can.ungroup}': canUngroup,
                '@:{can.group}': canGroup } = StageGeneric["@:{generic#query.group.state}"]();
            disabled[Contextmenu["@:{cm#group.id}"]] = !canGroup;
            disabled[Contextmenu["@:{cm#ungroup.id}"]] = !canUngroup;
        }
        let copyElements = StageClipboard["@:{get.copy.list}"]();
        let cxvInfo = StageGeneric['@:{generic#query.can.cxv}'](copyElements, element, currentCollection);
        disabled[Contextmenu['@:{cm#cut.id}']] = !cxvInfo['@:{can.cut}'];
        disabled[Contextmenu['@:{cm#copy.id}']] = !cxvInfo['@:{can.copy}'];
        disabled[Contextmenu['@:{cm#duplicate.id}']] = !cxvInfo['@:{can.copy}'] || !cxvInfo['@:{can.duplicate}'];
        disabled[Contextmenu['@:{cm#paste.id}']] = !cxvInfo['@:{can.paste}'];
        Menu.show(view, event, contextMenuId, {
            list: list,
            disabled,
            picked
        });
    }
};