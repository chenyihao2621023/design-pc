/*
    author:https://github.com/xinglie
*/
'ref@:./index.less';
import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import StageGeneric from '../../designer/generic';
import DHistory from '../../designer/history';
import StageSelection from '../../designer/selection';
import Transform from '../../designer/transform';
import GenericProvider from '../../provider/generic';
let { State, View, node, Vframe, mark, isFunction, dispatch, } = Magix;
/**
 * 是否忽略某个属性
 * @param key 哪个属性
 * @param param1 元素属性
 */
let isSkipKey = (key: string, { pinX, pinY }: Report.StageElementProps) => {
    return (key == 'x' && pinX) ||
        (key == 'y' && pinY) ||
        (key == 'rotate' && (pinX || pinY));
};
/**
 * 获取元素的批量属性值是否不同
 * @param sharedProps 批量属性
 * @param elements 从哪些元素中查找差异
 * @returns 是否有差异
 */
let hasDiffValue = (sharedProps: Report.PanelOfPropsType[],
    elements: Report.StageElement[]) => {
    let d = 0,
        first = elements[0];
    o: for (let p of sharedProps) {
        let keys = p.keys || [p.key];
        for (let k of keys) {
            let v = first.props[k];
            for (let i = elements.length; i-- > 1;) {
                let { props } = elements[i];
                //锁定，固定位置的忽略
                if (props.locked ||
                    isSkipKey(k, props)) {
                    continue;
                }
                if (props[k] !== v) {
                    d = 1;
                    break o;
                }
            }
        }
    }
    return d;
};
/**
 * 判断当前修改元素是否禁用
 * @param elementProp 元素属性
 * @param prop 当前面板属性
 * @returns 禁用
 */
let disable = (elementProp: Report.StageElementProps, prop: Report.PanelOfPropsType) => {
    let disabled = elementProp.locked ||
        (prop.key == 'x' && elementProp.pinX) ||
        (prop.key == 'y' && elementProp.pinY) ||
        (prop.key == 'rotate' && (elementProp.pinX || elementProp.pinY));
    if (!disabled &&
        prop['@:{if.disabled}']) {
        disabled = prop['@:{if.disabled}'](elementProp) as boolean;
    }
    return disabled;
};
export default View.extend({
    tmpl: '@:element.html',
    init() {
        let update = GenericProvider['@:{generic#debounce}'](this.render, 30, this);
        let updateLang = ({ to }: Report.EventOfLangChange) => {
            let data = {
                lang: to
            };
            let display = State.get<string>('@:{global#panels.props.display}');
            if (display != '@:{panels#props.display.page}') {
                this.digest(data);
            } else {
                this.set(data);
            }
        };
        State.on('@:{event#stage.select.element.props.change}', update);
        State.on('@:{event#history.shift.change}', update);
        State.on('@:{event#stage.select.elements.change}', update);
        State.on('@:{event#lang.change}', updateLang);
        this.on('destroy', () => {
            State.off('@:{event#stage.select.element.props.change}', update);
            State.off('@:{event#history.shift.change}', update);
            State.off('@:{event#stage.select.elements.change}', update);
            State.off('@:{event#lang.change}', updateLang);
        });
        this.set({
            he: Const['@:{const#show.help.and.ow.links}'],
            types: Enum
        });
    },
    render() {
        let selectElements = State.get('@:{global#stage.select.elements}');
        let display = State.get<string>('@:{global#panels.props.display}');
        let singleOrMultiple = display != '@:{panels#props.display.page}',
            diff,
            multiple;
        if (singleOrMultiple) {
            multiple = display == '@:{panels#props.display.multiple}';
            let e = selectElements[0];
            let old = this.get('e');
            if (multiple) {
                //多选
                let props = State.get('@:{global#panels.props.multiple.props}');
                diff = hasDiffValue(props, selectElements);
                let { ctrl, props: oldProps } = e;
                e = {
                    id: State.get('@:{global#panels.props.multiple.key}'),
                    ctrl: {
                        title: '@:{lang#props.batch.apply}',
                        sub: ctrl.title,
                        props,
                    },
                    title: ctrl.title,
                    props: oldProps
                };
            }
            let groups;
            let useGroup = Const['@:{const#panels.prop.show.group}'];
            let selected = this.get('selected');
            if (useGroup) {
                groups = StageGeneric['@:{generic#generate.groups}'](e.ctrl);
                if (!groups.includes(selected)) {
                    selected = groups[0];
                }
            }
            if (!old ||
                ((Const['@:{const#panels.prop.auto.scroll.top}'] & 4) && old.id != e.id) ||
                old.type != e.type) {
                dispatch(this.root, 'top');
            }
            this.digest({
                useGroup,
                disable,
                groups,
                selected,
                multiple,
                diff,
                e
            });
        }
    },
    async '@:{update.prop}<input,change>'(e: Magix5.MagixMixedEvent & {
        use: string
        pkey: string
        //pkeys: string[]
        isMod: number
        isKP: number,
        isOperate: number,
        preset: number
        isSize: number
    }) {
        //console.log(e);
        let { key, use, native, write, keys } = e.params;
        if (!use) {
            use = e.use;
        }
        if (!key) {
            key = e.pkey;
        }
        let mod = e.isMod, kp = e.isKP,
            size = e.isSize,
            operate = e.isOperate;
        let changed = 0,
            changedProps = {},
            changedIds = {},
            changedTypes = {};
        let selectElements = State.get<Report.StageElement[]>('@:{global#stage.select.elements}');
        let selectedMap = StageSelection['@:{selection#get.selected.map}']();
        let index = 0,
            firstProps,
            historyKey = '';
        for (let element of selectElements) {
            let { ctrl, props, id, type } = element;
            if ((props.locked &&
                key != 'locked') ||
                isSkipKey(key, props)) {
                continue;
            }
            let moveElements = [element];
            if (use || native) {
                if (!index) {
                    firstProps = props;
                }
                historyKey += id + ':';
                let resetXY = size ||
                    key == 'width' ||
                    key == 'height' ||
                    key == 'rx' ||
                    key == 'ry',
                    oldTopLeft, cachedOldTopLeft,
                    moved;
                if (props.rotate) {
                    let oldRotatedRect = Transform['@:{transform#rotate.rect}'](props);
                    cachedOldTopLeft = oldRotatedRect['@:{point}'][0];
                }
                let updatePosition = key == 'x' || key == 'y';
                let oldWidth = props.width,
                    oldHeight = props.height;
                let v = native ? e.eventTarget[native] : e[use];
                let updateMarker = mark(this, '@:{update.props}');
                changedIds[id] = 1;
                changedTypes[type] = 1;
                if (use) {
                    changedProps[use] = 1;
                }
                if (key) {
                    changedProps[key] = 1;
                }
                if (write) {
                    v = (await write(v, props, changedProps, e)) ?? v;
                }
                if (updateMarker()) {
                    if (resetXY ||
                        oldWidth != props.width ||
                        oldHeight != props.height) {
                        oldTopLeft = cachedOldTopLeft;
                    }
                    if (updatePosition) {
                        let positionOffset = v - props[key];
                        let linkage = State.get('@:{global#stage.elements.groups.linked}');
                        if (linkage) {
                            let groups = State.get('@:{global#stage.elements.groups}');
                            let sameGroups = groups[id];
                            if (sameGroups) {
                                let {
                                    '@:{generic.all#map}': allMap
                                } = StageGeneric['@:{generic#query.all.elements.and.map}']();
                                for (let g of sameGroups) {
                                    if (!index &&
                                        !selectedMap[g]) {
                                        let e = allMap[g];
                                        moveElements.push(e);
                                        if (e.props.pinX &&
                                            key == 'x') {
                                            positionOffset = 0;
                                        } else if (e.props.pinY &&
                                            key == 'y') {
                                            positionOffset = 0;
                                        }
                                    }
                                }
                            }
                        }
                        if (positionOffset) {
                            for (let me of moveElements) {
                                let { ctrl, props, id, type } = me;
                                changedIds[id] = 1;
                                changedTypes[type] = 1;
                                let moveProps = ctrl['@:{move.props}'];
                                if (isFunction(moveProps)) {
                                    moveProps = moveProps(props);
                                }
                                for (let m of moveProps) {
                                    if (m.use == key) {
                                        props[m.key] += positionOffset;
                                    }
                                }
                                if (ctrl['@:{update.props}']) {
                                    ctrl['@:{update.props}'](props, {
                                        '@:{pctrl#from.props.panel}': 1,
                                        '@:{pctrl#old.left.top}': oldTopLeft,
                                        '@:{pctrl#changed.props}': changedProps
                                    });
                                }
                                changed = 1;
                            }
                        } else {
                            this.render();
                        }
                    } else if (key) {
                        let r;
                        if ((key == 'width' ||
                            key == 'height') &&
                            ((ctrl['@:{modifier}'] & Enum['@:{enum#modifier.sync.size}']) || ((ctrl['@:{modifier}'] & Enum['@:{enum#modifier.width}']) && (ctrl['@:{modifier}'] & Enum['@:{enum#modifier.height}']) && State.get('@:{global#stage.element.keep.ratio}')))) {
                            r = props.height ? props.width / props.height : 0;
                            if (!v) {
                                v = Const['@:{const#to.unit}'](1);
                            }
                        }
                        props[key] = v;

                        if (r != null) {
                            let {
                                '@:{generic#min.w}': minWidth,
                                '@:{generic#max.w}': maxWidth,
                                '@:{generic#min.h}': minHeight,
                                '@:{generic#max.h}': maxHeight
                            } = StageGeneric['@:{generic#query.size.boundaries}'](ctrl, props);
                            if (key == 'width') {
                                if (r) {
                                    props.height = props.width / r;
                                }
                                if (props.height > maxHeight) {
                                    props.height = maxHeight;
                                    props.width = maxHeight * r;
                                } else if (props.height < minHeight) {
                                    props.height = minHeight;
                                    props.width = minHeight * r;
                                }
                            } else {
                                if (r) {
                                    props.width = props.height * r;
                                }

                                if (props.width > maxWidth) {
                                    props.width = maxWidth;
                                    props.height = maxWidth / r;
                                } else if (props.width < minWidth) {
                                    props.width = minWidth;
                                    props.height = minWidth / r;
                                }
                            }
                        }

                        if (ctrl['@:{update.props}']) {
                            moved = ctrl['@:{update.props}'](props, {
                                '@:{pctrl#from.props.panel}': 1,
                                '@:{pctrl#old.left.top}': oldTopLeft,
                                '@:{pctrl#changed.props}': changedProps
                            });
                        }
                        if (!moved &&
                            oldTopLeft) {
                            let newRotatedRect = Transform['@:{transform#rotate.rect}'](props);
                            let n = newRotatedRect['@:{point}'][0];
                            props.x += oldTopLeft.x - n.x;
                            props.y += oldTopLeft.y - n.y;
                        }
                        changed = 1;
                    } else {
                        if (keys &&
                            index) {
                            for (let k of keys) {
                                if (props[k] != firstProps[k]) {
                                    props[k] = firstProps[k];
                                }
                            }
                        }
                        if (ctrl['@:{update.props}']) {
                            ctrl['@:{update.props}'](props, {
                                '@:{pctrl#from.props.panel}': 1,
                                '@:{pctrl#old.left.top}': oldTopLeft,
                                '@:{pctrl#changed.props}': changedProps
                            });
                        }
                        changed = 1;
                    }
                }
                index++;
                if (changed) {
                    for (let me of moveElements) {
                        let n = node(me.id);
                        let vf = Vframe.byNode(n);
                        vf?.invoke('render', me);
                    }
                }
            }
        }
        if (changed) {
            State.fire('@:{event#stage.select.element.props.change}', {
                '@:{ids}': changedIds,
                '@:{types}': changedTypes,
                '@:{props}': changedProps
            });
            //非svg控制点的处理,才记录历史记录
            if (!e['@:{svg.control.point}']) {
                let type;
                if (key == 'x' ||
                    key == 'y') {
                    type = DHistory['@:{history#element.moved}'];
                } else if ((size && !operate) ||
                    key == 'width' ||
                    key == 'height' ||
                    key == 'rx' ||
                    key == 'ry' ||
                    key == 'r' ||
                    key == 'tfootSpacing') {
                    type = DHistory['@:{history#element.modified.size}'];
                } else if (key == 'rotate') {
                    type = DHistory['@:{history#element.rotated}'];
                } else if (kp) {
                    type = DHistory['@:{history#element.modified.ctrl.point}'];
                } else if (mod) {
                    type = DHistory['@:{history#element.modified.mod.point}'];
                } else if (key == 'locked') {
                    type = firstProps.locked ? DHistory['@:{history#element.locked}'] : DHistory['@:{history#element.unlocked}'];
                } else {
                    type = DHistory['@:{history#element.modified.props}'];
                }
                let ename = StageGeneric['@:{generic#query.element.name}'](selectElements);
                DHistory["@:{history#save}"](type, ename, historyKey + '@:{history#element.props.change}' + key, Const['@:{const#hisotry.save.continous.delay}']);
            }
        }
    },
    '@:{update.image.size}<click>'(e: Magix5.MagixPointerEvent) {
        let m = mark(this, '@:{update.img.size}');
        let { key, src } = e.params;
        let selectElements = State.get<Report.StageElement[]>('@:{global#stage.select.elements}');
        let img = new Image(),
            changed,
            changeIds = {},
            changeTypes = {},
            historyKey = '';
        let setSize = () => {
            for (let element of selectElements) {
                let { props, ctrl, id, type } = element;
                if (props.locked ||
                    ((props.pinX || props.pinY) && props.rotate)) {
                    continue;
                }
                historyKey += id + ':';
                let oldRotatedRect = Transform['@:{transform#rotate.rect}'](props);
                let old = oldRotatedRect['@:{point}'][0];
                let newWidth = Const['@:{const#to.unit}'](img.width),
                    newHeight = Const['@:{const#to.unit}'](img.height);
                if (m() &&
                    (newWidth != props.width ||
                        newHeight != props.height)) {
                    changeIds[id] = 1;
                    changeTypes[type] = 1;
                    props.width = newWidth;
                    props.height = newHeight;
                    let newRotatedRect = Transform['@:{transform#rotate.rect}'](props);
                    let n = newRotatedRect['@:{point}'][0];
                    props.x += old.x - n.x;
                    props.y += old.y - n.y;
                    if (ctrl['@:{update.props}']) {
                        ctrl['@:{update.props}'](props);
                    }
                    let n1 = node(element.id);
                    let vf = Vframe.byNode(n1);
                    vf?.invoke('render', element);
                    changed = 1;
                }
            }
            if (changed) {
                State.fire('@:{event#stage.select.element.props.change}', {
                    '@:{ids}': changeIds,
                    '@:{types}': changeTypes,
                    '@:{props}': {
                        '@:{position}': 1
                    }
                });
                let ename = StageGeneric['@:{generic#query.element.name}'](selectElements);
                DHistory["@:{history#save}"](DHistory['@:{history#element.modified.size}'], ename, historyKey + '@:{history#element.props.change}' + key, Const['@:{const#hisotry.save.continous.delay}']);
            }
        };
        img.onload = setSize;
        img.src = src;
        if (img.complete) {
            setSize();
        }
    },
    '@:{change.tab}<click>'({ params }: Magix5.MagixPointerEvent) {
        this.digest({
            selected: params.to
        });
    },
    '@:{sync.props}<click>'() {
        let changed = 0,
            changedProps = {},
            changedIds = {},
            changedTypes = {};
        let e = this.get<Report.StageElement>('e');
        let selectElements = State.get<Report.StageElement[]>('@:{global#stage.select.elements}');
        let first = selectElements[0];
        for (let s of selectElements) {
            let sourceProps = s.props;
            if (s == first ||
                sourceProps.locked) {
                continue;
            }
            changedIds[s.id] = 1;
            changedTypes[s.type] = 1;
            //旋转的情况下，先记录旧矩形的点信息，方便进行平移
            let oldRotatedRect = Transform['@:{transform#rotate.rect}'](sourceProps);
            let currentChangedProps = {} as Report.StageElementProps;
            for (let p of e.ctrl.props) {
                let keys = p.keys || [p.key];
                for (let k of keys) {
                    if (isSkipKey(k, sourceProps)) {
                        continue;
                    }
                    let v = first.props[k];
                    if (sourceProps[k] != v) {
                        currentChangedProps[k] = 1;
                        sourceProps[k] = v;
                        changed = 1;
                        changedProps[k] = 1;
                    }
                }
            }
            if (changed) {
                //计算更新后的矩形信息
                let newRotatedRect = Transform['@:{transform#rotate.rect}'](sourceProps),
                    ox = 0, oy = 0;
                //宽高变化的时候才平移
                if (currentChangedProps.width ||
                    currentChangedProps.height) {
                    //宽高且角度也需要同步，则以中心点为参考点
                    if (currentChangedProps.rotate) {
                        ox = oldRotatedRect['@:{center.x}'] - newRotatedRect['@:{center.x}'];
                        oy = oldRotatedRect['@:{center.y}'] - newRotatedRect['@:{center.y}'];
                    } else {//仅尺寸时，以左上角为参考点
                        let o = oldRotatedRect['@:{point}'][0],
                            n = newRotatedRect['@:{point}'][0];
                        ox = o.x - n.x;
                        oy = o.y - n.y;
                    }
                }
                sourceProps.x += ox;
                sourceProps.y += oy;
                if (s.ctrl['@:{update.props}']) {
                    s.ctrl['@:{update.props}'](sourceProps, {
                        '@:{pctrl#changed.props}': changedProps
                    });
                }
                let n = node(s.id);
                let vf = Vframe.byNode(n);
                vf?.invoke('render', s);
            }
        }
        if (changed) {
            State.fire('@:{event#stage.select.element.props.change}', {
                '@:{ids}': changedIds,
                '@:{types}': changedTypes,
                '@:{props}': changedProps
            });
            let ename = StageGeneric['@:{generic#query.element.name}'](selectElements);
            DHistory["@:{history#save}"](DHistory['@:{history#element.sync.props}'], ename);
        }
    }
});