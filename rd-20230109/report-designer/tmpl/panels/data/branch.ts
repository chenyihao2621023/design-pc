/*
    author:https://github.com/xinglie
*/
'ref@:./index.less';
import Magix from 'magix5';
let { View, State, dispatch } = Magix;

let highlight = (title, kw) => {
    if (kw) {
        title = title.replaceAll(kw, `<span class="@:scoped.style:{color-brand}">${kw}</span>`);
    }
    return title;
}
export default View.extend({
    tmpl: '@:./branch.html',
    init() {
        this.set({
            highlight
        });
    },
    assign(data) {
        this.set(data);
    },
    render() {
        this.digest();
    },
    '@:{toggle.children}<click>'(e: Magix5.MagixPointerEvent) {
        let { item } = e.params;
        let list = this.get('list');
        item.expand = !item.expand;
        this.digest({
            list
        });
    },

    '@:{drag.field.start}<dragstart>'(e: DragEvent & Magix5.MagixMixedEvent) {
        let { params: dragData,
            eventTarget,
            pageX, pageY,
            dataTransfer } = e;
        let b = eventTarget.getBoundingClientRect();
        State.set({
            '@:{global#bind.field.drag.data}': dragData,
            '@:{global#bind.field.drag.event.offset}': {
                '@:{offset.x}': pageX - b.x,
                '@:{offset.y}': pageY - b.y
            }
        });
        dataTransfer.setData('text/plain', '@:{fix.firefox.cursor}');
        //dataTransfer.effectAllowed = 'move';
        State.fire('@:{event#bind.field.start.drag}');
    },
    '@:{drag.field.end}<dragend>'() {
        State.set({
            '@:{global#bind.field.drag.data}': null,
            '@:{global#bind.field.drag.event}': null
        });
        State.fire('@:{event#bind.field.end.drag}');
    },
    //https://github.com/xinglie/report-designer/issues/45
    '@:{fix.drag.clip.bug}<pointerdown>'(e: Magix5.MagixPointerEvent) {
        dispatch(this.root, 'treeitemdown', {
            node: e.eventTarget
        });
    }
})