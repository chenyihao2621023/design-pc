/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Dragdrop from '../../gallery/mx-dragdrop/index';
let { State, View, applyStyle, dispatch, } = Magix;
applyStyle('@:./roost.less');
export default View.extend({
    tmpl: '@:./roost.html',
    init() {
        this.set({
            index: -1
        });
    },
    assign({ props, disabled, defined }) {
        this.set({
            props,
            defined,
            disabled,
        });
        this['@:{now.tag}'] = null;
        this['@:{now.id}'] = null;
        this['@:{now.name}'] = null;
        this['@:{fields}'] = [];
        let data = props[defined.key];
        if (data) {
            let { tag, fields = [], id, name } = data;
            if (tag) {
                this['@:{now.tag}'] = tag;
            }
            if (id) {
                this['@:{now.id}'] = id;
            }
            if (name) {
                this['@:{now.name}'] = name;
            }
            this['@:{fields}'] = fields;
        }
        this.set({
            fields: this['@:{fields}']
        });
        this['@:{data.stringify}'] = JSON.stringify([this['@:{now.tag}'], this['@:{now.id}'], this['@:{now.name}'], this['@:{fields}']]);
    },
    render() {
        this.digest();
    },
    '@:{when.data.field.enter}<dragenter>'(e: Magix5.MagixPointerEvent) {
        let disabled = this.get('disabled');
        if (!disabled) {
            e['@:{halt}'] = 1;
            let { at } = e.params;
            let s = this['@:{drag.key.set}'];
            if (!s) {
                s = new Set();
                this['@:{drag.key.set}'] = s;
            }
            s.add(at);
            if (Dragdrop['@:{is.dragenter}'](this, at)) {
                let src = State.get('@:{global#bind.field.drag.data}');
                if (src) {
                    this.digest({
                        index: at,
                    });
                }
            }
        }
    },
    '@:{when.data.field.leave}<dragleave>'(e: Magix5.MagixPointerEvent) {
        let { at } = e.params;
        if (Dragdrop['@:{is.dragleave}'](this, at)) {
            if (this.get('index') == at) {
                this.digest({
                    index: -1,
                });
            }
        }
    },
    '@:{when.data.field.drop}<drop>&{passive:false}'(e) {
        this['@:{prevent.default}'](e);
        let s = this['@:{drag.key.set}'];
        if (s) {
            for (let e of s) {
                Dragdrop['@:{clear.drag}'](this, e);
            }
        }
        e['@:{halt}'] = 1;
        let index = this.get('index');
        let src = State.get('@:{global#bind.field.drag.data}');
        if (src &&
            index != -1) {
            this.digest({
                index: -1,
            });
            let { id, tag, name, field } = src;
            if (this['@:{now.id}'] != id) {
                this['@:{fields}'].length = 0;
            }
            this['@:{now.id}'] = id;
            this['@:{now.tag}'] = tag;
            this['@:{now.name}'] = name;
            this['@:{fields}'][index] = {
                key: field.key,
                name: field.name
            };
            this['@:{notify.change}']();
        }
    },
    '@:{notify.change}'() {
        let tag = this['@:{now.tag}'],
            fields = this['@:{fields}'],
            name = this['@:{now.name}'],
            id = this['@:{now.id}'];
        let nowStringify = JSON.stringify([tag, id, name, fields]);
        if (nowStringify != this['@:{data.stringify}']) {
            this['@:{data.stringify}'] = nowStringify;
            if (!fields.length) {
                tag = '';
                id = '';
                name = '';
            }
            let defined = this.get('defined');
            dispatch(this.root, 'change', {
                use: 'bf',
                pkey: defined.key,
                bf: {
                    tag,
                    id,
                    name,
                    fields
                }
            });
        }
    },
    '@:{remove.at}<click>'({ params }: Magix5.MagixPointerEvent) {
        let fields = this['@:{fields}'];
        fields.splice(params.at, 1);//直接删除
        this['@:{notify.change}']();
    }
});