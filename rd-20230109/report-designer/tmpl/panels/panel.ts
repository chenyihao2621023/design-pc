/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Cursor from '../gallery/mx-pointer/cursor';
import DragDrop from '../gallery/mx-dragdrop/index';
import Const from '../designer/const';
let DocRoot = document.documentElement;
let {
    applyStyle,
    config,
    inside,
    mark,
    node,
    State,
    toTry,
    Vframe,
    delay,
    View
} = Magix;
applyStyle('@:panel.less');
let MinWidth = 100;
let ZIndex = 600;
let TitleHeight = 18;
let PanelTail,
    PanelCount = 0;
let PanelsManager = {
    '@:{add}'(view) {
        if (PanelTail) {
            PanelTail = {
                '@:{p#view}': view,
                '@:{p#prev}': PanelTail
            }
        } else {
            PanelTail = {
                '@:{p#view}': view
            };
        }
        PanelCount++;
    },
    '@:{remove}'(view) {
        let tail = PanelTail,
            passed;
        while (tail) {
            if (tail['@:{p#view}'] == view) {
                if (passed) {
                    passed['@:{p#prev}'] = tail['@:{p#prev}'];
                } else {
                    PanelTail = tail['@:{p#prev}'];
                }
                PanelCount--;
                break;
            }
            passed = tail;
            tail = tail['@:{p#prev}'];
        }
    },
    '@:{z-index}'() {
        let tail = PanelTail,
            i = PanelCount;
        while (tail) {
            tail['@:{p#view}']['@:{set.z-index}'](ZIndex + i);
            tail = tail['@:{p#prev}'];
            i--;
        }
    },
    '@:{top}'(view) {
        if (PanelTail?.['@:{p#view}'] != view) {
            this['@:{remove}'](view, 1);
            this['@:{add}'](view);
            this['@:{z-index}']();
        }
    }
};
export default View.extend({
    tmpl: '@:panel.html',
    init(data) {
        PanelsManager["@:{add}"](this);
        let updateLang = ({ to }: Report.EventOfLangChange) => {
            this.digest({
                lang: to
            });
        };
        State.on('@:{event#lang.change}', updateLang);
        this.on('destroy', () => {
            PanelsManager["@:{remove}"](this);
            State.off('@:{event#lang.change}', updateLang);
        });
        this.set(data);
    },
    async render() {
        await this.digest({
            hl: Const['@:{const#show.help.and.ow.links}'],
            th: TitleHeight,
            zIndex: ZIndex + PanelCount
        });
        let panelRoot = node<HTMLElement>('_rdp_' + this.id);
        let panelRootStyle = panelRoot.style;
        let viewNode = node<HTMLHtmlElement>(`_rd_${this.id}_v`);
        let appRoot = node<HTMLElement>(config('rootId'));
        this['@:{panel.root}'] = panelRoot;
        this['@:{panel.root.style}'] = panelRootStyle;
        this['@:{view.node}'] = viewNode;
        this['@:{app.root}'] = appRoot;
        this['@:{fix.position}']();
        this['@:{check.hide.state}']();
    },
    '@:{drag.move}<pointerdown>'(e) {
        this['@:{hold.hide}'] = 1;
        let n = this['@:{panel.root}'];
        let { classList, style } = n;
        let root = this['@:{app.root}'];
        let { classList: vClassList } = this['@:{view.node}'];
        classList.add('@:./panel.less:panel-disable-anim')
        vClassList.add('@:scoped.style:pointer-events-none');
        let screenHeight = root.offsetHeight;
        let min = this.get('mmin');
        let screenWidth = min(root.offsetWidth, DocRoot.offsetWidth);
        let startX = this.get('left');
        let dockRight;
        if (startX == null) {
            dockRight = 1;
            startX = this.get('right');
        }
        let startY = this.get('top');
        let dockBottom;
        if (startY == null) {
            dockBottom = 1;
            startY = this.get('bottom');
        }
        let panelWidth = n.offsetWidth;
        let panelHeight = n.offsetHeight;
        let dockXKey = dockRight ? 'right' : 'left';
        let dockYKey = dockBottom ? 'bottom' : 'top';
        let target = e.eventTarget;
        Cursor["@:{show}"](target);
        State.fire('@:{event#pointer.using}', {
            active: 1
        });
        this['@:{drag.drop}'](e, ex => {
            let offsetX = (dockRight ? e.pageX - ex.pageX : ex.pageX - e.pageX) + startX;
            if (offsetX < 0) {
                offsetX = 0;
            } else if (offsetX + panelWidth > screenWidth) {
                offsetX = screenWidth - panelWidth;
            }
            let offsetY = (dockBottom ? e.pageY - ex.pageY : ex.pageY - e.pageY) + startY;
            if (dockBottom &&
                offsetY < 0) {
                offsetY = 0;
            }
            if (offsetY + panelHeight > screenHeight) {
                offsetY = screenHeight - panelHeight;
            }
            if (!dockBottom &&
                offsetY < 0) {
                offsetY = 0;
            }
            style[dockXKey] = offsetX + 'px';
            style[dockYKey] = offsetY + 'px';
            this.set({
                [dockXKey]: offsetX,
                [dockYKey]: offsetY
            });
        }, () => {
            State.fire('@:{event#pointer.using}');
            this['@:{hold.hide}'] = 0;
            Cursor["@:{hide}"]();
            classList.remove('@:./panel.less:panel-disable-anim');
            vClassList.remove('@:scoped.style:pointer-events-none');
            this['@:{check.hide.state}']();
        });
    },
    '@:{start.resize}<pointerdown>'(e) {
        let { w: resizeWidth } = e.params;
        this['@:{hold.hide}'] = 1;
        let startWidth = this.get('width');
        let startHeight = this.get('height');
        let startRight = this.get('right');
        let minWidth = this.get('minWidth') ?? MinWidth;
        let minHeight = this.get('minHeight') ?? TitleHeight;
        let eventTarget = e.eventTarget;
        let eventTargetClass = eventTarget.classList;

        let root = this['@:{app.root}'];
        let screenHeight = root.offsetHeight;
        let rNode = this['@:{panel.root}'] as HTMLDivElement;

        let { classList: vClassList } = this['@:{view.node}'];
        let { classList: rClassList,
            style: pStyles } = rNode;
        rClassList.add('@:panel.less:panel-disable-anim');
        vClassList.add('@:scoped.style:pointer-events-none');
        eventTargetClass.add('@:panel.less:resize-hover');
        let bound = rNode.getBoundingClientRect();
        Cursor["@:{show}"](eventTarget);
        State.fire('@:{event#pointer.using}', {
            active: 1
        });
        this['@:{drag.drop}'](e, ex => {
            if (resizeWidth) {
                let offset = ex.pageX - e.pageX;
                if (offset + startWidth < minWidth) {
                    offset = minWidth - startWidth;
                }
                let offsetX = offset + startWidth;
                pStyles.width = offsetX + 'px';
                if (startRight || startHeight === 0) {
                    pStyles.right = (startRight - offset) + 'px';
                    this.set({
                        right: startRight - offset
                    });
                }
                this.set({
                    width: offsetX
                });
            } else {
                let offsetY = e.pageY - ex.pageY + startHeight;
                let height = screenHeight - offsetY;
                let max = screenHeight - bound.y;
                if (height > max) {
                    offsetY = screenHeight - max;
                } else if (height < minHeight) {
                    offsetY = screenHeight - minHeight;
                }
                pStyles.height = `max(calc(100% - ${offsetY}px),${minHeight}px)`;
                this.set({
                    height: offsetY
                });
            }
        }, () => {
            State.fire('@:{event#pointer.using}');
            this['@:{hold.hide}'] = 0;
            this['@:{user.defined.height}'] = 0;
            Cursor["@:{hide}"]();
            rClassList.remove('@:panel.less:panel-disable-anim');
            vClassList.remove('@:scoped.style:pointer-events-none');
            eventTargetClass.remove('@:panel.less:resize-hover');
            this['@:{check.hide.state}']();
        });
    },
    '@:{set.z-index}'(z) {
        this['@:{panel.root.style}'].zIndex = z;
        this.set({
            zIndex: z
        });
    },
    async '@:{fix.position}'() {
        let check = mark(this, '@:{check.position}');
        await delay(400);
        if (check()) {
            let n = this['@:{panel.root}'];
            let root = this['@:{app.root}'];
            let definedHeight = this.get('height') + TitleHeight;
            let startHeight = this['@:{user.defined.height}'] || definedHeight;
            let resizeY = this.get('resizeY');
            let screenHeight = root.offsetHeight;
            let min = this.get('mmin');
            let screenWidth = min(root.offsetWidth, DocRoot.offsetWidth);
            if (resizeY) {
                if (startHeight > screenHeight) {
                    if (!this['@:{user.defined.height}']) {
                        this['@:{user.defined.height}'] = startHeight;
                    }
                    n.style.height = `max(calc(100% - ${screenHeight - TitleHeight}px),${TitleHeight}px)`;
                    this.set({
                        height: screenHeight - TitleHeight
                    });
                } else if (definedHeight != startHeight) {
                    this['@:{user.defined.height}'] = 0;
                    n.style.height = `max(calc(100% - ${startHeight}px),${TitleHeight}px)`;
                    this.set({
                        height: startHeight
                    });
                }
            }
            let startX = this.get('left');
            let dockRight;
            if (startX == null) {
                dockRight = 1;
                startX = this.get('right');
            }
            let styles = n.style;
            let startY = this.get('top');
            let dockBottom,
                fixed;
            if (startY == null) {
                dockBottom = 1;
                startY = this.get('bottom');
            }
            let panelHeight = n.offsetHeight;
            let panelWidth = n.offsetWidth;
            if (startX + panelWidth > screenWidth) {
                startX = screenWidth - panelWidth;
                fixed = 1
            }
            if (startY + panelHeight > screenHeight) {
                startY = screenHeight - panelHeight;
                fixed = 1;
            }
            if (!dockRight &&
                startX < 0) {
                startX = 0;
                fixed = 1;
            }
            if (dockRight &&
                startX < 0) {
                startX = 0;
                fixed = 1;
            }
            if (dockBottom &&
                startY < 0) {
                startY = 0;
                fixed = 1;
            }
            if (!dockBottom &&
                startY < 0) {
                startY = 0;
                fixed = 1;
            }
            if (fixed) {
                let dockYKey = dockBottom ? 'bottom' : 'top';
                let dockXKey = dockRight ? 'right' : 'left';
                styles[dockYKey] = startY + 'px';
                styles[dockXKey] = startX + 'px';
                this.set({
                    [dockXKey]: startX,
                    [dockYKey]: startY
                });
                this['@:{check.hide.state}']();
            }
        }
    },
    async '@:{toggle.height}'(forceExpand) {
        let shrink = this.get('shrink');
        if (!forceExpand ||
            shrink) {
            await this.digest({
                shrink: !shrink
            });
            this['@:{fix.position}']();
            let viewNode = this['@:{view.node}'];
            let vf = Vframe.byNode(viewNode);
            vf?.invoke(shrink ? '@:{show}' : '@:{hide}', !shrink);
        }
    },
    async '@:{check.hide.state}'() {
        if (Const['@:{const#support.panels.hide.when.nearside}']) {
            let hideMark = mark(this, '@:{hide.mark}');
            await delay(50);
            if (hideMark()) {
                let styles = this['@:{panel.root.style}'];
                let startX = this.get('left');
                let width = this.get('width');
                let height = this.get('height');
                let startY = this.get('top');
                let resizeY = this.get('resizeY');
                let shrink = this.get('shrink');
                let hideX = 0,
                    hideY = '';
                if (startX == null) {
                    startX = this.get('right');
                    if (startX === 0) {
                        hideX = width - 10;
                    }
                } else if (startX === 0) {
                    hideX = 10 - width;
                }
                if (!shrink &&
                    !hideX) {
                    if (startY == null) {
                        startY = this.get('bottom');
                        if (startY === 0) {
                            hideY = height + 'px';
                        }
                    } else if (startY === 0) {
                        //[!!]css min需要所有的数值都带上单位
                        hideY = resizeY ? `min(10px - 100%, 0px)` : (10 - height - TitleHeight) + 'px';
                    }
                }
                if (hideX ||
                    hideY) {
                    styles.transform = `translate3d(${hideX}px,${hideY || 0},0)`;
                }
            }
        }
    },
    '@:{update.z-index}<pointerdown>'(e) {
        PanelsManager["@:{top}"](this);
    },
    '@:{show}'() {
        PanelsManager["@:{top}"](this);
        let viewNode = this['@:{view.node}'];
        let panelRoot = this['@:{panel.root}'];
        let vf = Vframe.byNode(viewNode);
        vf?.invoke('@:{show}', this.get('shrink'));
        panelRoot?.classList.add('@:scoped.style:pointer-events-all');
    },
    '@:{hide}'() {
        let viewNode = this['@:{view.node}'];
        let panelRoot = this['@:{panel.root}'];
        let vf = Vframe.byNode(viewNode);
        vf?.invoke('@:{hide}');
        panelRoot?.classList.remove('@:scoped.style:pointer-events-all');
    },
    '@:{open}<click>'(e) {
        open(e.params.url);
    },
    '@:{toggle.height}<click>'() {
        this['@:{toggle.height}']();
    },
    '@:{close}<click>'() {
        let close = this.get('@:{close.watch}');
        toTry(close);
    },
    '@:{hover.panel}<pointerover,pointerout>'(e) {
        let inNode = inside(e.relatedTarget, e.eventTarget);
        if (!inNode) {
            let styles = this['@:{panel.root.style}'];
            if (e.type == 'pointerover') {
                mark(this, '@:{hide.mark}');
                styles.transform = 'translate3d(0,0,0)';
            } else if (!this['@:{hold.hide}']) {
                this['@:{check.hide.state}']();
            }
        }
    },
    '$win<resize>'() {
        this['@:{fix.position}']();
    }
}).merge(DragDrop);