/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import DataCenter from '../../../provider/datacenter';
import ChartProvider from '../../../provider/chart';
import FormatProvider from '../../../provider/format';
let { node, View, mark, isArray, mix } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    init() {
        this.on('destroy', () => {
            if (this['@:{chart.entity}']) {
                this['@:{chart.entity}'].destroy();
            }
        });
    },
    assign(data) {
        this.set(data);
    },
    '@:{update.chart}'(options) {
        if (this['@:{chart.entity}']) {
            let chart = this['@:{chart.entity}'];
            mix(chart.config, options);
            chart.update();
        } else {
            let n = node<HTMLElement>(`_rd_chart_${this.id}`);
            let c = node(`_rd_chart_c_${this.id}`);
            let chart = new Chart(c, options);
            this['@:{chart.entity}'] = chart;
            n.dataset.tip = '';
        }
    },
    async render() {
        let m = mark(this, '@:{render}');
        await this.digest();
        try {
            await ChartProvider();
            let props = this.get('props');
            let { bind, options } = props;
            if (m()) {
                let chartOptions = FormatProvider['@:{format}'](options, bind._data, bind.fields);
                let optionStringify = JSON.stringify(chartOptions);
                if (this['@:{lastest.options}'] != optionStringify) {
                    this['@:{lastest.options}'] = optionStringify
                    this['@:{update.chart}'](chartOptions);
                }
            }
        } catch (ex) {
            if (m()) {
                if (this['@:{chart.entity}']) {
                    this['@:{chart.entity}'].destroy();
                    this['@:{chart.entity}'] = null;
                }
                this.digest({
                    error: ex
                });
            }
        }
    },
});