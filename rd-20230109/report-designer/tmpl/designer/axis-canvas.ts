/**
 * 标尺canvas相关的配置
 */
import Magix from 'magix';
import Const from './const';
let { Cache } = Magix;
let enlarge = 1e4;
let c = new Cache();
export default {
    /**
     * 扩大倍数
     */
    '@:{ac#enlarge}': enlarge,
    /**
     * 标尺尺寸
     */
    '@:{ac#size}': 19,
    /**
     * 最大canvas尺寸
     */
    '@:{ac#max.canvas.size}': 3.27 * enlarge,//不支持ie　https://stackoverflow.com/questions/6081483/maximum-size-of-a-canvas-element
    /**
     * 检测重叠区域
     * @param ctx canvas 2d
     * @param size 测试尺寸
     * @param decimals 小数位数
     */
    '@:{ac#measure.overlap}'(ctx: CanvasRenderingContext2D,
        size: number,
        decimals: number) {
        let text = size + '_' + decimals;
        if (!c.has(text)) {
            let test = Const['@:{const#to.unit}'](size * Const['@:{const#scale.max}']).toFixed(decimals);
            c.set(text, ctx.measureText(test).width);
        }
        return c.get(text);
    }
};