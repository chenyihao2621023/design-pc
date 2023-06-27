/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { View, isArray, dispatch } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    assign(data) {
        let { props } = data;
        let { bind, image, webUrl } = props;
        let text = '';
        if (!image && webUrl) {
            image = webUrl;
        }
        if (bind.id) {
            let bindField = bind.fields[0];
            if (bind._tip) {
                text = bind._tip;
            } else if (bind._data) {
                let src = bind._data;
                if (isArray(src)) {
                    src = src[0];
                }
                image = src[bindField.key];
            } else if (this['@:{has.contents}']) {
                text = `[绑定:${bindField.name}]`;
            }
        }
        this.set(data, {
            image,
            text
        });
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