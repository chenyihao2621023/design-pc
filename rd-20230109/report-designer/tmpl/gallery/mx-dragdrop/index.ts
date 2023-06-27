/*
    author:https://github.com/xinglie
 */
import Magix from 'magix5';
let { attach, detach } = Magix;
let Win = window;
let Doc = document;
let ClearSelection = (t?: () => Selection) => {
    if ((t = Win.getSelection)) {
        t().removeAllRanges();
    }
};
let DragPrevent = e => e.preventDefault();
let DragMoveEvent = 'pointermove';
let DragEndEvent = ['pointerup', 'pointercancel'];
let DragPreventEvent = ['keydown', 'wheel', 'fullscreenchange', 'selectstart'];

let EventOptions = {
    capture: false,
    passive: true
};
let passiveOptios = {
    capture: false,
    passive: false,
};
let dragKey = '@:{drag.count}';
export default {
    ctor() {
        let me = this;
        me.on('destroy', () => {
            me['@:{drag.end}']();
        });
    },
    '@:{is.dragenter}'(owner, key?: string) {
        key ||= dragKey;
        let ref = owner[key];
        if (!ref) {
            owner[key] = 0;
        }
        owner[key]++;
        return !ref;
    },
    '@:{is.dragleave}'(owner, key?: string) {
        key ||= dragKey;
        let ref = owner[key];
        if (ref) {
            owner[key]--;
        }
        return ref === 1;
    },
    '@:{clear.drag}'(owner, key?: string) {
        delete owner[key || dragKey];
    },
    '@:{drag.end}'(e) {
        let me = this;
        let info = me['@:{move.proxy}'];
        if (info) {
            let fn;
            for (fn of DragEndEvent) {
                detach(Doc, fn, me['@:{stop.proxy}'], EventOptions);
            }
            for (fn of DragPreventEvent) {
                detach(Doc, fn, DragPrevent, passiveOptios);
            }
            detach(Doc, DragMoveEvent, me['@:{move.proxy}'], EventOptions);
            detach(Win, 'blur', me['@:{stop.proxy}'], EventOptions);
            delete me['@:{move.proxy}'];
            let stop = me['@:{stop.callback}'];
            stop?.(e);
        }
    },
    '@:{drag.drop}'(e: PointerEvent, moveCallback, endCallback) {
        let me = this;
        me['@:{drag.end}']();
        if (e) {
            ClearSelection();
            me['@:{stop.callback}'] = endCallback;
            me['@:{stop.proxy}'] = me['@:{drag.end}'].bind(me);
            me['@:{move.proxy}'] = e => {
                moveCallback?.(e);
            };
            let fn;
            for (fn of DragEndEvent) {
                attach(Doc, fn, me['@:{stop.proxy}'], EventOptions);
            }
            for (fn of DragPreventEvent) {
                attach(Doc, fn, DragPrevent, passiveOptios);
            }
            attach(Doc, DragMoveEvent, me['@:{move.proxy}'], EventOptions);
            attach(Win, 'blur', me['@:{stop.proxy}'], EventOptions);
        }
    },
    /**
     * 获取某坐标点的dom元素
     * @param x x坐标
     * @param y y坐标
     */
    '@:{from.point}'<T extends Element>(x: number, y: number): T {
        let node = Doc.elementFromPoint(x, y);
        while (node?.nodeType == 3) {
            node = <Element>node.parentNode;
        }
        return <T>node;
    },
    '@:{clear.selection}': ClearSelection
};