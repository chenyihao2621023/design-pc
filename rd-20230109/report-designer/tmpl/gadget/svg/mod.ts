/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Transform from '../../designer/transform';
import SVGProvider from '../../provider/svg';
let { View, dispatch, inside } = Magix;
export default View.extend({
    tmpl: '@:./mod.html',
    assign(extra) {
        let { props, disabled } = extra;
        this.set({
            disabled,
            fixed: () => Const["@:{const#unit.fixed}"](),
            step: () => Const["@:{const#unit.step}"](),
            read: Transform["@:{transform#to.show.value}"],
            points: SVGProvider['@:{svg#get.mod.point}'](props),
            props
        });
    },
    render() {
        this.digest();
    },
    '@:{update.mod.point}<input>'(e) {
        let { i, type } = e.params;
        let props = this.get('props');
        let v = e.value;
        if (props['mod' + i + 'Type'] == 'int') {
            v = Transform["@:{transform#to.real.value}"](v);
        }
        console.log(v);
        props['mod' + i + type] = v;
        dispatch(this.root, 'change', {
            isMod: 1,
            use: 'mod'
        });
    },
    '@:{focus.mod.point}<pointerover>'(e: Magix5.MagixPointerEvent) {
        if (!inside(e.relatedTarget as HTMLDivElement, e.eventTarget)) {
            let { key } = e.params;
            let props = this.get('props');
            props['@:{focus.mod}'] = key;
            dispatch(this.root, 'change', {
                isMod: 1,
                use: 'mod',
                '@:{svg.control.point}': 1
            });
        }
    },
});