/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { View, node, dispatch, isArray, isObject } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    assign(data) {
        let { props } = data;
        let { items = [], bind, multipleSelect } = props;
        if (bind?.id &&
            bind.fields.length) {
            items.length = 0;
            let source = bind._data;
            let key = bind.fields[0].key;
            if (!isArray(source)) {
                source = [source];
            }
            for (let e of source) {
                let dest = e[key];
                if (isObject(dest)) {
                    items.push({ ...dest });
                }
            }
        }
        if (!multipleSelect) {
            let findSelect;
            for (let i = items.length; i--;) {
                let option = items[i];
                if (findSelect) {
                    if (option.checked) {
                        option.checked = false;
                    }
                } else if (option.checked) {
                    findSelect = 1;
                }
            }
        }
        this.set(data);
    },
    render() {
        this.digest();
    },
    // getValue() {
    //     let props = this.get('props');
    //     let input = node(`ipt_${this.id}`);
    //     let id = this.get('id');
    //     return {
    //         id,
    //         type: 'form-input',
    //         props,
    //         elementId: id,
    //         elementType: 'form-input',
    //         elementProps: JSON.stringify(props),
    //         elementValue: props.userValue,
    //         elementName: props.inputName,
    //         elementInput: input
    //     }
    // }
});