import Magix from 'magix5';
let { applyStyle, guid, node, mark, delay, } = Magix;
applyStyle('@:./index.css');
let toastId = guid('_mx_toast_');
export default {
    async show(msg?: string, duration?: number, prevent?: number) {
        let n = node<HTMLElement>(toastId);
        if (!n) {
            n = document.createElement('div');
            n.id = toastId;
            n.className = '@:./index.css:toast-mask @:scoped.style:{designer-root,designer-ff,pf,full-fill,flex,align-items-center,justify-content-center,unselectable}';
            n.innerHTML = `<div class="@:index.css:toast @:scoped.style:tc" id="${toastId}_c"></div>`;
            document.body.appendChild(n);
        }
        let { classList } = n;
        mark(this, '@:{hide}');
        let m = mark(this, '@:{delay.hide}');
        classList.remove('@:scoped.style:opacity-0', '@:./index.css:fade-out');
        if (prevent) {
            classList.remove('@:scoped.style:pointer-events-none');
            classList.add('@:index.css:toast-mask-prevent');
        } else {
            classList.add('@:scoped.style:pointer-events-none');
            classList.remove('@:index.css:toast-mask-prevent');
        }
        let cNode = node<HTMLElement>(toastId + '_c');
        cNode.innerText = msg;
        if (duration) {
            await delay(duration);
            if (m()) {
                this.hide();
            }
        }
    },
    async hide() {
        let n = node<HTMLElement>(toastId);
        let hideMark = mark(this, '@:{hide}');
        n?.classList.add('@:./index.css:fade-out');
        await delay(200);
        if (hideMark()) {
            n?.classList.add('@:scoped.style:pointer-events-none', '@:scoped.style:opacity-0');
        }
    }
};