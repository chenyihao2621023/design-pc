
import Owner from '../index';
import ChartBar from './bar/designer';
import ChartChartJS from './chartjs/designer';
import ChartFunnel from './funnel/designer';
import ChartLine from './line/designer';
import ChartMeter from './meter/designer';
import ChartPie from './pie/designer';
import ChartRadar from './radar/designer';
import ChartScatter from './scatter/designer';
export default () => {
    Owner['@:{element.manager#register.layout}']({
        icon: '&#xeb94;',
        title: '图表',
        subs: [{
            ctrl: ChartLine
        }, {
            ctrl: ChartMeter
        }, {
            ctrl: ChartBar
        }, {
            ctrl: ChartPie
        }, {
            ctrl: ChartFunnel
        }, {
            ctrl: ChartRadar
        }, {
            ctrl: ChartScatter
        }, {
            ctrl: ChartChartJS
        }]
    });
};