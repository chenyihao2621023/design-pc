/*
    author:https://github.com/xinglie
*/
import GenericProvider from '../../provider/generic';
import UnderscoreProvider from '../../provider/underscore';
import RichTextView from '../richtext/index';
export default RichTextView.extend({
    assign(data) {
        let { props } = data;
        props.text = GenericProvider['@:{generic#safe.html}'](props.text);
        this.set(data);
    },
    async render() {
        await UnderscoreProvider();
        let props = this.get('props');
        let { bind } = props;
        if (bind.id) {
            if (bind._data) {
                props.text = _.template(props.text)({
                    data: bind._data,
                    fields: bind.fields
                });
            }
        }
        this.digest();
    }
});