/**
 * 加载css或js
 */
import Magix from 'magix5';
let { State } = Magix;
let loadCenters = {};
let stateCenters = {};
let rejectMsg = 'can not load: ';
let { head } = document;
let Loaded = 4;
let Loading = 2;
let Initial = 1;
let P = Promise;
let loadResource = src => {
    return new P<void>(resolve => {
        let css = src.endsWith('.css'),
            proxy;
        State.fire('@:{event#magix.request}', {
            '@:{is.start}': 1
        });
        console.log('start', src);
        if (css) {
            proxy = document.createElement('link');
            proxy.onload = proxy.onerror = () => {
                State.fire('@:{event#magix.request}');
                console.log('end css', src);
                resolve();
            };
            proxy.href = src;
            proxy.rel = 'stylesheet';
            head.appendChild(proxy);
        } else {
            let proxy = document.createElement('script');
            proxy.onload = proxy.onerror = () => {
                head.removeChild(proxy);
                State.fire('@:{event#magix.request}');
                console.log('end js', src);
                resolve();
            };
            proxy.src = src;
            head.appendChild(proxy);
        }
    });
};

export default (checkFlag: string,
    resources: string[], preloads?: string[]) => {
    return new P<void>((resolve, reject) => {
        let state = loadCenters[checkFlag] || Initial;
        let loadingList = stateCenters[checkFlag] || (stateCenters[checkFlag] = []);
        if (window[checkFlag]) {
            resolve();
        } else if (state & Loaded) {
            reject(rejectMsg + checkFlag);
        } else if (state & Loading) {
            loadingList.push([resolve, reject]);
        } else {
            loadCenters[checkFlag] = state | Loading;
            loadingList.push([resolve, reject]);
            let promises = [];
            if (preloads) {
                for (let src of preloads) {
                    promises.push(loadResource(src));
                }
            }
            P.all(promises).then(() => {
                let inners = [];
                for (let m of resources) {
                    inners.push(loadResource(m));
                }
                return P.all(inners);
            }).then(() => {
                loadCenters[checkFlag] = state | Loaded;
                for (let [res, rej] of loadingList) {
                    if (window[checkFlag]) {
                        res();
                    } else {
                        rej(rejectMsg + checkFlag);
                    }
                }
                loadingList.length = 0;
            }).catch(reject);
        }
    });
};