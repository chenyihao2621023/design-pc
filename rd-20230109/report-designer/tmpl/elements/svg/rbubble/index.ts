/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../../designer/const';
export default Magix.View.extend({
    tmpl: '@:index.html',
    assign(data) {
        let { props, unit } = data;
        let path = 'M';
        let { width, height, mod1X, mod1Y,
            radius,
            gapPosition, gapPRatio, gapRatio } = props;
        let halfWidth = width / 2;
        let halfHeight = height / 2;
        let min = this.get('mmin');
        let m = min(halfWidth, halfHeight);
        if (radius > m) {
            radius = m;
        }
        let points = [];
        let pxOfRadius = Const['@:{const#to.px}'](radius);
        let pxOfWidth = Const['@:{const#to.px}'](width);
        let pxOfHeight = Const['@:{const#to.px}'](height);
        let pxOfMod1X = Const['@:{const#to.px}'](mod1X);
        let pxOfMod1Y = Const['@:{const#to.px}'](mod1Y);
        let cWidth = pxOfWidth - 2 * pxOfRadius,
            cHeight = pxOfHeight - 2 * pxOfRadius;
        let lt = 'A' + pxOfRadius + ',' + pxOfRadius + ',0,0,1,' + pxOfRadius + ',0';
        let rt = 'A' + pxOfRadius + ',' + pxOfRadius + ',0,0,1,' + pxOfWidth + ',' + pxOfRadius;
        let rb = 'A' + pxOfRadius + ',' + pxOfRadius + ',0,0,1,' + (pxOfWidth - pxOfRadius) + ',' + pxOfHeight;
        let lb = 'A' + pxOfRadius + ',' + pxOfRadius + ',0,0,1,0,' + (pxOfHeight - pxOfRadius);
        if (gapPosition == 'top') {
            let gap1x = pxOfRadius + cWidth * gapPRatio;
            let gap2x = gap1x + cWidth * gapRatio;
            if (gap2x > pxOfWidth - pxOfRadius) {
                gap2x = pxOfWidth - pxOfRadius;
            }
            points.push(pxOfRadius, ',0,L', gap1x, ',0',
                'L', pxOfMod1X, ',', -pxOfMod1Y,
                'L', gap2x, ',0',
                'L', (pxOfWidth - pxOfRadius), ',0',
                rt,
                'L', pxOfWidth, ',', pxOfHeight - pxOfRadius,
                rb,
                'L', pxOfRadius, ',', pxOfHeight, ',',
                lb,
                'L0,', pxOfRadius,
                lt);
        } else if (gapPosition == 'right') {
            let gap1y = pxOfRadius + cHeight * gapPRatio;
            let gap2y = gap1y + cHeight * gapRatio;
            if (gap2y > pxOfHeight - pxOfRadius) {
                gap2y = pxOfHeight - pxOfRadius;
            }
            points.push(pxOfRadius, ',0,L', pxOfWidth - pxOfRadius, ',0',
                rt,
                'L', pxOfWidth, ',', gap1y,
                'L', pxOfWidth + pxOfMod1X, ',', pxOfMod1Y,
                'L', pxOfWidth, ',', gap2y,
                'L', pxOfWidth, ',', pxOfHeight - pxOfRadius,
                rb,
                'L', pxOfRadius, ',', pxOfHeight,
                lb,
                'L0,', pxOfRadius,
                lt);
        } else if (gapPosition == 'bottom') {
            let gap1x = pxOfRadius + cWidth * gapPRatio;
            let gap2x = gap1x + cWidth * gapRatio;
            if (gap2x > pxOfWidth - pxOfRadius) {
                gap2x = pxOfWidth - pxOfRadius;
            }
            points.push(pxOfRadius, ',0,L', pxOfWidth - pxOfRadius, ',0',
                rt,
                'L', pxOfWidth, ',', pxOfHeight - pxOfRadius,
                rb,
                'L', gap2x, ',', pxOfHeight,
                'L', pxOfMod1X, ',', pxOfHeight + pxOfMod1Y,
                'L', gap1x, ',', pxOfHeight,
                'L', pxOfRadius, ',', pxOfHeight,
                lb,
                'L0,', pxOfRadius,
                lt);
        } else if (gapPosition == 'left') {
            let gap1y = pxOfRadius + cHeight * gapPRatio;
            let gap2y = gap1y + cHeight * gapRatio;
            if (gap2y > pxOfHeight - pxOfRadius) {
                gap2y = pxOfHeight - pxOfRadius;
            }
            points.push(pxOfRadius, ',0,L', pxOfWidth - pxOfRadius, ',0',
                rt,
                'L', pxOfWidth, ',', pxOfHeight - pxOfRadius,
                rb,
                'L', pxOfRadius, ',', pxOfHeight,
                lb,
                'L0,', gap2y,
                'L', -pxOfMod1X, ',', pxOfMod1Y,
                'L0,', gap1y,
                'L0,', pxOfRadius,
                lt);
        }
        this.set({
            unit,
            props,
            path: path + points.join('')
        });
    },
    render() {
        this.digest();
    }
});