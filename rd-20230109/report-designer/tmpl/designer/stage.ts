/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Dialog from '../gallery/mx-dialog/index';
import Dragdrop from '../gallery/mx-dragdrop/index';
import Cursor from '../gallery/mx-pointer/cursor';
import Select from '../gallery/mx-pointer/select';
import CellProvider from '../provider/cell';
import GenericProvider from '../provider/generic';
import PoleProvider from '../provider/pole';
import ScrollProvider from '../provider/scroll';
import SDragProvider from '../provider/sdrag';
import StageDropProvider from '../provider/sdrop';
import WatchSizeProvider from '../provider/wsize';
import StageClipboard from './clipboard';
import Const from './const';
import Contextmenu from './contextmenu';
import StageElements from './elements';
import Enum from './enum';
import Example from './example';
import StageGeneric from './generic';
import DHistory from './history';
import Keyboard from './keyboard';
import StageSelection from './selection';
import Transform from './transform';
let emptyObject = {};
let { State,
    node, applyStyle, View, inside, isFunction } = Magix;
let { min, abs } = Math;
//缩放元素
let scaleElement = (m, step) => {
    let { props, ctrl } = <Report.StageElement>m;
    for (let s of ctrl.props) {
        if (isFunction(s['@:{stage.scale}'])) {
            s['@:{stage.scale}'](props, step);
        } else if (s['@:{is.scale.and.unit.field}']) {
            props[s.key] *= step;
        }
    }
    if (ctrl['@:{update.props}']) {
        ctrl['@:{update.props}'](props);
    }
};
/**
 * 获取所有页头和页脚对象
 * @param elements 所有元素
 * @param param1 页面对象
 * @returns 页头和页脚
 */
let findHeaderAndFooterElements = (elements, { pages }) => {
    if (pages > 1 &&
        elements) {
        let hfs = [];
        for (let e of elements) {
            if (e.type == 'hod-header' ||
                e.type == 'hod-footer') {
                hfs.push(e);
            }
        }
        return hfs;
    }
};
//调整z轴快捷键映射
let KeysToMenuId = {
    [Keyboard["@:{key#u}"]]: 5,
    [Keyboard["@:{key#d}"]]: 6,
    [Keyboard["@:{key#t}"]]: 3,
    [Keyboard["@:{key#b}"]]: 4
};
//快捷键对齐
let KeysToAlign = {
    [Keyboard['@:{key#l}']]: {
        to: '@:{align#left}',
        x: 1
    },
    [Keyboard['@:{key#c}']]: {
        to: '@:{align#center}',
        x: 1
    },
    [Keyboard['@:{key#r}']]: {
        to: '@:{align#right}',
        x: 1
    },
    [Keyboard['@:{key#t}']]: {
        to: '@:{align#top}',
        y: 1
    },
    [Keyboard['@:{key#m}']]: {
        to: '@:{align#middle}',
        y: 1
    },
    [Keyboard['@:{key#b}']]: {
        to: '@:{align#bottom}',
        y: 1
    },
};
//快捷键处理
let ShortcutsProcessors = [({
    '@:{keypress#code}': code,
    '@:{keypress#is.key.down}': isKeydown,
    '@:{keypress#shift.key}': shiftKey,
    '@:{keypress#ctrl.key}': ctrlKey,
    '@:{keypress#alt.key}': altKey,
    '@:{keypress#prevent.default}': prevent,
}) => {
    if (isKeydown &&
        ctrlKey &&
        !shiftKey &&
        !altKey) {//ctrl开始
        let find;
        if (code == Keyboard["@:{key#y}"]) {//仅ctrl+y
            find = 1;
            prevent();
            DHistory["@:{history#redo}"]();
        } else if (code == Keyboard["@:{key#a}"]) {//仅ctrl+a
            find = 1;
            prevent();
            let stage = StageGeneric['@:{generic#query.nearest.stage}'](1);
            let coll = stage["@:{collection}"];
            StageGeneric['@:{generic#select.all.collection.elements}'](coll);
        } else if (code == Keyboard["@:{key#x}"]) {//仅ctrl+x
            find = 1;
            prevent();
            StageClipboard["@:{cut.elements}"]();
        } else if (code == Keyboard["@:{key#c}"]) {//仅ctrl+c
            find = 1;
            prevent();
            StageClipboard["@:{copy.elements}"]();
        } else if (code == Keyboard["@:{key#v}"]) {//ctrl+v
            find = 1;
            prevent();
            let stage = StageGeneric['@:{generic#query.nearest.stage}']();
            StageClipboard["@:{paste.elements}"](stage);
        } else if (code == Keyboard['@:{key#d}']) {//ctrl+d
            find = 1;
            prevent();
            let selectElementsMap = StageSelection['@:{selection#get.selected.map}']();
            if (StageGeneric['@:{generic#query.in.enable.hod}'](selectElementsMap)) {
                let stages = StageGeneric['@:{generic#query.select.elements.stage}']();
                StageClipboard['@:{duplicate.elements}'](stages);
            }
        } else if (code == Keyboard["@:{key#g}"]) {//ctrl+g
            find = 1;
            prevent();
            let { '@:{can.group}': canGroup,
                '@:{can.ungroup}': canUngroup
            } = StageGeneric["@:{generic#query.group.state}"]();
            if (canGroup || canUngroup) {
                StageGeneric["@:{generic#group.select.elements}"](!canGroup);
            }
        } else if (code == Keyboard["@:{key#l}"]) {//ctrl+l
            find = 1;
            prevent();
            StageGeneric["@:{generic#lock.select.elements}"](0, 1);
        }
        return find;
    }
}, ({
    '@:{keypress#code}': code,
    '@:{keypress#is.key.down}': isKeydown,
    '@:{keypress#shift.key}': shiftKey,
    '@:{keypress#ctrl.key}': ctrlKey,
    '@:{keypress#alt.key}': altKey,
    '@:{keypress#prevent.default}': prevent,
}) => {
    if (isKeydown &&
        shiftKey &&
        !ctrlKey &&
        !altKey) {//shift开始
        let find;
        if (code == Keyboard["@:{key#g}"]) {//shift+g
            find = 1;
            prevent();
            let { '@:{can.group}': canGroup,
                '@:{can.ungroup}': canUngroup
            } = StageGeneric["@:{generic#query.group.state}"]();
            if (canGroup || canUngroup) {
                StageGeneric["@:{generic#group.select.elements}"](canUngroup);
            }
        } else if (code == Keyboard["@:{key#l}"]) {//shift+l
            find = 1;
            prevent();
            StageGeneric["@:{generic#lock.select.elements}"](1, 1);
        } else if (code == Keyboard["@:{key#a}"]) {//shift+a
            find = 1;
            prevent();
            let stage = StageGeneric['@:{generic#query.nearest.stage}'](1);
            let coll = stage["@:{collection}"];
            StageGeneric['@:{generic#select.all.collection.elements}'](coll, 0, shiftKey);
        }
        return find;
    }
}, ({
    '@:{keypress#code}': code,
    '@:{keypress#is.key.down}': isKeydown,
    '@:{keypress#shift.key}': shiftKey,
    '@:{keypress#ctrl.key}': ctrlKey,
    '@:{keypress#alt.key}': altKey,
    '@:{keypress#prevent.default}': prevent,
}) => {
    if (!shiftKey &&
        !altKey &&
        !ctrlKey) {//纯按键
        let find;
        if (isKeydown) {
            if (code == Keyboard["@:{key#space}"]) {//space
                find = 1;
                let currentSelected = State.get('@:{global#stage.select.elements}');
                if (currentSelected.length == 1) {
                    let m = currentSelected[0];
                    StageElements['@:{elements#space.or.double.click.action}'](m, prevent);
                }
            } else if (code == Keyboard["@:{key#delete}"] ||
                code == Keyboard["@:{key#backspace}"]) {//delete 或 backspace
                find = 1;
                prevent();
                let selectElementsMap = StageSelection['@:{selection#get.selected.map}']();
                let selectElements = State.get('@:{global#stage.select.elements}');
                let enable = StageGeneric['@:{generic#query.in.enable.hod}'](selectElementsMap);
                let disabled = StageGeneric['@:{generic#query.has.disabled}'](selectElements);
                if (enable && !disabled) {
                    StageGeneric["@:{generic#delete.select.elements}"]();
                }
            } else if (code == Keyboard["@:{key#f}"]) {//f
                find = 1;
                StageElements["@:{elements#focus.select.element.hod}"]();
            } else if ((code == Keyboard["@:{key#d}"] ||
                code == Keyboard["@:{key#u}"] ||
                code == Keyboard["@:{key#t}"] ||
                code == Keyboard["@:{key#b}"])) {// d u t b
                find = 1;
                //e['@:{keypress#prevent.default}']();
                let selectElements = State.get('@:{global#stage.select.elements}');
                if (selectElements.length == 1) {
                    StageElements["@:{elements#modify.element.z.index}"](KeysToMenuId[code], selectElements[0]);
                }
            }
        } else {
            if (code == Keyboard['@:{key#escape}']) {
                //单纯的在keyup阶段按escape
                find = 1;
                let oldSelected = StageSelection["@:{selection#set}"]();
                if (oldSelected) {
                    DHistory["@:{history#save}"](DHistory['@:{history#element.lost.focus}'], StageGeneric['@:{generic#query.element.name}'](oldSelected));
                }
            }
        }

        return find;
    }
}, ({
    '@:{keypress#code}': code,
    '@:{keypress#is.key.down}': isKeydown,
    '@:{keypress#shift.key}': shiftKey,
    '@:{keypress#ctrl.key}': ctrlKey,
    '@:{keypress#alt.key}': altKey,
    '@:{keypress#prevent.default}': prevent,
    '@:{keypress#data}': keyData,
}) => {
    if (isKeydown &&
        ctrlKey &&
        !altKey) {//ctrl+shift?
        let find
        if (code == Keyboard["@:{key#z}"]) {//ctrl+z或ctrl+shift+z
            find = 1;
            prevent();
            if (shiftKey) {
                DHistory["@:{history#redo}"]();
            } else {
                DHistory["@:{history#undo}"]();
            }
        } else if (code == Keyboard["@:{key#up}"] ||
            code == Keyboard["@:{key#left}"] ||
            code == Keyboard["@:{key#right}"] ||
            code == Keyboard["@:{key#down}"] ||
            code == Keyboard['@:{key#custom.rotate}']) {//ctrl+箭头旋转
            find = 1;
            let selectElements = State.get<Report.StageElement[]>('@:{global#stage.select.elements}');
            if (selectElements.length > 0) {
                prevent?.();
                let changed;
                let step,
                    snapToCustom,
                    half;
                if (code == Keyboard['@:{key#custom.rotate}']) {
                    step = keyData;
                    half = abs(keyData / 2);
                    snapToCustom = shiftKey;
                } else {
                    if (code == Keyboard["@:{key#up}"] ||
                        code == Keyboard["@:{key#left}"]) {
                        step = -1;
                    } else {
                        step = 1;
                    }

                    if (shiftKey) {
                        step *= Const['@:{const#keyboard.with.shift.rotate.step}']
                    } else {
                        step *= Const['@:{const#keyboard.rotate.step}'];
                    }
                }
                let ids = {},
                    types = {},
                    changedProps = { rotate: 1 };
                for (let element of selectElements) {
                    let { props, ctrl, id, type, } = element;
                    if (!props.locked &&
                        (ctrl['@:{modifier}'] & Enum['@:{enum#modifier.rotate}'])) {
                        let r = props.rotate;
                        r += step;
                        r = (r + 360) % 360;
                        if (snapToCustom) {
                            let astep = abs(step);
                            let m = r % astep;
                            if (m > half) {
                                r += astep - m;
                            } else {
                                r -= m;
                            }
                        }
                        if (r != props.rotate) {
                            changed = 1;
                            props.rotate = r;
                            ids[id] = 1;
                            types[type] = 1;
                            StageGeneric['@:{generic#update.stage.element}'](element);
                        }
                    }
                }
                if (changed) {
                    //for flow charts
                    State.fire('@:{event#stage.select.element.props.change}', {
                        '@:{ids}': ids,
                        '@:{types}': types,
                        '@:{props}': changedProps
                    });
                    let ename = StageGeneric['@:{generic#query.element.name}'](selectElements);
                    DHistory["@:{history#save}"](DHistory['@:{history#element.rotated}'], ename, '@:{history#rotate.element.by.keyboard}', Const['@:{const#hisotry.save.continous.delay}']);
                }
            }
        }
        return find;
    }
}, ({
    '@:{keypress#code}': code,
    '@:{keypress#is.key.down}': isKeydown,
    '@:{keypress#shift.key}': shiftKey,
    '@:{keypress#ctrl.key}': ctrlKey,
    '@:{keypress#alt.key}': altKey,
    '@:{keypress#prevent.default}': prevent,
}) => {
    //alt对齐
    let align = KeysToAlign[code];
    if (isKeydown &&
        altKey &&
        align &&
        !ctrlKey &&
        !shiftKey) {
        let canAlign = StageGeneric['@:{generic#query.can.align}']();
        if ((canAlign['@:{generic.align#x.can.align}'] && align.x) ||
            (canAlign['@:{generic.align#y.can.align}'] && align.y)
        ) {
            prevent();
            StageElements['@:{elements#align.elements}'](align.to);
        }
        return 1;
    }
}, ({
    '@:{keypress#code}': code,
    '@:{keypress#is.key.down}': isKeydown,
    '@:{keypress#shift.key}': shiftKey,
    '@:{keypress#ctrl.key}': ctrlKey,
    '@:{keypress#alt.key}': altKey,
    '@:{keypress#prevent.default}': prevent,
}) => {
    if (isKeydown &&
        ctrlKey &&
        shiftKey &&
        !altKey &&
        code == Keyboard['@:{key#i}']) {//ctrl+shift+i
        prevent();
        let stage = StageGeneric['@:{generic#query.nearest.stage}'](1, null, -1, -1);
        let coll = stage["@:{collection}"];
        StageGeneric['@:{generic#select.all.collection.elements}'](coll, 1);
        return 1;
    }
}, ({
    '@:{keypress#code}': code,
    '@:{keypress#is.key.down}': isKeydown,
    '@:{keypress#shift.key}': shiftKey,
    '@:{keypress#ctrl.key}': ctrlKey,
    '@:{keypress#alt.key}': altKey,
    '@:{keypress#prevent.default}': prevent,
}) => {
    if (isKeydown &&
        !ctrlKey &&
        !altKey) {
        let find;
        if (code == Keyboard["@:{key#tab}"]) {//tab或shift+tab
            find = 1;
            prevent();
            StageElements["@:{elements#handle.key.tab}"](shiftKey);
        } else if (code == Keyboard["@:{key#up}"] ||
            code == Keyboard["@:{key#left}"] ||
            code == Keyboard["@:{key#right}"] ||
            code == Keyboard["@:{key#down}"]) {
            find = 1;
            /**
             * 吸附网格我们只在拖动时做，因为拖动相对来讲不精确
             * 通过属性面板或键盘时，我们支持微调
             */
            let scale = State.get('@:{global#stage.scale}');
            let stepX = Const["@:{const#keyboard.move.step}"],
                stepY = Const["@:{const#keyboard.move.step}"];
            if (shiftKey) {
                stepX = Const["@:{const#keyboard.with.shift.move.step}"];
                stepY = Const["@:{const#keyboard.with.shift.move.step}"];
            }
            stepX *= scale;
            stepY *= scale;

            let selectElements = State.get('@:{global#stage.select.elements}');
            if (selectElements.length) {
                //有元素选中才阻止默认行为，其它情况可响应如滚动容器等行为
                prevent();
                let offset,
                    use;
                let newMap = {};
                let groups = State.get('@:{global#stage.elements.groups}');
                let { '@:{generic.all#map}': elementsMap,
                } = StageGeneric["@:{generic#query.all.elements.and.map}"]();
                let newElements = [];
                let ids = {}, types = {};
                let addElementToNewList = e => {
                    let { props, id, type, ctrl } = e;
                    if (!newMap[id] &&
                        (!(ctrl['@:{modifier}'] & Enum['@:{enum#modifier.linkage}']))) {
                        types[type] = 1;
                        newMap[id] = 1;
                        let { locked, pinX, pinY } = props;
                        if (locked || !ctrl['@:{move.props}']) {
                            pinX = pinY = 1;
                        }
                        if (pinX) {
                            stepX = 0;
                        }
                        if (pinY) {
                            stepY = 0;
                        }
                        newElements.push(e);
                    }
                };
                for (let e of selectElements) {
                    addElementToNewList(e);
                    let list = groups[e.id];
                    if (list) {
                        for (let n of list) {
                            e = elementsMap[n];
                            addElementToNewList(e);
                        }
                    }
                }
                if (code == Keyboard["@:{key#up}"]) {
                    offset = -stepY;
                    use = 'y';
                } else if (code == Keyboard["@:{key#down}"]) {
                    offset = stepY;
                    use = 'y';
                } else if (code == Keyboard["@:{key#left}"]) {
                    offset = -stepX;
                    use = 'x';
                } else if (code == Keyboard["@:{key#right}"]) {
                    offset = stepX;
                    use = 'x';
                }
                if (offset) {
                    StageElements['@:{elements#move.elements.by.ids}'](newElements, use, Const['@:{const#to.unit}'](offset), ids, 1);
                    State.fire('@:{event#stage.select.element.props.change}', {
                        '@:{ids}': ids,
                        '@:{types}': types,
                        '@:{props}': {
                            '@:{position}': 1
                        }
                    });
                    let ename = StageGeneric['@:{generic#query.element.name}'](newElements);
                    DHistory["@:{history#save}"](DHistory['@:{history#element.moved}'], ename, '@:{history#move.element.by.keyboard}', Const['@:{const#hisotry.save.continous.delay}']);
                }

            }
        }
        return find;
    }
}];
applyStyle('@:stage.less');
export default View.extend({
    tmpl: '@:stage.html',
    init() {
        /**
         * 编辑区滚动节点
         */
        //let bakScale = 0;
        this.set({
            sr: CellProvider['@:{cell#scale.radius}'],
            center: Const['@:{const#stage.auto.center}'],
            unit: State.get('@:{global#stage.unit}'),
            spad: Const['@:{const#stage.padding}'],
        });

        let update = GenericProvider['@:{generic#debounce}'](this.render, 10, this);
        //添加元素
        let addElements = e => {
            if (e.node) {
                let lastHod = SDragProvider['@:{sdrag#get.last.hod}']();
                if (lastHod) {
                    let { classList } = lastHod;
                    //, '@:scoped.style:full-fill'
                    classList.remove('@:scoped.style:hod-drop-tip');
                }
                //鼠标下的节点不在设计区
                if (!inside(e.node, this.root)) {
                    return;
                }
            }
            SDragProvider['@:{sdrag#clear}']();
            //添加元素
            let {
                '@:{add.elements}': addElements,
                '@:{select.elements}': selectElements
            } = StageElements["@:{elements#add.element}"](e);
            if (addElements.length) {//成功添加后更新界面并记录历史记录
                State.fire('@:{event#stage.elements.change}');
                if (selectElements.length) {
                    StageSelection['@:{selection#set.all}'](selectElements);
                }
                DHistory["@:{history#save}"](DHistory['@:{history#element.added}'], StageGeneric['@:{generic#query.element.name}'](addElements));
            }
        };
        let updateStage = e => {//更新设计区
            //console.log(e);
            let elements = State.get('@:{global#stage.elements}');
            let { step, /*'@:{fullscreen}': fs*/ } = e;
            //console.log(e);
            if (step/* ||
                fs*/) {
                // if (e['@:{fullscreen}']) {
                //     let page = State.get('@:{global#stage.page}');
                //     if (e['@:{is.full.screen}']) {
                //         let pxWidth = Const['@:{const#to.px}'](page.width);
                //         let pxHeight = Const['@:{const#to.px}'](page.height);
                //         let rh = pxHeight * page.pages;
                //         let rwidth = e['@:{width}'] / pxWidth;
                //         let rheight = e['@:{height}'] / rh;
                //         let rbest = min(rwidth, rheight);
                //         let rx = 0, ry = 0;
                //         if (page.scaleType == 'auto') {
                //             rx = rbest;
                //             ry = rbest;
                //         } else {
                //             rx = rwidth;
                //             ry = rheight;
                //         }
                //         //console.log(e.width,e.height);
                //         let marginTop = (e['@:{height}'] - ry * rh) / 2,
                //             marginLeft = (e['@:{width}'] - rx * pxWidth) / 2;
                //         let current = State.get('@:{global#stage.scale}');
                //         if (current != 1) {
                //             e.step = 1 / current;
                //             bakScale = current;
                //         } else {
                //             bakScale = 0;
                //         }
                //         console.log(rx, ry, marginTop, marginLeft);
                //         State.set({
                //             '@:{global#stage.scale}': 1
                //         });
                //         this.set({
                //             rx,
                //             ry,
                //             marginTop,
                //             marginLeft
                //         });
                //     } else {
                //         if (bakScale != 0) {
                //             e.step = bakScale;
                //             State.set({
                //                 '@:{global#stage.scale}': bakScale
                //             });
                //         }
                //     }
                //     this.set({
                //         fs: e['@:{is.full.screen}']
                //     });
                // }
                if (step) {
                    let flowConnector = [];
                    let walk = es => {
                        for (let m of es) {
                            let { props, ctrl } = m;
                            if ((ctrl['@:{modifier}'] & Enum['@:{enum#modifier.linkage}'])) {
                                flowConnector.push(m)
                            } else {
                                scaleElement(m, step);
                                if (ctrl.as & Enum['@:{enum#as.hod}']) {
                                    for (let row of props.rows) {
                                        for (let col of row.cols) {
                                            if (col.elements) {
                                                walk(col.elements);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    };
                    walk(elements);
                    for (let m of flowConnector) {
                        scaleElement(m, step);
                    }
                }
            }
            update(step);
            WatchSizeProvider['@:{wsize#update}']();
            //聚焦体验不好，暂时先忽略
            // let updateMark = mark(this, '@:{scroll.to.selected}');
            // if (e.type == '@:{event#history.shift.change}') {
            //     await delay(20);
            //     await lowTaskFinale();
            //     if (updateMark()) {
            //         let selectedElements = State.get<Report.StageElement[]>('@:{global#stage.select.elements}');
            //         if (selectedElements.length == 1) {
            //             let first = selectedElements[0];
            //             GenericProvider['@:{generic#scroll.into.view}'](first.id);
            //         }
            //     }
            // }
        };
        /**
         * 监听键盘事件
         * @param e 事件
         * @returns
         */
        let watchKeypress = (e: Report.EventOfKeyboardPress) => {
            //let fs = this.get('fs');
            let {
                '@:{keypress#code}': code,
                '@:{keypress#is.key.down}': isKeydown,
                '@:{keypress#shift.key}': shiftKey,
                '@:{keypress#ctrl.key}': ctrlKey,
                '@:{keypress#alt.key}': altKey,
                '@:{keypress#active}': active,
                '@:{keypress#active.is.input}': activeIsInput,
                '@:{keypress#active.is.disabled}': activeIsDisabled,
            } = e,
                prevent = State.get('@:{global#pointer.is.active}');
            //全屏、事件被阻止、激活的是输入元素且不是指定的动作均不处理
            if (//fs ||
                prevent ||
                (activeIsInput &&
                    !activeIsDisabled &&
                    (active.dataset.as != 'da' ||
                        code != Keyboard["@:{key#tab}"]))) return;
            for (let p of ShortcutsProcessors) {
                if (p(e)) {
                    break;
                }
            }
        };
        let updateLang = ({ to }: Report.EventOfLangChange) => {
            this.digest({
                lang: to
            });
        };
        let updateHeaderAndFooter = (e: Report.EventOfSelectElementsPropsChange) => {
            let hfs = this.get('hfs');//查询当前已有的占位header和footer
            if (hfs) {
                let changedTypes = {};//记录变化类型，即hod-header或hod-footer变化
                let changedTypesCount = 0;//有几个变化类型，用于中断循环优化性能
                let { '@:{sub.map}': subMap,
                    '@:{hod.map}': hodsMap,
                    '@:{hod.count}': hodsCount,
                } = StageGeneric['@:{generic#find.hod.sub.elements.map}'](hfs);
                for (let id in e['@:{ids}']) {
                    let hodId = subMap[id];
                    if (!hodId &&
                        hodsMap[id]) {//有可能是容器自身
                        hodId = id;
                    }
                    if (hodId) {
                        let { type } = hodsMap[hodId];
                        if (!changedTypes[type]) {
                            changedTypes[type] = 1;
                            changedTypesCount++;
                            //如果类型都发生了变化，则中断循环
                            if (changedTypesCount >= hodsCount) {
                                break;
                            }
                        }
                    }
                }
                State.fire('@:{event#stage.header.footer.need.update}', {
                    '@:{changed.types}': changedTypes
                });
            }
        };
        State.on('@:{event#lang.change}', updateLang);
        State.on('@:{event#history.shift.change}', updateStage);
        State.on('@:{event#stage.scale.change}', updateStage);
        State.on('@:{event#stage.page.change}', updateStage);
        State.on('@:{event#starter.element.add}', addElements);
        State.on('@:{event#stage.elements.change}', update);
        State.on('@:{event#stage.select.elements.change}', update);
        State.on('@:{event#key.press}', watchKeypress);
        State.on('@:{event#stage.page.and.elements.change}', update);
        State.on('@:{event#toggle.element.keep.ratio}', update);
        State.on('@:{event#stage.select.element.props.change}', updateHeaderAndFooter);
        State.on('@:{event#stage.animations.update}', updateHeaderAndFooter);
        WatchSizeProvider['@:{wsize#setup}']();
        StageDropProvider['@:{sdrop#setup}']();
        PoleProvider['@:{pole#setup}'](this);
        ScrollProvider['@:{scroll#setup}']();
        SDragProvider['@:{sdrag#setup}']();
        this.on('destroy', () => {
            //State.off('@:{event#preview}', updateStage);
            State.off('@:{event#lang.change}', updateLang);
            State.off('@:{event#history.shift.change}', updateStage);
            State.off('@:{event#stage.scale.change}', updateStage);
            State.off('@:{event#stage.page.change}', updateStage);
            State.off('@:{event#starter.element.add}', addElements);
            State.off('@:{event#stage.elements.change}', update);
            State.off('@:{event#stage.select.elements.change}', update);
            State.off('@:{event#key.press}', watchKeypress);
            State.off('@:{event#stage.page.and.elements.change}', update);
            State.off('@:{event#toggle.element.keep.ratio}', update);
            State.off('@:{event#stage.select.element.props.change}', updateHeaderAndFooter);
            State.off('@:{event#stage.animations.update}', updateHeaderAndFooter);
            StageDropProvider['@:{sdrop#teardown}']();
            WatchSizeProvider['@:{wsize#teardown}']();
            PoleProvider['@:{pole#teardown}']();
            ScrollProvider['@:{scroll#teardown}']();
            SDragProvider['@:{sdrag#clear}']();
            SDragProvider['@:{sdrag#teardown}']();
        });
    },
    render() {
        let elements = State.get('@:{global#stage.elements}');
        let page = State.get('@:{global#stage.page}');
        this.digest({
            unit: State.get('@:{global#stage.unit}'),
            scale: State.get('@:{global#stage.scale}'),
            page,
            hfs: findHeaderAndFooterElements(elements, page),
            elements,
        });
    },
    '@:{element.start.drag}<pointerdown>'(e) {
        //let fs = this.get('fs');
        if (//fs ||
            !e['@:{halt}']) {
            StageElements["@:{elements#select.or.move.elements}"](e, this);
        }
    },
    '$root<pointerdown>'(e: PointerEvent) {
        //let fs = this.get('fs');
        if (!e['@:{halt}']) {
            let { target, shiftKey, ctrlKey, metaKey, pageX, pageY } = e;
            let stageRoot = this['@:{stage.root}'];
            if (!stageRoot) {
                stageRoot = this['@:{stage.root}'] = node('_rd_sc');
            }
            if (inside(stageRoot, target)) {
                let last = StageSelection['@:{selection#get.selected.map}']();
                let hodElements,
                    firstSelectElement,
                    currentSelected;
                let initSelectedElements = [...State.get('@:{global#stage.select.elements}')];
                let initIds = [],
                    initIdsMap = {};
                for (let ise of initSelectedElements) {
                    initIds.push(ise.id);
                    initIdsMap[ise.id] = 1;
                }
                currentSelected = initIds.join(',');
                let initIdsSelected = currentSelected;
                let stageElements = State.get('@:{global#stage.elements}');
                let isShiftKeyStillPressed;
                if (shiftKey || ctrlKey || metaKey) {
                    isShiftKeyStillPressed = 1;
                    hodElements = StageGeneric["@:{generic#find.hod.sub.elements.map}"](stageElements)['@:{sub.map}'];
                } else {
                    StageSelection["@:{selection#set}"]();
                    initIdsMap = emptyObject;
                }
                Select["@:{init}"]();
                State.fire('@:{event#pointer.using}', {
                    active: 1
                });
                Cursor["@:{show.by.type}"]('default');
                let elementLocations = StageGeneric["@:{generic#query.elements.location}"](stageElements);
                let moveEvent;
                let dragSelect = () => {
                    if (moveEvent) {
                        let { pageX: moveX, pageY: moveY } = moveEvent;
                        let width = abs(pageX - moveX);
                        let height = abs(pageY - moveY);
                        let left = min(pageX, moveX);
                        let top = min(pageY, moveY);
                        Select["@:{update}"](left, top, width, height);
                        let rect = Transform["@:{transform#real.to.stage.coord}"]({
                            x: left,
                            y: top
                        }) as Report.Rect;
                        rect.width = width;
                        rect.height = height;
                        if (elementLocations.length) {
                            let intersect = StageGeneric["@:{generic#query.intersect.elements}"](elementLocations, rect, initSelectedElements, firstSelectElement, isShiftKeyStillPressed && hodElements, isShiftKeyStillPressed ? initIdsMap : emptyObject);
                            if (intersect["@:{ids}"] != currentSelected) {
                                currentSelected = intersect["@:{ids}"];
                                firstSelectElement = intersect['@:{first}'];
                                StageSelection["@:{selection#set.all}"](intersect['@:{selected}']);
                            }
                        }
                    }
                };
                //需要监听在拉框选择过程中，用户松开或再次按下shift键
                /**
                 * 如果在按下鼠标拖动时，未按shift键，则后续再按shift键无效果
                 * 如果在按下鼠标拖动时，按了shift键，而鼠标未松开的情况下，松开shift键，则需要立即同步未按shift键的效果，如果又再次按下shift键，则需要再次处理
                 */
                let watchKeypress = e => {
                    isShiftKeyStillPressed = e['@:{keypress#shift.key}'] || e['@:{keypress#ctrl.key}'];
                    dragSelect();
                };
                State.on('@:{event#key.press}', watchKeypress);
                this['@:{drag.drop}'](e, ex => {
                    moveEvent = ex;
                    dragSelect();
                }, () => {
                    State.fire('@:{event#pointer.using}');
                    State.off('@:{event#key.press}', watchKeypress);
                    Select["@:{hide}"]();
                    Cursor["@:{hide}"]();
                    let diff = StageSelection["@:{selection#has.changed}"](last);
                    if (diff['@:{selection.changed#has.diffed}']) {
                        let {
                            '@:{generic.diff.info#type}': type,
                            '@:{generic.diff.info#ename}': ename
                        } = StageGeneric['@:{generic#query.history.info.by.diff}'](diff);
                        DHistory["@:{history#save}"](type, ename);
                    } else if (currentSelected != initIdsSelected) {
                        DHistory['@:{history#replace.state}']();
                    }
                });
            }
        }
    },
    '$root<contextmenu>&{passive:false}'(e: Magix5.MagixMixedEvent) {
        /**
         * 如果事件被处理过或者当前活动节点是可输入节点，则退出
         */
        if (!e['@:{halt}'] &&
            !Keyboard['@:{key#is.input.element}'](e.target as Report.ActiveType)) {
            //阻止系统的右键
            this['@:{prevent.default}'](e);
            let collection = State.get('@:{global#stage.elements}');
            let selectElements = State.get('@:{global#stage.select.elements}');
            let element = selectElements[0];
            //展示菜单
            StageElements["@:{elements#show.contextmenu}"](this, e, collection, 0, menu => {
                //全选按钮
                if (menu.id == Contextmenu["@:{cm#all.id}"] ||
                    menu.id == Contextmenu['@:{cm#reverse.id}'] ||
                    menu.id == Contextmenu['@:{cm#all.movable.id}']) {
                    StageGeneric['@:{generic#select.all.collection.elements}'](collection, menu.id == Contextmenu['@:{cm#reverse.id}'], menu.id == Contextmenu['@:{cm#all.movable.id}']);
                    //复制
                } else if (menu.id == Contextmenu["@:{cm#copy.id}"]) {
                    StageClipboard["@:{copy.elements}"](e);
                    //粘贴
                } else if (menu.id == Contextmenu["@:{cm#paste.id}"]) {
                    let p = Transform["@:{transform#real.to.stage.coord}"]({
                        x: e.pageX,
                        y: e.pageY
                    });
                    let stage = StageGeneric['@:{generic#query.nearest.stage}']();
                    StageClipboard["@:{paste.elements}"](stage, p);
                    //剪切
                } else if (menu.id == Contextmenu['@:{cm#duplicate.id}']) {
                    let stages = StageGeneric['@:{generic#query.select.elements.stage}']();
                    StageClipboard['@:{duplicate.elements}'](stages);
                } else if (menu.id == Contextmenu["@:{cm#cut.id}"]) {
                    StageClipboard["@:{cut.elements}"](e);
                    //删除
                } else if (menu.id == Contextmenu["@:{cm#delete.id}"]) {
                    StageGeneric["@:{generic#delete.select.elements}"]();
                    //清空设计区
                } else if (menu.id == Contextmenu['@:{cm#clear.id}']) {
                    State.fire('@:{event#stage.clear}');
                    //3~6进行z轴的调整
                } else if (menu.id == Contextmenu['@:{cm#new.id}']) {
                    State.fire('@:{event#stage.clear}', {
                        '@:{clear.events#action}': '@:{clear.events#new}'
                    });
                } else if (menu.id == Contextmenu['@:{cm#help.id}']) {
                    State.fire('@:{event#stage.show.help}');
                } else if (menu.id == Contextmenu['@:{cm#preview.id}']) {
                    State.fire('@:{event#stage.show.preview}');
                } else if (menu.id == Contextmenu['@:{cm#template.id}']) {
                    Example['@:{show}'](this);
                } else if (menu.id >= 3 && menu.id <= 6) {
                    StageElements["@:{elements#modify.element.z.index}"](menu.id, element);
                    //20~29 表示对齐
                } else if (menu.id > 19 && menu.id < 30) {
                    StageElements["@:{elements#align.elements}"](menu.to);
                    //31~39表示组合
                } else if (menu.id > 30 && menu.id < 40) {
                    let ungroup = menu.id == 32;
                    StageGeneric["@:{generic#group.select.elements}"](ungroup);
                    //41~49表示同步尺寸
                } else if (menu.id > 40 && menu.id < 50) {
                    let from = (menu.id == Contextmenu["@:{cm#sync.width.as.height.id}"] || menu.id == Contextmenu["@:{cm#sync.width.id}"]) ? 1 : 0;
                    let to = (menu.id == Contextmenu["@:{cm#sync.height.id}"] ||
                        menu.id == Contextmenu["@:{cm#sync.width.as.height.id}"]) ? 0 : 1;
                    let result = StageElements["@:{elements#sync.or.reverse.size.elements}"](from, to);
                    if (result) {
                        DHistory["@:{history#save}"](DHistory['@:{history#element.sync.size}']);
                    }
                } else if (menu.id > 60 && menu.id < 70) {
                    let code;
                    if (menu.id == Contextmenu['@:{cm#zoom.in.id}']) {
                        code = Keyboard['@:{key#ctrl.plus}']
                    } else if (menu.id == Contextmenu['@:{cm#zoom.out.id}']) {
                        code = Keyboard['@:{key#ctrl.minus}'];
                    } else {
                        code = Keyboard['@:{key#num.zero}'];
                    }
                    if (code) {//转为键盘事件
                        State.fire('@:{event#key.press}', {
                            '@:{keypress#is.key.down}': 1,
                            '@:{keypress#ctrl.key}': 1,
                            '@:{keypress#shift.key}': e.shiftKey,
                            '@:{keypress#alt.key}': e.altKey,
                            '@:{keypress#code}': code,
                        });
                    }
                }
            });
        }
    },
    '$root<drop>&{passive:false}'(e: DragEvent) {
        StageDropProvider['@:{sdrop#drop}'](e);
    },
    '$root<dragenter>'(e: DragEvent) {
        StageDropProvider['@:{sdrop#drag.enter}'](e);
    }
}).merge(Dragdrop, Dialog);