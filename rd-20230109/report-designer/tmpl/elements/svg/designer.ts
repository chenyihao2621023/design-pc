/*
    author:https://github.com/xinglie
*/
'ref@:../index.less';
'ref@:../svg.less';
import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import StageGeneric from '../../designer/generic';
import DHistory from '../../designer/history';
import StageSelection from '../../designer/selection';
import Transform from '../../designer/transform';
import Dragdrop from '../../gallery/mx-dragdrop/index';
import Cursor from '../../gallery/mx-pointer/cursor';
import PointerTip from '../../gallery/mx-pointer/tip';
import EBaseProvider from '../../provider/ebase';
let { atan2, PI } = Math;
let { has, State, View } = Magix;
export default View.extend({
    tmpl: '@:designer.html',
    init() {
        this.set({
            denum: Enum,
            hmSize: Const['@:{const#element.auto.show.icon.less.than}'],
            //minSize: () => Const['@:{const#to.unit}'](1),
            toPx: Const['@:{const#to.px}'],
        });
    },
    '@:{check.status}'() {
        let map = StageSelection['@:{selection#get.selected.map}']();
        let elements = State.get('@:{global#stage.select.elements}');
        let count = elements.length;
        let element = this.get('element');
        if (element) {
            let id = element.id;
            let groups = State.get('@:{global#stage.elements.groups}');
            let list = groups[id],
                grouped = 0;
            if (!map[id] &&
                list) {
                for (let n of list) {
                    if (map[n]) {
                        grouped = 1;
                        break;
                    }
                }
            }
            let selected = has(map, id);
            if (!selected) {
                element.props['@:{focus.ctrl}'] = '';
            }
            this.set({
                selfGrouped: list,
                grouped,
                selected,
                count
            });
        }
    },
    '@:{start.points.rotate}<pointerdown>'(e: Magix5.MagixPointerEvent) {
        e['@:{halt}'] = 1;
        let me = this;
        let element = me.get('element');
        let { props, ctrl } = element;
        let { x, y, width, height } = props;
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
        let pos = Transform["@:{transform#real.to.nearest.coord}"](me.root, {
            x: e.pageX,
            y: e.pageY,
            f: 1
        });
        let sdeg = atan2(pos.y - c.y, pos.x - c.x),
            moved;
        let bak = {};
        let keyPoints = ctrl['@:{get.key.points}'] ? ctrl['@:{get.key.points}'](props) : ctrl['@:{key.points}'];
        for (let p of keyPoints) {
            bak[p + 'X'] = Const['@:{const#to.px}'](props[p + 'X']);
            bak[p + 'Y'] = Const['@:{const#to.px}'](props[p + 'Y']);
        }
        let eventTarget = e.eventTarget;
        Cursor["@:{show}"](eventTarget);
        let moveEvent,
            altKey = e.altKey,
            page = State.get('@:{global#stage.page}'),
            snapElement = page.snap,
            altPressed = snapElement ? altKey : !altKey;
        let moveCallback = () => {
            if (moveEvent) {
                let { pageX, pageY } = moveEvent;
                if (!moved) {
                    moved = 1;
                }
                pos = Transform["@:{transform#real.to.nearest.coord}"](me.root, {
                    x: pageX,
                    y: pageY,
                    f: 1
                });
                let deg = atan2(pos.y - c.y, pos.x - c.x);
                deg = (((deg - sdeg) * 180 / PI + 360) | 0) % 360;
                if (!altPressed) {
                    deg = StageGeneric['@:{generic#query.snap.degree}'](deg);
                }
                for (let p of keyPoints) {
                    let o = {
                        x: bak[p + 'X'],
                        y: bak[p + 'Y']
                    };
                    let d = Transform["@:{transform#get.point.deg}"](o, c) + deg;
                    o = Transform["@:{transform#get.rotated.point}"](o, c, d);
                    props[p + 'X'] = Const['@:{const#to.unit}'](o.x);
                    props[p + 'Y'] = Const['@:{const#to.unit}'](o.y);
                }
                this.digest({
                    pos,
                    element
                });
                State.fire('@:{event#stage.select.element.props.change}', {
                    '@:{ids}': {
                        [element.id]: 1
                    },
                    '@:{types}': {
                        [element.type]: 1
                    },
                    '@:{props}': {
                        '@:{protate}': 1
                    }
                });

                PointerTip['@:{show.text}'](`${deg}°`);
                PointerTip['@:{update.position}'](pageX, pageY);
            }
        };
        let watchKeypress = e => {
            altPressed = snapElement ? e['@:{keypress#alt.key}'] : !e['@:{keypress#alt.key}'];
            moveCallback();
        };
        State.on('@:{event#key.press}', watchKeypress);
        me['@:{drag.drop}'](e, (ex) => {
            moveEvent = ex;
            moveCallback();
        }, () => {
            State.off('@:{event#key.press}', watchKeypress);
            //ctrl['@:{update.props}'](props);
            this.set({
                pos: 0,
                //element,
            });
            Cursor["@:{hide}"]();
            if (moved) {
                StageGeneric['@:{generic#update.stage.element}'](element, '@:{protated}', this.owner);
                let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
                DHistory["@:{history#save}"](DHistory['@:{history#element.modified.ctrl.point}'], ename);
            } else {
                this.digest();
            }
            State.fire('@:{event#pointer.using}');
            State.fire('@:{event#stage.scrolling}');
            PointerTip['@:{hide}']();
        });
    },
    '@:{drag.svg.special.key.point}<pointerdown>'(e) {
        e['@:{halt}'] = 1;
        let element = this.get('element');
        let { ctrl } = element;
        let { key } = e.params;
        ctrl['@:{drag.special.key}'](element, e, key, this);
    },
}).merge(Dragdrop, EBaseProvider);