//magix-composer#loader=none;
if (typeof DEBUG == 'undefined') DEBUG = true;
if (typeof APPROVE == 'undefined') APPROVE = true;
if (typeof SCENE_LABEL == 'undefined') SCENE_LABEL = '${SCENE_LABEL}';
if (typeof SCENE_IOT == 'undefined') SCENE_IOT = '${SCENE_IOT}';
if (typeof LOCALRES == 'undefined') LOCALRES = '${LOCALRES}';
'compiled@:./lib/patch.ts';
'compiled@:./lib/sea.js';
'compiled@:./lib/magix.ts';
/*!report-desinger|https://github.com/xinglie|${U_START}*/
(() => {
    let { max, min } = Math;
    /**
     * 安装全局通用的基础方法
     * @param View Magix.View
     * @param I18n 多语言对象
     * @param GenericProvider 通用方法对象
     */
    let setupBase = (View, I18n, GenericProvider, lang) => {
        if (!setupBase['@:{called}']) {
            setupBase['@:{called}'] = 1;
            View.merge({
                ctor() {
                    this.set({
                        lang,
                        //enSpace: GenericProvider['@:{generic#encode.space}'],
                        enHTML: GenericProvider['@:{generic#encode.html}'],
                        safeHTML: GenericProvider['@:{generic#safe.html}'],
                        i18n: I18n,
                        am: GenericProvider['@:{generic#generate.design.animation}'],
                        amp: GenericProvider['@:{generic#generate.preview.animation}'],
                        mmax: max,
                        mmin: min
                    });
                },
                '@:{prevent.default}'(e: PointerEvent) {
                    e.preventDefault();
                },
                '@:{stop.propagation}'(e: PointerEvent) {
                    e.stopPropagation();
                },
                '@:{stop}<change,wheel>'(e) {
                    this['@:{stop.propagation}'](e);
                },
                '@:{prevent}<contextmenu>'(e: PointerEvent) {
                    this['@:{prevent.default}'](e);
                }
            });
        }
    };
    /**
     * 加载插件
     * @param use 加载器方法
     * @param plugins 插件
     */
    let loadPlugins = async (use, plugins) => {
        if (!loadPlugins['@:{called}']) {//插件只处理一次
            loadPlugins['@:{called}'] = 1;
            if (plugins?.length) {
                let loaded = [];
                for (let e of plugins) {
                    loaded.push(`elements/${e}/index`);
                }
                return await use(...loaded);
            }
        }
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
    let bootDir = (document.currentScript as HTMLScriptElement).src.replace(/\/[^\/]+$/, '/');
    let destroyed;
    let pathRelativeBoot = path => path.startsWith('.') ? s.rp(bootDir + path) : path;
    let P = Promise;
    window.designer = {
        /**
         * 把项目中的其它资源，如图片、字体等处理为相对入口文件的路径，方便在其它项目中只引用入口文件即可正常访问
         */
        resolve: pathRelativeBoot,
        /**
         * 安装设计器
         * @param ops 安装选项
         * @returns Promise
         */
        setup(ops: Magix5.Config = {}) {
            destroyed = 0;
            return new P(resolve => {
                if (DEBUG) {
                    s.config({
                        paths: {
                            designer: bootDir + 'designer',
                            elements: bootDir + 'elements',
                            gallery: bootDir + 'gallery',
                            gadget: bootDir + 'gadget',
                            i18n: bootDir + 'i18n',
                            neat: bootDir + 'neat',
                            panels: bootDir + 'panels',
                            provider: bootDir + 'provider'
                        }
                    });
                }
                s.use([
                    'magix5',
                    'i18n/index',
                    'provider/generic'
                ], async ({
                    applyStyle,
                    config,
                    State,
                    View,
                    node,
                    use,
                    boot
                }, I18n, GenericProvider) => {
                    applyStyle('@:scoped.style');
                    let lang = GenericProvider['@:{generic#store.get}']('lang', 'zh');
                    config(ops, {
                        lang,
                    });
                    setupBase(View, I18n, GenericProvider, lang);
                    let rootId = ops.rootId || 'app';
                    /**
                     * 监听设计器初始化完成
                     */
                    State.on('@:{event#designer.ready}', resolve);
                    let { classList } = node(rootId);
                    classList.add('@:scoped.style:designer-root', '@:scoped.style:designer-ff', '@:scoped.style:hp100', '@:scoped.style:overflow-hidden', '@:scoped.style:pr', '@:scoped.style:overscroll-behavior-contain');
                    //这里可采用外部配置的方式
                    let plugins = ['chart', 'svg', 'flow', 'lscreen'];
                    let args = await loadPlugins(use, plugins);
                    if (args) {
                        for (let setup of args) {
                            setup();
                        }
                    }
                    if (!destroyed) {
                        addEventListener('unhandledrejection', logError);
                        boot({
                            mark:'${MARK}',
                            defaultPath: '/rd/${U_START}',
                            defaultView: 'designer/index',
                            rootId,
                            retard(f) {
                                State.fire('@:{event#magix.busy}', {
                                    busy: f
                                });
                            },
                            request(f) {
                                State.fire('@:{event#magix.request}', {
                                    '@:{is.start}': f
                                });
                            },
                            error: logError
                        });
                    }
                });
            });
        },
        /**
         * 获取内容
         * @returns Promise<string>
         */
        get() {
            return new P((resolve, reject) => {
                s.use('designer/tojson', ToJSON => {
                    if (destroyed) {
                        reject('designer destroyed');
                    }
                    try {
                        resolve(ToJSON());
                    } catch (ex) {
                        reject('designer exception:' + ex.message);
                    }
                });
            });
        },
        /**
         * 设置内容
         * @param content 内容对象或字符串
         */
        set(content) {
            s.use(['magix5', 'designer/history'], ({ isString, State }, DHistory) => {
                let stage = content;
                if (isString(content)) {
                    stage = JSON.parse(content as string);
                }
                if (!destroyed) {
                    State.fire('@:{event#example.change}', {
                        '@:{example.change.event#type}': DHistory['@:{history#example.from.custom}'],
                        '@:{example.change.event#stage}': stage
                    });
                }
            });
        },
        /**
         * 销毁
         */
        destroy() {
            destroyed = 1;
            let Magix = s.r('magix5');
            if (Magix) {
                removeEventListener('unhandledrejection', logError);
                let { unboot, State } = Magix;
                State.off('@:{event#designer.ready}');
                unboot();
            }
        }
    };
})();