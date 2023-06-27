/*
    author:https://github.com/xinglie
*/
import EBind from '../../provider/ebind';
import IndexView from './index';
export default IndexView.extend({
    tmpl: '@:dshow.html',
    '@:{has.contents}'({ text,
        '@:{show.text}': showText }) {
        return text ||
            showText;
    },
    // '@:{change.props}<wheel>&{passive:false}'(e: WheelEvent) {
    //     let { meta,
    //         y } = StageGeneric['@:{generic#query.delta.by.wheel}'](e);
    //     let element = this.get<Report.StageElement>('element');
    //     let { ctrl, type, id, props } = element;
    //     let map = StageSelection['@:{selection#get.selected.map}']();
    //     if (meta &&
    //         props.autoMatch &&
    //         map[id]) {
    //         e['@:{halt}'] = 1;
    //         this['@:{prevent.default}'](e);
    //         if (!this['@:{props.change}']) {
    //             this['@:{props.change}'] = y => {
    //                 let max = Number.MAX_VALUE,
    //                     min = -max;
    //                 for (let p of ctrl.props) {
    //                     if (p.key == 'fontsize') {
    //                         if (p.min) {
    //                             min = isFunction(p.min) ? p.min() : p.min;
    //                         }
    //                         if (p.max) {
    //                             max = isFunction(p.max) ? p.max() : p.max;
    //                         }
    //                         break;
    //                     }
    //                 }
    //                 let fs = props.fontsize + (y > 0 ? 1 : -1) * Const['@:{const#unit.step}']();
    //                 if (fs < min) {
    //                     fs = min;
    //                 } else if (fs > max) {
    //                     fs = max;
    //                 }
    //                 if (fs != props.fontsize) {
    //                     props.fontsize = fs;
    //                     StageGeneric['@:{generic#update.stage.element}'](element, 'fontsize', null, 1);
    //                 }
    //             };
    //         };
    //         this['@:{props.change}'](y);
    //     }
    // }
}).merge(EBind);