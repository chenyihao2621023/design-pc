/*
    author:https://github.com/xinglie
*/
/**
 * 投影
 */
import Magix from 'magix5';
import Const from './const';
import Transform from './transform';
let { State, node, lowTaskFinale, LOW } = Magix;
//排序
let sortByAsc = (a, b) => a[0] - b[0];
let { max } = Math;
/**
 * 计算投影
 * @param e 事件对象
 */
let computeShadow = () => {
    let selectElements = State.get<Report.StageElement[]>('@:{global#stage.select.elements}');
    let srcSizesOfX = [],
        srcSizesOfY = [],
        stageBound = Transform['@:{transform#get.stage.dom.rect}']();
    //先获取当前选中元素的所有坐标及尺寸
    for (let { id } of selectElements) {
        let maskNode = node<HTMLDivElement>(`_rdm_${id}`);
        if (maskNode) {
            let b = maskNode.getBoundingClientRect();
            let px = b.x - stageBound.x;
            let py = b.y - stageBound.y;
            srcSizesOfX.push([px, px + b.width]);
            srcSizesOfY.push([py, py + b.height]);
        }
    }
    //以下对坐标及尺寸进行合并，减少dom的生成
    let mergeSizesOfX = [];
    srcSizesOfX.sort(sortByAsc);
    let mergeSizesOfY = [];
    srcSizesOfY.sort(sortByAsc);
    let srcAndMergeSizes = [
        [srcSizesOfX, mergeSizesOfX],
        [srcSizesOfY, mergeSizesOfY]
    ];
    for (let [src, merge] of srcAndMergeSizes) {
        for (let size of src) {
            let extend;
            for (let merged of merge) {
                if (size[0] >= merged[0] &&
                    size[0] <= merged[1]) {
                    merged[1] = max(size[1], merged[1]);
                    extend = 1;
                }
            }
            if (!extend) {
                merge.push(size);
            }
        }
    }
    //派发事件
    State.fire('@:{event#stage.axis.shadow.change}', {
        x: mergeSizesOfX,
        y: mergeSizesOfY
    });
};
/**
 * 定时器id
 */
let delayTimer;
/**
 * 延迟改变投影
 */
let delayChange = async () => {
    clearTimeout(delayTimer);
    await lowTaskFinale();
    delayTimer = setTimeout(computeShadow, 8);
};
export default {
    /**
     * 安装投影
     */
    '@:{axis.shadow#setup}'() {
        if (Const['@:{const#axis.show.shadow}']) {
            State.on('@:{event#stage.select.element.props.change}', delayChange, LOW);
            State.on('@:{event#stage.select.elements.change}', delayChange, LOW);
            State.on('@:{event#stage.scale.change}', delayChange, LOW);
            State.on('@:{event#history.shift.change}', delayChange, LOW);
        }
    },
    /**
     * 卸载投影
     */
    '@:{axis.shadow#teardown}'() {
        if (Const['@:{const#axis.show.shadow}']) {
            clearTimeout(delayTimer);
            State.off('@:{event#stage.select.element.props.change}', delayChange, LOW);
            State.off('@:{event#stage.select.elements.change}', delayChange, LOW);
            State.off('@:{event#stage.scale.change}', delayChange, LOW);
            State.off('@:{event#history.shift.change}', delayChange, LOW);
        }
    }
};