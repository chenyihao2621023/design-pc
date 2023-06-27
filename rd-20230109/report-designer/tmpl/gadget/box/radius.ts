/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import CellProvider from '../../provider/cell';
let { View, dispatch, State } = Magix;
let BorderRadiusText = ['@:{lang#dir.lefttop}',
    '@:{lang#dir.righttop}',
    '@:{lang#dir.rightbottom}',
    '@:{lang#dir.leftbottom}'];
let MODE_TIDY = 1,
    MODE_SIMPLE = 2,
    MODE_FULL = 3;
export default View.extend({
    tmpl: '@:./radius.html',
    init() {
        let min = this.get('mmin');
        this.set({
            MODE_TIDY,
            MODE_FULL,
            MODE_SIMPLE,
            mode: MODE_TIDY,
            step: () => Const["@:{const#unit.step}"](),
            fixed: () => Const["@:{const#unit.fixed}"](),
            max: () => Const["@:{const#to.unit}"](min(Const['@:{const#page.max.width}'], Const['@:{const#page.max.height}'])),
            brt: BorderRadiusText,
        });
    },
    assign(data) {
        let { props, disabled, defined } = data;
        let radius = props[defined.key];
        let i = CellProvider['@:{cell#extract.radius}'](radius);
        let left = i['@:{r#left}'],
            right = i['@:{r#right}'];
        if (defined.scale) {
            let s = State.get('@:{global#stage.scale}');
            CellProvider['@:{cell#scale.radius.part}'](left, 1 / s);
            CellProvider['@:{cell#scale.radius.part}'](right, 1 / s);
        }
        this.set({
            disabled,
            defined,
            left,
            right,
            items() {
                let unit = State.get('@:{global#stage.unit}');
                return [{
                    text: '%',
                    value: '%',
                }, {
                    text: unit,
                    value: unit
                }]
            },
        });
    },
    render() {
        this.digest();
    },
    '@:{update.radius}<input,change>'(e) {
        this['@:{stop.propagation}'](e);
        let { dest, at } = e.params;
        let left = this.get('left'),
            right = this.get('right'),
            defined = this.get('defined'),
            mode = this.get('mode');
        dest[at] = e.value;
        if (mode == MODE_TIDY) {
            for (let i = 2; i < left.length; i++) {
                left[i] = left[0];
                left[++i] = left[1];
            }
            mode = MODE_SIMPLE;
        }
        if (mode == MODE_SIMPLE) {
            for (let i = left.length; i--;) {
                right[i] = left[i];
            }
        }
        if (defined.scale) {
            let s = State.get('@:{global#stage.scale}');
            CellProvider['@:{cell#scale.radius.part}'](left, s);
            CellProvider['@:{cell#scale.radius.part}'](right, s);
        }
        let radius = CellProvider['@:{cell#build.radius}'](left, right);
        dispatch(this.root, 'change', {
            use: 'radius',
            pkey: defined.key,
            radius
        });
    },
    '@:{change.mode}<click>'({ params }) {
        let { to } = params,
            changed, radius;
        this.digest({
            mode: to
        });
        let left = this.get('left'),
            right = this.get('right');
        if (to == MODE_TIDY) {
            for (let i = 2; i < left.length; i++) {
                if (left[i] != left[0]) {
                    left[i] = left[0];
                    changed = 1;
                }
                if (left[i + 1] != left[1]) {
                    left[i + 1] = left[1];
                    changed = 1;
                }
                i++;
            }
            to = MODE_TIDY;
        }
        if (to == MODE_TIDY) {
            for (let i = left.length; i--;) {
                if (right[i] != left[i]) {
                    right[i] = left[i];
                    changed = 1;
                }
            }
            if (changed) {
                radius = CellProvider['@:{cell#build.radius}'](left, right);
            }
        }
        if (changed) {
            let defined = this.get('defined');
            dispatch(this.root, 'change', {
                use: 'radius',
                pkey: defined.key,
                radius
            });
        }
    }
});