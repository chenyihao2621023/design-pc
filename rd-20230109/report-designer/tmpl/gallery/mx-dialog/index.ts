/*
    author:https://github.com/xinglie
 */
import Magix from 'magix5';
let { View, applyStyle, node, dispatch,
    has, guid, attach, detach, delay } = Magix;
applyStyle('@:index.less');
interface DialogOptions {
    view: string
    width: number
    height?: number
    left?: string
    top?: string
    dialog: {
        close: () => void
    }
};
let DialogZIndex = 800;
let DialogTail;
let addDialog = dialog => {
    if (DialogTail) {
        DialogTail = {
            '@:{dlg#dialog}': dialog,
            '@:{dlg#prev}': DialogTail
        };
    } else {
        DialogTail = {
            '@:{dlg#dialog}': dialog
        };
    }
};
let removeDialog = dialog => {
    let tail = DialogTail,
        passed;
    while (tail) {
        if (tail['@:{dlg#dialog}'] == dialog) {
            if (passed) {
                passed['@:{dlg#prev}'] = tail['@:{dlg#prev}'];
            } else {
                DialogTail = tail['@:{dlg#prev}'];
            }
            break;
        }
        passed = tail;
        tail = tail['@:{dlg#prev}'];
    }
};
export default View.extend({
    tmpl: '@:index.html',
    init(extra) {
        let { root } = this;
        this.on('destroy', () => {
            removeDialog(this);
            DialogZIndex -= 2;
            // if (DialogZIndex == 500) {
            //     app.classList.remove('@:index.less:blur');
            // }
            dispatch(root, '@:{dialog.hard.close}');
            root.remove();
        });
        this.set(extra);
        // if (DialogZIndex == 500 &&
        //     !navigator.userAgent.includes('Firefox')) {
        //     app.classList.add('@:index.less:blur');
        // }
        DialogZIndex += 2;
        addDialog(this);
    },
    async render() {
        let me = this;
        //this.root.focus();
        await me.digest({
            zIndex: DialogZIndex
        });
        let scrollNode = node<HTMLElement>(`_mx_scroll_${this.id}`);
        scrollNode?.focus();
    },
    '@:{close.anim}'() {
        let id = this.id;
        let { classList } = node<HTMLElement>('_mx_scroll_' + id);
        classList.add('@:index.less:anim-body-out');
        ({ classList } = node<HTMLElement>('_mx_mask_' + id));
        classList.add('@:index.less:anim-mask-out');
    },
    '@:{close}<click>'() {
        dispatch(this.root, '@:{dialog.soft.close}');
    },
    '$doc<keyup>'(e) {
        if (e.code == 'Escape') { //esc
            let dlg = DialogTail?.['@:{dlg#dialog}'];
            if (dlg == this &&
                dlg.get('closable')) {
                dispatch(this.root, '@:{dialog.soft.close}');
            }
        }
    }
}).static({
    '@:{dialog.show}'(options) {
        let id = guid('_mx_dlg_');
        document.body.insertAdjacentHTML('beforeend', '<div id="' + id + '" class="@:scoped.style:{designer-root,designer-ff}"/>');
        let n = node<HTMLElement>(id);
        let vf = this.owner.mount(n, '@:{moduleId}', options);
        let whenClose = async () => {
            if (!n['@:{is.closing}']) {
                n['@:{is.closing}'] = 1;
                vf.invoke('@:{close.anim}');
                detach(n, '@:{dialog.soft.close}', whenClose);
                await delay(200);
                vf.unmount();
            }
        };
        attach(n, '@:{dialog.soft.close}', whenClose);
        return n;
    },
    alert(content, enterCallback, title) {
        this.confirm(content, enterCallback, null, title, 'alert');
    },
    confirm(content, enterCallback, cancelCallback, title, view = 'confirm') {
        this.mxDialog({
            view: '@:./' + view,
            body: content,
            cancel: cancelCallback,
            enter: enterCallback,
            title: title,
            modal: true,
        });
    },
    mxDialog(options, close?: Function) {
        let me = this;
        let { unlock, view } = options;
        let key = '@:{dialog}' + view;
        if (unlock ||
            !me[key]) {
            if (!unlock) {
                me[key] = 1;
            }
            let dlg = me['@:{dialog.show}']({
                width: 400,
                closable: true,
                _close() {
                    dispatch(dlg, '@:{dialog.soft.close}');
                },
                ...options
            });
            let closeWatcher = () => {
                delete me[key];
                detach(dlg, '@:{dialog.hard.close}', closeWatcher);
                close?.();
            };
            attach(dlg, '@:{dialog.hard.close}', closeWatcher);
        }
    }
});