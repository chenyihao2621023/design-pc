/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { View, dispatch } = Magix;
export default View.extend({
    tmpl: '@:./index.html',
    assign(extra) {
        let { props, disabled } = extra;
        this.set({
            disabled,
            props
        });
    },
    render() {
        this.digest();
    },
    '@:{set}<click>'(e: Magix5.MagixPointerEvent) {
        let props = this.get('props');
        let background = props.background;
        if (background != '#000' &&
            background != '#000000') {
            props.background = '#000';
            props.forecolor = '#fff';
        } else {
            props.background = '#fff';
            props.forecolor = '#000';
        }
        dispatch(this.root, 'change', {
            use: 'color',
        });
    },
});