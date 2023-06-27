/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Dialog from '../../gallery/mx-dialog/index';
let { View, applyStyle, dispatch } = Magix;
applyStyle('@:index.less');
export default View.extend({
    tmpl: '@:index.html',
    assign(data) {
        this.set(data);
    },
    render() {
        this.digest();
    },
    '@:{choose.picture}<click>'() {
        //debugger;
        let me = this;
        let defined = me.get('defined');
        me.mxDialog({
            view: '@:./list',
            width: 1092,
            defined,
            done(pic) {
                //me.digest(pic);
                me['@:{fire.event}'](pic);
            }
        });
    },
    '@:{fire.event}'(pic) {
        let defined = this.get('defined');
        dispatch(this.root, 'change', {
            use: 'src',
            pkey: defined.key,
            ...pic
        });
    },
    '@:{clear.image}<click>'(e: Magix5.MagixPointerEvent) {
        this['@:{stop.propagation}'](e);
        //debugger;
        // this.digest({
        //     src: ''
        // });
        this['@:{fire.event}']({
            src: '',
            width: 0,
            height: 0
        });
    }
}).merge(Dialog);