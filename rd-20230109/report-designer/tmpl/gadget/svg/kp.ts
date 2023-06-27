/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Transform from '../../designer/transform';
let { has, View, dispatch, inside } = Magix;
let { random } = Math;
export default View.extend({
    tmpl: '@:./kp.html',
    init() {
        this.set({
            fixed: () => Const["@:{const#unit.fixed}"](),
            step: () => Const["@:{const#unit.step}"](),
            read: Transform["@:{transform#to.show.value}"]
        })
    },
    assign(extra) {
        let { props, disabled, defined } = extra;
        this.set({
            disabled,
            points: Transform['@:{transform#get.key.point}'](props),
            props,
            mod: defined.mod,
            min: defined.min
        });
    },
    render() {
        this.digest();
    },
    '@:{update.key.point}<input>'(e) {
        let { i, type } = e.params;
        let props = this.get('props');
        props['ctrl' + i + type] = Transform["@:{transform#to.real.value}"](e.value);
        dispatch(this.root, 'change', {
            use: 'kp',
            isKP: 1
        });
    },
    '@:{add.key.point}<click>'({ ctrlKey, metaKey }: Magix5.MagixPointerEvent) {
        let props = this.get('props');
        let keyPoints = Transform['@:{transform#get.key.point}'](props);
        let { x, y, width, height } = props;
        let nextIndex = keyPoints.length + 1;
        let nextX = x + (width * random());
        let nextY = y + (height * random());
        if (ctrlKey || metaKey) {
            while (nextIndex) {
                props[`ctrl${nextIndex}X`] = props[`ctrl${nextIndex - 1}X`];
                props[`ctrl${nextIndex}Y`] = props[`ctrl${nextIndex - 1}Y`];
                if (nextIndex == 2) {
                    break;
                }
                nextIndex--;
            }
            let focus = props['@:{focus.ctrl}'];
            if (focus) {//插在前面移动聚焦点
                let nextIndex = 1;
                while (nextIndex) {
                    let key = 'ctrl' + nextIndex;
                    if (focus == key) {
                        props['@:{focus.ctrl}'] = 'ctrl' + (nextIndex + 1);
                        break;
                    }
                    nextIndex++;
                }
            }
            props.ctrl1X = nextX;
            props.ctrl1Y = nextY;
        } else {
            props[`ctrl${nextIndex}X`] = nextX;
            props[`ctrl${nextIndex}Y`] = nextY;
        }
        delete props['@:{cached.key.points}'];
        delete props['@:{cached.move.props}'];
        dispatch(this.root, 'change', {
            use: 'kp',
            isKP: 1
        });
    },
    '@:{remove.key.point}<click>'(e) {
        let props = this.get('props');
        let { i } = e.params;
        let next = i + 1;

        while (1) {
            if (has(props, `ctrl${next}X`)) {
                props[`ctrl${i}X`] = props[`ctrl${next}X`];
                props[`ctrl${i}Y`] = props[`ctrl${next}Y`];
                next++;
                i++;
            } else {
                break;
            }
        }
        delete props[`ctrl${i}X`];
        delete props[`ctrl${i}Y`];

        delete props['@:{cached.key.points}'];
        delete props['@:{cached.move.props}'];
        dispatch(this.root, 'change', {
            use: 'kp',
            isKP: 1
        });
    },
    '@:{move.at}<click>'({ params }) {
        let { at, d: direction } = params;
        let props = this.get('props');
        let nowX = props[`ctrl${at}X`],
            nowY = props[`ctrl${at}Y`];
        props[`ctrl${at}X`] = props[`ctrl${at + direction}X`];
        props[`ctrl${at}Y`] = props[`ctrl${at + direction}Y`];
        props[`ctrl${at + direction}X`] = nowX;
        props[`ctrl${at + direction}Y`] = nowY;
        dispatch(this.root, 'change', {
            use: 'kp',
            isKP: 1
        });
    },
    '@:{focus.key.point}<pointerover>'(e: Magix5.MagixPointerEvent) {
        if (!inside(e.relatedTarget as HTMLDivElement, e.eventTarget)) {
            let { key } = e.params;
            let props = this.get('props');
            props['@:{focus.ctrl}'] = key;
            dispatch(this.root, 'change', {
                use: 'kp',
                isKP: 1,
                '@:{svg.control.point}': 1
            });
        }
    },
});