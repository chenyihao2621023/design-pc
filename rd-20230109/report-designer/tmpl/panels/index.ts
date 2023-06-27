import Magix from 'magix5';
let {
    config,
    guid,
    node,
    State,
    toMap,
    Vframe
} = Magix;
let Panels: Report.StagePanelProps[] = [];
let PanelsMap;
let emptyObject: Report.OuterPanelsConfig = {};
let canDisplayPanel = (outConfig: Report.OuterViewConfig) => {
    return !outConfig ||
        (!outConfig.to && !outConfig.hidden);
};
let getCloseWatcher = (panelsMamager, panel) => {
    return () => {
        panelsMamager['@:{panels#close.panel}'](panel);
    };
};
export default {
    /**
     * 检测是否所有面板均已打开　
     */
    '@:{panels#is.all.opened}'() {
        let result = true;
        for (let info of Panels) {
            if (!info['@:{opened}'] &&
                !info.mini) {
                result = false;
                break;
            }
        }
        return result;
    },
    /**
     * 一键关闭所有面板
     */
    '@:{panels#close.all.panels}'() {
        let changed;
        for (let p of Panels) {
            if (!p.mini &&
                p['@:{opened}']) {
                changed = 1;
                this['@:{panels#close.panel}'](p, 1);
            }
        }
        if (changed) {
            State.fire('@:{event#panel.change}');
        }
    },
    /**
     * 一键打开所有面板
     */
    '@:{panels#open.all.panels}'() {
        let changed;
        for (let p of Panels) {
            if (!p.mini &&
                !p['@:{opened}']) {
                changed = 1;
                this['@:{panels#open.panel}'](p, 1);
            }
        }
        if (changed) {
            State.fire('@:{event#panel.change}');
        }
    },
    /**
     * 渲染放在外部的面板内容
     */
    '@:{panels#mount.outer.panels}'() {
        let app = node<HTMLElement>(config('rootId'));
        let root = Vframe.byNode(app);
        let outerPanels = config<Report.OuterPanelsConfig>('panels') || emptyObject;
        for (let op in outerPanels) {
            let panelConfig = outerPanels[op];
            if (!panelConfig.hidden) {
                let dest = node<HTMLElement>(panelConfig.to);
                if (dest) {
                    let { classList } = dest;
                    classList.add('@:scoped.style:designer-root', '@:scoped.style:designer-ff')
                    if (panelConfig.scrollable) {
                        classList.add('@:scoped.style:scrollable', '@:scoped.style:thin-scrollable', '@:scoped.style:overflow-auto', '@:scoped.style:scroll-behavior-smooth');
                    }
                    root.mount(dest, '@:./' + op + '/index');
                }
            }
        }
    },
    '@:{panels#force.open.by.ids}'(ids) {
        let changed;
        for (let id of ids) {
            let p = PanelsMap[id];
            if (p &&
                !p['@:{opened}']) {
                this['@:{panels#open.panel}'](p, 1);
                this['@:{panels#toggle.panel.content}'](p, 1);
                changed = 1;
            }
        }
        if (changed) {
            State.fire('@:{event#panel.change}');
        }
    },
    /**
     * 根据面板的初始条件打开相应面板
     */
    '@:{panels#display.show.panels}'() {
        let changed;
        for (let p of Panels) {
            if (p.show) {
                changed = 1;
                this['@:{panels#open.panel}'](p, 1);
            }
        }
        if (changed) {
            State.fire('@:{event#panel.change}');
        }
    },
    /**
     * 销毁所有面板
     */
    '@:{panels#destroy}'() {
        for (let info of Panels) {
            info['@:{opened}'] = null;
            info['@:{node.id}'] = null;
            info['@:{close.watch}'] = null;
        }
    },
    /**
     * 打开面板
     * @param info 面板
     * @param prevent 是否阻止事件派发
     */
    '@:{panels#open.panel}'(info: Report.StagePanelProps,
        prevent?: boolean) {
        if (!info['@:{opened}']) {
            info['@:{opened}'] = 1;
            if (!info['@:{node.id}']) {
                info['@:{node.id}'] = guid('_rdp_');
                info['@:{close.watch}'] = getCloseWatcher(this, info);
                let app = node<HTMLElement>(config('rootId'));
                app.insertAdjacentHTML('beforeend', `<div id="${info['@:{node.id}']}" class="@:scoped.style:{pa,hp100,pointer-events-none,full-fill}"></div>`);
                let root = Vframe.byNode(app);
                let destNode = node(info['@:{node.id}']);
                root.mount(destNode, '@:./panel', info);
            } else {
                let panelRoot = node<HTMLElement>(info['@:{node.id}']);
                //panelRoot.style.display = 'block';
                panelRoot.classList.remove('@:scoped.style:opacity-0');
                let vf = Vframe.byNode(panelRoot);
                vf.invoke('@:{show}');
            }
            if (!prevent) {
                State.fire('@:{event#panel.change}');
            }
        }
    },
    /**
     * 关闭面板
     * @param info 面板
     * @param pevent 是否阻止事件的派发
     */
    '@:{panels#close.panel}'(info, pevent) {
        if (info['@:{opened}']) {
            info['@:{opened}'] = 0;
            let n = node<HTMLElement>(info['@:{node.id}']);
            n.classList.add('@:scoped.style:opacity-0');
            //n.style.display = 'none';
            let vf = Vframe.byNode(n);
            vf.invoke('@:{hide}');
            if (!pevent) {
                State.fire('@:{event#panel.change}');
            }
        }
    },
    /**
     * 展示或关闭面板
     * @param info 面板
     */
    '@:{panels#toggle.panel}'(info) {
        if (info['@:{opened}']) {
            this['@:{panels#close.panel}'](info);
        } else {
            this['@:{panels#open.panel}'](info);
        }
    },
    /**
     * 打开或折叠面板内容区域
     * @param info 面板
     */
    '@:{panels#toggle.panel.content}'(info, ...args) {
        if (info['@:{opened}']) {
            let n = node(info['@:{node.id}']);
            let vf = Vframe.byNode(n);
            vf.invoke('@:{toggle.height}', ...args);
        }
    },
    /**
     * 获取当前环境所支持的面板，比如迷你模式下部分面板不展示以节省显示区域
     */
    '@:{panels#setup}'() {
        if (!Panels['@:{panels#inited}']) {
            Panels['@:{panels#inited}'] = 1;
            let outerPanels = config<Report.OuterPanelsConfig>('panels') || emptyObject;
            let mini = config('mini') || config('split');

            //有数据源配置才显示数据源面板
            if (config('getFieldUrl') &&
                canDisplayPanel(outerPanels.data)) {
                Panels.push({
                    title: '@:{lang#panel.data}',
                    icon: '&#xe609;',
                    width: 180,
                    cm: 1,
                    height: mini ? 120 : 270,//mini ? 120 : 365,
                    show: 1,//mini ? false : true,
                    scrollable: 1,
                    imd: 1,
                    resizeY: 1,
                    left: 25,
                    //right: 260,
                    top: 90,
                    key: Panels.length + 1,
                    id: 'data',
                    view: '@:./data/index',
                    help: '//github.com/xinglie/report-designer/issues/27'
                });
            }
            //非迷你模式展示概览面板
            if (!mini &&
                canDisplayPanel(outerPanels.outline)) {
                Panels.push({
                    title: '@:{lang#panel.outline}',
                    icon: '&#xe99a;',
                    width: 210,
                    height: 124,
                    key: Panels.length + 1,
                    show: 1,
                    left: 25,
                    bottom: 30,
                    id: 'outline',
                    view: '@:./outline/index',
                });
            }
            if (canDisplayPanel(outerPanels.props)) {
                Panels.push({
                    title: '@:{lang#panel.props}',
                    icon: '&#xe7a1;',
                    width: 262,
                    cm: 1,
                    height: 120,
                    right: 10,
                    top: 90,
                    key: Panels.length + 1,
                    show: 1,
                    scrollable: 1,
                    resizeY: 1,
                    id: 'props',
                    view: '@:./props/index'
                });
            }
            if (canDisplayPanel(outerPanels.tree)) {
                Panels.push({
                    title: '@:{lang#panel.tree}',
                    icon: '&#xe7ef;',
                    width: 200,
                    height: mini ? 120 : 365,// mini ? 120 : 270,
                    //left: 25,
                    right: 280,
                    top: 90,
                    key: Panels.length + 1,
                    show: 0,
                    scrollable: 1,
                    resizeY: 1,
                    id: 'tree',
                    view: '@:./tree/index',
                    help: '//github.com/xinglie/report-designer/issues/14'
                });
            }
            //非迷你模式展示历史记录面板
            if (!mini) {
                if (canDisplayPanel(outerPanels.record)) {
                    Panels.push({
                        title: '@:{lang#panel.record}',
                        icon: '&#xe720;',
                        width: 200,
                        height: 220,
                        show: 0,
                        scrollable: 1,
                        right: 280,
                        bottom: 30,
                        key: Panels.length + 1,
                        id: 'record',
                        view: '@:./record/index'
                    });
                }
                if (canDisplayPanel(outerPanels.element)) {
                    Panels.push({
                        title: '@:{lang#panel.elements}',
                        icon: '&#xe6c3;',
                        width: 175,
                        height: 350,
                        left: 210,
                        top: 90,
                        key: Panels.length + 1,
                        show: 0,
                        scrollable: 1,
                        resizeY: 1,
                        id: 'element',
                        view: '@:./element/index'
                    });
                }

                if (canDisplayPanel(outerPanels.debug)) {
                    Panels.push({
                        title: '调试',
                        width: 210,
                        height: 380,
                        icon: '&#xe606;',
                        show: 0,
                        right: 498,
                        top: 90,
                        scrollable: 1,
                        key: Panels.length + 1,
                        id: 'debug',
                        view: '@:./debug/index',
                        help: '//github.com/xinglie/report-designer/issues'
                    });
                }
                if (screen.width >= 1440) {
                    Panels.push({
                        width: 56,
                        height: 8,
                        center: 1,
                        unselectable: 1,
                        mini: 1,
                        show: 1,
                        right: 320,
                        top: 135,
                        id: '@:{panels#toolbar-do}',
                        view: '@:../designer/toolbar-do'
                    }, {
                        width: 100,
                        height: 8,
                        center: 1,
                        unselectable: 1,
                        mini: 1,
                        show: 1,
                        right: 276,
                        bottom: 50,
                        id: '@:{panels#toolbar-scale}',
                        view: '@:../designer/toolbar-scale'
                    }, {
                        width: 26,
                        height: 81,
                        vertical: 1,
                        center: 1,
                        unselectable: 1,
                        mini: 1,
                        show: 1,
                        right: 350,
                        top: 275,
                        id: '@:{panels#toolbar-cxv}',
                        view: '@:../designer/toolbar-cxv?v=1'
                    }, {
                        width: 26,
                        height: 81,
                        vertical: 1,
                        center: 1,
                        unselectable: 1,
                        mini: 1,
                        show: 1,
                        right: 350,
                        top: 168,
                        id: '@:{panels#toolbar-layer}',
                        view: '@:../designer/toolbar-layer?v=1'
                    }, {
                        width: 26,
                        height: 127,
                        vertical: 1,
                        center: 1,
                        unselectable: 1,
                        mini: 1,
                        show: 1,
                        right: 350,
                        top: 383,
                        id: '@:{panels#toolbar-align}',
                        view: '@:../designer/toolbar-align?v=1'
                    });
                }
            }
            PanelsMap = toMap(Panels, 'id');
        }
        return Panels;
    },
    /**
     * 获取所有面板
     * @returns 面板数组
     */
    '@:{panels#get.panels}'() {
        return Panels;
    },
    /**
     * 获取所有面板map
     * @returns 面板map
     */
    '@:{panels#get.panels.map}'() {
        return PanelsMap;
    },
};