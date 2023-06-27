/*
    author:https://github.com/xinglie
*/
/**
 * 显示y标尺的view
 */
'ref@:./axis.less';
import Magix from 'magix5';
import AxisCanvas from './axis-canvas';
import Const from './const';
let { View, State, mark, node } = Magix;
let { round, PI, floor } = Math;
let enlarge = AxisCanvas['@:{ac#enlarge}'];
let yrodWidth = AxisCanvas['@:{ac#size}'];
let maxCanvasSize = AxisCanvas['@:{ac#max.canvas.size}'];
let lapOver;

let drawBar = (ctx, i, scale, yPos, space, hbar,
    decimals, bar, flag, dpr) => {
    let temp = round(i / scale * enlarge);
    let spliter = round(space * enlarge);
    if (temp % spliter) {
        ctx.fillRect(dpr * yrodWidth - dpr * bar, yPos, dpr * bar, dpr);
    } else {
        ctx.fillRect(dpr * yrodWidth - dpr * hbar, yPos, dpr * hbar, dpr);
        let text = (flag < 0 ? '-' : '') + Const['@:{const#to.unit}'](temp / enlarge).toFixed(decimals);
        ctx.save();
        ctx.translate(14 * dpr, yPos - dpr);
        ctx.rotate(-90 * PI / 180);
        ctx.fillText(text, 0, 0);
        ctx.restore();
    }
};
let drawPiece = (cs, yStart, i, dpr, scale,
    space, hbar, decimals, bar, flag) => {
    let yPos = (yStart + i * flag) * dpr - dpr / 2;
    if (yPos >= 0) {
        let p = floor(yPos / maxCanvasSize);
        drawBar(cs[p], i, scale, yPos - p * maxCanvasSize, space, hbar, decimals, bar, flag, dpr);
        let min = (p * maxCanvasSize),
            max = (min + lapOver * dpr);
        if (yPos > min &&
            yPos < max &&
            cs[p - 1]) {
            drawBar(cs[p - 1], i, scale, yPos - min + maxCanvasSize, space, hbar, decimals, bar, flag, dpr);
        }
    }
};
export default View.extend({
    tmpl: '@:axis-yrod.html',
    init() {
        let updateShadow = e => {
            this.digest({ y: e.y });
        };
        State.on('@:{event#stage.axis.shadow.change}', updateShadow);
        this.on('destroy', () => {
            State.off('@:{event#stage.axis.shadow.change}', updateShadow);
        });
    },
    assign(data) {
        this.set(data);
    },
    async render() {
        let dpr = State.get('@:{global#env.dpr}');
        let ops = this.get();
        let height = ops.h;
        let h = height;
        let single = maxCanvasSize / dpr;
        let cs = [];
        lapOver = 0;
        while (h > single) {
            cs.push(single);
            h -= single;
        }
        if (h) {
            cs.push(h);
        }
        await this.digest({
            cs,
            w: yrodWidth,
            dpr
        });
        let m = mark(this, '@:{render}');
        await this.digest();
        if (m()) {
            let {
                t: step,
                ys: yStart,
                ye: yEnd,
                s: scale,
                d: decimals,
                sc: space,
                hb: hbar,
                bar,
                bc: barColor
            } = ops;
            let ctx = [];
            for (let i = cs.length; i--;) {
                let v = node<HTMLCanvasElement>(`_rd_${i}_${this.id}`);
                let x = v.getContext('2d');
                x.clearRect(0, 0, dpr * yrodWidth, maxCanvasSize);
                x.font = `${dpr * 10}px arial`;
                x.strokeStyle = barColor;
                x.fillStyle = barColor;
                ctx[i] = x;
                if (!lapOver) {
                    lapOver = AxisCanvas['@:{ac#measure.overlap}'](x, Const['@:{const#page.max.height}'], decimals);
                }
            }
            for (let i = step; i < yStart; i += step) {
                drawPiece(ctx, yStart, i, dpr, scale, space, hbar, decimals, bar, -1);
            }
            for (let i = 0; i < yEnd; i += step) {
                drawPiece(ctx, yStart, i, dpr, scale, space, hbar, decimals, bar, 1);
            }
        }
    }
});