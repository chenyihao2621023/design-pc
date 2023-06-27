//magix-composer#loader=none;
if (typeof DEBUG == 'undefined') DEBUG = true;
if (typeof APPROVE == 'undefined') APPROVE = true;
if (typeof SUPPORT_RDS == 'undefined') SUPPORT_RDS = true;
if (typeof SCENE_LABEL == 'undefined') SCENE_LABEL = '${SCENE_LABEL}';
if (typeof SCENE_IOT == 'undefined') SCENE_IOT = '${SCENE_IOT}';
if (typeof LOCALRES == 'undefined') LOCALRES = '${LOCALRES}';
'compiled@:./lib/patch.ts';
'compiled@:./lib/sea.js';
'compiled@:./lib/magix.ts';
/*!report-desinger|https://github.com/xinglie|${U_START}*/
(() => {
    let bootDir = (document.currentScript as HTMLScriptElement).src.replace(/\/[^\/]+$/, '/');
    let body = document.body;
    let pathRelativeBoot = path => path.startsWith('.') ? s.rp(bootDir + path) : path;
    let { max, min } = Math;
    let P = Promise;
    //let filter = (key, value) => key.startsWith('_') ? undefined : value;
    let initConfig = (ops?) => {
        if (!initConfig['@:{inited.promise}']) {
            if (DEBUG) {
                s.config({
                    paths: {
                        designer: bootDir + 'designer',
                        elements: bootDir + 'elements',
                        gallery: bootDir + 'gallery',
                        gadget: bootDir + 'gadget',
                        i18n: bootDir + 'i18n',
                        provider: bootDir + 'provider',
                        viewer: bootDir + 'viewer'
                    }
                });
            }
            initConfig['@:{inited.promise}'] = new P<void>(resolve => {
                s.use(['magix5', 'i18n/index', 'provider/generic'], ({
                    applyStyle,
                    config,
                    View
                }, I18n, GenericProvider) => {
                    applyStyle('@:scoped.style');
                    let lang = GenericProvider['@:{generic#store.get}']('lang', 'zh');
                    config(ops, {
                        lang
                    });
                    View.merge({
                        ctor() {
                            this.set({
                                //enSpace: GenericProvider['@:{generic#encode.space}'],
                                enHTML: GenericProvider['@:{generic#encode.html}'],
                                safeHTML: GenericProvider['@:{generic#safe.html}'],
                                i18n: I18n,
                                am: GenericProvider['@:{generic#generate.preview.animation}'],
                                mmax: max,
                                mmin: min
                            });
                        },
                        // update(props) {
                        //     this.set({
                        //         props
                        //     });
                        //     this.render();
                        // },
                        '@:{prevent.default}'(e: PointerEvent) {
                            e.preventDefault();
                        },
                        '@:{stop.propagation}'(e: PointerEvent) {
                            e.stopPropagation();
                        },
                        '@:{stop}<change,wheel>'(e) {
                            this['@:{stop.propagation}'](e);
                        },
                    });
                    resolve();
                });
            });
        }
        return initConfig['@:{inited.promise}'];
    };
    /**
     * 记录异常
     * @param e 异常
     */
    let logError = e => {
        if (DEBUG) {
            setTimeout(() => {
                throw e;
            }, 0);
        }
        if (APPROVE) {
            let { config, toUrl } = s.r('magix5');
            let reportUrl = config('errorReportUrl');
            if (reportUrl) {
                reportUrl = toUrl(reportUrl, {
                    error: e.message || e.reason
                });
                navigator.sendBeacon(reportUrl);
            }
        }
    };
    let initStandalone = async (ops?) => {
        await initConfig(ops);
        if (!initStandalone['@:{inited.promise}']) {
            initStandalone['@:{inited.promise}'] = new P<void>(resolve => {
                addEventListener('unhandledrejection', logError);
                s.use(['magix5'], ({
                    View,
                    boot,
                    config
                }) => {
                    let rootId = config('rootId');
                    s.d('~/root', () => {
                        return View.extend();
                    });
                    if (!body.id) {
                        body.id = rootId;
                    }
                    boot({
                        mark:'${MARK}',
                        defaultPath: '/rd/${U_START}',
                        defaultView: '~/root',
                        rootId: body.id,
                        error: logError
                    });
                    resolve();
                });
            });
        }
        return initStandalone['@:{inited.promise}'];
    };
    let rootSelector = '@:scoped.style:designer-root';
    let mountView = async (nodeOrId, path, params) => {
        await initStandalone();
        let { config, node, isString, Vframe, State } = s.r('magix5');
        let rootId = config('rootId');
        let rootNode = node(rootId);
        State.set({
            '@:{global#stage.unit}': params.unit || 'px'
        });
        let rootVframe = Vframe.byNode(rootNode);
        let destNode = nodeOrId;
        if (isString(destNode)) {
            destNode = node(destNode.replace(/^#/, ''));
        }
        if (destNode) {
            if (!destNode.classList.contains(rootSelector)) {
                destNode.classList.add(rootSelector, '@:scoped.style:designer-ff');
            }
            let oldVf = Vframe.byNode(destNode);
            if (oldVf?.path == path) {
                await oldVf.invoke('assign', params);
                await oldVf.invoke('render');
            } else {
                rootVframe.mount(destNode, path, params);
            }
        }
    };
    window.viewer = {
        resolve: pathRelativeBoot,
        /**
         * 打印或虚拟页面安装
         * @param ops 安装选项
         * @returns
         */
        setup(ops = {}) {
            return new P(async resolve => {
                await initStandalone(ops);
                s.use(['magix5'], ({ node,
                    config,
                    Vframe,
                }) => {
                    let { rootId: appId = 'app',
                        use: view = 'viewer/index', } = ops,
                        root = node(appId);
                    if (view == 'virtual') {
                        view = 'viewer/virtual';
                        root = document.createElement('div');
                        root.className = '@:scoped.style:{pointer-events-none,offscreen-holder,pf,opacity-0}';
                        body.append(root);
                    } else {
                        if (SCENE_LABEL) {
                            view = 'viewer/label';
                            config({
                                labelCols: ops.labelCols || 1,
                                labelGap: ops.labelGap || 0
                            });
                        } else if (SCENE_IOT) {
                            view = 'viewer/iot';
                        }
                    }
                    root.classList.add(rootSelector, '@:scoped.style:designer-ff', '@:scoped.style:overscroll-behavior-contain');
                    let rId = config('rootId');
                    let rootVframe = Vframe.byNode(node(rId));
                    resolve(rootVframe.mount(root, view));
                });
            });
        },
        /**
         * 渲染单个元素
         * @param nodeOrId 节点或节点id
         * @param elementJSON 元素JSON对象
         */
        element(nodeOrId, elementJSON) {
            mountView(nodeOrId, `elements/${elementJSON.type}/index`, elementJSON);
        },
        /**
         * 获取Vframe对象
         * @param nodeOrId 节点或节点id
         * @returns Magix.Vframe
         */
        // getVframe(nodeOrId) {
        //     return new P((resolve, reject) => {
        //         let tryTimes = 20;
        //         let destNode = nodeOrId;
        //         let { node, Vframe, isString } = s.r('magix5');
        //         if (isString(destNode)) {
        //             destNode = node((destNode as string).replace(/^#/, ''));
        //         }
        //         let check = () => {
        //             if (destNode) {
        //                 let vf = Vframe.byNode(destNode);
        //                 if (vf) {
        //                     resolve(vf);
        //                 } else {
        //                     tryTimes--;
        //                     if (!tryTimes) {
        //                         reject(new Error('can not find vframe'));
        //                     } else {
        //                         setTimeout(check, 50);
        //                     }
        //                 }
        //             } else {
        //                 reject(new Error('can not find nodeOrId'));
        //             }
        //         };
        //         setTimeout(check, 50);
        //     });
        // },
        /**
         * 渲染整个页面
         * @param nodeOrId 节点或节点id
         * @param pageJSON 页面JSON对象
         */
        // page(nodeOrId, pageJSON) {
        //     mountView(nodeOrId, `viewer/page`, pageJSON);
        // },
        /**
         * 删除某个节点上的vframe
         * @param nodeOrId 节点或节点id
         * @returns boolean
         */
        remove(nodeOrId) {
            let destNode = nodeOrId;
            let { node, Vframe, isString } = s.r('magix5');
            if (isString(destNode)) {
                destNode = node((destNode as string).replace(/^#/, ''));
            }
            if (destNode) {
                let vf = Vframe.byNode(destNode);
                if (vf) {
                    vf.unmount();
                    return true;
                }
            }
            return false;
        },
        /**
         * 销毁
         */
        destroy() {
            removeEventListener('unhandledrejection', logError);
            s.use(['magix5'], ({ unboot }) => {
                initStandalone['@:{inited.promise}'] = null;
                unboot();
            });
        }
    };
})();