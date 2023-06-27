/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import BarcodeProvider from '../../provider/barcode';
let { View, mark, task, isArray } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    assign(data) {
        let { props } = data;
        let { bind, text } = props;
        if (bind.id) {
            let bindField = bind.fields[0];
            if (bind._tip) {
                text = bind._tip;
            } else if (bind._data) {
                let src = bind._data;
                if (isArray(src)) {
                    src = src[0];
                }
                text = src[bindField.key];
            } else {
                text = `[bind:${bindField.key}]`;
            }
        }
        this.set(data, {
            text
        });
    },
    async render() {
        let m = mark(this, '@:{render}');
        let { linewidth,
            height,
            format,
            showText,
            styleBold,
            styleItalic,
            color,
            textPosition,
            textAlign,
            font,
            textMargin,
            fontsize,
            render } = this.get('props');
        let text = this.get('text');
        let key = JSON.stringify({
            linewidth,
            height,
            format,
            showText,
            styleBold,
            styleItalic,
            color,
            textPosition,
            textAlign,
            font,
            text,
            fontsize,
            textMargin,
            render
        });
        let changed = key != this['@:{cached.key}'];
        this['@:{cached.key}'] = key;
        await this.digest({
            error: null,
            render
        });
        try {
            await BarcodeProvider["@:{load.library}"]();
            if (m()) {
                if (text &&
                    changed) {
                    m = mark(this, '@:{render.barcode}');
                    task(() => {
                        if (m()) {
                            fontsize = Const['@:{const#to.px}'](fontsize);
                            textMargin = Const['@:{const#to.px}'](textMargin);
                            linewidth = Const['@:{const#to.px}'](linewidth);
                            height = Const['@:{const#to.px}'](height);
                            let fontOptions = '';
                            if (styleBold) {
                                fontOptions = 'bold';
                            }
                            if (styleItalic) {
                                if (styleBold) {
                                    fontOptions += ' ';
                                }
                                fontOptions += 'italic';
                            }
                            try {

                                JsBarcode(`#_rd_${this.id}_bar`, text, {
                                    height,
                                    fontSize: fontsize,
                                    lineColor: color,
                                    width: linewidth,
                                    textPosition,
                                    textAlign,
                                    format,
                                    fontOptions,
                                    displayValue: showText,
                                    font,
                                    textMargin,
                                });
                            } catch (ex) {
                                this.digest({
                                    error: ex
                                });
                            }
                        }
                    });
                }
            }
        } catch (ex) {
            if (m()) {
                this.digest({
                    error: ex
                });
            }
        }
    }
});