/*
    author:https://github.com/xinglie
*/
import Const from '../../../designer/const';
import Enum from '../../../designer/enum';
import DesignerProvider from '../../../provider/designer';
import Designer from '../../designer';
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./index'
        });
    }
}).static({
    type: 'chart/chartjs',
    title: '@:{lang#elements.chart-chartjs}',
    icon: '&#xe668;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            alpha: 1,
            width: Const['@:{const#to.unit}'](500),
            height: Const['@:{const#to.unit}'](300),
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            animations: [],
            options: `custom:function(data, fields){
    //data是绑定数据源的接口数据，fields是图表绑定了数据源中的哪些字段
    //可以在绑定数据后，去掉下面的debugger前的注释查看相应的数据
    //debugger
    let labels=[];
    let datasets=[];
    if(fields&&fields.length) {
        for(let bf of fields) {
            labels.push(bf.name); 
            let ds=[];
            for(let d of data){
                ds.push(d[bf.key]);
            }
            datasets.push({label:bf.name,data:ds});
        }
    } else {
        labels = ['nodata'];
        datasets = [{label: 'nodata',data: []}];
    }
    //下面返回的是chart完整的option配置
    return {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Chart.js Bar Chart'
                }
            }
        },
    }
}`,
            ow: 'www.chartjs.org',
            locked: false,
            bind: {},
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.width}'](),
        DesignerProvider['@:{designer#shared.props.height}'](),
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.rotate}'],
        DesignerProvider['@:{designer#shared.props.data.source.spliter}'], DesignerProvider['@:{designer#shared.props.bind}'](-1), {
            tip: '@:{lang#props.options}',
            key: 'options',
            type: Enum['@:{enum#prop.format.fx}'],
            json: 1,
            clear: 0
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ow}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});