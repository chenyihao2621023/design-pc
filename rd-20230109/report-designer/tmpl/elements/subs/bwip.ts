/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import I18n from '../../i18n/index';
import BWIP from '../../provider/bwip';
let { View, task, mark } = Magix;
export default View.extend({
    assign(data) {
        this.set(data);
    },
    async render() {
        let { root } = this;
        if (!BWIP['@:{is.loaded}']()) {
            root.innerHTML = I18n('@:{lang#elements.loading.library.tip}');
        }
        let m = mark(this, '@:{render}');
        let { bwipParams, bwipFormat, bwipValue, } = this.get('props');
        let current = JSON.stringify([bwipParams, bwipFormat, bwipValue]);
        try {
            await BWIP['@:{load.library}']();
            task(() => {
                if (m() &&
                    this['@:{current.string}'] != current) {
                    this['@:{current.string}'] = current;
                    if (bwipValue) {
                        let svg = bwipjs.toSVG({
                            bcid: bwipFormat,
                            text: bwipValue,
                        }, bwipParams);
                        root.innerHTML = svg;
                    } else {
                        root.innerHTML = `N/A`;
                    }
                }
            });
        } catch (ex) {
            if (m()) {
                root.innerHTML = ex.message;
            }
        }
    },
});