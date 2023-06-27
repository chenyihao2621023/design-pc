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
            let xAxis = ['请绑定数据'];
            let yData = [100];
            // 绘制图表
            this['@:{chart.entity}'].setOption({
                tooltip: {
                    trigger: 'axis'
                },
                xAxis: {
                    data: xAxis
                },
                yAxis: {
                    type: 'value'
                },
                series: [{
                    data: yData,
                    type: 'bar'
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
                    color: props.color
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
        let { bind } = props;
        if (bind.id) {
            let m = mark(this, '@:{load.data}');
            let {
                '@:{data}': data
            } = await DataCenter['@:{request}'](bind);
            if (m()) {
                if (!isArray(data)) {
                    data = [data];
                }
                let first = data[0];
                let xAxis = [];
                let yData = [];
                if (first) {
                    for (let f of bind.fields) {
                        xAxis.push(f.name);
                        yData.push(first[f.key]);
                    }
                    console.log('update chart');
                    let chart = this['@:{chart.entity}'];
                    chart.setOption({
                        xAxis: {
                            data: xAxis
                        },
                        series: [{
                            data: yData,
                            type: 'bar'
                        }]
                    });
                }
            }
        }
    }
});