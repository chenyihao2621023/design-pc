/*
    author:https://github.com/xinglie
 */
import Magix from 'magix5';
import I18n from '../../i18n/index';
let { View, node } = Magix;
export default View.extend({
    tmpl: '@:alert.html',
    init({ body, title = I18n('@:{lang#dialog.tip}'), enter, _close }) {
        let me = this;
        me['@:{dialog.close}'] = _close;
        me['@:{string.body}'] = body;
        me['@:{string.title}'] = title;
        me['@:{fn.enter.callback}'] = enter;
    },
    async render() {
        let me = this;
        await me.digest({
            body: me['@:{string.body}'],
            title: me['@:{string.title}']
        });
        let okBtn = node<HTMLButtonElement>(`_mx_o_${this.id}`);
        if (okBtn) {
            okBtn.focus();
        }
    },
    '@:{enter}<click>'() {
        let me = this;
        me['@:{dialog.close}']();
        me['@:{fn.enter.callback}']?.();
    }
});