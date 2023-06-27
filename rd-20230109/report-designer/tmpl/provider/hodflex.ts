/**
 * 容器元素调整格子尺寸插件
 */
import Magix from 'magix5';
import Const from '../designer/const';
import StageGeneric from '../designer/generic';
import DHistory from '../designer/history';
import Transform from '../designer/transform';
import Cursor from '../gallery/mx-pointer/cursor';
import PointerTip from '../gallery/mx-pointer/tip';
import CellProvider from './cell';

let { State } = Magix;
export default {
    '@:{start.resize}<pointerdown>'(e) {
        if (!e['@:{halt}'] && !e.button) {
            e['@:{halt}'] = 1;
            let me = this;
            let element = this.get('element');
            let { props } = element;
            let { focusRow, focusCol, rows, ename,
                x: elementX,
                y: elementY } = props;
            if (focusRow != -1 && focusCol != -1) {
                State.fire('@:{event#pointer.using}', {
                    active: 1
                });
                State.fire('@:{event#stage.scrolling}', {
                    active: 1,
                });
                let scale = State.get('@:{global#stage.scale}');
                let row = rows[focusRow];
                let cell = row.cols[focusCol];
                let { key } = e.params;
                let [handY, handX] = key;
                let moved;
                let beginWidth = cell.width != null ? cell.width : row.width;
                let beginHeight = row.height != null ? row.height : cell.height;
                let beginX = e.pageX;
                let beginY = e.pageY;
                let parent = me.owner.parent();
                let current = e.eventTarget;

                let modifyWidth = handX != 'm';
                let modifyHeight = handY != 'm';
                let oppsiteWidth = handX == 'l' ? -1 : 1;
                let oppsiteHeight = handY == 't' ? -1 : 1;
                let movedX = 0, movedY = 0;
                let minWidth = Const['@:{const#to.unit}'](CellProvider["@:{cell#min.width}"] * scale);
                let minHeight = Const['@:{const#to.unit}'](CellProvider["@:{cell#min.height}"] * scale);
                let maxWidth = Const['@:{const#to.unit}'](CellProvider["@:{cell#max.width}"] * scale);
                let maxHeight = Const['@:{const#to.unit}'](CellProvider["@:{cell#max.height}"] * scale);
                let moveEvent,
                    nearsideScrollOffset;
                let moveCallback = async () => {
                    if (!moved) {
                        Cursor["@:{show}"](current);
                        moved = 1;
                    }
                    let {
                        pageX: movePageX,
                        pageY: movePageY
                    } = moveEvent;
                    let diffWidth = movePageX - beginX;
                    let diffHeight = movePageY - beginY;
                    if (nearsideScrollOffset) {
                        diffHeight += nearsideScrollOffset['@:{interval.move.event#y}'];
                        diffWidth += nearsideScrollOffset['@:{interval.move.event#x}'];
                    }
                    let offsetHeight = Const['@:{const#to.unit}']((modifyHeight ? diffHeight : 0) * oppsiteHeight);
                    let offsetWidth = Const['@:{const#to.unit}']((modifyWidth ? diffWidth : 0) * oppsiteWidth);
                    let newWidth = beginWidth + offsetWidth;
                    let newHeight = beginHeight + offsetHeight;
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
                    if (oppsiteHeight == -1) {
                        movedY = beginHeight - newHeight;
                    }
                    if (oppsiteWidth == -1) {
                        movedX = beginWidth - newWidth;
                    }
                    let hflex = cell.width != null,
                        vflex = row.width != null;
                    if ((hflex && (
                        newWidth != cell.width ||
                        newHeight != row.height)) ||
                        (vflex && (
                            newWidth != row.width ||
                            newHeight != cell.height))) {
                        if (hflex) {
                            row.height = newHeight;
                            cell.width = newWidth;
                        } else if (vflex) {
                            cell.height = newHeight;
                            row.width = newWidth;
                        }
                        props.x = elementX + movedX;
                        props.y = elementY + movedY;
                        await StageGeneric['@:{generic#update.stage.element}'](element, '@:{size}', parent);
                    }
                    if (nearsideScrollOffset &&
                        !nearsideScrollOffset['@:{interval.move.event#called}']) {
                        nearsideScrollOffset['@:{interval.move.event#called}'] = 1;
                        nearsideScrollOffset['@:{interval.move.event#ready}']();
                    }
                    let tipWidth = Transform['@:{transform#to.show.value}'](newWidth),
                        tipHeight = Transform['@:{transform#to.show.value}'](newHeight),
                        tipMsg = `${tipWidth} x ${tipHeight}`;
                    PointerTip['@:{show.text}'](tipMsg);
                    PointerTip['@:{update.position}'](movePageX, movePageY);
                };
                let watchIntervalMove = (e: Report.EventOfStageAutoScroll) => {
                    nearsideScrollOffset = e;
                    moveCallback();
                };
                State.on('@:{event#stage.auto.scroll}', watchIntervalMove);
                me['@:{drag.drop}'](e, evt => {
                    State.fire('@:{event#drag.element.move}', evt);
                    moveEvent = evt;
                    moveCallback();
                }, () => {
                    State.off('@:{event#stage.auto.scroll}', watchIntervalMove);
                    State.fire('@:{event#drag.element.stop}');
                    if (moved) {
                        DHistory["@:{history#save}"](DHistory['@:{history#element.modified.size}'], ename);
                        Cursor["@:{hide}"]();
                    }
                    State.fire('@:{event#pointer.using}');
                    State.fire('@:{event#stage.scrolling}');
                    PointerTip['@:{hide}']();
                });
            }
        }
    }
}