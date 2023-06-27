/*
    author:https://github.com/xinglie
*/
import TextIndexView from '../text/index';
export default TextIndexView.extend({
    tmpl: '@:./dshow.html',
    assign(data) {
        let { props } = data;
        this.set(data);
        this['@:{set.border}'](props);
    },
});