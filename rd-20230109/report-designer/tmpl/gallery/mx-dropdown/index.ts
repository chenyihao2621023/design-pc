/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import I18n from '../../i18n/index';
import Monitor from '../mx-monitor/index';
let { View, applyStyle, toMap, inside,
    node, dispatch, isFunction } = Magix;
applyStyle('@:index.less');
let autoSearchMax = 19;
let firstElemetOffset = 31;
let rotateClass = '@:../../designer/index.less:{foot-logo,foot-logo-rotate}';
export default View.extend({
    tmpl: '@:index.html',
    init(data) {
        let ff = data.list?.[0]?.style;
        Monitor["@:{setup}"]();
        this.set({
            ff,
            rc: rotateClass,
            rff() {
                return 0;
            },
            sff() {
                return 0;
            },
        });
        let update = () => {
            let list = this.get('list');
            this.digest({
                list
            });
        };
        this.on('destroy', () => {
            Monitor['@:{remove}'](this);
            Monitor['@:{teardown}']();
        });
    },
    '@:{get.filter.list}'(value, textKey, valueKey) {
        let list = this['@:{src.list}'];
        if (value) {
            let newList = [];
            for (let e of list) {
                let text = I18n(e[textKey]);
                if (text.includes(value) ||
                    e[valueKey].includes(value)) {
                    newList.push(e);
                }
            }
            return newList;
        } else {
            return list
        }
    },
    assign(data) {
        let {
            selected,
            textKey = 'text',
            valueKey = 'value',
            iconKey = '',
            disabled,
            dock = 'left',
            list = [],
            kw = '',
            search,
            props,
            dt
        } = data;
        if (isFunction(list)) {
            list = list(props);
        }
        let map = toMap(list, valueKey);
        if (!map[selected]) {
            selected = list[0][valueKey];
        }
        let selectedItem = map[selected];
        let selectedText = selectedItem[textKey];
        let selectedIcon = iconKey ? selectedItem[iconKey] : '';
        this['@:{src.list}'] = list;
        this.set({
            dt,
            dock,
            kw,
            search: search || list.length > autoSearchMax,
            selected,
            selectedText,
            selectedIcon,
            list: this['@:{get.filter.list}'](kw, textKey, valueKey),
            iconKey,
            textKey,
            valueKey,
            disabled
        });
    },
    render() {
        this.digest();
    },
    '@:{inside}'(node) {
        return inside(node, this.root);
    },
    '@:{scroll}'() {
        let n = node<HTMLElement>('_mx_list_' + this.id);
        let active = n.querySelector<HTMLLIElement & {
            scrollIntoViewIfNeeded: () => void
        }>('div.@:./index.less:active');
        if (active) {
            active.scrollIntoViewIfNeeded?.();
            let ab = active.getBoundingClientRect(),
                nb = n.getBoundingClientRect();
            if (ab.y - nb.y < firstElemetOffset) {
                n.scrollBy(0, ab.y - nb.y - firstElemetOffset);
            }
        }
    },
    async '@:{show}'() {
        let { classList } = node<HTMLElement>('_mx_dd_' + this.id);
        if (!classList.contains('@:index.less:open')) {
            classList.add('@:index.less:open');
            let r = this.get('rList');
            if (!r) {
                await this.digest({
                    rList: true
                });
            }
            Monitor['@:{add}'](this);
            this['@:{scroll}']();
        }
    },
    '@:{hide}'() {
        let { classList } = node<HTMLElement>('_mx_dd_' + this.id);
        if (classList.contains('@:index.less:open')) {
            classList.remove('@:index.less:open');
            Monitor['@:{remove}'](this);
        }
    },
    '@:{toggle}<click>'() {
        let { classList } = node<HTMLElement>('_mx_dd_' + this.id);
        if (classList.contains('@:index.less:open')) {
            this['@:{hide}']();
        } else if (!classList.contains('@:index.less:notallowed')) {
            this['@:{show}']();
        }
    },
    '@:{select}<click>'({ params: { item }, '@:{halt}': halt }) {
        if (!halt) {
            this['@:{hide}']();
            let valueKey = this.get('valueKey');
            let lastSelected = this.get('selected');
            let selected = item[valueKey];
            if (lastSelected !== selected) {
                let textKey = this.get('textKey');
                let iconKey = this.get('iconKey');
                let selectedText = item[textKey];
                let selectedIcon = item[iconKey];
                this.digest({
                    selected,
                    selectedIcon,
                    selectedText
                });
                dispatch(this.root, 'change', {
                    item,
                    value: selected,
                    text: selectedText
                });
            }
        }
    },
    '@:{list}<scroll>&{capture:true}'({ eventTarget }) {
        let searchInput = node<HTMLElement>(`si_${this.id}`);
        if (searchInput) {
            let { classList } = searchInput;
            let selector = '@:./index.less:search-input-boxshadow';
            if (eventTarget.scrollTop != 0) {
                classList.add(selector);
            } else {
                classList.remove(selector);
            }
        }
    },
    async '@:{search}<input>'(e) {
        let { value } = e.eventTarget as HTMLInputElement;
        let textKey = this.get('textKey'),
            valueKey = this.get('valueKey');
        await this.digest({
            kw: value,
            list: this['@:{get.filter.list}'](value, textKey, valueKey)
        });
        this['@:{scroll}']();
    },
    '@:{load.ff}<click>'(e: Magix5.MagixPointerEvent) {
        e['@:{halt}'] = 1;
    }
});