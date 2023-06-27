import Magix from 'magix5';
export default Magix.View.extend({
    tmpl: '@:./tip.html',
    init({ _close }) {
        this['@:{dialog.close}'] = _close;
    },
    render() {
        this.digest();
    },
    '@:{enter}<click>'() {
        this['@:{dialog.close}']();
    }
})