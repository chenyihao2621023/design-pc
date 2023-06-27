/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
let { View, dispatch, applyStyle, isNumber } = Magix;
applyStyle('@:./style.less');
let Skins = [{
    cellAlign: 'center',
    theadFontsize: 16,
    theadRowHeight: 40,
    theadForecolor: '#000000',
    tbodyRowHeight: 30,
    tbodyFontsize: 14,
    tbodyForecolor: '#000000',
    theadRowBackground: '#ffda95',
    tbodyEvenRowBackground: '#dde09d',
    tbodyOddRowBackground: '#f2f5cc',
    bordercolor: '#000000',
}, {
    cellAlign: 'center',
    theadFontsize: 16,
    theadRowHeight: 40,
    theadForecolor: '#8391b7',
    tbodyRowHeight: 30,
    tbodyFontsize: 14,
    tbodyForecolor: '#8391b7',
    theadRowBackground: '#ffffff',
    tbodyEvenRowBackground: '#ffffff',
    tbodyOddRowBackground: '#d3dfed',
    bordercolor: '#becfe6',
}, {
    cellAlign: 'center',
    theadFontsize: 16,
    theadRowHeight: 40,
    theadForecolor: '#c27f88',
    tbodyRowHeight: 30,
    tbodyFontsize: 14,
    tbodyForecolor: '#c27f88',
    theadRowBackground: '#ffffff',
    tbodyEvenRowBackground: '#ffffff',
    tbodyOddRowBackground: '#eed3d2',
    bordercolor: '#eccecd',
}, {
    cellAlign: 'center',
    theadFontsize: 16,
    theadRowHeight: 40,
    theadForecolor: '#ffffff',
    tbodyRowHeight: 30,
    tbodyFontsize: 14,
    tbodyForecolor: '#000000',
    theadRowBackground: '#7f659f',
    tbodyEvenRowBackground: '#ffffff',
    tbodyOddRowBackground: '#ffffff',
    bordercolor: '#7f659f',
}, {
    cellAlign: 'center',
    theadFontsize: 14,
    theadRowHeight: 30,
    theadForecolor: '#666666',
    tbodyRowHeight: 20,
    tbodyFontsize: 12,
    tbodyForecolor: '#666666',
    theadRowBackground: '#e9eaec',
    tbodyEvenRowBackground: '#f6f6f6',
    tbodyOddRowBackground: '#ffffff',
    bordercolor: '#dedede',
}, {
    cellAlign: 'center',
    theadFontsize: 14,
    theadRowHeight: 30,
    theadForecolor: '#d1dbdb',
    tbodyRowHeight: 20,
    tbodyFontsize: 12,
    tbodyForecolor: '#d1dbdb',
    theadRowBackground: '#212121',
    tbodyEvenRowBackground: '#010101',
    tbodyOddRowBackground: '#404040',
    bordercolor: '#343434',
}];
export default View.extend({
    tmpl: '@:./style.html',
    assign(data) {
        this.set(data);
    },
    render() {
        this.digest({
            skins: Skins
        });
    },
    '@:{set.skin}<click>'(e) {
        let { skin } = e.params;
        let cloned = {};
        for (let p in skin) {
            let src = skin[p];
            if (isNumber(src)) {
                src = Const['@:{const#to.unit}'](src);
            }
            cloned[p] = src;
        }
        dispatch(this.root, 'change', {
            use: 'skin',
            skin: cloned
        });
    }
});