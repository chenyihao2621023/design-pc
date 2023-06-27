import Magix from 'magix5';
import Lodop from './index';
'ref@:../index.less';
export default Magix.View.extend({
    tmpl: '@:./setting.html',
    init({ _close }) {
        this['@:{dialog.close}'] = _close;
    },
    render() {
        this.digest({
            src: Lodop["@:{get.clodop.src}"]()
        });
    },
    '@:{cancel}<click>'() {
        this['@:{dialog.close}']();
    },
    '@:{update.src}<input>'(e) {
        let value = e.eventTarget.value;
        this.digest({
            src: value
        });
    },
    '@:{apply}<click>'() {
        if (APPROVE) {
            Lodop["@:{set.clodop.src}"](this.get('src'));
            this['@:{dialog.close}']();
        } else {
            alert(`未授权版本不支持设置`);
        }
    }
});