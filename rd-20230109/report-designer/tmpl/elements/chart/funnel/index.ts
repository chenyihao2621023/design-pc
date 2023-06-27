/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import DataCenter from '../../../provider/datacenter';
import EChartProvider from '../../../provider/echarts';
let { node, View, mark, isArray } = Magix;
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
                console.log('chart dispose');
                this['@:{chart.entity}'].dispose();
            });
            this['@:{chart.entity}'].setOption({
                series: [{
                    type: 'funnel',
                    min: 0,
                    max: 100,
                    minSize: '0%',
                    maxSize: '100%',
                    gap: 2,
                    label: {
                        show: true,
                        position: 'inside'
                    },
                    data: [
                        { value: 100, name: '请绑定数据' },
                    ]
                }]
            }, true);//true for clear canvas
            n.dataset.tip = '';
        }
        this['@:{chart.entity}'].resize();
    },
    async render() {
        let m = mark(this, '@:{render}');
        await this.digest();
        try {
            await EChartProvider();
            if (m()) {
                let props = this.get('props');
                this['@:{set.chart}']();
                this['@:{chart.entity}'].setOption({
                    title: {
                        text: props.title,
                        x: props.titleAlign
                    },
                    color: props.colors
                });
                let oldFields = this['@:{old.bind.fields}'];
                let newFields = JSON.stringify(props.bind);
                if (oldFields != newFields) {
                    this['@:{old.bind.fields}'] = newFields;
                    this['@:{load.data}'](props);
                }
            }
        } catch (ex) {
            if (m()) {
                this.digest({
                    error: ex
                });
            }
        }
    },
    async '@:{load.data}'(props) {
        let { bind, showProgress, roundCap, color } = props;
        let chart = this['@:{chart.entity}'];
        let { series } = this['@:{chart.entity}'].getOption();
        if (bind.id) {
            let m = mark(this, '@:{load.data}');
            let {
                '@:{data}': data
            } = await DataCenter['@:{request}'](bind);
            if (m()) {
                if (!isArray(data)) {
                    data = [data];
                }
                let chartData = [];
                let first = data[0];
                if (first) {
                    for (let f of bind.fields) {
                        chartData.push({
                            value: first[f.key],
                            name: f.name
                        });
                    }
                    series[0].data = chartData;
                    chart.setOption({
                        series
                    });
                }
            }
        } else {
            series[0].data = [
                { value: 100, name: '请绑定数据' },
            ];
            chart.setOption({
                series
            });
        }
    }
});