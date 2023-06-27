/**
 * svg操作对象
 */

import Magix from 'magix5';
import Const from '../designer/const';
import Enum from '../designer/enum';
import StageGeneric from '../designer/generic';
import DHistory from '../designer/history';
import Keyboard from '../designer/keyboard';
import StageAlign from '../designer/snap';
import Transform from '../designer/transform';
import Cursor from '../gallery/mx-pointer/cursor';
import PointerTip from '../gallery/mx-pointer/tip';
let { atan2, PI, sin, cos, hypot, } = Math;
let { node, State, inside, } = Magix;
let doc = document;
export default {
    assign(data) {
        // let { element } = data;
        // if (!element.ctrl) {
        //     let map = State.get('@:{global#stage.elements.map}');
        //     element.ctrl = map[element.type];
        // }
        // if (!element.id) {
        //     element.id = guid('fix_');
        // }
        this.set(data);
        this['@:{check.status}']();
    },
    async render(element?: Report.StageElement) {
        //console.log('rerender');
        if (element) {
            this.set({
                element
            });
        }
        await this.digest({
            kr: State.get('@:{global#stage.element.keep.ratio}')
        });
        let ta = node(`_rd_ta_${this.id}`) as HTMLInputElement;
        if (ta &&
            doc.activeElement != ta) {
            ta.focus();
            ta.selectionStart = ta.value.length;
        }
    },
    '@:{start.rotate}<pointerdown>'(e: Magix5.MagixPointerEvent) {
        e['@:{halt}'] = 1;
        let me = this;
        let element = me.get('element');
        let { props } = element;
        let { rotate, x, y, width, height } = props;
        width = Const['@:{const#to.px}'](width);
        height = Const['@:{const#to.px}'](height);
        x = Const['@:{const#to.px}'](x);
        y = Const['@:{const#to.px}'](y);
        State.fire('@:{event#pointer.using}', {
            active: 1
        });
        State.fire('@:{event#stage.scrolling}', {
            active: 1,
        });
        let c = {
            x: x + width / 2,
            y: y + height / 2
        };
        let { altKey,
            pageX: startX,
            pageY: startY } = e;
        let pos = Transform["@:{transform#real.to.nearest.coord}"](me.root, {
            x: startX,
            y: startY,
            f: 1
        });
        let sdeg = atan2(pos.y - c.y, pos.x - c.x) - rotate * PI / 180,
            moved;
        let eventTarget = e.eventTarget;
        let moveEvent,
            page = State.get('@:{global#stage.page}'),
            snapElement = page.snap,
            altPressed = snapElement ? altKey : !altKey;
        let moveCallback = () => {
            if (moveEvent) {
                if (!moved) {
                    Cursor["@:{show}"](eventTarget);
                    moved = 1;
                }
                let {
                    pageX,
                    pageY
                } = moveEvent;
                pos = Transform["@:{transform#real.to.nearest.coord}"](me.root, {
                    x: pageX,
                    y: pageY,
                    f: 1
                });
                let deg = atan2(pos.y - c.y, pos.x - c.x);
                deg = ((deg - sdeg) * 180 / PI + 360) | 0;
                if (!altPressed) {
                    deg = StageGeneric['@:{generic#query.snap.degree}'](deg);
                }
                deg %= 360;
                props.rotate = deg;
                StageGeneric['@:{generic#update.stage.element}'](element, '@:{rotate}', this.owner);
                PointerTip['@:{show.text}'](`${props.rotate}°`);
                PointerTip['@:{update.position}'](pageX, pageY);
            }
        };
        let watchKeypress = e => {
            altPressed = snapElement ? e['@:{keypress#alt.key}'] : !e['@:{keypress#alt.key}'];
            moveCallback();
        };
        State.on('@:{event#key.press}', watchKeypress);
        me['@:{drag.drop}'](e, (evt) => {
            moveEvent = evt;
            moveCallback();
        }, () => {
            State.off('@:{event#key.press}', watchKeypress);
            if (moved) {
                Cursor["@:{hide}"]();
                if (rotate != props.rotate) {
                    let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
                    DHistory["@:{history#save}"](DHistory['@:{history#element.rotated}'], ename);
                }
            }
            State.fire('@:{event#pointer.using}');
            State.fire('@:{event#stage.scrolling}');
            PointerTip['@:{hide}']();
        });
    },
    '@:{start.resize}<pointerdown>'(e: Magix5.MagixPointerEvent) {
        if (!e.button && !e['@:{halt}']) {
            e['@:{halt}'] = 1;
            let me = this;
            let element = me.get('element');
            let { props, ctrl } = element;
            State.fire('@:{event#pointer.using}', {
                active: 1
            });
            State.fire('@:{event#stage.scrolling}', {
                active: 1,
            });
            let { rotate,
                width: beginWidth,
                height: beginHeight
            } = props;
            if (rotate == null) {
                props.rotate = rotate = 0;
            }
            let { params, pageX, pageY,
                shiftKey: isShiftKeyStillPressed,
                altKey,
                eventTarget } = e;
            let { key } = params;
            let rotatedRect = Transform['@:{transform#rotate.rect}'](props);
            let [handY, handX] = key;
            let useFixIndex = Transform['@:{transform#handle.to.fixed.point}'](key);
            let beginFixed = rotatedRect['@:{point}'][useFixIndex];
            let scale = State.get('@:{global#stage.scale}');
            let {
                '@:{generic#min.w}': minWidth,
                '@:{generic#max.w}': maxWidth,
                '@:{generic#min.h}': minHeight,
                '@:{generic#max.h}': maxHeight
            } = StageGeneric['@:{generic#query.size.boundaries}'](ctrl, props);
            let moved;
            let beginPoint = {
                x: pageX,
                y: pageY
            };
            let moveEvent;
            let modifyWidth = handX != 'm';
            let modifyHeight = handY != 'm';
            let oppsiteWidth = handX == 'l' ? -1 : 1;
            let oppsiteHeight = handY == 't' ? -1 : 1;
            let max = this.get('mmax');
            let min = this.get('mmin');
            let minRatio = max(minWidth / beginWidth, minHeight / beginHeight);
            let maxRatio = min(maxWidth / beginWidth, maxHeight / beginHeight);
            let syncSize = ctrl['@:{modifier}'] & Enum['@:{enum#modifier.sync.size}'];
            let supportSnapElement = Const['@:{const#page.enable.snap.align.elements}'],
                alignElements,
                page = State.get('@:{global#stage.page}'),
                snapElement = page.snap,
                altPressed = snapElement ? altKey : !altKey,
                snapThreshold,
                maskLeft,
                maskTop;
            if (supportSnapElement) {
                let maskId = this.get('maskId');
                let {
                    '@:{generic.all#elements}': allElements
                } = StageGeneric['@:{generic#query.all.elements.and.map}']();
                let find = StageAlign['@:{align#query.align.elements}'](allElements, maskId, element);
                alignElements = find['@:{align.queried#align.elements.sizes}'];
                snapThreshold = Const['@:{const#drag.snap.to.other.element.offset}'] * scale;
                if (maskId) {
                    let maskBound = find['@:{align.queried#mask.bound}'];
                    let rootBound = find['@:{align.queried#root.bound}'];
                    maskLeft = maskBound.x - rootBound.x;
                    maskTop = maskBound.y - rootBound.y;
                }
            }
            let nearsideScrollOffset;
            let moveCallback = async () => {
                //console.log(supportSnapElement, altPressed);
                if (moveEvent) {
                    if (!moved) {
                        Cursor["@:{show}"](eventTarget);
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
                    let syncFlag = 0;
                    //按下shift键或元素本身就需要使用相同的宽高
                    if (syncSize ||
                        ((ctrl['@:{modifier}'] & Enum['@:{enum#modifier.width}']) && (ctrl['@:{modifier}'] & Enum['@:{enum#modifier.height}']) && (State.get('@:{global#stage.element.keep.ratio}') ? !isShiftKeyStillPressed : isShiftKeyStillPressed))) {
                        let r;
                        if (handX == 'm') {
                            syncFlag = 1;
                        } else if (handY == 'm') {
                            syncFlag = 2;
                        } else if (beginWidth >= beginHeight) {
                            syncFlag = 2;
                        } else {
                            syncFlag = 1;
                        }
                        if (syncFlag == 1) {
                            if (beginHeight) {
                                r = newHeight / beginHeight;
                            } else {
                                r = 1;
                                syncFlag = 0;
                            }
                        } else {
                            if (beginWidth) {
                                r = newWidth / beginWidth;
                            } else {
                                r = 1;
                                syncFlag = 0;
                            }
                        }
                        if (r < minRatio) {
                            r = minRatio;
                        } else if (r > maxRatio) {
                            r = maxRatio;
                        }
                        newWidth = beginWidth * r;
                        newHeight = beginHeight * r;
                    }

                    if (supportSnapElement) {
                        let snapInfo = StageAlign['@:{align#query.snap.info}'](alignElements, beginFixed, key, rotate, newWidth, newHeight, snapThreshold, minWidth, maxWidth, minHeight, maxHeight, syncFlag, beginWidth, beginHeight, minRatio, maxRatio, altPressed, maskLeft, maskTop);

                        if (snapInfo['@:{snapped}']) {
                            newWidth = snapInfo['@:{snap.width}'];
                            newHeight = snapInfo['@:{snap.height}'];
                        }
                    }
                    let tipWidth = Transform['@:{transform#to.show.value}'](newWidth),
                        tipHeight = Transform['@:{transform#to.show.value}'](newHeight),
                        tipMsg = `${tipWidth} x ${tipHeight}`;
                    newWidth = Const['@:{const#scale.to.unit}'](newWidth);
                    newHeight = Const['@:{const#scale.to.unit}'](newHeight);
                    if (props.width != newWidth ||
                        props.height != newHeight) {
                        moved = (newWidth != beginWidth || newHeight != beginHeight) ? 2 : 1;
                        props.width = newWidth;
                        props.height = newHeight;
                        let newRotatedRect = Transform['@:{transform#rotate.rect}'](props);
                        let newFixed = newRotatedRect['@:{point}'][useFixIndex];

                        let x = beginFixed.x - newFixed.x;
                        let y = beginFixed.y - newFixed.y;
                        props.x += x;
                        props.y += y;

                        await StageGeneric['@:{generic#update.stage.element}'](element, '@:{size}', this.owner);
                    }
                    if (nearsideScrollOffset &&
                        !nearsideScrollOffset['@:{interval.move.event#called}']) {
                        nearsideScrollOffset['@:{interval.move.event#called}'] = 1;
                        nearsideScrollOffset['@:{interval.move.event#ready}']();
                    }
                    PointerTip['@:{show.text}'](tipMsg);
                    PointerTip['@:{update.position}'](movePageX, movePageY);
                }
            };
            /**
             * 监听设计器贴边滚动事件
             * @param e 内部滚动事件对象
             */
            let watchIntervalMove = (e: Report.EventOfStageAutoScroll) => {
                nearsideScrollOffset = e;
                moveCallback();
            };
            let watchKeypress = e => {
                isShiftKeyStillPressed = e['@:{keypress#shift.key}'];
                altPressed = snapElement ? e['@:{keypress#alt.key}'] : !e['@:{keypress#alt.key}'];
                moveCallback();
            };
            State.on('@:{event#key.press}', watchKeypress);
            //处理贴边滚动
            State.on('@:{event#stage.auto.scroll}', watchIntervalMove);
            me['@:{drag.drop}'](e, evt => {
                State.fire('@:{event#drag.element.move}', evt);
                moveEvent = evt;
                moveCallback();
            }, () => {
                State.off('@:{event#key.press}', watchKeypress);
                State.off('@:{event#stage.auto.scroll}', watchIntervalMove);
                State.fire('@:{event#drag.element.stop}');
                if (moved) {
                    Cursor["@:{hide}"]();
                }
                if (moved == 2) {
                    let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
                    DHistory["@:{history#save}"](DHistory['@:{history#element.modified.size}'], ename);
                }
                State.fire('@:{event#pointer.using}');
                State.fire('@:{event#stage.scrolling}');
                if (supportSnapElement) {
                    State.fire('@:{event#stage.snap.element.find}');
                }

                PointerTip['@:{hide}']();
            });
        }
    },
    '@:{drag.svg.key.point}<pointerdown>'(e: Magix5.MagixPointerEvent) {
        e['@:{halt}'] = 1;
        let me = this;
        let element = me.get('element');
        let { props } = element;
        State.fire('@:{event#pointer.using}', {
            active: 1
        });
        State.fire('@:{event#stage.scrolling}', {
            active: 1,
        });
        let moved;
        let { altKey, params, eventTarget } = e;
        let { key } = params;
        //let { x, y, width, height/*, rotate*/ } = props;
        let startX = props[`${key}X`],
            startY = props[`${key}Y`];
        // width = Const['@:{const#to.px}'](width);
        // height = Const['@:{const#to.px}'](height);
        // x = Const['@:{const#to.px}'](x);
        // y = Const['@:{const#to.px}'](y);

        //rotate = rotate || 0;
        // let c = {
        //     x: x + width / 2,
        //     y: y + height / 2
        // };
        let scale = State.get('@:{global#stage.scale}');
        props['@:{focus.ctrl}'] = key;
        StageGeneric['@:{generic#update.stage.element}'](element, '@:{focus.kp}', this.owner);
        let supportSnapElement = Const['@:{const#page.enable.snap.align.elements}'],
            alignElements,
            page = State.get('@:{global#stage.page}'),
            snapElement = page.snap,
            altPressed = snapElement ? altKey : !altKey,
            snapThreshold;
        if (supportSnapElement) {
            let {
                '@:{generic.all#elements}': allElements
            } = StageGeneric['@:{generic#query.all.elements.and.map}']();
            let find = StageAlign['@:{align#query.align.elements}'](allElements, null, element);
            alignElements = find['@:{align.queried#align.elements.sizes}'];
            snapThreshold = Const['@:{const#drag.snap.to.other.element.offset}'] * scale;
        }
        let moveEvent;
        let nearsideScrollOffset,
            stageBound = Transform['@:{transform#get.stage.dom.rect}']();
        let moveCallback = async () => {
            if (moveEvent) {
                if (!moved) {
                    Cursor["@:{show}"](eventTarget);
                    moved = 1;
                }
                let {
                    pageX: movePageX,
                    pageY: movePageY
                } = moveEvent;
                let mpos = {
                    x: movePageX - stageBound.x - scrollX,
                    y: movePageY - stageBound.y - scrollY
                };
                if (nearsideScrollOffset) {
                    mpos.y += nearsideScrollOffset['@:{interval.move.event#y}'];
                    mpos.x += nearsideScrollOffset['@:{interval.move.event#x}'];
                }
                //console.log(current,rotate,newX,newY);
                if (supportSnapElement) {
                    let snapInfo = StageAlign['@:{align#query.svg.point.snap.info}'](alignElements, mpos.x, mpos.y, snapThreshold, altPressed);
                    if (snapInfo['@:{snapped}']) {
                        mpos.x = snapInfo['@:{snap.x}'];
                        mpos.y = snapInfo['@:{snap.y}'];
                    }
                }
                // let current = Transform["@:{transform#get.point.deg}"](mpos, c);
                // let {
                //     y: newY,
                //     x: newX
                // } = Transform["@:{transform#get.rotated.point}"](mpos, c, current - rotate);
                props[`${key}X`] = Const['@:{const#to.unit}'](mpos.x);
                props[`${key}Y`] = Const['@:{const#to.unit}'](mpos.y);

                await StageGeneric['@:{generic#update.stage.element}'](element, '@:{kp}', this.owner);
                if (nearsideScrollOffset &&
                    !nearsideScrollOffset['@:{interval.move.event#called}']) {
                    nearsideScrollOffset['@:{interval.move.event#called}'] = 1;
                    nearsideScrollOffset['@:{interval.move.event#ready}']();
                }
                let tipMsg = `${Transform['@:{transform#to.show.value}'](props[`${key}X`])} , ${Transform['@:{transform#to.show.value}'](props[`${key}Y`])}`;
                PointerTip['@:{show.text}'](tipMsg);
                PointerTip['@:{update.position}'](movePageX, movePageY);
            }
        };
        let watchIntervalMove = (e: Report.EventOfStageAutoScroll) => {
            nearsideScrollOffset = e;
            moveCallback();
        };
        let watchKeypress = e => {
            altPressed = snapElement ? e['@:{keypress#alt.key}'] : !e['@:{keypress#alt.key}'];
            moveCallback();
        };
        State.on('@:{event#key.press}', watchKeypress);
        State.on('@:{event#stage.auto.scroll}', watchIntervalMove);
        me['@:{drag.drop}'](e, (evt) => {
            State.fire('@:{event#drag.element.move}', evt);
            moveEvent = evt;
            moveCallback();
        }, () => {
            State.off('@:{event#key.press}', watchKeypress);
            State.off('@:{event#stage.auto.scroll}', watchIntervalMove);
            State.fire('@:{event#drag.element.stop}');
            Cursor["@:{hide}"]();
            if (moved) {
                StageGeneric['@:{generic#update.stage.element}'](element, '@:{kped}', this.owner);
                if (props[`${key}X`] != startX ||
                    props[`${key}Y`] != startY) {
                    let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
                    DHistory["@:{history#save}"](DHistory['@:{history#element.modified.ctrl.point}'], ename);
                }
            }
            State.fire('@:{event#pointer.using}');
            State.fire('@:{event#stage.scrolling}');
            if (supportSnapElement) {
                State.fire('@:{event#stage.snap.element.find}');
            }
            PointerTip['@:{hide}']();
        });
    },
    '@:{update.text}<input>'(e) {
        let element = this.get('element');
        let { props } = element;
        props.text = e.eventTarget.value;//.trim();
        StageGeneric['@:{generic#update.stage.element}'](element, '@:{content}', this.owner);
        let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
        DHistory["@:{history#save}"](DHistory['@:{history#element.modified.props}'], ename, element.id + '@:{history#element.props.change}.text', Const['@:{const#hisotry.save.continous.delay}']);
    },
    /**
     * 监听输入框的keyup事件
     * @param e 键盘事件
     */
    '@:{watch.input}<keyup,focusout>'(e: Magix5.MagixKeyboardEvent) {
        if (e.type == 'focusout' ||
            e.code == Keyboard['@:{key#escape}']) {
            let element = this.get('element');
            let { props } = element;
            props['@:{show.text}'] = 0;
            this.render(element);
        }
    },
    '@:{focus.mod.point}<pointerover>'(e: Magix5.MagixPointerEvent) {
        if (!inside(e.relatedTarget as HTMLElement, e.eventTarget)) {
            let element = this.get('element');
            let { props } = element;
            props['@:{focus.mod}'] = e.params.key;
            StageGeneric['@:{generic#update.stage.element}'](element, '@:{focus.mod}', this.owner);
        }
    },
    '@:{drag.mod.point}<pointerdown>'(e) {
        e['@:{halt}'] = 1;
        let element = this.get('element');
        let { ctrl } = element;
        let { key } = e.params;
        ctrl['@:{drag.mod.point}'](element, e, key, this);
    },
    '@:{stop}<pointerdown,contextmenu>'(e) {
        e['@:{halt}'] = 1;
    }
};