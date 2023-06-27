import Magix from 'magix5';
import GenericProvider from '../../provider/generic';
let { View, node, mark, Base } = Magix;
let PO = window.PerformanceObserver;
//canvas宽，在render方法中被初始化赋值
let grapWidth = 0;
//canvas高
let graphHeight = 60;
let Data = Base.extend({
    ctor(d, barWidth = 1) {
        this['@:{samples}'] = [];
        this['@:{decimals}'] = d;
        this['@:{bar.width}'] = barWidth;
    },
    '@:{add.sample}'(v) {
        //采样多于图表宽度，画不下，删除
        if (this['@:{samples}'].length * this['@:{bar.width}'] > grapWidth) {
            this['@:{samples}'].shift();
        }
        this['@:{samples}'].push(v);
    },
    '@:{calc}'() {
        //从采样中计算最大值，最小值，及当前对应的值
        let samples = this['@:{samples}'];
        let d = this['@:{decimals}'];
        let min = samples[0];
        let max = samples[0];
        for (let k of samples) {
            if (k < min) {
                min = k;
            }
            if (k > max) {
                max = k;
            }
        }
        let now = samples.at(-1);
        return {
            '@:{max}': max.toFixed(d),
            '@:{min}': min.toFixed(d),
            '@:{now}': now.toFixed(d)
        };
    }
});
//图表
let Widget = Base.extend({
    ctor(id, barWidth = 1) {
        this['@:{results}'] = [];
        this['@:{text.node}'] = node(`${id}_text`);
        this['@:{canvas.ctx}'] = (node(`${id}_canvas`) as HTMLCanvasElement).getContext('2d');
        this['@:{bar.width}'] = barWidth;
    },
    '@:{add.result}'(r) {
        if (this['@:{results}'].length > grapWidth) {
            this['@:{results}'].shift();
        }
        this['@:{results}'].push(r);
        if (!this['@:{dirty}']) {
            this['@:{dirty}'] = 1;
            this['@:{draw}']();
        }
    },
    '@:{draw}'() {
        let results = this['@:{results}'];
        let len = results.length;
        let result = results[len - 1];
        let scale = graphHeight / (result['@:{max}'] * 1.2);
        let colorBrand = GenericProvider['@:{generic#get.brand.color}']();
        this['@:{text.node}'].innerHTML = `min:${result['@:{min}']}&nbsp;max:${result['@:{max}']}&nbsp;now:${result['@:{now}']}`;
        let ctx = this['@:{canvas.ctx}'];
        ctx.fillStyle = "#fafafa";
        ctx.fillRect(0, 0, grapWidth, graphHeight);
        ctx.fillStyle = colorBrand;
        let diff = grapWidth - len;
        for (let i = 0; i < len; i++) {
            ctx.fillRect(diff + i, graphHeight, this['@:{bar.width}'], -(results[i]['@:{now}'] * scale));
        }
        this['@:{dirty}'] = 0;
    }
});
export default View.extend<{
    '@:{started}': number
    '@:{hidden}': number
    '@:{fps.update}'(n: number): void
    '@:{mem.update}'(): void
}>({
    tmpl: '@:perf.html',
    '@:{show}'(shrink) {
        this['@:{hidden}'] = null;
        if (!this['@:{started}'] &&
            !shrink) {
            this['@:{started}'] = 1;
            requestAnimationFrame(this['@:{fps.update}']);
            if (this['@:{mem.update}']) {
                this['@:{mem.update}']();
            }
            this['@:{perf.observer}']?.observe({ entryTypes: ['longtask'] });
        }
    },
    '@:{hide}'() {
        this['@:{started}'] = null;
        this['@:{hidden}'] = 1;
        this['@:{perf.observer}']?.disconnect();
    },
    async render() {
        let renderMark = mark(this, '@:{render}');
        let m = performance.memory;
        let { offsetWidth } = this.root;
        grapWidth = 2 * offsetWidth;
        await this.digest({
            po: PO?.supportedEntryTypes.includes('longtask'),
            w: offsetWidth,
            m
        });
        if (renderMark()) {
            let fpsData = new Data(0);
            let fpsWidget = new Widget(`${this.id}_fps`);
            let samples = [];
            let last = 0;
            let fpsUpdate = now => {
                if (renderMark() &&
                    !this['@:{hidden}']) {
                    let elapsed = (now - (last === 0 ? now : last)) / 1000;
                    let fps = 1 / elapsed;
                    if (fps !== Infinity) {
                        if (samples.length === 64) {
                            samples.shift();
                        }
                        samples.push(fps);
                        let sum = 0;
                        for (let i = 0; i < samples.length; i++) {
                            sum += samples[i];
                        }
                        let mean = sum / samples.length;
                        fpsData['@:{add.sample}'](mean);
                        fpsWidget['@:{add.result}'](fpsData['@:{calc}']());
                    }
                    last = now;
                    requestAnimationFrame(fpsUpdate);
                }
            };
            this['@:{fps.update}'] = fpsUpdate;
            if (m) {
                let memData = new Data(1);
                let memWidget = new Widget(`${this.id}_mem`);
                let updateMem = () => {
                    if (renderMark() &&
                        !this['@:{hidden}'] &&
                        m) {
                        memData['@:{add.sample}'](performance.memory.usedJSHeapSize / (1024 * 1024));
                        memWidget['@:{add.result}'](memData['@:{calc}']());
                        setTimeout(updateMem, 30);
                    }
                };
                this['@:{mem.update}'] = updateMem;
            }
            if (this.get('po')) {
                let ltData = new Data(0, 4);
                let ltWidget = new Widget(`${this.id}_lt`, 4);
                let observer = new PO(e => {
                    if (renderMark()) {
                        let entries = e.getEntries();
                        for (let x of entries) {
                            ltData['@:{add.sample}'](x.duration);
                        }
                    }
                    ltWidget['@:{add.result}'](ltData['@:{calc}']());
                });
                this['@:{perf.observer}'] = observer;
            }
            this['@:{show}']();
        }
    },
});