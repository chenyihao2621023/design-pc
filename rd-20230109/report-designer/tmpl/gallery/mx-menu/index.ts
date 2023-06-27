/*
    author:https://github.com/xinglie
 */
import Magix from 'magix5';
import Monitor from '../mx-monitor/index';
let { node, View, applyStyle, inside, Vframe } = Magix;
let paddingSize = 10;
applyStyle('@:index.less');
export default View.extend({
    tmpl: '@:index.html',
    init() {
        let { root } = this;
        Monitor['@:{setup}']();
        this.on('destroy', () => {
            Monitor['@:{remove}'](this);
            Monitor['@:{teardown}']();
            root.remove();
        });
    },
    assign(ops) {
        let me = this;
        let width = ops.width || 220;
        me['@:{list}'] = ops.list;
        me['@:{width}'] = width;
        me['@:{menu.disabled}'] = ops.disabled || {};
        me['@:{fn.picked}'] = ops.picked;
    },
    async render(e) {
        let me = this;
        await me.digest({
            disabled: me['@:{menu.disabled}'],
            list: me['@:{list}'],
            width: me['@:{width}']
        });
        if (e) {
            this['@:{show}'](e);
        }
    },
    '@:{inside}'(node) {
        return inside(node, this.root);
    },
    '@:{show}'(e) {
        let me = this;
        if (!me['@:{ui.show}']) {
            me['@:{ui.show}'] = 1;
            let n = node<HTMLElement>('_mx_cnt_' + me.id);
            let width = n.offsetWidth;
            let height = n.offsetHeight;
            let left = e.pageX + 2 - scrollX;
            let top = e.pageY - scrollY;
            let positionHeight = top + height + paddingSize,
                positionnWidth = left + width + paddingSize,
                { innerHeight, innerWidth } = window;
            if (positionnWidth > innerWidth) {
                left -= width;
            }
            if (positionHeight > innerHeight) {
                top -= (positionHeight - innerHeight) + paddingSize;
            }
            n.style.left = left + 'px';
            n.style.top = top + 'px';
            Monitor['@:{add}'](me);
        }
    },
    '@:{hide}'() {
        let me = this;
        if (me['@:{ui.show}']) {
            me['@:{ui.show}'] = 0;
            let n = node<HTMLElement>('_mx_cnt_' + me.id);
            n.style.left = '-10000px';
            Monitor['@:{remove}'](me);
        }
    },
    '@:{select}<click>'(e: Magix5.MagixMixedEvent) {
        let me = this;
        me['@:{hide}']();
        let fn = me['@:{fn.picked}'];
        if (fn) {
            fn(e.params.item);
        }
    }
}).static<{
    show(view: Magix5.View, e: PointerEvent, contextMenuId: string, ops?: object)
}>({
    show(view, e, cmId, ops) {
        let n = node(cmId);
        let vf = Vframe.byNode(n);
        if (vf) {
            vf.invoke('assign', ops);
            vf.invoke('render', e);
        } else {
            document.body.insertAdjacentHTML("beforeend", `<div class="@:scoped.style:{designer-root,designer-ff}" id="${cmId}"></div>`);
            vf = view.owner.mount(node(cmId), '@:{moduleId}', ops);
            vf.invoke('@:{show}', e);
        }
    }
});