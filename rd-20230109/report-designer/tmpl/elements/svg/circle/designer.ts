/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../../designer/const';
import StageGeneric from '../../../designer/generic';
import DHistory from '../../../designer/history';
import Transform from '../../../designer/transform';
import Cursor from '../../../gallery/mx-pointer/cursor';
import DesignerProvider from '../../../provider/designer';
import Designer from '../designer';
let { State } = Magix;
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./index'
        });
    }
}).static({
    type: 'svg/circle',
    title: '@:{lang#elements.svg.circle}',
    icon: '&#xe65a;',
    '@:{key.special.points}': ['rxr'],
    '@:{move.props}': [...DesignerProvider['@:{designer#shared.move.props}'], {
        key: 'centerX',
        use: 'x'
    }, {
        key: 'centerY',
        use: 'y'
    }, {
        key: 'rxrX',
        use: 'x'
    }, {
        key: 'rxrY',
        use: 'y'
    }],
    '@:{update.props}'(props) {
        let { r, centerX, centerY } = props;
        props.width = 2 * r;
        props.height = 2 * r;
        props.x = centerX - r;
        props.y = centerY - r;
        props.rxrX = props.x + 2 * r;
        props.rxrY = props.y + r;
    },
    '@:{drag.special.key}'(element, e, key, host) {
        State.fire('@:{event#pointer.using}', {
            active: 1
        });
        State.fire('@:{event#stage.scrolling}', {
            active: 1,
        });
        let { props, ctrl } = element;
        let moved;
        let { r, ename } = props;
        let minSize = 0;
        let scale = State.get('@:{global#stage.scale}');
        for (let p of ctrl.props) {
            if (p.key == 'r') {
                minSize = p.min() * scale;
            }
        }
        let { eventTarget } = e;
        host['@:{drag.drop}'](e, (evt) => {
            if (!moved) {
                Cursor["@:{show}"](eventTarget);
                moved = 1;
            }
            let xDiff = Const['@:{const#to.unit}'](evt.pageX - e.pageX);
            let newR = r + xDiff;
            if (newR < minSize) {
                newR = minSize;
            }
            props.r = newR;
            StageGeneric['@:{generic#update.stage.element}'](element, '@:{size}', host.owner);
        }, () => {
            if (moved) {
                Cursor["@:{hide}"]();
                DHistory['@:{history#save}'](DHistory['@:{history#element.modified.size}'], ename);
            }
            State.fire('@:{event#pointer.using}');
            State.fire('@:{event#stage.scrolling}');
        });
    },
    '@:{get.props}'(x, y) {
        return {
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            centerX: Const['@:{const#to.unit}'](x + 75),
            centerY: Const['@:{const#to.unit}'](y + 75),
            r: Const['@:{const#to.unit}'](75),
            linewidth: Const['@:{const#to.unit}'](1),
            fillcolor: '',
            dash: 0,
            cap: false,
            color: '#000',
            animations: [],
            locked: false
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.svg.width}'],
        DesignerProvider['@:{designer#shared.props.svg.height}'],
        DesignerProvider['@:{designer#shared.props.alpha}'], {
            key: 'centerX',
            '@:{is.scale.and.unit.field}': 1,
            read: Transform["@:{transform#to.show.value}"],
            json: 1
        }, {
            key: 'centerY',
            '@:{is.scale.and.unit.field}': 1,
            read: Transform["@:{transform#to.show.value}"],
            json: 1
        },
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.radius}',
            key: 'r',
            min: () => Const["@:{const#to.unit}"](20)
        },
        DesignerProvider['@:{designer#shared.props.svg.line.width}'],
        DesignerProvider['@:{designer#shared.props.svg.color}'],
        DesignerProvider['@:{designer#shared.props.svg.dash}'],
        DesignerProvider['@:{designer#shared.props.svg.fill.color}'],
        DesignerProvider['@:{designer#shared.props.svg.cap}'],
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});