/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import StageGeneric from '../../designer/generic';
import DHistory from '../../designer/history';
import StageSelection from '../../designer/selection';
import CKEitorProvider from '../../provider/ckeditor5';
let { applyStyle, View, mark, node, State } = Magix;
applyStyle('@:./dshow.less');
export default View.extend({
    tmpl: '@:dshow.html',
    init() {
        this.on('destroy', () => {
            let editor = this['@:{editor}'];
            if (editor && editor !== 1) {
                editor.destroy();
            }
        });
    },
    assign(data) {
        this.set(data);
    },
    async render() {
        let marker = mark(this, '@:{render}');
        let props = this.get('props');
        let readonly = props.readonly || props.locked;
        await this.digest({
            readonly,
            scale: State.get('@:{global#stage.scale}') || 1
        });
        await CKEitorProvider();
        if (marker()) {
            if (!this['@:{editor}']) {
                this['@:{editor}'] = 1;
                let editor = await CKEditor.Classic.create(node(`${this.id}_ed`), {
                    initialData: props.text
                });
                if (marker()) {
                    this['@:{editor}'] = editor;
                    editor.model.document.on('change', () => {
                        let newestProps = this.get('props');
                        newestProps.text = editor.getData();
                    });
                }
            }
        }
    },
    '@:{toggle.state}<click>'(e) {
        let pv = this.get('pv');
        let props = this.get('props');
        this.digest({
            pv: !pv,
            text: props.text
        });
    },
    '@:{stop}<wheel>'(e) {
        e['@:{halt}'] = 1;
    },
    '@:{stop}<pointerdown,contextmenu>'(e: Magix5.MagixPointerEvent & {
        target: HTMLElement
    }) {
        if (!e['@:{halt}']) {
            let { target } = e;
            if (target.id != `${this.id}_pv`) {
                e['@:{halt}'] = 1;
                let element = this.get('element');
                if (StageSelection["@:{selection#set}"](element)) {
                    let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
                    DHistory["@:{history#save}"](DHistory['@:{history#element.get.focus}'], ename);
                }
            }
        }
    }
});