/*
    author:https://github.com/xinglie
 */
import Magix from 'magix5';
let { toTry, now, delay } = Magix;
let setRAF = requestAnimationFrame;
let rafTimerId,
    tTimerStarted;
let rafTail,
    timeoutTail;
let startRafTask = () => {
    if (!rafTimerId) {
        let run = () => {
            let tail = rafTail;
            while (tail) {
                let n = now();
                if ((n - tail['@:{task#time}']) >= tail['@:{task#interval}']) {
                    tail['@:{task#time}'] = n;
                    toTry(tail['@:{task#callback}']);
                }
                tail = tail['@:{task#prev}'];
            }
            if (rafTail) {
                rafTimerId = setRAF(run);
            } else {
                rafTimerId = 0;
            }
        };
        rafTimerId = setRAF(run);
    }
};
let startBackgroundTask = () => {
    if (!tTimerStarted) {
        let run = async () => {
            await delay(50);
            let tail = timeoutTail;
            while (tail) {
                let n = now();
                if ((n - tail['@:{task#time}']) >= tail['@:{task#interval}']) {
                    tail['@:{task#time}'] = n;
                    toTry(tail['@:{task#callback}']);
                }
                tail = tail['@:{task#prev}'];
            }
            if (timeoutTail) {
                run();
            } else {
                tTimerStarted = 0;
            }
        };
        tTimerStarted = 1;
        run();
    }
};
export default {
    '@:{task.add}'(interval, fn) {
        let dest = {
            '@:{task#time}': now(),
            '@:{task#interval}': interval || 15,
            '@:{task#callback}': fn
        };
        if (rafTail) {
            dest['@:{task#prev}'] = rafTail;
        }
        rafTail = dest;
        startRafTask();
    },
    '@:{task.remove}'(fn) {
        let tail = rafTail,
            passed;
        while (tail) {
            if (tail['@:{task#callback}'] == fn) {
                if (passed) {
                    passed['@:{task#prev}'] = tail['@:{task#prev}'];
                } else {
                    rafTail = tail['@:{task#prev}'];
                }
                break;
            }
            passed = tail;
            tail = tail['@:{task#prev}'];
        }
    },
    '@:{task.add.background}'(interval, fn) {
        let dest = {
            '@:{task#time}': now(),
            '@:{task#interval}': interval,
            '@:{task#callback}': fn
        };
        if (timeoutTail) {
            dest['@:{task#prev}'] = timeoutTail;
        }
        timeoutTail = dest;
        startBackgroundTask();
    },
    '@:{task.remove.background}'(fn) {
        let tail = timeoutTail,
            passed;
        while (tail) {
            if (tail['@:{task#callback}'] == fn) {
                if (passed) {
                    passed['@:{task#prev}'] = tail['@:{task#prev}'];
                } else {
                    timeoutTail = tail['@:{task#prev}'];
                }
                break;
            }
            passed = tail;
            tail = tail['@:{task#prev}'];
        }
    }
};