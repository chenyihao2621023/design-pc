/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { View, dispatch } = Magix;
export default View.extend({
    tmpl: '@:./items.html',
    assign({ disabled, defined, props }) {
        let m = defined.mutual;
        this.set({
            disabled,
            items: props[defined.key],
            mutual: m ? m(props) : null
        });
    },
    render() {
        this.digest();
    },
    '@:{update.item}<input>'(e) {
        let { eventTarget, params } = e;
        let value = eventTarget.value.trim();
        let { i, key } = params;
        let items = this.get('items');
        let current = items[i];
        current[key] = value;
        dispatch(this.root, 'change', {
            use: 'items',
            items
        });
    },
    '@:{update.state}<change>'(e) {
        let { eventTarget, params } = e;
        let checked = eventTarget.checked;
        let { i, key } = params;
        let items = this.get('items');
        let current = items[i];
        current[key] = checked;
        let mutual = this.get('mutual');
        console.log(this.id, mutual);
        if (checked &&
            !mutual) {
            for (let i of items) {
                if (i != current &&
                    i.checked) {
                    i.checked = false;
                }
            }
        }
        dispatch(this.root, 'change', {
            use: 'items',
            items
        });
    },
    '@:{move.at}<click>'({ params }) {
        let { at, d: direction } = params;
        let items = this.get('items');
        let now = items[at];
        items[at] = items[at + direction];
        items[at + direction] = now;
        dispatch(this.root, 'change', {
            use: 'items',
            items
        });
    },
    '@:{add.item}<click>'({ metaKey, ctrlKey }: Magix5.MagixPointerEvent) {
        let items = this.get('items');
        let option = {
            text: '',
            value: '',
            disabled: false,
            checked: false
        };
        if (metaKey || ctrlKey) {
            items.unshift(option);
        } else {
            items.push(option);
        }
        dispatch(this.root, 'change', {
            use: 'items',
            items
        });
    },
    '@:{remove.item}<click>'(e) {
        let { i } = e.params;
        let items = this.get('items');
        items.splice(i, 1);
        dispatch(this.root, 'change', {
            use: 'items',
            items
        });
    },
});