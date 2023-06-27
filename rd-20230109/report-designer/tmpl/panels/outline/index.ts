/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Dragdrop from '../../gallery/mx-dragdrop/index';
import Cursor from '../../gallery/mx-pointer/cursor';
import CellProvider from '../../provider/cell';
import GenericProvider from '../../provider/generic';
import StageGeneric from '../../designer/generic';
let { State, node, View, applyStyle, mark, LOW, delay } = Magix;
applyStyle('@:index.less');
let OverviewSize = [210, 120];
// let getElementSelector = () => {
//     let result = getElementSelector['@:{result}'];
//     if (!getElementSelector['@:{tested}']) {
//         getElementSelector['@:{tested}'] = 1;
//         if (window.CSS) {
//             let prefixes = ['', '-moz-', '-webkit-', '-ms-'];
//             for (let prefix of prefixes) {
//                 let r = `background:${prefix}element(#_rd_so) no-repeat`;
//                 if (CSS.supports(r)) {
//                     result = r;
//                     break;
//                 }
//             }
//         }
//         getElementSelector['@:{result}'] = result;
//     }
//     return result;
// };
export default View.extend({
    tmpl: '@:index.html',
    init() {
        let updateOverview = GenericProvider['@:{generic#debounce}'](this.render, 200, this);
        let updatePos = this['@:{update.viewport.pos}'].bind(this);

        State.on('@:{event#history.shift.change}', updateOverview, LOW);
        State.on('@:{event#stage.page.change}', updateOverview, LOW);
        State.on('@:{event#stage.size.change}', updateOverview, LOW);
        State.on('@:{event#stage.page.and.elements.change}', updateOverview, LOW);
        State.on('@:{event#stage.scale.change}', updateOverview, LOW);
        State.on('@:{event#stage.elements.change}', updateOverview, LOW);
        State.on('@:{event#stage.select.element.props.change}', updateOverview, LOW);
        State.on('@:{event#stage.scroll}', updatePos, LOW);
        this['@:{update.overview}'] = updateOverview;
        this.on('destroy', () => {
            State.off('@:{event#history.shift.change}', updateOverview, LOW);
            State.off('@:{event#stage.page.change}', updateOverview, LOW);
            State.off('@:{event#stage.size.change}', updateOverview, LOW);
            State.off('@:{event#stage.elements.change}', updateOverview, LOW);
            State.off('@:{event#stage.select.element.props.change}', updateOverview, LOW);
            State.off('@:{event#stage.page.and.elements.change}', updateOverview, LOW);
            State.off('@:{event#stage.scale.change}', updateOverview, LOW);
            State.off('@:{event#stage.scroll}', updatePos, LOW);
        });
    },
    '@:{update.viewport.pos}'({ x: left, y: top }) {
        let outlineStyle: CSSStyleDeclaration = this['@:{outline.node.style}'];
        if (!outlineStyle) {
            outlineStyle = node<HTMLDivElement>('_rd_ol_' + this.id)?.style;
            this['@:{outline.node.style}'] = outlineStyle;
        }
        if (outlineStyle) {
            let min = this.get('mmin');
            let ratio = this.get('ratio');
            let width = this.get('width');
            let height = this.get('height');
            let viewportWidth = this.get('vWidth');
            let viewportHeight = this.get('vHeight');
            let setLeft = min(left * ratio, width - viewportWidth),
                setTop = min(top * ratio, height - viewportHeight);
            outlineStyle.left = setLeft + 'px';
            outlineStyle.top = setTop + 'px';
            this.set({
                left: setLeft,
                top: setTop
            });
        }
    },
    async render() {
        let m = mark(this, '@:{render}');
        let draw = async () => {
            if (m()) {
                if (node('_rd_sc')) {
                    let page = State.get('@:{global#stage.page}');
                    let scale = State.get('@:{global#stage.scale}');
                    let stage = this['@:{stage.node}'];
                    if (!stage) {
                        stage = this['@:{stage.node}'] = node('_rd_stage');
                    }
                    let stageWrap = this['@:{stage.wrap}'];
                    if (!stageWrap) {
                        stageWrap = this['@:{stage.wrap}'] = node('_rd_sw');
                    }
                    let stageRealWidth = stage.scrollWidth;
                    let stageRealHeight = stage.scrollHeight;
                    let width = OverviewSize[0];
                    let ratio = width / stageRealWidth;
                    let height = ratio * stageRealHeight;
                    if (height > OverviewSize[1]) {
                        height = OverviewSize[1];
                        ratio = height / stageRealHeight;
                        width = ratio * stageRealWidth;
                    }
                    let factor = ratio * scale;
                    let { width: pWidth,
                        height: pHeight,
                        radius } = page;
                    let pageWidth = pWidth * factor;
                    let pageHeight = pHeight * factor;
                    let canvasMargin = '';
                    let stageBound = stage.getBoundingClientRect();
                    let wrapBound = stageWrap.getBoundingClientRect();
                    let paddings = Const['@:{const#stage.padding}'];
                    let stageScrollLeft = stage.scrollLeft,
                        stageScrollTop = stage.scrollTop;
                    canvasMargin += (paddings[0] + wrapBound.y + stageScrollTop - stageBound.y) * ratio + 'px ';
                    canvasMargin += (paddings[1] + stageRealWidth - wrapBound.x - wrapBound.width - stageScrollLeft + stageBound.x) * ratio + 'px ';
                    canvasMargin += (paddings[2] + stageRealHeight - wrapBound.y - wrapBound.height - stageScrollTop + stageBound.y) * ratio + 'px ';
                    canvasMargin += (paddings[3] + wrapBound.x + stageScrollLeft - stageBound.x) * ratio + 'px';

                    let centerMargin = `${(OverviewSize[1] - height) / 2}px ${(OverviewSize[0] - width) / 2}px`;
                    let min = this.get('mmin');
                    let viewportWidth = min(stage.offsetWidth, stageRealWidth) * ratio;//for border
                    let viewportHeight = min(stage.offsetHeight, stageRealHeight) * ratio;

                    this.digest({
                        unit: State.get('@:{global#stage.unit}'),
                        width,
                        height,
                        page,
                        radius: CellProvider['@:{cell#scale.radius}'](radius, factor),
                        pWidth: pageWidth,
                        pHeight: pageHeight,
                        ratio,
                        //native: getElementSelector(),
                        elements: State.get('@:{global#stage.elements}'),
                        vHeight: viewportHeight,
                        vWidth: viewportWidth,
                        canvasMargin,
                        centerMargin,
                        left: min(stageScrollLeft * ratio, width - viewportWidth),
                        top: min(stageScrollTop * ratio, height - viewportHeight)
                    });
                } else {
                    await delay(20);
                    draw();
                }
            }
        };
        await delay(20);
        draw();
    },
    '@:{move.viewport}<pointerdown>'(e) {
        let startX = this.get('left'),
            startY = this.get('top'),
            viewportWidth = this.get('vWidth'),
            viewportHeight = this.get('vHeight'),
            width = this.get('width'),
            height = this.get('height'),
            stage = this['@:{stage.node}'],
            ratio = this.get('ratio');
        State.fire('@:{event#pointer.using}', {
            active: 1
        });
        Cursor["@:{show.by.type}"]('move');
        this['@:{drag.drop}'](e, ex => {
            let x = startX + ex.pageX - e.pageX;
            let y = startY + ex.pageY - e.pageY;
            if (x < 0) {
                x = 0;
            } else if (x > (width - viewportWidth)) {
                x = width - viewportWidth;
            }
            if (y < 0) {
                y = 0;
            } else if (y > (height - viewportHeight)) {
                y = height - viewportHeight;
            }
            stage.scrollTo(x / ratio, y / ratio);
            this['@:{viewport.moved}'] = 1;
        }, () => {
            State.fire('@:{event#pointer.using}');
            Cursor["@:{hide}"]();
        });
    },
    '@:{scroll.by.pointer}<wheel>&{passive:false}'(e: WheelEvent) {
        this['@:{prevent.default}'](e);
        let { x, y } = StageGeneric['@:{generic#query.delta.by.wheel}'](e);
        StageGeneric['@:{generic#scroll.node.by.wheel}'](x, y, this['@:{stage.node}']);
    },
    '$win<resize>'() {
        this['@:{update.overview}']();
    }
}).merge(Dragdrop);