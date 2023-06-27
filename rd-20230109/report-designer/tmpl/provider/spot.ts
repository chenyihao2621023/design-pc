/**
 * 展示元素位置插件
 */
import Magix from 'magix5';
import Const from '../designer/const';
import StageElements from '../designer/elements';
import StageGeneric from '../designer/generic';
import Transform from '../designer/transform';
import Monitor from '../gallery/mx-monitor/index';
let { node, config, guid, inside } = Magix;
let RId = guid('_rd_rp_');
let { max } = Math;
let root;
let RectPole = {
    '@:{init}'() {
        let n = node(RId);
        if (!n) {
            root = node(config('rootId'));
            root.insertAdjacentHTML("beforeend", `<div class="@:scoped.style:{pa,z-index-1,background-color-brand,opacity-40}" id="${RId}"></div>`)
        }
    },
    '@:{show}'(element, dest) {
        let ns = node<HTMLElement>(RId).style;
        let rb = root.getBoundingClientRect();
        let styles = getComputedStyle(root);
        let borderLeft = parseInt(styles.borderLeftWidth, 10) || 0;
        let borderTop = parseInt(styles.borderTopWidth, 10) || 0;
        let { props } = element,
            pos;
        let x = Const['@:{const#to.px}'](props.x),
            y = Const['@:{const#to.px}'](props.y),
            width = Const['@:{const#to.px}'](props.width),
            height = Const['@:{const#to.px}'](props.height);
        if (dest) {
            let n = node<HTMLElement>(dest);
            if (n) {
                do {
                    n = n.parentNode as HTMLElement;
                    if (n?.dataset.as == 'hod') {
                        break;
                    }
                } while (n)
                pos = n.getBoundingClientRect();
                pos.x += x;
                pos.y += y;
            } else {
                console.log('not find', dest);
                //元素可能处于隐藏状态
                pos = {
                    x: -1e5,
                    y: -1e5
                };
            }
        } else {
            pos = Transform["@:{transform#stage.to.real.coord}"]({
                x,
                y
            });
        }
        ns.left = pos.x - rb.x - borderLeft - scrollX + 'px';
        ns.top = pos.y - rb.y - borderTop - scrollY + 'px';
        ns.width = max(width, 1) + 'px';
        ns.height = max(height, 1) + 'px';
        let r = props.rotate || 0;
        ns.transform = `rotate(${r}deg)`;
    },
    '@:{hide}'() {
        let styles = node<HTMLElement>(RId).style;
        styles.left = '-10000px';
        styles.top = '-10000px';
    }
};
export default {
    '@:{setup}'(view) {
        RectPole['@:{init}']();
        Monitor['@:{setup}']();
        Monitor['@:{add}'](view);
    },
    '@:{teardown}'(view) {
        Monitor['@:{teardown}']();
        Monitor['@:{remove}'](view);
        this['@:{hide}']();
    },
    '@:{hide}'() {
        RectPole['@:{hide}']();
    },
    '@:{inside}'(node) {
        return inside(node, this.root);
    },
    '@:{show.rect}<pointerover>'(e) {
        let flag = inside(e.relatedTarget, e.eventTarget);
        if (!flag) {
            let { element, dest } = e.params;
            RectPole["@:{show}"](element, dest);
        }
    },
    '@:{hide.rect}<pointerout>'(e) {
        let flag = inside(e.relatedTarget, e.eventTarget);
        if (!flag) {
            RectPole["@:{hide}"]();
        }
    },
    '@:{select.element}<click>'(e: Magix5.MagixPointerEvent) {
        if (!e['@:{halt}']) {
            let { params, shiftKey, ctrlKey, metaKey } = e;
            let { element, dest } = params;
            StageElements['@:{elements#single.or.multi.select}'](element, shiftKey || ctrlKey || metaKey);
            //修正元素聚焦滚动到视区内时，hover高亮元素的指示元素也需要更新位置
            RectPole["@:{show}"](element, dest);
        }
    },
    '@:{remove.element}<click>'(e: Magix5.MagixPointerEvent) {
        e['@:{halt}'] = 1;
        let { element } = e.params;
        StageGeneric['@:{generic#delete.select.elements}'](element, '@:{delete.from.tree.panel}');
        RectPole['@:{hide}']();
    }
}