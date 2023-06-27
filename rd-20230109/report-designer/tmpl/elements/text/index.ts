/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import FormatProvider from '../../provider/format';
import GenericProvider from '../../provider/generic';
let { isArray, View, dispatch } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    '@:{set.text.decoration}'(props) {
        this.set({
            td: GenericProvider['@:{generate.text.decoration}'](props, 'style')
        });
    },
    '@:{set.border}'({ borderwidth: bw, width, height }) {
        let mmin = this.get('mmin');
        let minSize = mmin(width, height);
        let half = minSize / 2;
        if (bw > half) {
            bw = half;
        }
        this.set({
            bw,
        });
    },
    assign(data) {
        let { props } = data;
        let { text, bind, format, richText, } = props;
        if (bind?.id) {
            let bindField = bind.fields[0];
            if (bind._tip) {
                text = bind._tip;
            } else if (bind._data) {
                let src = bind._data;
                if (isArray(src)) {
                    src = src[0];
                }
                text = src[bindField.key];
                let store;
                if (richText) {
                    let i = GenericProvider['@:{generic#store.html}'](format);
                    format = i['@:{generic#html}'];
                    store = i['@:{generic#store}'];
                }
                text = FormatProvider["@:{format}"](format, text, src);
                if (richText) {
                    text = GenericProvider['@:{generic#recover.html}'](text, store);
                }
            } else if (this['@:{has.contents}']) {
                text = `[绑定:${bindField.name}]`;
            }
        }
        this.set(data, {
            text,
        });
        this['@:{set.text.decoration}'](props);
        this['@:{set.border}'](props);
    },
    render() {
        this.digest();
    },
    '@:{open.link}<click>'() {
        let props = this.get('props');
        dispatch(this.root, 'link', {
            props
        });
    }
});