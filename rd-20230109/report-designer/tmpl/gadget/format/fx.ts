/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Dialog from '../../gallery/mx-dialog/index';
import './share';
'ref@:./share.less';
let { View, dispatch } = Magix;
export default View.extend({
    tmpl: '@:fx.html',
    assign({ disabled, props, defined }) {
        this.set({
            disabled,
            format: props[defined.key],
            defined
        });
    },
    render() {
        this.digest();
    },
    '@:{choose.format}<click>'(e) {
        if (!e['@:{halt}']) {
            let me = this;
            let defined = this.get('defined');
            me.mxDialog({
                view: '@:./code',
                width: 950,
                format: this.get('format'),
                dfx: defined['@:{default.fx}'],
                done(format) {
                    dispatch(me.root, 'change', {
                        use: 'format',
                        pkey: defined.key,
                        format
                    });
                }
            });
        }
    },
    '@:{clear.format}<click>'(e: Magix5.MagixPointerEvent) {
        e['@:{halt}'] = 1;
        let defined = this.get('defined')
        dispatch(this.root, 'change', {
            use: 'format',
            pkey: defined.key,
            format: ''
        });
    }
}).merge(Dialog);