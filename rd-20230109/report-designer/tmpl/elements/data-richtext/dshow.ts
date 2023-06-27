/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import EBind from '../../provider/ebind';
let { View } = Magix;
export default View.extend({
    tmpl: '@:dshow.html',
    '@:{has.contents}'({ text, '@:{show.text}': showText }) {
        return text || showText;
    },
    assign(data) {
        this.set(data);
        let { props } = data;
        let { text, bind } = props;
        if (bind.id) {
            let bindField = bind.fields[0];
            text = `[绑定:${bindField.name}]`;
        }
        this.set({
            text
        });
    },
    render() {
        this.digest();
    },
}).merge(EBind);