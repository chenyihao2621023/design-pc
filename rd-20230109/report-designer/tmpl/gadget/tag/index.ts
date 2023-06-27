/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { View, dispatch } = Magix;
let { random } = Math;
let getRandomColor = () => '#' + ('00000' + (0x1000000 * random() | 0).toString(16)).slice(-6);
export default View.extend({
    tmpl: '@:./index.html',
    assign(extra) {
        let { props, disabled } = extra;
        this.set({
            disabled,
            props
        });
    },
    render() {
        this.digest();
    },
    '@:{update.tag}<input>'(e: Magix5.MagixPointerEvent & {
        color: string
    }) {
        let { at, key } = e.params;
        let props = this.get('props');
        let items = props.words;
        let value;
        if (key == 'text' ||
            key == 'url') {
            value = (e.eventTarget as HTMLInputElement).value;
        } else {
            value = e.color;
        }
        items[at][key] = value
        dispatch(this.root, 'change', {
            use: 'words',
            words: items
        });
    },
    '@:{remove.tag}<click>'(e: Magix5.MagixPointerEvent) {
        let { at } = e.params;
        let props = this.get('props');
        let items = props.words;
        items.splice(at, 1);
        dispatch(this.root, 'change', {
            use: 'words',
            words: items
        });
    },
    '@:{move.at}<click>'({ params }) {
        let { at, d: direction } = params;
        let { words } = this.get('props');
        let now = words[at];
        words[at] = words[at + direction];
        words[at + direction] = now;
        dispatch(this.root, 'change', {
            use: 'words',
            words
        });
    },
    '@:{add.tag}<click>'({ metaKey, ctrlKey }: Magix5.MagixPointerEvent) {
        let { words } = this.get('props');
        let word = {
            text: '标签',
            url: '',
            forecolor: getRandomColor(),
            background: getRandomColor()
        };
        if (ctrlKey || metaKey) {
            words.unshift(word);
        } else {
            words.push(word);
        }
        dispatch(this.root, 'change', {
            use: 'words',
            words
        });
    }
});