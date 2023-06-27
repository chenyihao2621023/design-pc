/*
    author:https://github.com/xinglie
*/
/**
 * 显示x标尺的view
 */
'ref@:./axis.less';
import Magix from 'magix5';
import AxisCanvas from './axis-canvas';
import Const from './const';
let { View, State, mark, node } = Magix;
let { round, floor } = Math;
let enlarge = AxisCanvas['@:{ac#enlarge}'];
let xrodHeight = AxisCanvas['@:{ac#size}'];
let maxCanvasSize = AxisCanvas['@:{ac#max.canvas.size}'];
let lapOver;

let drawBar = (ctx: CanvasRenderingContext2D,
    i, scale, xPos, space, hbar, decimals, bar, flag, dpr) => {
    let temp = round(i / scale * enlarge);
    let spliter = round(space * enlarge);
    //console.log(temp, spliter, space,temp % spliter);
    if (temp % spliter) {
        ctx.fillRect(xPos, dpr * xrodHeight - dpr * bar, dpr, dpr * bar);
    } else {
        ctx.fillRect(xPos, dpr * xrodHeight - dpr * hbar, dpr, dpr * hbar);
        let text = (flag < 0 ? '-' : '') + Const['@:{const#to.unit}'](temp / enlarge).toFixed(decimals);
        ctx.fillText(text, xPos + 2 * dpr, 14 * dpr);
    }
};

let drawPiece = (cs, xStart, i, dpr, scale, space, hbar, decimals, bar, flag) => {
    let xPos = (xStart + i * flag) * dpr - dpr / 2;
    if (xPos >= 0) {
        let p = floor(xPos / maxCanvasSize);
        drawBar(cs[p], i, scale, xPos - p * maxCanvasSize, space, hbar, decimals, bar, flag, dpr);
        let max = (p + 1) * maxCanvasSize,
            min = max - lapOver;
        if (xPos > min &&
            xPos < max &&
            cs[p + 1]) {
            drawBar(cs[p + 1], i, scale, xPos - max, space, hbar, decimals, bar, flag, dpr);
        }
    }
};
export default View.extend({
    tmpl: '@:axis-xrod.html',
    init() {
        let updateShadow = e => {
            this.digest({ x: e.x });
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
        let m = mark(this, '@:{render}');
        let dpr = State.get('@:{global#env.dpr}');
        let ops = this.get();
        let width = ops.w;
        let w = width;
        let single = maxCanvasSize / dpr;
        let cs = [];
        lapOver = 0;
        while (w > single) {
            cs.push(single);
            w -= single;
        }
        if (w) {
            cs.push(w);
        }
        await this.digest({
            cs,
            h: xrodHeight,
            dpr,
        });
        if (m()) {
            let {
                t: step,
                xs: xStart,
                xe: xEnd,
                s: scale,
                d: decimals,
                sc: space,
                hb: hbar,
                bar,
                bc: barColor
            } = ops;
            let ctxs = [];
            for (let i = cs.length; i--;) {
                let v = node<HTMLCanvasElement>(`_rd_${i}_${this.id}`);
                let x = v.getContext('2d');
                x.clearRect(0, 0, maxCanvasSize, dpr * xrodHeight);
                x.font = `${dpr * 10}px arial`;
                x.strokeStyle = barColor;
                x.fillStyle = barColor;
                ctxs[i] = x;
                if (!lapOver) {
                    lapOver = AxisCanvas['@:{ac#measure.overlap}'](x, Const['@:{const#page.max.width}'], decimals);
                }
            }
            for (let i = step; i < xStart; i += step) {
                drawPiece(ctxs, xStart, i, dpr, scale, space, hbar, decimals, bar, -1);
            }
            for (let i = 0; i < xEnd; i += step) {
                drawPiece(ctxs, xStart, i, dpr, scale, space, hbar, decimals, bar, 1);
            }
        }
    }
});