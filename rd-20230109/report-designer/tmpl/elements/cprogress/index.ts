/*
    author:https://github.com/xinglie
*/
import Magix from 'magix';
import Const from '../../designer/const';
import FX from '../../gallery/mx-runner/fx';
import ProgressBarIndexView from '../pbar/index';
let { node } = Magix;
let { PI } = Math;
let animDuration = 200;
export default ProgressBarIndexView.extend({
    tmpl: '@:index.html',
    init() {
        let fx = new FX(animDuration, alg => {
            let fromRate = this['@:{from.rate}'];
            let toRate = this['@:{to.rate}'];
            let currentRate = alg(fromRate, toRate);
            this['@:{current.rate}'] = currentRate;
            let radius = this.get('radius');
            let len = 2 * PI * radius;
            let d1 = len * currentRate;
            let d2 = len - d1;
            let n = node<HTMLDivElement>(`_rd_${this.id}`);
            n.setAttribute('stroke-dasharray', `${d1},${d2}`);
        });
        this['@:{fx}'] = fx;
        this.on('destroy', () => {
            fx['@:{stop}']();
        });
    },
    assign(data) {
        let value = this['@:{set.value.and.text}'](data);
        let { props: { width, border } } = data;
        border = Const['@:{const#to.px}'](border);
        let size = Const['@:{const#to.px}'](width);
        let max = this.get('mmax');
        let currentRate = this['@:{current.rate}'] ?? 0;
        let toRate = value / 100;
        let radius = max((size - border) / 2, 0);
        let len = 2 * PI * radius;
        let d1 = len * currentRate;
        let d2 = len - d1;
        this['@:{fx}']['@:{stop}']();
        this['@:{from.rate}'] = currentRate;
        this['@:{to.rate}'] = toRate;
        this.set(data, {
            border,
            center: size / 2,
            radius,
            d1,
            d2
        });
    },
    async render() {
        await this.digest();
        if (this['@:{from.rate}'] != this['@:{to.rate}']) {
            this['@:{fx}']['@:{start}']();
        }
    }
});