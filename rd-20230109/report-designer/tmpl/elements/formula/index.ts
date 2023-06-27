/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import MathJaxProvider from '../../provider/mathjax';
let { View, mark } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    assign(data) {
        this.set(data);
    },
    async render() {
        let m = mark(this, '@:{render}');
        try {
            if (!window.MathJax) {
                await this.digest({
                    html: 'loading...'
                });
            }
            await MathJaxProvider();
            if (m()) {
                let props = this.get('props');
                let text = props.text,
                    html = this['@:{last.html}'];
                if (text != this['@:{last.text}']) {
                    this['@:{last.text}'] = text;
                    html = MathJax.tex2svg(text, {
                        em: 12,
                        ex: 6
                    }).innerHTML;
                    this['@:{last.html}'] = html;
                }
                this.digest({
                    html
                });
            }
        } catch (ex) {
            if (m()) {
                this.digest({
                    html: ex
                });
            }
        }
    }
});