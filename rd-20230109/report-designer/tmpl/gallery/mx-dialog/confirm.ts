/*
    author:https://github.com/xinglie
 */
import I18n from '../../i18n/index';
import AlertView from './alert';
export default AlertView.extend({
    tmpl: '@:confirm.html',
    init({ _close, body,
        title = I18n('@:{lang#dialog.tip}'), enter, cancel }) {
        let me = this;
        me['@:{dialog.close}'] = _close;
        me['@:{string.body}'] = body;
        me['@:{string.title}'] = title;
        me['@:{fn.enter.callback}'] = enter;
        me['@:{fn.calcel.callback}'] = cancel;
    },
    '@:{cancel}<click>'() {
        let me = this;
        me['@:{dialog.close}']();
        me['@:{fn.calcel.callback}']?.();
    }
});