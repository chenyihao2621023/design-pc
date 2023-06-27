/**
 * 容器元素基础通用方法
 */
import Magix from 'magix5';
import Const from '../designer/const';
import Contextmenu from '../designer/contextmenu';
import DHistory from '../designer/history';
import Keyboard from '../designer/keyboard';
import StageClipboard from '../designer/clipboard';
import StageElements from '../designer/elements';
import StageGeneric from '../designer/generic';
import StageSelection from '../designer/selection';
import Transform from '../designer/transform';
import Cursor from '../gallery/mx-pointer/cursor';
import PointerTip from '../gallery/mx-pointer/tip';
import CellProvider from './cell';
import TableProvider from './table';
let { State, mark, delay } = Magix;

let { min, abs, PI, sin, cos, hypot } = Math;
let emptyObject = {};
/**
 * 根据位置激活格子
 * @param element 容器元素对象
 * @param row 行
 * @param col 列
 */
let activeCellByPos = (element, row, col) => {
    let { props } = element;
    if (!props.locked && (props.focusRow != row ||
        props.focusCol != col)) {//未锁定且当前激活的格子与目标格子不一样才处理
        props.focusRow = row;
        props.focusCol = col;
        StageGeneric['@:{generic#update.stage.element}'](element, '@:{focus.cell}');
    }
};
/**
 * 激活格子
 * @param element 容器元素对象
 * @param row 行
 * @param col 列
 * @param isShiftKeyPressed shift键是否按下
 */
let activeCell = (element, row, col, isShiftKeyPressed) => {
    let { props } = element;
    if (props.readonly) {//元素只读
        if (!isShiftKeyPressed) {//未按shift的情况下，取消其它元素的选中，且当前元素不能被选中
            let old = StageSelection["@:{selection#set}"]();
            if (old) {
                DHistory["@:{history#save}"](DHistory['@:{history#element.lost.focus}'], StageGeneric['@:{generic#query.element.name}'](old));
            }
        }
    } else {
        activeCellByPos(element, row, col);
        StageElements['@:{elements#single.or.multi.select}'](element, isShiftKeyPressed, false);
    }
};
/**
 * 激活当前格子内的input元素
 * @param view 容器属性所在的Magix.View对象
 * @param sourceTarget 事件的原始节点
 * @param eventTarget 监听事件的节点
 */
let activeDirectInput = async (view: Magix5.View,
    sourceTarget: HTMLDivElement,
    eventTarget: HTMLElement) => {
    let waitMark = mark(view, '@:{wait.ready}');
    await view.finale();//等待view完成渲染
    await delay(0);//在pointerdown事件里，需要等到外部处理完成
    if (waitMark()) {
        let input = eventTarget.querySelector<HTMLInputElement>(`[rd-as=i][rd-owner="${view.id}"]`);
        if (input &&
            input != sourceTarget) {
            input.focus();
            input.selectionStart = input.value.length;
        }
    }
};
export default {
    /**
     * 失去焦点
     */
    '@:{lost.select}'() {
        let element = this.get('element');
        activeCellByPos(element, -1, -1);
    },
    /**
     * 格子内的input监听
     * @param e
     */
    '@:{active.cell.by.pos}<focusin>'(e: Magix5.MagixPointerEvent) {
        let { params } = e;
        let { row, col } = params;
        let element = this.get('element');
        activeCellByPos(element, row, col);
    },
    /**
     * 改变格子尺寸
     * @param e
     * @returns
     */
    '@:{start.resize.table.cell}<pointerdown>'(e) {
        if (e['@:{halt}'] || e.button) return;//事件被阻止或右键不处理
        e['@:{halt}'] = 1;
        let me = this;
        let element = this.get('element');
        let { props, ctrl, id } = element;
        let { focusRow, focusCol, rows, ename,
            rotate, excelLeft, excelTop,
            tfootSpacing } = props;
        if ((focusRow == -1 || focusCol == -1)) return;//未有格子激活，不处理
        if (rotate == null) {
            rotate = 0;
        }
        rotate %= 360;
        props.rotate = rotate;
        let beginPoint = {
            x: e.pageX,
            y: e.pageY
        };
        State.fire('@:{event#pointer.using}', {
            active: 1
        });
        State.fire('@:{event#stage.scrolling}', {
            active: 1,
        });
        let isShiftKeyStillPressed = e.shiftKey;
        //是否是留白
        let isSpace = focusRow == -2 && focusCol == -2;
        //是否是excel的格子
        let isExcelCell = focusRow == -3 && focusCol == -3;
        //是否为普通的格子
        let isNormalCell = focusRow > -1 && focusCol > -1;
        let row = rows[focusRow];
        let cell = isNormalCell && row.cols[focusCol];
        let moved;
        let beginWidth = isExcelCell ? excelLeft : (isSpace ? 0 : cell.width);
        let beginHeight = isExcelCell ? excelTop : (isSpace ? tfootSpacing : cell.height);
        let { eventTarget, params } = e;
        let { key } = params;
        let [handY, handX] = key;
        let rotatedRect = Transform['@:{transform#rotate.rect}'](props);
        let useFixIndex = Transform['@:{transform#handle.to.fixed.point}'](key);
        let beginFixed = rotatedRect['@:{point}'][useFixIndex];

        let parent = me.owner.parent();
        let current = eventTarget;
        let modifyWidth = handX != 'm';
        let modifyHeight = handY != 'm';
        let oppsiteWidth = handX == 'l' ? -1 : 1;
        let oppsiteHeight = handY == 't' ? -1 : 1;
        let scale = State.get('@:{global#stage.scale}');
        let minCellWidth = isSpace ? 0 : Const['@:{const#to.unit}'](CellProvider['@:{cell#min.width}'] * scale);
        let minCellHeight = isSpace ? 0 : Const['@:{const#to.unit}'](CellProvider['@:{cell#min.height}'] * scale);
        let maxCellWidth = Const['@:{const#to.unit}'](CellProvider['@:{cell#max.width}'] * scale);
        let maxCellHeight = Const['@:{const#to.unit}'](CellProvider['@:{cell#max.height}'] * scale);
        let max = this.get('mmax');
        let min = this.get('mmin');
        let colspan = isNormalCell ? cell.colspan : 1,
            rowspan = isNormalCell ? cell.rowspan : 1;
        let minWidth = colspan * minCellWidth;
        let minHeight = rowspan * minCellHeight;
        let maxWidth = colspan * maxCellWidth;
        let maxHeight = rowspan * maxCellHeight;

        let minRatio = max(minCellWidth / beginWidth, minCellHeight / beginHeight);
        let maxRatio = min(maxCellWidth / beginWidth, maxCellHeight / beginHeight);
        let moveEvent,
            nearsideScrollOffset: Report.EventOfStageAutoScroll;
        let moveCallback = async () => {
            if (moveEvent) {
                if (!moved) {
                    Cursor["@:{show}"](current);
                    moved = 1;
                }
                let {
                    pageX: movePageX,
                    pageY: movePageY
                } = moveEvent;
                let nowPoint = {
                    x: movePageX,
                    y: movePageY
                };
                if (nearsideScrollOffset) {
                    nowPoint.y += nearsideScrollOffset['@:{interval.move.event#y}'];
                    nowPoint.x += nearsideScrollOffset['@:{interval.move.event#x}'];
                }
                let angle = Transform['@:{transform#get.point.deg}'](nowPoint, beginPoint);
                let dis = hypot(nowPoint.x - beginPoint.x, nowPoint.y - beginPoint.y);
                let rad = (PI / 180) * (angle - rotate);
                let diffY = Const['@:{const#to.unit}'](sin(rad) * dis);
                let diffX = Const['@:{const#to.unit}'](cos(rad) * dis);

                let newWidth = beginWidth + (modifyWidth ? diffX : 0) * oppsiteWidth;
                let newHeight = beginHeight + (modifyHeight ? diffY : 0) * oppsiteHeight;
                if ((State.get('@:{global#stage.element.keep.ratio}') ? !isShiftKeyStillPressed : isShiftKeyStillPressed)) {
                    let r = modifyWidth ? newWidth / beginWidth : newHeight / beginHeight;
                    if (r < minRatio) {
                        r = minRatio;
                    } else if (r > maxRatio) {
                        r = maxRatio;
                    }
                    newWidth = r * beginWidth;
                    newHeight = r * beginHeight;
                } else {
                    if (newWidth < minWidth) {
                        newWidth = minWidth;
                    } else if (newWidth > maxWidth) {
                        newWidth = maxWidth;
                    }
                    if (newHeight < minHeight) {
                        newHeight = minHeight;
                    } else if (newHeight > maxHeight) {
                        newHeight = maxHeight;
                    }
                }
                let changed;
                if (isExcelCell) {
                    changed = newWidth != props.excelLeft || newHeight != props.excelTop;
                } else if (isSpace) {
                    changed = newHeight != props.tfootSpacing;
                } else {
                    changed = newWidth != cell.width || newHeight != cell.height;
                }
                if (changed) {
                    moved = (newWidth != beginWidth || newHeight != beginHeight) ? 2 : 1;
                    if (isExcelCell) {
                        props.excelLeft = newWidth;
                        props.excelTop = newHeight;
                    } else if (isSpace) {
                        props.tfootSpacing = newHeight;
                    } else {
                        cell.width = newWidth;
                        cell.height = newHeight;
                        TableProvider["@:{table.provider#update.cell.size}"](props, cell);
                    }
                    //更新部分尺寸属性后，调用元素控制器的update.props方法进行其它属性的更新
                    ctrl['@:{update.props}'](props);
                    let newRotatedRect = Transform['@:{transform#rotate.rect}'](props);
                    let newFixed = newRotatedRect['@:{point}'][useFixIndex];
                    let x = beginFixed.x - newFixed.x;
                    let y = beginFixed.y - newFixed.y;
                    props.x += x;
                    props.y += y;
                    await StageGeneric['@:{generic#update.stage.element}'](element, '@:{size}', parent);
                }
                if (nearsideScrollOffset &&
                    !nearsideScrollOffset['@:{interval.move.event#called}']) {
                    nearsideScrollOffset['@:{interval.move.event#called}'] = 1;
                    nearsideScrollOffset['@:{interval.move.event#ready}']();
                }
                let tipWidth = Transform['@:{transform#to.show.value}'](newWidth),
                    tipHeight = Transform['@:{transform#to.show.value}'](newHeight),
                    tipMsg;
                if (isSpace) {
                    tipMsg = tipHeight;
                } else {
                    tipMsg = `${tipWidth} x ${tipHeight}`;
                }
                PointerTip['@:{show.text}'](tipMsg);
                PointerTip['@:{update.position}'](movePageX, movePageY);
            }
        };
        let watchKeypress = e => {
            isShiftKeyStillPressed = e['@:{keypress#shift.key}'];
            moveCallback();
        };
        let watchIntervalMove = (e: Report.EventOfStageAutoScroll) => {
            nearsideScrollOffset = e;
            moveCallback();
        };
        State.on('@:{event#key.press}', watchKeypress);
        State.on('@:{event#stage.auto.scroll}', watchIntervalMove);
        me['@:{drag.drop}'](e, evt => {
            State.fire('@:{event#drag.element.move}', evt);
            moveEvent = evt;
            moveCallback();
        }, () => {
            State.off('@:{event#stage.auto.scroll}', watchIntervalMove);
            State.off('@:{event#key.press}', watchKeypress);
            State.fire('@:{event#drag.element.stop}');
            if (moved) {
                Cursor["@:{hide}"]();
            }
            if (moved == 2) {
                DHistory["@:{history#save}"](DHistory['@:{history#element.modified.size}'], ename);
            }
            State.fire('@:{event#pointer.using}');
            State.fire('@:{event#stage.scrolling}');
            PointerTip['@:{hide}']();
        });
    },
    '@:{active.cell}<pointerdown>'(e) {
        //let fs = this.get('fs');
        if (!e['@:{halt}']) {
            let element = this.get('element');
            let props = this.get('props');
            let { eventTarget: target,
                shiftKey,
                ctrlKey,
                metaKey,
                params,
                button,
                target: sourceTarget,
                pageX,
                pageY } = e;
            let { row, col, elm, input } = params;
            let isShiftKeyStillPressed = shiftKey || ctrlKey || metaKey;
            if (!button) {
                if (isShiftKeyStillPressed ||
                    elm) {
                    e['@:{halt}'] = 1;
                }
                if (elm && !input) {
                    let selectElements = State.get('@:{global#stage.select.elements}');
                    let cell = props.rows[row].cols[col];
                    //Select["@:{init}"]();
                    let showedCursor;
                    let hodElements,
                        firstSelectElement,
                        currentSelected;
                    let last = StageSelection['@:{selection#get.selected.map}']();
                    let initSelectedElements = [...selectElements];
                    let initIds = [],
                        initIdsMap = {};
                    for (let ise of initSelectedElements) {
                        initIds.push(ise.id);
                        initIdsMap[ise.id] = 1;
                    }
                    currentSelected = initIds.join(',');
                    let initIdsSelected = currentSelected;
                    if (isShiftKeyStillPressed) {
                        hodElements = StageGeneric["@:{generic#find.hod.sub.elements.map}"]([...cell.elements, ...initSelectedElements])['@:{sub.map}'];
                    } else {
                        initIdsMap = emptyObject;
                    }
                    let elementLocations = StageGeneric["@:{generic#query.elements.location}"](cell.elements);
                    let moveEvent;
                    State.fire('@:{event#pointer.using}', {
                        active: 1
                    });
                    let dragSelect = () => {
                        if (moveEvent) {
                            if (!showedCursor) {
                                showedCursor = 1;
                                Cursor["@:{show.by.type}"]('default');
                                if (!isShiftKeyStillPressed) {
                                    StageSelection["@:{selection#set}"]();
                                }
                            }
                            let { pageX: moveX, pageY: moveY } = moveEvent;
                            let width = abs(pageX - moveX);
                            let height = abs(pageY - moveY);
                            let left = min(pageX, moveX);
                            let top = min(pageY, moveY);
                            //Select["@:{update}"](left, top, width, height);
                            let rect = Transform["@:{transform#real.to.nearest.coord}"](target, {
                                x: left,
                                y: top
                            }) as {
                                x: number
                                y: number
                                width: number
                                height: number
                            };
                            rect.width = width;
                            rect.height = height;
                            //console.log(rect);
                            this.digest({
                                srRow: row,
                                srCol: col,
                                selectRect: rect
                            });
                            //console.log(rect,width,height);
                            if (elementLocations.length) {
                                let intersect = StageGeneric["@:{generic#query.intersect.elements}"](elementLocations, rect, initSelectedElements, firstSelectElement, isShiftKeyStillPressed && hodElements, isShiftKeyStillPressed ? initIdsMap : emptyObject);
                                if (intersect["@:{ids}"] != currentSelected) {
                                    currentSelected = intersect["@:{ids}"];
                                    firstSelectElement = intersect['@:{first}'];
                                    StageSelection["@:{selection#set.all}"](intersect['@:{selected}']);
                                }
                            }
                        }
                    }
                    let watchKeypress = e => {
                        isShiftKeyStillPressed = e['@:{keypress#shift.key}'] || e['@:{keypress#ctrl.key}'];
                        dragSelect();
                    };
                    State.on('@:{event#key.press}', watchKeypress);
                    this['@:{drag.drop}'](e, ex => {
                        moveEvent = ex;
                        dragSelect();
                    }, () => {
                        State.off('@:{event#key.press}', watchKeypress);
                        State.fire('@:{event#pointer.using}');
                        if (showedCursor) {
                            this.digest({
                                selectRect: null
                            });
                            //Select["@:{hide}"]();
                            Cursor["@:{hide}"]();
                            let diff = StageSelection["@:{selection#has.changed}"](last);
                            if (diff['@:{selection.changed#has.diffed}']) {
                                let {
                                    '@:{generic.diff.info#type}': type,
                                    '@:{generic.diff.info#ename}': ename
                                } = StageGeneric['@:{generic#query.history.info.by.diff}'](diff);
                                DHistory["@:{history#save}"](type, ename);
                            } else if (initIdsSelected != currentSelected) {
                                DHistory['@:{history#replace.state}']();
                            }
                        } else {
                            activeCell(element, row, col, isShiftKeyStillPressed);
                            activeDirectInput(this, sourceTarget, target);
                        }
                    });
                } else {
                    activeCell(element, row, col, isShiftKeyStillPressed);
                    if (!props.readonly) {
                        activeDirectInput(this, sourceTarget, target);
                        //如果点击对象是可输入，则优先使用系统的功能，比如输入框可以拖动选择文本，此时不宜移动元素
                        if (Keyboard['@:{key#is.input.element}'](sourceTarget)) {
                            e['@:{halt}'] = 1;
                        }
                    }
                }
            } else {
                activeCell(element, row, col, 0);
            }
        }
    },

    '@:{update.cell.text}<input>'(e: Magix5.MagixKeyboardEvent) {
        let { params, eventTarget } = e;
        let { cell, key } = params;
        let value = (eventTarget as HTMLInputElement).value;
        cell[key] = value;
        let element = this.get('element');
        StageGeneric['@:{generic#update.stage.element}'](element, 'rows');
        let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
        DHistory["@:{history#save}"](DHistory['@:{history#element.modified.props}'], ename, element.id + '@:{history#element.props.change}.rows', Const['@:{const#hisotry.save.continous.delay}']);
    },
    '@:{stop}<pointerdown>'(e) {
        e['@:{halt}'] = 1;
    },
    '@:{element.start.drag}<pointerdown>'(e) {
        //let fs = this.get('fs');
        if (//fs ||
            !e['@:{halt}']) {
            e['@:{halt}'] = 1;
            StageElements["@:{elements#select.or.move.elements}"](e, this);
        }
    },
    '@:{show.contxtmenu}<contextmenu>&{passive:false}'(e: Magix5.MagixMixedEvent) {
        //let fs = this.get('fs');
        if (//fs||
            !e['@:{halt}']) {
            let currentElement = this.get('element');
            let { props, id } = currentElement;
            this['@:{prevent.default}'](e);
            e['@:{halt}'] = 1;
            let { row, col } = e.params;
            let cell = props.rows[row].cols[col];
            let collection = cell.elements;
            let selectElements = State.get('@:{global#stage.select.elements}');
            let element = selectElements[0];
            let bound = e.eventTarget.getBoundingClientRect();
            let nowPosition = {
                x: e.pageX - bound.x - scrollX,
                y: e.pageY - bound.y - scrollY
            };
            StageElements["@:{elements#show.contextmenu}"](this, e, collection, id, menu => {
                if (menu.id == Contextmenu["@:{cm#all.id}"] ||
                    menu.id == Contextmenu['@:{cm#all.movable.id}']) {
                    StageGeneric['@:{generic#select.all.collection.elements}'](collection, 0, menu.id == Contextmenu['@:{cm#all.movable.id}']);
                } else if (menu.id == Contextmenu['@:{cm#reverse.id}']) {
                    let underElement = State.get<Report.StageElement>('@:{global#stage.contextmenu.under.item}');
                    let stage = StageGeneric['@:{generic#query.nearest.stage}'](0, underElement),
                        coll = stage["@:{collection}"];
                    StageGeneric['@:{generic#select.all.collection.elements}'](coll, 1);
                } else if (menu.id == Contextmenu["@:{cm#copy.id}"]) {
                    StageClipboard["@:{copy.elements}"](e);
                } else if (menu.id == Contextmenu["@:{cm#paste.id}"]) {
                    let stage = StageGeneric['@:{generic#query.nearest.stage}'](0, currentElement, row, col);
                    StageClipboard["@:{paste.elements}"](stage, nowPosition);
                } else if (menu.id == Contextmenu['@:{cm#duplicate.id}']) {
                    let stages = StageGeneric['@:{generic#query.select.elements.stage}']();
                    StageClipboard['@:{duplicate.elements}'](stages);
                } else if (menu.id == Contextmenu["@:{cm#cut.id}"]) {
                    StageClipboard["@:{cut.elements}"](e);
                } else if (menu.id == Contextmenu["@:{cm#delete.id}"]) {
                    StageGeneric["@:{generic#delete.select.elements}"]();
                } else if (menu.id >= 3 && menu.id <= 6) {
                    StageElements["@:{elements#modify.element.z.index}"](menu.id, element);
                } else if (menu.id > 19 && menu.id < 30) {
                    StageElements["@:{elements#align.elements}"](menu.to);
                } else if (menu.id > 30 && menu.id < 40) {
                    let ungroup = menu.id == 32;
                    StageGeneric["@:{generic#group.select.elements}"](ungroup);
                } else if (menu.id > 40 && menu.id < 50) {
                    let from = (menu.id == Contextmenu["@:{cm#sync.width.as.height.id}"] || menu.id == Contextmenu["@:{cm#sync.width.id}"]) ? 1 : 0;
                    let to = (menu.id == Contextmenu["@:{cm#sync.height.id}"] ||
                        menu.id == Contextmenu["@:{cm#sync.width.as.height.id}"]) ? 0 : 1;
                    let result = StageElements["@:{elements#sync.or.reverse.size.elements}"](from, to);
                    if (result) {
                        DHistory["@:{history#save}"](DHistory['@:{history#element.sync.size}']);
                    }
                } else if (menu.id == Contextmenu['@:{cm#clear.hod.stage.id}']) {
                    let removed = StageGeneric['@:{generic#remove.nonreadonly.elements}'](collection);
                    if (removed.length) {
                        State.fire('@:{event#stage.elements.change}');
                        DHistory["@:{history#save}"](DHistory['@:{history#element.removed}'], StageGeneric['@:{generic#query.element.name}'](removed));
                    }
                }
            });
        }
    }
}