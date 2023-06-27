/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import CodeMirrorProvider from '../../provider/codemirror';
let { node, View, mark, dispatch, delay } = Magix;

export default View.extend<{
    '@:{editor}': CodeMirrorPrototype
}>({
    tmpl: '@:index.html',
    init() {
        this.on('destroy', () => {
            let { '@:{editor}': editor } = this;
            if (editor) {
                editor.toTextArea();
            }
        });
    },
    assign(data) {
        this.set(data);
        let { '@:{editor}': editor } = this;
        if (editor &&
            data.value != editor.getValue()) {
            editor.setValue(data.value);
        }
        return false;
    },
    async render() {
        let m = mark(this, '@:{render}');
        let mode = this.get('mode') || 'javascript';
        await CodeMirrorProvider();
        await delay(100);
        await this.digest();
        if (m() && !this['@:{editor}']) {
            let ta = node(`_mx_ta_${this.id}`);
            this['@:{editor}'] = CodeMirror.fromTextArea(ta, {
                mode,
                lineNumbers: true,
                lineWrapping: true
            });
            this['@:{editor}'].setSize('100%', '100%');
            this['@:{editor}'].on('blur', e => {
                dispatch(this.root, 'cmchange', {
                    value: e.getValue()
                });
            });
        }
    }
});