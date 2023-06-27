import GenericProvider from '../../provider/generic';
let clodopService = 'http://127.0.0.1:8000/CLodopfuncs.js';
let key = `extra.lodop`;
let getCLodopService = () => GenericProvider['@:{generic#store.get}'](key, clodopService);
let SrcPools = {};
let Loaded = 4;
let Loading = 2;
let Initial = 1;
export default {
    '@:{set.clodop.src}'(src) {
        GenericProvider['@:{generic#store.set}'](key, src);
    },
    '@:{get.clodop.src}': getCLodopService,
    '@:{get.lodop}'() {
        return new Promise<any>(resolve => {
            let src = getCLodopService();
            let dest = SrcPools[src];
            if (!dest) {
                dest = {
                    '@:{state}': Initial,
                    '@:{resolves}': []
                };
                SrcPools[src] = dest;
            }
            dest['@:{resolves}'].push(resolve);
            let fetchCLodop = () => {
                dest['@:{state}'] |= Loaded;
                let ld;
                if (window.getCLodop) {
                    ld = getCLodop();
                }
                for (let r of dest['@:{resolves}']) {
                    r(ld);
                }
                dest['@:{resolves}'].length = 0;
            };
            if (dest['@:{state}'] & Loaded) {
                fetchCLodop();
            } else if (!(dest['@:{state}'] & Loading)) {
                dest['@:{state}'] |= Loading;
                let script = document.createElement('script');
                script.onload = script.onerror = fetchCLodop;
                script.src = src;
                document.head.appendChild(script);
            }
        });
    }
};