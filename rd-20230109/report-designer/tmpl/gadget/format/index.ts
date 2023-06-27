/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Dialog from '../../gallery/mx-dialog/index';
import FormatProvider from '../../provider/format';
import './share';
'ref@:./share.less';
let { View, dispatch } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    assign({ defined, disabled, props }) {
        this.set({
            format: props[defined.key],
            disabled,
            defined
        });
    },
    render() {
        this.digest({
            text: FormatProvider["@:{translate}"](this.get('format'))
        });
    },
    '@:{choose.format}<click>'(e) {
        if (!e['@:{halt}']) {
            let me = this;
            let defined = this.get('defined');
            me.mxDialog({
                width: 950,
                view: '@:./list',
                format: this.get('format'),
                done(format: string) {
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