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
            let n = node<HTMLDivElement>('_rd_chart_' + this.id);
            this['@:{chart.entity}'] = echarts.init(n);
            this.on('destroy', () => {
                console.log('chart dispose');
                this['@:{chart.entity}'].dispose();
            });
            this['@:{chart.entity}'].setOption({
                tooltip: {
                    trigger: 'axis'
                },
                xAxis: {
                    data: ['请先绑定数据和X轴的数据'],
                },
                yAxis: {
                    type: 'value'
                }
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
                let newFields = JSON.stringify(props.bind) + JSON.stringify(props.xBind);
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
        let chart = this['@:{chart.entity}'];
        let { bind, xBind } = props;
        if (bind.id &&
            xBind.id) {
            let m = mark(this, '@:{load.data}');
            let {
                '@:{data}': data
            } = await DataCenter['@:{request}'](bind);
            if (m()) {
                if (!isArray(data)) {
                    data = [data];
                }
                let xData = [],
                    yData = [];
                for (let d of data) {
                    for (let f of xBind.fields) {
                        xData.push(d[f.key]);
                    }
                    let index = 0;
                    for (let f of bind.fields) {
                        let dest = yData[index];
                        if (!dest) {
                            yData[index] = dest = {
                                data: [],
                                type: 'line'
                            };
                        }
                        dest.data.push(d[f.key]);
                        index++;
                    }
                }
                chart.setOption({
                    xAxis: {
                        data: xData
                    },
                    series: yData
                });
            }
        } else {
            chart.setOption({
                xAxis: {
                    data: ['请先绑定数据和X轴的数据']
                },
                series: [{
                    data: [],
                    type: 'line'
                }]
            });
        }
    }
});