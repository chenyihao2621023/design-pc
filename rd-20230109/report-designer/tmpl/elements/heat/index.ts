/*
    author:https://github.com/xinglie
*/
import ProgressBarIndexView from '../pbar/index';
export default ProgressBarIndexView.extend({
    tmpl: '@:index.html',
    assign(data) {
        let { props } = data;
        this.set(data, {
            step: 1 / props.bars,
        });
        this['@:{set.value.and.text}'](data);
    },
});