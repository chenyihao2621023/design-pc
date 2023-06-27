/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import FxProvider from '../../provider/fx';
import GenericProvider from '../../provider/generic';
let { View, mark, node } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    assign(data) {
        this.set(data);
    },
    async render() {
        let m = mark(this, '@:{render}');
        try {
            if (!window.functionPlot) {
                await this.digest({
                    html: 'loading...'
                });
            } else {
                await this.digest();
            }
            await FxProvider();
            if (m()) {
                let {
                    title,
                    width,
                    height,
                    xAxisRange,
                    xAxisTitle,
                    yAxisRange,
                    yAxisTitle,
                    grid,
                    zoom,
                    xLine,
                    yLine,
                    data,
                    annotations
                } = this.get('props');
                let dest = node<HTMLElement>(`fx_${this.id}`);
                let ld = node<HTMLElement>(`ld_${this.id}`);
                if (this['@:{title}'] != title ||
                    this['@:{width}'] != width ||
                    this['@:{height}'] != height ||
                    this['@:{x.axis.range}'] != xAxisRange.join(',') ||
                    this['@:{x.axis.title}'] != xAxisTitle ||
                    this['@:{y.axis.range}'] != yAxisRange.join(',') ||
                    this['@:{y.axis.title}'] != yAxisTitle ||
                    this['@:{grid}'] != grid ||
                    this['@:{zoom}'] != zoom ||
                    this['@:{x.line}'] != xLine ||
                    this['@:{y.line}'] != yLine ||
                    this['@:{data}'] != JSON.stringify(data) ||
                    this['@:{annotations}'] != annotations.join(',')) {
                    dest.innerHTML = '';
                    this['@:{x.line}'] = xLine;
                    this['@:{y.line}'] = yLine;
                    this['@:{x.axis.range}'] = xAxisRange.join(',');
                    this['@:{y.axis.range}'] = yAxisRange.join(',');
                    this['@:{annotations}'] = annotations.join(',');
                    this['@:{data}'] = JSON.stringify(data);
                    functionPlot({
                        target: dest,
                        width: this['@:{width}'] = Const['@:{const#to.px}'](width),
                        height: this['@:{height}'] = Const['@:{const#to.px}'](height),
                        yAxis: {
                            domain: yAxisRange,
                            label: this['@:{y.axis.title}'] = yAxisTitle
                        },
                        xAxis: {
                            domain: xAxisRange,
                            label: this['@:{x.axis.title}'] = xAxisTitle
                        },
                        tip: {
                            xLine,
                            yLine
                        },
                        grid,
                        disableZoom: zoom,
                        title: (this['@:{title}'] = title),
                        data: GenericProvider['@:{generic#clone}'](data),
                        annotations: GenericProvider['@:{generic#clone}'](annotations)
                    });
                    ld.innerHTML = '&nbsp;';
                } else {
                    this.digest();
                }
            } else {
                console.log(this.id, 'ignoer');
            }
        } catch (ex) {
            if (m()) {
                this.digest({
                    html: ex
                });
            }
        }
    }
});