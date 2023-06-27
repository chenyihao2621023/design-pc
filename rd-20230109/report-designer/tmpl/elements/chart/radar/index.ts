/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import DataCenter from '../../../provider/datacenter';
import EChartProvider from '../../../provider/echarts';
import FormatProvider from '../../../provider/format';
let { node, View, mark } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    assign(data) {
        this.set(data);
    },
    '@:{set.chart}'() {
        if (!this['@:{chart.entity}']) {
            let n = node<HTMLElement>('_rd_chart_' + this.id);
            this['@:{chart.entity}'] = echarts.init(n);
            this.on('destroy', () => {
                if (this['@:{chart.entity}']) {
                    this['@:{chart.entity}'].dispose();
                }
            });
            n.dataset.tip = '';
        }
        this['@:{chart.entity}'].resize();
    },
    async render() {
        let m = mark(this, '@:{render}');
        await this.digest();
        try {
            await EChartProvider();
            let props = this.get('props');
            let { bind, options } = props;
            let bindData;
            if (bind.id) {
                let {
                    '@:{data}': data
                } = await DataCenter['@:{request}'](bind);
                bindData = data;
            }
            if (m()) {
                this['@:{set.chart}']();
                let chartOptions = FormatProvider['@:{format}'](options, bindData, bind.fields);
                this['@:{chart.entity}'].setOption(chartOptions, true);
            }
        } catch (ex) {
            if (m()) {
                if (this['@:{chart.entity}']) {
                    this['@:{chart.entity}'].dispose();
                    this['@:{chart.entity}'] = null;
                }
                this.digest({
                    error: ex
                });
            }
        }
    },
});