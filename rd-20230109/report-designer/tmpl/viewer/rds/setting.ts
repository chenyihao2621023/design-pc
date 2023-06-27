import Magix from 'magix5';
import Service from '../../designer/service';
import Toast from '../../gallery/mx-toast/index';
import RDS from './index';
let { config, mark, View } = Magix;
'ref@:../index.less';
let Layouts = [{
    text: '纵向',
    value: 'portrait'
}, {
    text: '横向',
    value: 'landscape'
}];
export default View.extend({
    tmpl: '@:./setting.html',
    init({ _close }) {
        this['@:{dialog.close}'] = _close;
        this.set({
            exf: RDS["@:{format.ex.message}"],
            layouts: Layouts
        });
    },
    render() {
        let m = mark(this, '@:{render.rds.setting}');
        let s = new Service();
        s.all({
            name: '@:{post.by.url}',
            url: config('rdsUrl') + 'printers',
            '@:{body}': {
                print: JSON.stringify({
                    width: 0,
                    height: 0,
                    location: location.href
                })
            }
        }, (ex, bag) => {
            if (m()) {
                let printer = RDS["@:{get.config}"]();
                let list = bag.get('data', []);
                let printerList = [];
                for (let pName of list) {
                    printerList.push({
                        text: pName,
                        value: pName
                    });
                }
                if (!printer.name) {
                    printer.name = list[0];
                }
                this.digest({
                    error: ex,
                    list: printerList,
                    printer
                });
            }
        });
    },
    '@:{cancel}<click>'() {
        this['@:{dialog.close}']();
    },
    '@:{update.num}<input>'(e) {
        let printer = this.get('printer');
        let { key } = e.params;
        printer[key] = e.value;
    },
    '@:{set.printer}<change>'(e) {
        let printer = this.get('printer');
        let { key } = e.params;
        printer[key] = e.value;
    },
    '@:{set.printer.two.side}<change>'(e) {
        let printer = this.get('printer');
        printer.ts = e.eventTarget.checked;
    },
    '@:{apply}<click>'() {
        RDS["@:{set.config}"](this.get('printer'));
        this['@:{dialog.close}']();
        Toast.show('设置成功~', 2000);
    }
});