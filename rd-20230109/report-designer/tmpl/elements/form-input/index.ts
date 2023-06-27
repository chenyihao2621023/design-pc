/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { View, node, dispatch, isArray, isObject } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    assign(data) {
        let { props } = data;
        let { bind, text } = props;
        if (bind?.id) {
            let bindField = bind.fields[0];
            if (bind._tip) {
                text = bind._tip;
            } else if (bind._data) {
                let src = bind._data;
                if (isArray(src)) {
                    src = src[0];
                }
                let single = src[bindField.key];
                if (isObject(single)) {
                    if (single.value) {
                        text = single.value;
                    }
                    if (single.className) {
                        props.className = single.className;
                    }
                    if (single.placeholder) {
                        props.placeholder = single.placeholder;
                    }
                    if (single.markAs) {
                        props.markAs = single.markAs;
                    }
                    if (single.inputName) {
                        props.inputName = single.inputName;
                    }
                } else {
                    text = single;
                }
            } else {
                text = `[绑定:${bindField.name}]`;
            }
        }
        this.set(data, {
            text
        });

    },
    render() {
        this.digest();
    },
    getValue() {
        let props = this.get('props');
        let input = node(`ipt_${this.id}`);
        let id = this.get('id');
        return {
            id,
            type: 'form-input',
            props,
            elementId: id,
            elementType: 'form-input',
            elementProps: JSON.stringify(props),
            elementValue: props.userValue,
            elementName: props.inputName,
            elementInput: input
        }
    },
    '@:{update.value}<input>'(e: Magix5.MagixKeyboardEvent) {
        this['@:{stop.propagation}'](e);
        let { eventTarget } = e;
        let value = (eventTarget as HTMLInputElement).value;//.trim();
        let props = this.get('props');
        props.userValue = value;
        dispatch(this.root, 'elementinput', {
            elementId: this.get('id'),
            elementType: 'form-input',
            elementProps: JSON.stringify(props),
            elementValue: value,
            elementName: props.inputName,
            elementInput: eventTarget
        });
    }
});