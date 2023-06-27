/*
    author:https://github.com/xinglie
 */
import Magix from "magix";
let { node, attach, detach } = Magix;
let ICounter = 0;
let DocumentEvents = ['pointerdown', 'keyup', 'keydown'];
let Doc = document;
let Win = window;
let Stage;
let EventOptions = {
    capture: false,
    passive: true
};
let WatchTail;
let Watcher = e => {
    let tail = WatchTail;
    while (tail) {
        let view = tail['@:{monitor#view}'];
        if (e.type == 'resize' ||
            e.type == 'blur' ||
            !view['@:{inside}'](e.target)) {
            view['@:{hide}']();
        }
        tail = tail['@:{monitor#prev}'];
    }
};
let Add = view => {
    if (WatchTail) {
        WatchTail = {
            '@:{monitor#view}': view,
            '@:{monitor#prev}': WatchTail
        };
    } else {
        WatchTail = {
            '@:{monitor#view}': view
        };
    }
};
let Remove = view => {
    let tail = WatchTail,
        passed;
    while (tail) {
        if (tail['@:{monitor#view}'] == view) {
            if (passed) {
                passed['@:{monitor#prev}'] = tail['@:{monitor#prev}'];
            } else {
                WatchTail = tail['@:{monitor#prev}'];
            }
            break;
        }
        passed = tail;
        tail = tail['@:{monitor#prev}'];
    }
};
export default {
    '@:{add}': Add,
    '@:{remove}': Remove,
    '@:{setup}'() {
        if (!ICounter) {
            if (!Stage) {
                Stage = node<HTMLDivElement>('_rd_stage');
            }
            for (let e of DocumentEvents) {
                attach(Doc, e, Watcher, EventOptions);
            }
            attach(Win, 'resize', Watcher, EventOptions);
            attach(Win, 'blur', Watcher, EventOptions);
            attach(Win, 'scroll', Watcher, EventOptions);
            if (Stage) {
                attach(Stage, 'scroll', Watcher, EventOptions);
            }
        }
        ICounter++;
    },
    '@:{teardown}'() {
        if (ICounter > 0) {
            ICounter--;
            if (!ICounter) {
                for (let e of DocumentEvents) {
                    detach(Doc, e, Watcher, EventOptions);
                }
                detach(Win, 'resize', Watcher, EventOptions);
                detach(Win, 'blur', Watcher, EventOptions);
                detach(Win, 'scroll', Watcher, EventOptions);
                if (Stage) {
                    detach(Stage, 'scroll', Watcher, EventOptions);
                }
            }
        }
    }
};