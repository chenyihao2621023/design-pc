/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Toast from '../gallery/mx-toast/index';
import I18n from '../i18n/index';
import FileSystemProvider from '../provider/fs';
import GenericProvider from '../provider/generic';
import Const from './const';
import DHistory from './history';
import ToJSON from './tojson';
let { node, State, applyStyle, View, Vframe, mark } = Magix;
applyStyle('@:content.less');
let prefix = atob('LyohUmVwb3J0IERlc2lnbmVyIEZpbGUKRnJvbTpodHRwczovL2dpdGh1Yi5jb20veGluZ2xpZS9yZXBvcnQtZGVzaWduZXIKQXV0aG9yOmtvb2JveV9saUAxNjMuY29tKi8K');
let alertMsg = msg => {
    Vframe.root().invoke('alert', msg);
};
let tryApplyContent = (content: string) => {
    content = content.trim();
    if (content.startsWith(prefix)) {
        content = decodeURIComponent(atob(content.replace(prefix, '')));
    }
    if (content != ToJSON()) {
        State.fire('@:{event#example.change}', {
            '@:{example.change.event#stage}': JSON.parse(content),
            '@:{example.change.event#type}': DHistory['@:{history#example.from.custom}']
        });
    }
};
export default View.extend({
    tmpl: '@:content.html',
    init({ _close }) {
        this['@:{dialog.close}'] = _close;
    },
    render() {
        this.digest({
            hl: Const['@:{const#show.help.and.ow.links}'],
            body: ToJSON()
        });
    },
    '@:{cancel}<click>'() {
        this['@:{dialog.close}']();
    },
    '@:{apply}<click>'() {
        //保留if逻辑体中的代码，删除if条件及else代码即可删除相应的未授权提示
        if (DEBUG || APPROVE) {
            try {
                let value = node<HTMLTextAreaElement>('_rd_ta_' + this.id).value.trim();
                tryApplyContent(value);
                this['@:{dialog.close}']();
            } catch (ex) {
                alertMsg(ex.message);
            }
        } else {
            alertMsg('未授权版本不支持该功能');
        }
    }
}).static({
    async '@:{read.file}'(target?: HTMLInputElement) {
        //保留if逻辑体中的代码，删除if条件及else代码即可删除相应的未授权提示
        if (DEBUG || APPROVE) {
            let readMark = mark(this, '@:{read.async}');
            try {
                let content = await FileSystemProvider['@:{read.file}'](target);
                tryApplyContent(content);
            } catch (ex) {
                if (readMark() &&
                    ex.name != 'AbortError') {
                    alertMsg(ex.message);
                }
            }
        } else {
            alertMsg('未授权版本不支持该功能');
        }
    },
    async '@:{save}'() {
        let saveMark = mark(this, '@:{save.async}');
        try {
            await FileSystemProvider['@:{prepare}']();
        } catch (ex) {
            Vframe.root().invoke('alert', ex.message);
            return;
        }
        if (saveMark()) {
            Toast.show(I18n('@:{lang#export.file.processing}'));
            let now = new Date();
            let time = [
                now.getFullYear(),
                GenericProvider['@:{generic#pad.start}'](now.getMonth() + 1),
                GenericProvider['@:{generic#pad.start}'](now.getDate()),
                GenericProvider['@:{generic#pad.start}'](now.getHours()),
                GenericProvider['@:{generic#pad.start}'](now.getMinutes()),
                GenericProvider['@:{generic#pad.start}'](now.getSeconds())
            ].join('');
            let value = ToJSON(1);
            try {
                value = prefix + btoa(encodeURIComponent(value));
                await FileSystemProvider['@:{save.file}'](`${I18n('@:{lang#site.name}')}-${time}.rd`, value);
                Toast.show(I18n('@:{lang#export.success}'), 3e3);
            } catch (ex) {
                Toast.hide();
                if (saveMark() &&
                    ex.name != 'AbortError') {
                    alertMsg(ex.message);
                }
            }
        }
    }
});