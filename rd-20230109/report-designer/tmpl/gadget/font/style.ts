/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';

let { View, dispatch } = Magix;
export default View.extend({
    tmpl: '@:style.html',
    assign(data) {
        this.set(data);
    },
    render() {
        this.digest();
    },
    '@:{set}<click>'(e) {
        let me = this;
        if (!me.get('disabled')) {
            let props = me.get('props');
            let { key } = e.params;
            //let defined = this.get('defined');
            //let prefix = defined.prefix || 'style';
            props[key] = !props[key];
            // if (key == `${prefix}Underline` &&
            //     props[key]) {
            //     props[`${prefix}Strike`] = false;
            //     props[`${prefix}Overline`] = false;
            // }
            // if (key == `${prefix}Strike` &&
            //     props[key]) {
            //     props[`${prefix}Underline`] = false;
            //     props[`${prefix}Overline`] = false;
            // }
            // if (key == `${prefix}Overline` &&
            //     props[key]) {
            //     props[`${prefix}Strike`] = false;
            //     props[`${prefix}Underline`] = false;
            // }
            dispatch(me.root, 'change', {
                use: key,
                pkey: key,
                [key]: props[key]
            });
        }
    }
});