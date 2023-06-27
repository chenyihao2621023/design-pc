/*
    author:https://github.com/xinglie
*/
'ref@:../index.less';
'ref@:../svg.less';
import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import StageSelection from '../../designer/selection';
import Transform from '../../designer/transform';
import Dragdrop from '../../gallery/mx-dragdrop/index';
import Cursor from '../../gallery/mx-pointer/cursor';
import DesignerProvider from '../../provider/designer';
import EBaseProvider from '../../provider/ebase';
import GenericProvider from '../../provider/generic';

let { has: Has, State, View, taskFinale } = Magix;
export default View.extend({
    tmpl: '@:designer.html',
    ctor() {
        this.set({
            denum: Enum,
            //minSize: () => Const['@:{const#to.unit}'](1),
            cursor: GenericProvider['@:{generic#cursor.shape}'],
            toPx: Const['@:{const#to.px}'],
        });
        let checkStaus = e => {
            if (this['@:{check.status}'](e)) {
                this.render();
            }
        };
        let updateLine = () => {
            let from = State.get('@:{global#stage.element.link.point.from}');
            let element = this.get('element');
            if (from?.src == element.id) {
                let to = State.get('@:{global#stage.element.link.point.to}');
                let solid = false;
                if (to &&
                    to.src != from.src) {
                    solid = true;
                }
                this.digest({
                    solid
                });
            }
        };
        //State.on('@:{event#stage.select.elements.change}', checkStaus);
        State.on('@:{event#stage.element.link.point.drag}', checkStaus);
        State.on('@:{event#stage.element.link.point.find}', updateLine);
        this.on('destroy', () => {
            //State.off('@:{event#stage.select.elements.change}', checkStaus);
            State.off('@:{event#stage.element.link.point.drag}', checkStaus);
            State.off('@:{event#stage.element.link.point.find}', updateLine);
        });
    },
    '@:{check.status}'() {
        let map = StageSelection['@:{selection#get.selected.map}']();
        let elements = State.get('@:{global#stage.select.elements}');
        let count = elements.length;
        let element = this.get('element');
        if (element) {
            let ownerId = this.get('ownerId');
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
            let selected = Has(map, id);
            if (!selected) {
                //element.props['@:{focus.ctrl}'] = '';
                //element.props['@:{show.text}'] = 0;
                let start = this.root;
                while (start &&
                    start.id != '_rd_sc') {
                    if (start.dataset?.as == 'hod') {
                        start.scrollTo(0, 0);
                        break;
                    }
                    start = start.parentNode as HTMLElement;
                }
            }
            let from = State.get('@:{global#stage.element.link.point.from}');
            //console.log(ownerId,from);
            //console.log(this.id,from,ownerId);
            this.set({
                selfGrouped: list,
                forceShowLinks: from && from.ownerId == ownerId,
                sameOwner: !from || from.ownerId == ownerId,
                isSelf: from && (from.src == id),
                linkKey: from && from.key,
                grouped,
                selected,
                count
            });
            return true;
        }
    },
    '@:{drag.svg.link.point}<pointerdown>'(e) {
        e['@:{halt}'] = 1;
        let me = this;
        let element = me.get('element');
        let { id, props } = element;
        let ownerId = this.get('ownerId');
        let { key } = e.params;
        State.set({
            '@:{global#stage.element.link.point.from}': {
                src: id,
                key,
                ownerId
            }
        });
        State.fire('@:{event#pointer.using}', {
            active: 1
        });
        State.fire('@:{event#stage.scrolling}', {
            active: 1
        });
        State.fire('@:{event#stage.element.link.point.drag}');
        let pos = Transform["@:{transform#real.to.nearest.coord}"](me.root, {
            x: e.pageX,
            y: e.pageY,
            f: 1
        });
        this.set({
            solid: false,
            startX: props[key + 'X'],
            startY: props[key + 'Y']
        });

        let { rotate, x, y, width, height } = props;
        width = Const['@:{const#to.px}'](width);
        height = Const['@:{const#to.px}'](height);
        x = Const['@:{const#to.px}'](x);
        y = Const['@:{const#to.px}'](y);
        let c = {
            x: x + width / 2,
            y: y + height / 2
        };
        let offsetInfo,
            moveInfo,
            movePoint = async () => {
                let tx = moveInfo.pageX,
                    ty = moveInfo.pageY;
                //console.log(tx, ty);
                pos = Transform["@:{transform#real.to.nearest.coord}"](me.root, {
                    x: tx,
                    y: ty,
                    f: 1
                });
                let deg = Transform["@:{transform#get.point.deg}"](pos, c);
                //console.log(deg);
                let dest = Transform["@:{transform#get.rotated.point}"](pos, c, deg - rotate);
                //console.log(dest, pos, c, props.rotate, deg);
                this.digest({
                    current: dest
                });
                if (offsetInfo && !offsetInfo['@:{interval.move.event#called}']) {
                    offsetInfo['@:{interval.move.event#called}'] = 1;
                    await taskFinale();
                    offsetInfo['@:{interval.move.event#ready}']();
                }
            };
        let watchIntervalMove = e => {
            offsetInfo = e;
            movePoint();
        };
        Cursor["@:{show.by.type}"]('crosshair');
        State.on('@:{event#stage.auto.scroll}', watchIntervalMove);
        me['@:{drag.drop}'](e, (evt) => {
            State.fire('@:{event#drag.element.move}', evt);
            moveInfo = evt;
            movePoint();
        }, () => {
            this.digest({
                current: 0
            });
            State.off('@:{event#stage.auto.scroll}', watchIntervalMove);
            State.fire('@:{event#drag.element.stop}');
            let to = State.get('@:{global#stage.element.link.point.to}');
            if (to &&
                to.src != id) {
                State.fire('@:{event#stage.element.link.line.add}', {
                    from: {
                        id,
                        key,
                        ownerId
                    },
                    to: {
                        id: to.src,
                        key: to.key
                    }
                });
            }
            Cursor["@:{hide}"]();
            State.set({
                '@:{global#stage.element.link.point.from}': null,
                '@:{global#stage.element.link.point.to}': null
            });
            State.fire('@:{event#pointer.using}');
            State.fire('@:{event#stage.scrolling}');
            State.fire('@:{event#stage.element.link.point.drag}');
        });
    },
    '@:{link.point.over}<pointerover>'(e) {
        let from = State.get('@:{global#stage.element.link.point.from}');
        if (from) {
            let element = this.get('element');
            State.set({
                '@:{global#stage.element.link.point.to}': {
                    src: element.id,
                    key: e.params.key
                }
            });
            State.fire('@:{event#stage.element.link.point.find}');
        }
    },
    '@:{link.point.out}<pointerout>'(e) {
        let to = State.get('@:{global#stage.element.link.point.to}');
        if (to) {
            State.set({
                '@:{global#stage.element.link.point.to}': null
            });
            State.fire('@:{event#stage.element.link.point.find}');
        }
    },
}).static({
    /**
     * 更新流程图连接点
     * @param points 连接点
     * @param center 中心点
     * @param rotate 旋转角度
     * @param props 属性
     */
    '@:{update.props}'(points, center, rotate, props) {
        let index = 0;
        for (let p of points) {
            let deg = Transform["@:{transform#get.point.deg}"](p, center);
            let r = Transform["@:{transform#get.rotated.point}"](p, center, deg + rotate);
            props[`p${index}XReal`] = r.x;
            props[`p${index}YReal`] = r.y;
            props[`p${index}X`] = p.x;
            props[`p${index}Y`] = p.y;
            index++;
        }
    },

    /**
     * 获取流程图公用属性
     * @param x x坐标
     * @param y y坐标
     * @param width 默认宽
     * @param height 默认高
     * @returns 共用属性
     */
    '@:{get.props}'(x, y, width, height) {
        return {
            height: Const['@:{const#to.unit}'](height),
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            width: Const['@:{const#to.unit}'](width),
            linewidth: Const['@:{const#to.unit}'](2),
            color: '#000',
            fillColor: '',
            padding: Const['@:{const#to.unit}'](10),
            dash: 0,
            text: '',
            cap: false,
            locked: false,
            textForecolor: '#000',
            textFontfamily: 'tahoma',
            textBackground: '',
            textFontsize: Const['@:{const#to.unit}'](14),
            textLetterspacing: 0,
        };
    },
    '@:{shared.props}': [{
        key: 'textX',
        read: Transform["@:{transform#to.show.value}"],
        json: 1
    }, {
        key: 'textY',
        read: Transform["@:{transform#to.show.value}"],
        json: 1
    }, {
        key: 'textWidth',
        read: Transform["@:{transform#to.show.value}"],
        json: 1
    }, {
        key: 'textHeight',
        read: Transform["@:{transform#to.show.value}"],
        json: 1
    }, {
        key: 'padding',
        json: 1,
        '@:{is.scale.and.unit.field}': 1
    }, {
        key: 'linewidth',
        '@:{is.scale.and.unit.field}': 1,
        read: Transform["@:{transform#to.show.value}"],
        json: 1
    },
    DesignerProvider['@:{designer#shared.props.x}'],
    DesignerProvider['@:{designer#shared.props.y}'],
    DesignerProvider['@:{designer#shared.props.width}'](20),
    DesignerProvider['@:{designer#shared.props.height}'](20),
    DesignerProvider['@:{designer#shared.props.alpha}'],
    DesignerProvider['@:{designer#shared.props.rotate}'],
    DesignerProvider['@:{designer#shared.props.spliter}'],
    DesignerProvider['@:{designer#shared.props.svg.color}'],
    DesignerProvider['@:{designer#shared.props.svg.fill.color}'],
    DesignerProvider['@:{designer#shared.props.svg.dash}'],
    DesignerProvider['@:{designer#shared.props.svg.cap}'],
    DesignerProvider['@:{designer#shared.props.spliter}'], {
        tip: '@:{lang#props.line.text}',
        key: 'text',
        type: Enum["@:{enum#prop.text.area}"],
        json: 1,
    },
    DesignerProvider['@:{designer#shared.props.fontsize}'](0, 0, 'textFontsize'),
    DesignerProvider['@:{designer#shared.props.fontfamily}']('textFontfamily'),
    DesignerProvider['@:{designer#shared.props.letter.sapcing}']('textLetterspacing'),
    DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.forecolor}', 'textForecolor'),
    DesignerProvider['@:{designer#shared.props.spliter}'],
    DesignerProvider['@:{designer#shared.props.ename}'],
    DesignerProvider['@:{designer#shared.props.locked}']]
}).merge(Dragdrop, EBaseProvider);