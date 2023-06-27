/*
    author:https://github.com/xinglie
*/
'ref@:../index.less';
import Magix from 'magix5';
import Const from '../../designer/const';
import StageGeneric from '../../designer/generic';
import DHistory from '../../designer/history';
import Dragdrop from '../../gallery/mx-dragdrop/index';
import GenericProvider from '../../provider/generic';
import HodBaseProvider from '../../provider/hodbase';
import HodExtProvider from '../../provider/hodext';
import TableProvider from '../../provider/table';
let { View, State } = Magix;
export default View.extend({
    tmpl: '@:dshow.html',
    init() {
        this.set({
            td:GenericProvider['@:{generate.text.decoration}'],
            cv: 'var(@:scoped.style:var(--scoped-element-outline-color))',
            toPx: Const['@:{const#to.px}'],
            toUnit: Const['@:{const#to.unit}'],
            excelTitle: GenericProvider['@:{generic#excel.col.title}'],
            getMaxCol(props) {
                let ext = TableProvider['@:{table.provider#add.ext.meta}'](props, 1);
                return ext['@:{col.max}'];
            },
            fieldRow: -1,
            fieldCol: -1
        });
    },

    assign(data) {
        this.set(data);
    },
    render() {
        this.digest();
    },
    '@:{update.cell.dropdown}<change>'(e: Magix5.MagixPointerEvent) {
        let { params, eventTarget } = e;
        let { cell } = params;
        let value = (eventTarget as HTMLSelectElement).options;
        let dropdownItems = cell.dropdownItems,
            changed;
        console.log(dropdownItems, value);
        for (let i = value.length; i--;) {
            let item = value[i];
            let src = dropdownItems[item.index];
            if (src.checked != item.selected) {
                src.checked = item.selected;
                changed = 1;
            }
        }
        console.log(changed);
        if (changed) {
            let element = this.get('element');
            StageGeneric['@:{generic#update.stage.element}'](element, 'rows', this.owner);
            let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
            DHistory["@:{history#save}"](DHistory['@:{history#element.modified.props}'], ename, element.id + '@:{history#element.props.change}' + 'rows', Const['@:{const#hisotry.save.continous.delay}']);
        }
    }
}).merge(Dragdrop, HodBaseProvider, HodExtProvider);