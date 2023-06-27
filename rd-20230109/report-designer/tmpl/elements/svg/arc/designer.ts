/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../../designer/const';
import Enum from '../../../designer/enum';
import StageGeneric from '../../../designer/generic';
import DHistory from '../../../designer/history';
import Transform from '../../../designer/transform';
import Cursor from '../../../gallery/mx-pointer/cursor';
import DesignerProvider from '../../../provider/designer';
import Designer from '../designer';
let { State } = Magix;
let { PI, min, cos, sin, hypot, } = Math;
let resetPoints = props => {
    let { centerX,
        centerY,
        rotate,
        rx, ry } = props;
    let center = Transform["@:{transform#get.linear.equation.by.deg}"](centerX, centerY, rotate);
    let tangentK = -1 / center.k;
    let c = {
        x: centerX,
        y: centerY
    };
    let topPoint = {
        x: centerX,
        y: centerY - ry
    };
    let leftPoint = {
        x: centerX - rx,
        y: centerY
    };
    let leftTanget = Transform["@:{transform#get.rotated.point}"](leftPoint, c, rotate + 180);
    let topTanget = Transform["@:{transform#get.rotated.point}"](topPoint, c, rotate + 270);
    let leftB = leftTanget.y - leftTanget.x * tangentK;
    let topB = topTanget.y - topTanget.x * center.k;

    let leftTopX = (topB - leftB) / (tangentK - center.k);
    let leftTopY = tangentK * leftTopX + leftB;
    if (rotate == 0) {
        leftTopX = centerX - rx;
        leftTopY = centerY - ry;
    } else if (rotate == 180) {
        leftTopX = centerX + rx;
        leftTopY = centerY + ry;
    }
    let leftTopPoint = {
        x: leftTopX,
        y: leftTopY
    };
    let newDeg = Transform["@:{transform#get.point.deg}"](leftTopPoint, c);
    let { x, y } = Transform["@:{transform#get.rotated.point}"](leftTopPoint, c, newDeg - rotate);
    props.x = x;
    props.y = y;
    props.width = 2 * rx;
    props.height = 2 * ry;
    props.rxrX = x + 2 * rx;
    props.rxrY = y + ry;
    props.ryrX = x + rx;
    props.ryrY = y + 2 * ry;
};
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./index'
        });
    }
}).static({
    type: 'svg/arc',
    title: '@:{lang#elements.arc}',
    icon: '&#xe654;',
    '@:{circle.paths}': [['cr', 'center']],
    '@:{path.points}': ['M', 'startA', 'L', 'start', 'M', 'endA', 'L', 'end'],
    '@:{key.special.points}': ['rxr', 'ryr', 'start', 'end'],
    '@:{modifier}': Enum['@:{enum#modifier.rotate}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{update.props}'(props: Report.StageElementProps,
        actions: Report.StageElementPropsUpdateActions) {
        let { rx, ry, x, y,
            startAngle, endAngle, } = props;
        props.width = 2 * rx;
        props.height = 2 * ry;
        let old = actions && actions['@:{pctrl#old.left.top}'];
        if (actions?.['@:{pctrl#from.props.panel}'] &&
            old) {
            let newRotatedRect = Transform['@:{transform#rotate.rect}'](props);
            let n = newRotatedRect['@:{point}'][0];
            props.x += old.x - n.x;
            props.y += old.y - n.y;
            x = props.x;
            y = props.y
        }
        props.centerX = x + rx;
        props.centerY = y + ry;
        props.rxrX = x + 2 * rx;
        props.rxrY = y + ry;
        props.ryrX = x + rx;
        props.ryrY = y + 2 * ry;
        if (endAngle < startAngle) {
            [endAngle, startAngle] = [startAngle, endAngle];
        }
        if (startAngle > 0) {
            startAngle -= 360;
        }
        if (endAngle < 0) {
            endAngle += 360;
        }
        let ANGLE = PI / 180;
        let r = min(rx, ry) / 2;
        props.startAX = props.centerX + rx * cos(startAngle * ANGLE);
        props.startAY = props.centerY + ry * sin(startAngle * ANGLE);
        props.endAX = props.centerX + rx * cos(endAngle * ANGLE);
        props.endAY = props.centerY + ry * sin(endAngle * ANGLE);

        props.startX = props.centerX + r * cos(startAngle * ANGLE);
        props.startY = props.centerY + r * sin(startAngle * ANGLE);
        props.endX = props.centerX + r * cos(endAngle * ANGLE);
        props.endY = props.centerY + r * sin(endAngle * ANGLE);
        props.startAngle = startAngle;
        props.endAngle = endAngle;

        props.cr = r;
    },
    '@:{drag.start.end.point}'(element, e, key, host) {
        State.fire('@:{event#pointer.using}', {
            active: 1
        });
        State.fire('@:{event#stage.scrolling}', {
            active: 1,
        });
        let { props, ctrl } = element;
        let moved;
        let { centerX,
            centerY,
            rotate, ename } = props;
        let start = props[`${key}Angle`];
        rotate = (360 + rotate) % 360;
        let pos = Transform["@:{transform#real.to.stage.coord}"]({
            x: e.pageX,
            y: e.pageY
        });
        let c = {
            x: Const['@:{const#to.px}'](centerX),
            y: Const['@:{const#to.px}'](centerY)
        };
        let deg = Transform["@:{transform#get.point.deg}"](pos, c);
        let { eventTarget } = e;
        Cursor["@:{show}"](eventTarget);
        host['@:{drag.drop}'](e, (evt) => {
            if (!moved) {
                moved = 1;
            }
            let mpos = Transform["@:{transform#real.to.stage.coord}"]({
                x: evt.pageX,
                y: evt.pageY
            });

            let mdeg = Transform["@:{transform#get.point.deg}"](mpos, c);
            let diff = mdeg - deg;
            let d = start + diff;
            if (d > 360) {
                d -= 360
            } else if (d < -360) {
                d += 360
            };
            props[`${key}Angle`] = d;
            StageGeneric['@:{generic#update.stage.element}'](element, '@:{angle}', host.owner);
        }, () => {
            Cursor["@:{hide}"]();
            if (moved) {
                DHistory['@:{history#save}'](DHistory['@:{history#element.modified.props}'], ename);
            }
            State.fire('@:{event#pointer.using}');
            State.fire('@:{event#stage.scrolling}');
        });
    },
    '@:{drag.special.key}'(element, e, key, host) {
        if (key == 'start' || key == 'end') {
            this['@:{drag.start.end.point}'](element, e, key, host);
        } else {
            State.fire('@:{event#pointer.using}', {
                active: 1
            });
            State.fire('@:{event#stage.scrolling}', {
                active: 1,
            });
            let { props, ctrl } = element;
            let moved;
            let { centerX,
                centerY,
                rx,
                ry,
                rotate,
                ename } = props;
            centerX = Const['@:{const#to.px}'](centerX);
            centerY = Const['@:{const#to.px}'](centerY);
            rx = Const['@:{const#to.px}'](rx);
            ry = Const['@:{const#to.px}'](ry);
            rotate = (360 + rotate) % 360;
            let dragRight = key == 'rxr',
                minRX = 0,
                minRY = 0;

            let scale = State.get('@:{global#stage.scale}');
            for (let p of ctrl.props) {
                if (p.key == 'rx') {
                    minRX = Const["@:{const#to.px}"](p.min()) * scale;
                } else if (p.key == 'ry') {
                    minRY = Const["@:{const#to.px}"](p.min()) * scale;
                }
            }
            let minSize = dragRight ? minRX : minRY;
            let pos = Transform["@:{transform#real.to.stage.coord}"]({
                x: e.pageX,
                y: e.pageY
            });
            console.log(pos, centerX, centerY);
            let { k: centerK,
                b: centerB } = Transform["@:{transform#get.linear.equation.by.deg}"](centerX, centerY, rotate);
            let verticalK = -1 / centerK;
            let vertialCenterB = centerY - centerX * verticalK;

            let k = dragRight ? verticalK : centerK;
            let startMouseB = pos.y - pos.x * k;
            let startX = pos.x,
                startY = pos.y;
            let { eventTarget } = e;
            Cursor["@:{show}"](eventTarget);
            host['@:{drag.drop}'](e, (evt) => {
                if (!moved) {
                    moved = 1;
                }
                let mpos = Transform["@:{transform#real.to.stage.coord}"]({
                    x: evt.pageX,
                    y: evt.pageY
                });
                let lessZero = k * mpos.x + startMouseB - mpos.y < 0;
                let movedB = mpos.y - mpos.x * k;
                let movedX,
                    movedY;
                if (dragRight) {
                    movedX = (centerB - movedB) / (verticalK - centerK);
                } else {
                    movedX = (vertialCenterB - movedB) / (centerK - verticalK);
                }
                movedY = k * movedX + movedB;


                if (rotate == 0 ||
                    rotate == 180) {
                    if (dragRight) {
                        movedX = mpos.x;
                        movedY = centerY;
                        lessZero = mpos.x > pos.x;
                    } else {
                        lessZero = mpos.y > pos.y;
                        movedX = centerX;
                        movedY = mpos.y;
                    }
                } else if (rotate == 90 ||
                    rotate == 270) {
                    if (dragRight) {
                        movedX = centerX;
                        movedY = mpos.y;
                        lessZero = mpos.y > pos.y;
                    } else {
                        movedX = mpos.x;
                        movedY = centerY;
                        lessZero = mpos.x > pos.x;
                    }
                }
                let scale = 1;
                if (dragRight) {
                    if (rotate >= 0 &&
                        rotate < 180) {
                        if (lessZero) {
                            scale = 1;
                        } else {
                            scale = -1;
                        }
                    } else {
                        if (lessZero) {
                            scale = -1;
                        } else {
                            scale = 1;
                        }
                    }
                } else {
                    if (rotate >= 90 &&
                        rotate < 270) {
                        if (lessZero) {
                            scale = -1;
                        } else {
                            scale = 1;
                        }
                    } else {
                        if (lessZero) {
                            scale = 1;
                        } else {
                            scale = -1;
                        }
                    }
                }

                let distance = hypot(movedX - startX, movedY - startY);
                let half = distance / 2;
                let destRotate = dragRight ? rotate : 90 + rotate;
                let size = dragRight ? rx : ry;
                //console.log(movedY, movedX, startY, startX);
                if (size + scale * half - minSize <= 0) {
                    half = (minSize - size) / scale;
                }
                props.centerX = Const['@:{const#to.unit}'](centerX + scale * half * cos(destRotate * PI / 180));
                props.centerY = Const['@:{const#to.unit}'](centerY + scale * half * sin(destRotate * PI / 180));
                if (dragRight) {
                    props.rx = Const['@:{const#to.unit}'](rx + scale * half);
                } else {
                    props.ry = Const['@:{const#to.unit}'](ry + scale * half);
                }
                resetPoints(props);
                StageGeneric['@:{generic#update.stage.element}'](element, '@:{sie}', host.owner);
            }, () => {
                Cursor["@:{hide}"]();
                if (moved) {
                    DHistory['@:{history#save}'](DHistory['@:{history#element.modified.props}'], ename);
                }
                State.fire('@:{event#pointer.using}');
                State.fire('@:{event#stage.scrolling}');
            });
        }
    },
    '@:{get.props}'(x, y) {
        return {
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rxrY: Const['@:{const#to.unit}'](y + 50),
            ryrX: Const['@:{const#to.unit}'](x + 100),
            ryrY: Const['@:{const#to.unit}'](y + 100),
            centerX: Const['@:{const#to.unit}'](x + 100),
            centerY: Const['@:{const#to.unit}'](y + 50),
            rx: Const['@:{const#to.unit}'](100),
            ry: Const['@:{const#to.unit}'](80),
            startAngle: -160,
            endAngle: 20,
            rotate: 0,
            linewidth: Const['@:{const#to.unit}'](1),
            fillcolor: '',
            dash: 0,
            linejoin: 'meter',
            cap: false,
            animations: [],
            color: '#000',
            closed: false,
            locked: false
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.svg.width}'],
        DesignerProvider['@:{designer#shared.props.svg.height}'], {
            key: 'centerX',
            read: Transform['@:{transform#to.show.value}'],
            json: 1
        }, {
            key: 'centerY',
            read: Transform['@:{transform#to.show.value}'],
            json: 1
        }, {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.rx}',
            key: 'rx',
            min: () => Const["@:{const#to.unit}"](20)
        }, {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.ry}',
            key: 'ry',
            min: () => Const["@:{const#to.unit}"](10)
        },
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.rotate}'],
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            tip: '@:{lang#props.start.angle}',
            type: Enum["@:{enum#prop.number}"],
            read: angle => +angle.toFixed(1),
            key: 'startAngle',
            min: -360,
            max: 360,
            step: 0.1,
            fixed: 1,
            json: 1
        }, {
            tip: '@:{lang#props.end.angle}',
            type: Enum["@:{enum#prop.number}"],
            key: 'endAngle',
            read: angle => +angle.toFixed(1),
            min: -360,
            max: 360,
            step: 0.1,
            fixed: 1,
            json: 1
        },
        DesignerProvider['@:{designer#shared.props.svg.line.width}'],
        DesignerProvider['@:{designer#shared.props.svg.color}'],
        DesignerProvider['@:{designer#shared.props.svg.dash}'],
        DesignerProvider['@:{designer#shared.props.svg.fill.color}'],
        DesignerProvider['@:{designer#shared.props.svg.cap}'],
        DesignerProvider['@:{designer#shared.props.svg.line.join}'],
        DesignerProvider['@:{designer#shared.props.svg.closed}'],
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});