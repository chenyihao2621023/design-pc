/*
    author:https://github.com/xinglie
*/
import TextIndexView from '../text/index';
import GenericProvider from '../../provider/generic';
export default TextIndexView.extend({
    tmpl: '@:./dshow.html',
    assign(data) {
        let { props } = data;
        let { text, lang, richText } = props;
        let store;
        if (richText) {
            let i = GenericProvider['@:{generic#store.html}'](text);
            store = i['@:{generic#store}'];
            text = i['@:{generic#html}'];
        }
        text = lang + '#' + text;
        if (richText) {
            text = GenericProvider['@:{generic#recover.html}'](text, store);
        }
        this.set(data, {
            text,
        });
        this['@:{set.border}'](props);
    },
});