/**
 * request state plugin
 */
import Magix from 'magix5';
import I18n from '../i18n/index';
let { State, node } = Magix;
/**
 * magix框架内部繁忙提示
 * @param e 繁忙事件对象
 */
let magixBusyTip = (e: Report.EventOfMagixBusy) => {
    let ns = node<HTMLDivElement>('_rd_ss');
    if (ns) {
        ns.innerHTML = e.busy ? I18n('@:{lang#system.busy}') : ''
    }
};

/**
 * 监测网络请求，进行界面提示
 */
let requestCount = 0;
let watchRequest = e => {
    let logo = node<HTMLElement>(`_rd_flogo`);
    if (logo) {
        if (e['@:{is.start}']) {
            if (!requestCount) {
                logo.classList.add('@:../designer/index.less:foot-logo-rotate');
            }
            requestCount++;
        } else {
            requestCount--;
            if (!requestCount) {
                logo.classList.remove('@:../designer/index.less:foot-logo-rotate');
            }
        }
    }
};

export default {
    '@:{rstate#setup}'() {
        State.on('@:{event#magix.request}', watchRequest);
        //框架内部繁忙
        State.on('@:{event#magix.busy}', magixBusyTip);
    },
    '@:{rstate#teardown}'() {
        requestCount = 0;
        State.off('@:{event#magix.request}', watchRequest);
        State.off('@:{event#magix.busy}', magixBusyTip);
    },
};