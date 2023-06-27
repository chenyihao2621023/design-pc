/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Dialog from '../gallery/mx-dialog/index';
import Runner from '../gallery/mx-runner/index';
import Toast from '../gallery/mx-toast/index';
import I18n from '../i18n/index';
import Panels from '../panels/index';
import ChangeUnitProvider from '../provider/cunit';
import DataCenterProvider from '../provider/datacenter';
import ExampleProvider from '../provider/example';
import GenericProvider from '../provider/generic';
import HistoryProvider from '../provider/history';
import PropProvider from '../provider/prop';
import RequestStateProvider from '../provider/rstate';
import SnapshotProvider from '../provider/snapshot';
import StageClipboard from './clipboard';
import Const from './const';
import Example from './example';
import StageGeneric from './generic';
import DHistory from './history';
import Keyboard from './keyboard';
import StageSelection from './selection';
import Service from './service';
import Shortcuts from './shortcuts';
import Theme from './theme';
import ToJSON from './tojson';
let { State, applyStyle, View,
    node, config, mark, has,
    //now, HIGH, LOW,
    delay, lowTaskFinale, } = Magix;
let P = Promise,
    d = designer;
applyStyle('@:index.less');
let elementIdPrefix = 'rde_' + Date.now().toString(36);
let doc = document;
/**
 * 根据快捷键处理相应的面板行为
 * @param index 待响应的面板下标索引
 * @param toggleHeight 是否打开或关闭内容
 */
let togglePanel = (index: number,
    toggleHeight: boolean | number) => {
    let panels = Panels['@:{panels#get.panels}']();
    let dest = panels[index];
    if (dest &&
        !dest.mini) {
        if (toggleHeight) {//仅展示可折叠内容
            Panels["@:{panels#toggle.panel.content}"](dest);
        } else {//展示可隐藏面板
            Panels["@:{panels#toggle.panel}"](dest);
        }
    }
};
/**
 * 安装外部view
 * @param config 外部view安装配置项
 * @param mountView 渲染哪个view到外面
 * @param owner 谁拥有安装的view
 */
let setupOuterView = (config: Report.OuterViewConfig,
    mountView: string,
    owner: Magix5.Vframe) => {
    if (config &&
        !config.hidden &&
        config.to) {
        let dest = node<HTMLElement>(config.to);
        if (dest) {
            dest.classList.add('@:scoped.style:designer-root', '@:scoped.style:designer-ff');
            owner.mount(dest, mountView);
        }
    }
};
/**
 * 判断内部模块是否应该隐藏
 * @param viewName 模块名称
 * @returns 是否隐藏
 */
let isBuiltInHidden = (cfg: Report.OuterViewConfig) => {
    return cfg && (cfg.to || cfg.hidden);
}
/**
 * 鼠标滚轮加ctrl缩放设计区
 */
let mousewheelZoom = GenericProvider['@:{generic#throttle}']((y, shift, alt) => {
    let code;
    //根据滚动方向，把鼠标行为转换为键盘行为，复用快捷键的放大缩小功能
    if (y > 0) {
        code = Keyboard['@:{key#ctrl.plus}']
    } else if (y < 0) {
        code = Keyboard['@:{key#ctrl.minus}'];
    }
    if (code) {//转为键盘事件
        State.fire('@:{event#key.press}', {
            '@:{keypress#is.key.down}': 1,
            '@:{keypress#ctrl.key}': 1,
            '@:{keypress#shift.key}': shift,
            '@:{keypress#alt.key}': alt,
            '@:{keypress#code}': code,
        });
    }
}, Const['@:{const#wheel.delay.time}']);

//反调试
//以下这个if语句完成在发布模式下的反调试功能，如果需要发布调试，可删除这个if语句
if (!DEBUG && !APPROVE) {
    // let F = Function,
    //     FS = F + '',
    //     FUS = F[FS] + '';
    // let a = `.${FS[5] + FS[6]}`;
    // let allowedHost = {//允许哪些域名使用当前的设计器
    //     [`x${FS[5]}${FS[2]}gl${FS[5]}e${a[0]}g${FS[5]}${FS[4]}h${FUS[0]}b${a}`]: 1,
    //     [`x${FS[5]}${FS[2]}gl${FS[5]}e${a[0]}g${FS[5]}${FS[4]}ee${a}`]: 1,
    //     [`rd${a}`]: 1
    // };
    // if (!allowedHost[location[`h${FS[6]}st${FS[2]}ame`]]) {
    //     unboot();
    // } else {
    // let now = performance.now.bind(performance);
    // let task = t1 => {
    //     t1 = now();
    //     F(`${FUS.slice(2, 4)}b${FS[1]}gg${FUS[3]}r`)();
    //     if (now() - t1 > 100) {
    //         Runner['@:{task.remove}'](task);
    //         unboot();
    //     }
    // }
    // Runner["@:{task.add}"](2000, task);
    //}
}
//快捷键处理
let ShortcutsProcessors = [({
    '@:{keypress#code}': code,
    '@:{keypress#shift.key}': shiftKey,
    '@:{keypress#ctrl.key}': ctrlKey,
    '@:{keypress#alt.key}': altKey,
    '@:{keypress#prevent.default}': prevent,
}) => {
    if (ctrlKey &&
        !shiftKey &&
        !altKey) {//仅ctrl开始
        let find;
        if (code == Keyboard['@:{key#p}']) {
            prevent();
            State.fire('@:{event#stage.preview}');
            find = 1;
        } else if (code == Keyboard['@:{key#h}']) {
            prevent();
            State.fire('@:{event#stage.toggle.axis}');
            find = 1;
        } else if (code == Keyboard['@:{key#b}']) {
            prevent();
            State.fire('@:{event#toggle.element.outline}');
            find = 1;
        } else if (code == Keyboard['@:{key#k}']) {
            prevent();
            State.fire('@:{event#toggle.element.keep.ratio}');
            find = 1;
        } else if (code == Keyboard['@:{key#e}']) {// ctrl+e 显示模板
            prevent?.();
            State.fire('@:{event#stage.show.template}');
            find = 1;
        }
        return find;
    }
}, ({
    '@:{keypress#code}': code,
    '@:{keypress#shift.key}': shiftKey,
    '@:{keypress#ctrl.key}': ctrlKey,
    '@:{keypress#alt.key}': altKey,
    '@:{keypress#prevent.default}': prevent,
}) => {
    if (!altKey &&
        !ctrlKey &&
        shiftKey) {//仅shift开始
        let find;
        if (code == Keyboard["@:{key#z}"]) {//shift+z，打开或关闭所有面板
            prevent?.();
            let allOpen = Panels["@:{panels#is.all.opened}"]();
            if (allOpen) {
                Panels["@:{panels#close.all.panels}"]();
            } else {
                Panels["@:{panels#open.all.panels}"]();
            }
            find = 1;
        } else if (code == Keyboard["@:{key#slash}"]) {// shift+/ 显示快捷键
            prevent?.();
            State.fire('@:{event#stage.show.help}');
            find = 1;
        } else if (code == Keyboard['@:{key#t}']) {// shift+t 显示主题
            prevent?.();
            State.fire('@:{event#stage.show.theme}');
            find = 1;
        }
        return find;
    }
}, ({
    '@:{keypress#code}': code,
    '@:{keypress#shift.key}': shiftKey,
    '@:{keypress#ctrl.key}': ctrlKey,
    '@:{keypress#alt.key}': altKey,
}) => {
    //shift  数字
    if (!ctrlKey &&
        !altKey &&
        has(Keyboard['@:{key#numbers.map}'], code)) {//单纯按下数字1-5
        togglePanel(Keyboard['@:{key#numbers.map}'][code], shiftKey);
        return 1;
    }
}, ({
    '@:{keypress#code}': code,
    '@:{keypress#shift.key}': shiftKey,
    '@:{keypress#ctrl.key}': ctrlKey,
    '@:{keypress#alt.key}': altKey,
    '@:{keypress#prevent.default}': prevent,
}) => {
    if (!altKey &&
        ctrlKey &&
        code == Keyboard["@:{key#s}"]) {//如果是ctrl+s或cmd+s，显示保存
        prevent();
        State.fire('@:{event#stage.content.save}', {
            '@:{save.content.event#shift.key}': shiftKey
        });
        return 1;
    }
}, ({
    '@:{keypress#code}': code,
    '@:{keypress#shift.key}': shiftKey,
    '@:{keypress#ctrl.key}': ctrlKey,
    '@:{keypress#alt.key}': altKey,
    '@:{keypress#prevent.default}': prevent,
}) => {
    if (ctrlKey) {
        let find;
        let scale = State.get('@:{global#stage.scale}'),
            old = scale,
            maxScale = Const["@:{const#scale.max}"],
            minScale = Const["@:{const#scale.min}"],
            step = shiftKey ? Const['@:{const#scale.fast.increase}'] : altKey ? Const['@:{const#scale.slow.decrease}'] : Const["@:{const#scale.step}"];
        if (code == Keyboard["@:{key#ctrl.plus}"]) {
            find = 1;
            prevent?.();
            scale += step;
            if (scale > maxScale) scale = maxScale;
        } else if (code == Keyboard["@:{key#ctrl.minus}"]) {
            find = 1;
            prevent?.();
            scale -= step;
            if (scale < minScale) scale = minScale;
        } else if (code == Keyboard["@:{key#num.zero}"]) {
            find = 1;
            //e['@:{keypress#prevent.default}']();
            //恢复我们不阻止，万－浏览器真有缩放存在，可以通过该操作进行恢复
            scale = 1;
            //reset = 1;
        }
        //缩放变化且当前活动节点不是输入框
        if (old != scale) {
            State.set({
                '@:{global#stage.scale}': scale
            });
            State.fire('@:{event#stage.scale.change}', {
                step: scale / old
            });
            let msg;
            if (scale == 1) {
                msg = DHistory['@:{history#zoomreset.stage}'];
            } else if (scale > old) {
                msg = DHistory['@:{history#zoomin.stage}'];
            } else {
                msg = DHistory['@:{history#zoomout.stage}'];
            }
            DHistory["@:{history#save}"](msg);
        }
        return find;
    }
}, ({
    '@:{keypress#code}': code,
    '@:{keypress#shift.key}': shiftKey,
    '@:{keypress#ctrl.key}': ctrlKey,
    '@:{keypress#alt.key}': altKey,
}) => {
    if (!(ctrlKey || shiftKey || altKey)) {
        let find;
        if (code == Keyboard['@:{key#c}']) {//单纯的按c
            find = 1;
            if (StageGeneric['@:{generic#query.can.clear.stage}']()) {
                State.fire('@:{event#stage.clear}');
            }
        } else if (code == Keyboard['@:{key#n}']) {
            find = 1;
            if (StageGeneric['@:{generic#query.can.create.new.page}']()) {
                State.fire('@:{event#stage.clear}', {
                    '@:{clear.events#action}': '@:{clear.events#new}'
                });
            }
        }
        return find;
    }
}, ({
    '@:{keypress#code}': code,
    '@:{keypress#data}': keyboardData
}) => {
    if (code == Keyboard['@:{key#custom.force.open.panel}']) {
        Panels['@:{panels#force.open.by.ids}'](keyboardData);
        return 1;
    }
}];
export default View.extend({
    tmpl: '@:index.html',
    init() {
        let rootClassList = this.root.classList;
        //设置全局数据
        State.set({
            '@:{global#stage.element.id.prefix}': elementIdPrefix,
            '@:{global#stage.unit}': Const['@:{const#unit}'],
            '@:{global#env.dpr}': devicePixelRatio,
            '@:{global#stage.elements.groups.linked}': false,
            '@:{global#stage.element.keep.ratio}': false,
            '@:{global#stage.scale}': Const['@:{const#stage.scale}'],
        });
        let pageCtrl = State.get('@:{global#stage.page.ctrl}');
        let max = this.get('mmax');
        State.set({
            '@:{global#stage.page}': pageCtrl['@:{get.props}'](),
            '@:{global#stage.elements}': [],
            '@:{global#stage.select.elements}': [],
            '@:{global#stage.elements.groups}': {},
            '@:{global#stage.x.help.lines}': [],
            '@:{global#stage.y.help.lines}': [],
            '@:{global#stage.clipboard}': {}
        });
        /**
         * 清空设计器
         * @param e 清空事件
         */
        let clearStageElements = (e: Report.EventOfStageClear) => {//清空设计区元素
            let xLines = State.get<number[]>('@:{global#stage.x.help.lines}');
            let yLines = State.get<number[]>('@:{global#stage.y.help.lines}');
            let elements = State.get<Report.StageElement[]>('@:{global#stage.elements}');
            this.confirm(I18n(e['@:{clear.events#action}'] == '@:{clear.events#new}' ? '@:{lang#create.new.page.confirm}' : '@:{lang#clear.stage.element.confirm}'), async () => {
                xLines.length = 0;
                yLines.length = 0;
                let m = mark(this, '@:{clear.and.new.mark}');
                let stageNode = node<HTMLDivElement>('_rd_stage');
                let oldScale = State.get<number>('@:{global#stage.scale}'),
                    scaleChange,
                    isNewAction,
                    x = 0, y = 0;
                if (e['@:{clear.events#action}'] !== '@:{clear.events#new}' &&
                    Const['@:{const#support.readonly.element}']) {
                    let page = State.get<Report.StagePage>('@:{global#stage.page}');
                    page.readonly = false;
                    StageGeneric['@:{generic#remove.nonreadonly.elements}'](elements, 1);
                } else {
                    isNewAction = 1;
                    StageClipboard['@:{clear}']();
                    State.set({
                        '@:{global#stage.unit}': Const['@:{const#unit}']
                    });
                    let pageCtrl = State.get('@:{global#stage.page.ctrl}');
                    let page = pageCtrl['@:{get.props}']();
                    let scale = StageGeneric['@:{generic#measure.scale}'](page);
                    if (oldScale != scale) {
                        scaleChange = 1;
                    }
                    elements.length = 0;
                    State.set({
                        '@:{global#stage.scale}': scale,
                        '@:{global#stage.page}': page
                    });
                }
                State.set({
                    '@:{global#stage.elements}': elements,
                    '@:{global#stage.elements.groups}': {}
                });
                if (scaleChange) {
                    State.fire('@:{event#stage.scale.change}');
                }
                StageSelection["@:{selection#set}"]();
                State.fire('@:{event#stage.page.and.elements.change}');
                DHistory["@:{history#save}"](DHistory[e['@:{clear.events#action}'] == '@:{clear.events#new}' ? '@:{history#new.page}' : '@:{history#clear.stage}']);
                await delay(50);
                await lowTaskFinale();
                if (isNewAction &&
                    stageNode &&
                    m()) {
                    stageNode.scrollTo(x, y);
                }
            });
        };
        /**
         * 展示设计区数据内容
         */
        let showContent = () => {
            if (Const['@:{const#save.can.show.stage.content}']) {
                let rootSize = GenericProvider['@:{generic#get.root.size}']();
                this.mxDialog({
                    view: '@:./content',
                    width: max(1200, rootSize['@:{width}'] - 200)
                });
            }
        };
        /**
         * 保存内容
         * @param e 保存内容事件对象
         */
        let saveContent = (e: Report.EventOfContentSave) => {
            let pageData = State.get<Report.StagePage>('@:{global#stage.page}');
            if (!e ||
                !e['@:{save.content.event#shift.key}']) {
                if (!pageData.readonly) {
                    //let whenSave = config<Function>('whenSave');
                    let url = config<string>('saveContentUrl');
                    // if (whenSave) {
                    //     whenSave(ToJSON(1));
                    // } else
                    if (url) {
                        let autoSave = e['@:{save.content.event#auto.save}'];
                        if (!autoSave) {//自动保存无论成功或失败均不提示，避免干扰用户
                            Toast.show('正在保存...');
                        }
                        let m = mark(this, '@:{save.content}');
                        try {
                            let s = new Service();
                            s.save({
                                name: '@:{save.content}',
                                '@:{body}': {
                                    stage: ToJSON(1)
                                },
                            }, (ex: {
                                message: string
                            }, bag) => {
                                if (m()) {
                                    if (ex) {
                                        if (!autoSave) {
                                            Toast.hide();
                                            this.alert(I18n('@:{lang#save.failure}') + ex.message);
                                        }
                                    } else {
                                        if (!autoSave) {
                                            Toast.show(I18n('@:{lang#save.success}'), 2e3);
                                        }
                                    }
                                }
                            });
                        } catch (ex) {
                            if (!autoSave &&
                                m()) {
                                Toast.hide();
                                this.alert(ex.message);
                            }
                        }
                    }
                }
            } else {
                showContent();
            }
        };
        /**
         * 预览
         */
        let preview = () => {
            if (Const['@:{const#new.page.print}']) {
                let old = this['@:{viewer.post.fn}'];
                if (old) {
                    Runner["@:{task.remove.background}"](old);
                }
                this['@:{viewer.try.send.message}'] = 0;
                let previewUrl = StageGeneric['@:{generic#query.preview.url}']();
                let w = open(previewUrl, '@:{viewer}');
                w.focus();
                let { protocol, host } = location;
                let origin = protocol + '//' + host;
                let post = () => {
                    w.postMessage(ToJSON(1, 1), origin);
                    this['@:{viewer.try.send.message}']++;
                    if (this['@:{viewer.try.send.message}'] > Const['@:{const#viewer.try.send.times}']) {
                        Runner["@:{task.remove.background}"](post);
                    }
                };
                Runner["@:{task.add.background}"](Const['@:{const#viewer.try.send.interval}'], this['@:{viewer.post.fn}'] = post);
            } else {
                let rootSize = GenericProvider['@:{generic#get.root.size}']();
                this.mxDialog({
                    view: '@:./viewer',
                    width: max(1360, rootSize['@:{width}'] - 50)
                });
            }
        };
        let toggleAxis = () => {
            let hidden = rootClassList.contains('@:index.less:hide-axis');
            if (hidden) {
                //axisClassList.remove('@:scoped.style:opacity-0');
                rootClassList.remove('@:index.less:hide-axis');
            } else {
                //axisClassList.add('@:scoped.style:opacity-0');
                rootClassList.add('@:index.less:hide-axis');
            }
        };
        let showHelp = () => {
            if (Const['@:{const#support.help}']) {
                Shortcuts["@:{show}"](this);
            }
        };
        let showTheme = () => {
            console.log(123,Const['@:{const#support.theme}'] )
            if (Const['@:{const#support.theme}']) {
                Theme['@:{show}'](this);
            }
        };
        let showTemplate = () => {
            Example['@:{show}'](this);
        };
        /**
         * 监听键盘按下抬起
         * @param e 按键事件
         */
        let watchKeypress = (e: Report.EventOfKeyboardPress) => {
            let {
                '@:{keypress#code}': code,
                '@:{keypress#shift.key}': shiftKey,
                '@:{keypress#ctrl.key}': ctrlKey,
                '@:{keypress#alt.key}': altKey,
                '@:{keypress#is.key.down}': isKeydown,
                '@:{keypress#active.is.input}': activeIsInput,
                '@:{keypress#support.prevent.default}': canPrevent,
                '@:{keypress#data}': keyboardData
            } = e;
            if (State.get('@:{global#pointer.is.active}') ||
                !isKeydown ||
                activeIsInput) return;
            for (let p of ShortcutsProcessors) {
                if (p(e)) {
                    break;
                }
            }
        };
        /**
         * 是否为独立模式
         */
        let union = !(config('split') || config('mini'));
        /**
         * 更新标题
         */
        let updateTitle = () => {
            if (APPROVE) {
                if (union) {
                    doc.title = config('siteName') || I18n('@:{lang#site.name}');
                }
            } else {
                doc.title = I18n('@:{lang#site.name}');
            }
        };
        let updateLang = ({ to }: Report.EventOfLangChange) => {
            updateTitle();
            this.digest({
                lang: to
            });
            GenericProvider['@:{generic#store.set}']('lang', to);
        };
        let mutexPointerAndKeyboard = ({ active }: Report.EventOfPointerUsing) => {
            State.set({ '@:{global#pointer.is.active}': active });
        };
        updateTitle();
        State.on('@:{event#lang.change}', updateLang);
        //清空
        State.on('@:{event#stage.clear}', clearStageElements);
        //保存
        State.on('@:{event#stage.content.save}', saveContent);
        //按键
        State.on('@:{event#key.press}', watchKeypress);
        //鼠标激活的状态下排斥键盘
        State.on('@:{event#pointer.using}', mutexPointerAndKeyboard);
        //预览
        State.on('@:{event#stage.preview}', preview);
        //标尺
        State.on('@:{event#stage.toggle.axis}', toggleAxis);
        //帮助
        State.on('@:{event#stage.show.help}', showHelp);
        //主题
        State.on('@:{event#stage.show.theme}', showTheme);
        //模板
        State.on('@:{event#stage.show.template}', showTemplate);
        //未授权提示
        // if (!APPROVE) {
        //     State.on('@:{event#history.list.change}', () => {
        //         (now() % 200 < 10) && Toast.show(atob('dW5hdXRob3JpemVk'), 6 * HIGH, 1);
        //     }, LOW);
        // }

        //监听历史记录事件
        HistoryProvider['@:{history#setup}']();
        //安装全局数据缓存监控
        StageGeneric['@:{generic#setup.all.elements.cache.monitor}']();
        //流程图监控元素之间的连线插件
        let flowProvider = State.get('@:{global#provider.of.flow}');
        flowProvider?.['@:{flow.provider#setup.flow.monitor}']();
        //示例模板插件
        ExampleProvider['@:{example#setup}'](this);
        //请求及繁忙状态
        RequestStateProvider['@:{rstate#setup}']();
        //单位转换
        ChangeUnitProvider['@:{cunit#setup}']();
        //安装键盘监视
        Keyboard['@:{key#setup.monitor}']();
        //属性面板监视
        PropProvider['@:{prop#setup}']();
        //安装面板
        Panels['@:{panels#setup}']();
        //快照
        if (Const['@:{const#support.snapshot}']) {
            SnapshotProvider['@:{snapshot#setup}'](this);
        }
        this.on('destroy', () => {
            DHistory['@:{history#clear}']();
            HistoryProvider['@:{history#teardown}']();
            Panels['@:{panels#destroy}']();
            StageClipboard['@:{clear}']();
            StageSelection['@:{selection#reset.map}']();
            Keyboard['@:{key#teardown.monitor}']();
            PropProvider['@:{prop#teardown}']();
            SnapshotProvider['@:{snapshot#teardown}']();
            ChangeUnitProvider['@:{cunit#teardown}']();
            RequestStateProvider['@:{rstate#teardown}']();
            ExampleProvider['@:{example#teardown}']();
            flowProvider?.['@:{flow.provider#teardown.flow.monitor}']();
            StageGeneric['@:{generic#teardown.all.elements.cache.monitor}']();
            State.off('@:{event#stage.clear}', clearStageElements);
            State.off('@:{event#stage.content.save}', saveContent);
            State.off('@:{event#key.press}', watchKeypress);
            State.off('@:{event#lang.change}', updateLang);
            State.off('@:{event#pointer.using}', mutexPointerAndKeyboard);
            State.off('@:{event#stage.preview}', preview);
            State.off('@:{event#stage.toggle.axis}', toggleAxis);
            State.off('@:{event#stage.show.help}', showHelp);
            State.off('@:{event#stage.show.theme}', showTheme);
            State.off('@:{event#stage.show.template}', showTemplate);
        });
        this.set({
            union
        });
    },
    /**
     * 获取数据源数据，数据源在项目中多处使用，这里进行统一请求，并放置在State中，供其它view使用
     */
    '@:{fetch.data.source}'() {
        return new P<void>(resolve => {
            if (config('getFieldUrl')) {
                let s = new Service();
                s.all('@:{get.fields}', (err, bag) => {
                    let dataSourceList = bag.get('data', []);
                    let list = [{
                        name: I18n('@:{lang#select.source}'),
                        id: ''
                    }].concat(dataSourceList);
                    DataCenterProvider['@:{register.global.source}'](list, err);
                    resolve();
                });
            } else {
                resolve();
            }
        });
    },
    async '@:{read.by.id}'(readById) {
        return new P<number>(resolve => {
            let fill;
            /**
             * 有id和内容接口或有预设内容接口
             * 优先根据id读取内容
             */
            Toast.show(I18n('@:{lang#reading.content}'), 0, 1);
            let s = new Service();
            let sendParams,
                title;
            if (readById) {
                sendParams = '@:{get.content}';
                title = I18n('@:{lang#edit.content}');
            } else {
                sendParams = '@:{get.preset}';
                title = I18n('@:{lang#preset.content}');
            }
            s.all(sendParams, (ex, bag) => {
                if (ex) {
                    this.alert(ex.message);
                } else {
                    let stage = bag.get('data');
                    if (stage) {
                        fill = 1;
                        State.fire('@:{event#example.change}', {
                            '@:{example.change.event#type}': DHistory['@:{history#example.from.remote}'],
                            '@:{example.change.event#title}': title,
                            '@:{example.change.event#stage}': stage
                        });
                    }
                }
                Toast.hide();
                resolve(fill);
            });
        });
    },
    '@:{apply.theme}'() {
        return new P<void>(resolve => {
            let themeUrl = config<string>('getThemeUrl');
            if (themeUrl) {
                let s = new Service();
                s.all({
                    //name: '@:{get.by.url}',
                    url: themeUrl
                }, (err, bag) => {
                    let theme = bag.get('data');
                    Theme['@:{apply.theme}'](theme?.brand, theme?.contrast);
                    resolve();
                });
            } else {
                let themeBrand = config<string>('themeBrand');
                let themeContrast = config<string>('themeContrast');
                if (APPROVE &&
                    themeBrand &&
                    themeContrast) {
                    Theme['@:{apply.theme}'](themeBrand, themeContrast);
                }
                resolve();
            }
        });
    },
    async render() {
        let m = mark(this, '@:{render}');
        let toolbarConfig = config<Report.OuterViewConfig>('toolbar');
        let headerConfig = config<Report.OuterViewConfig>('header');
        let owner = this.owner;
        await P.all([
            this['@:{fetch.data.source}'](),
            this['@:{apply.theme}']()
        ]);
        await this.digest({
            so: Const['@:{const#element.show.normal.outline}'],
            snv: '@:scoped.style:var(--scoped-element-outline-color)',
            copyright: APPROVE ? config('copyright') : '',
            hideToolbar: isBuiltInHidden(toolbarConfig),
            hideHeader: isBuiltInHidden(headerConfig)
        });
        //XFontFace['@:{idle.load}']();
        if (m()) {
            Panels['@:{panels#display.show.panels}']();
            Panels['@:{panels#mount.outer.panels}']();
            setupOuterView(headerConfig, '@:./header', owner);
            setupOuterView(toolbarConfig, '@:./toolbar', owner);
            /**
             * 如果地址栏有id且配置了获取内容的url，则从接口读取内容
             * 否则如果配置了模板接口，则从模板列表中随机选择一个
             */
            let templateUrl = config<string>('getTemplateUrl');//获取示例内容的接口
            let contentUrl = config<string>('getContentUrl');//根据id读取具体内容的接口
            let presetUrl = config<string>('presetUrl');//预设内容的接口，比如进入设计器时，默认是空白，可以配置该接口返回内容，让设计器不显示空白界面。
            //let whenFetch = config<Function>('whenFetch');//自定义获取内容的方法
            let prefillContent;
            // if (whenFetch) {//如果有自定义获取内容的方法，则调用
            //     let stage = await whenFetch();
            //     if (stage) {
            //         if (isString(stage)) {//支持字符串格式
            //             stage = JSON.parse(stage);
            //         }
            //         prefillContent = 1;
            //         State.fire('@:{event#example.change}', {
            //             '@:{example.change.event#type}': DHistory['@:{history#example.from.custom}'],
            //             '@:{example.change.event#stage}': stage
            //         });
            //     }
            // } else
            if (contentUrl ||
                presetUrl) {
                prefillContent = await this['@:{read.by.id}'](contentUrl);
            } else if (templateUrl &&
                Const['@:{const#random.examples}']) {//如果有示例配置,且允许显示随机示例
                prefillContent = await Example["@:{load}"]();
            }
            if (!prefillContent) {
                DHistory['@:{history#save.default}']();
            }
            State.fire('@:{event#designer.ready}');
        }
    },
    /**
     * 监听设计区的滚动，让标尺进行同步
     */
    '@:{stage.scroll}<scroll>&{capture:true}'({ eventTarget }: Magix5.MagixPointerEvent) {
        let { scrollTop,
            scrollLeft } = eventTarget;
        if (scrollTop != this['@:{last.stage.top}'] ||
            scrollLeft != this['@:{last.stage.left}']) {
            this['@:{last.stage.top}'] = scrollTop;
            this['@:{last.stage.left}'] = scrollLeft;
            State.fire('@:{event#stage.scroll}', {
                y: scrollTop,
                x: scrollLeft
            });
        }
    },
    '@:{stage.wheel}<wheel>&{passive:false}'(e: Magix5.MagixPointerEvent & WheelEvent) {
        if (!e['@:{halt}']) {
            let {
                x, y, meta
            } = StageGeneric['@:{generic#query.delta.by.wheel}'](e);
            if (Const['@:{const#stage.wheel.zoom}'] &&
                meta) {
                this['@:{prevent.default}'](e);
                mousewheelZoom(y, e.shiftKey, e.altKey);
            } else if (Const['@:{const#stage.hook.wheel.event}']) {
                this['@:{prevent.default}'](e);
                StageGeneric['@:{generic#scroll.node.by.wheel}'](x, y, e.eventTarget);
            }
        }
    },
    // '@:{copyright.over}<pointerover>'(e: Magix5.MagixPointerEvent) {
    //     let over = !inside(e.relatedTarget, e.eventTarget);
    //     if (over) {
    //         let wechat = node<HTMLDivElement>(`_rd_wechat`);
    //         if (wechat) {
    //             wechat.classList.add('@:./index.less:wechat-show');
    //         }
    //     }
    // },
    // '@:{copyright.out}<pointerout>'(e: Magix5.MagixPointerEvent) {
    //     let out = !inside(e.relatedTarget, e.eventTarget);
    //     if (out) {
    //         let wechat = node<HTMLDivElement>(`_rd_wechat`);
    //         if (wechat) {
    //             wechat.classList.remove('@:./index.less:wechat-show');
    //         }
    //     }
    // },
    '$doc<dragover,drop>&{passive:false}'(e: DragEvent) {//发生的dragover与drop均需要阻止默认行为，前者是防止浏览器打开拖进来的元素，后者是防止文件拖动放置在textarea等输入框内
        this['@:{prevent.default}'](e);
    },
    '$win<message>'(e) {
        if (Const['@:{const#new.page.print}']) {
            let { protocol, host } = location;
            let origin = protocol + '//' + host;
            if (e.origin == origin &&
                e.data == '@:{viewer.message.received}') {
                console.log('callback', this['@:{viewer.post.fn}']);
                Runner["@:{task.remove.background}"](this['@:{viewer.post.fn}']);
            }
        }
    },
}).merge(Dialog);