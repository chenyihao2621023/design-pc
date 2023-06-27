/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import BarcodeProvider from '../../provider/barcode';
let { View, task, mark } = Magix;
export default View.extend({
    tmpl: '@:barcode.html',
    assign(data) {
        this.set(data);
    },
    async render() {
        let m = mark(this, '@:{render}');
        await this.digest({
            //msg: 'loading...'
        });
        try {
            await BarcodeProvider["@:{load.library}"]();
            if (m()) {
                let {
                    value,
                    props, } = this.get();
                let { barcodeColor: lineColor,
                    barcodeLineWidth: lineWidth,
                    barcodeShowText: showText,
                    barcodeFormat: format,
                    barcodeContent,
                    barcodeRender: render,
                    barcodeFill: fill,
                    barcodeStyleBold: styleBold,
                    barcodeStyleItalic: styleItalic,
                    barcodeTextPosition: textPosition,
                    barcodeTextAlign: textAlign,
                    barcodeFont: font,
                    barcodeFontsize: fontSize,
                    barcodeTextMargin: textMargin, } = props;
                await this.digest({
                    msg: null,
                    render,
                    fill
                });
                task(() => {
                    if (m()) {
                        if (!value) {
                            value = barcodeContent;
                        }
                        let fontOptions = '';
                        let height = this.root.offsetHeight;
                        if (styleBold) {
                            fontOptions = 'bold';
                        }
                        if (styleItalic) {
                            if (styleBold) {
                                fontOptions += ' ';
                            }
                            fontOptions += 'italic';
                        }
                        fontSize = Const['@:{const#to.px}'](fontSize);
                        textMargin = Const['@:{const#to.px}'](textMargin);
                        lineWidth = Const['@:{const#to.px}'](lineWidth);
                        JsBarcode(`#${this.id}_bar`, value, {
                            height,
                            lineColor,
                            width: lineWidth,
                            textPosition,
                            textAlign,
                            format,
                            fontSize,
                            fontOptions,
                            displayValue: showText,
                            font,
                            textMargin,
                        });
                    }
                });
            }
        } catch (ex) {
            if (m()) {
                this.digest({
                    msg: ex.message || ex
                });
            }
        }
    }
});