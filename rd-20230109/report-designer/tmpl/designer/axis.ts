/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import DragDrop from '../gallery/mx-dragdrop/index';
import Cursor from '../gallery/mx-pointer/cursor';
import Runner from '../gallery/mx-runner/index';
import I18n from '../i18n/index';
import GenericProvider from '../provider/generic';
import AxisShadow from './axis-shadow';
import Const from './const';
import StageGeneric from './generic';
import DHistory from './history';
import Keyboard from './keyboard';
import Transform from './transform';
let { abs, round } = Math;
let { State, node, applyStyle, mark, View, inside, HIGH } = Magix;
applyStyle('@:axis.less');
/**
 * 缩放配置对象，用于标尺的展示
 * 白名单，为了ui展示的更舒适
 */
let mm = {//其它单位算法
    /**
     * step/scale*10 取约数为space
     * space = const.to.px like const.to.px(25)
     * 未缩放的情况下，一个格子占多长，step = space/10*scale;
     * 确定space即可
     */
    '@:{decimals}': 1,
    '0.5': {
        space: 151.2,//多长显示一个带数字的大刻度
        step: 7.56//多长显示一个小刻度
    },
    '0.75': {
        space: 100.8,
        step: 7.56
    },
    '1': {
        space: 75.6,
        step: 7.56
    },
    '1.25': {
        space: 60.48,
        step: 7.56,
    },
    '1.5': {
        space: 50.4,
        step: 7.56
    },
    '1.75': {
        space: 43.2,
        step: 7.56
    },
    '2': {
        space: 37.8,
        step: 7.56
    },
    '2.25': {
        space: 33.6,
        step: 7.56,
    },
    '2.5': {
        space: 30.24,
        step: 7.56
    },
    '2.75': {
        space: 27.5,
        step: 7.5625
    },
    '3': {
        space: 25.2,
        step: 7.56
    },
    '3.25': {
        space: 23.3,
        step: 7.5725
    },
    '3.5': {
        space: 21.168,
        step: 7.4088
    },
    '3.75': {
        space: 20.16,
        step: 7.56
    },
    '4': {
        space: 18.9,
        step: 7.56
    }
};
let scalesMap = {
    'px': {
        '@:{decimals}': 0,
        '0.5': {
            space: 200,//多长显示一个带数字的大刻度
            step: 10//多长显示一个小刻度
        },
        '0.75': {
            space: 134,
            step: 10.05,
        },
        '1': {
            space: 100,
            step: 10
        },
        '1.25': {
            space: 80,
            step: 10
        },
        '1.5': {
            space: 66,
            step: 9.9
        },
        '1.75': {
            space: 58,
            step: 10.15
        },
        '2': {
            space: 50,
            step: 10
        },
        '2.25': {
            space: 44,
            step: 9.9
        },
        '2.5': {
            space: 40,
            step: 10
        },
        '2.75': {
            space: 36,
            step: 9.9,
        },
        '3': {
            space: 33,
            step: 9.9
        },
        '3.25': {
            space: 31,
            step: 10.075,
        },
        '3.5': {
            space: 29,
            step: 10.15
        },
        '3.75': {
            space: 27,
            step: 10.125,
        },
        '4': {
            space: 25,
            step: 10
        }
    },
    mm,
    'cm': {
        '@:{decimals}': 2,
        '0.5': {
            space: 151.18,//多长显示一个带数字的大刻度
            step: 7.559//多长显示一个小刻度
        },
        '0.75': {
            space: 100.8,
            step: 7.56
        },
        '1': {
            space: 75.59,
            step: 7.559
        },
        '1.25': {
            space: 60.472,
            step: 7.559
        },
        '1.5': {
            space: 50.39,
            step: 7.5585
        },
        '1.75': {
            space: 43.2,
            step: 7.56
        },
        '2': {
            space: 37.795,
            step: 7.559
        },
        '2.25': {
            space: 33.6,
            step: 7.56
        },
        '2.5': {
            space: 30.236,
            step: 7.559
        },
        '2.75': {
            space: 27.48,
            step: 7.557
        },
        '3': {
            space: 25.2,
            step: 7.56
        },
        '3.25': {
            space: 23.4,
            step: 7.605
        },
        '3.5': {
            space: 21.6,
            step: 7.56
        },
        '3.75': {
            space: 20.16,
            step: 7.56
        },
        '4': {
            space: 18.8975,
            step: 7.559
        }
    },
    'in': {
        '@:{decimals}': 2,
        '0.5': {
            space: 192,
            step: 9.6
        },
        '0.75': {
            space: 128,
            step: 9.6
        },
        '1': {
            space: 96,
            step: 9.6
        },
        '1.25': {
            space: 76.8,
            step: 9.6
        },
        '1.5': {
            space: 64,
            step: 9.6
        },
        '1.75': {
            space: 54.86,
            step: 9.6005,
        },
        '2': {
            space: 48,
            step: 9.6
        },
        '2.25': {
            space: 42.66,
            step: 9.5985
        },
        '2.5': {
            space: 38.4,
            step: 9.6
        },
        '2.75': {
            space: 34.9,
            step: 9.5975
        },
        '3': {
            space: 32,
            step: 9.6
        },
        '3.25': {
            space: 29.54,
            step: 9.6005
        },
        '3.5': {
            space: 27.4,
            step: 9.59
        },
        '3.75': {
            space: 25.6,
            step: 9.6,
        },
        '4': {
            space: 24,
            step: 9.6
        }
    },
    'pt': {
        '@:{decimals}': 1,
        '0.5': {
            space: 213.28,
            step: 10.664
        },
        '0.75': {
            space: 142.2,
            step: 10.665
        },
        '1': {
            space: 106.64,
            step: 10.664
        },
        '1.25': {
            space: 85.312,
            step: 10.664
        },
        '1.5': {
            space: 71.1,
            step: 10.665
        },
        '1.75': {
            space: 60.94,
            step: 10.6645
        },
        '2': {
            space: 53.32,
            step: 10.664
        },
        '2.25': {
            space: 47.4,
            step: 10.665
        },
        '2.5': {
            space: 42.656,
            step: 10.664
        },
        '2.75': {
            space: 38.8,
            step: 10.67
        },
        '3': {
            space: 35.55,
            step: 10.665
        },
        '3.25': {
            space: 32.8,
            step: 10.66,
        },
        '3.5': {
            space: 30.47,
            step: 10.6645
        },
        '3.75': {
            space: 28.44,
            step: 10.665
        },
        '4': {
            space: 26.66,
            step: 10.664
        }
    },
    'pc': {
        '@:{decimals}': 2,
        '0.5': {
            space: 160,
            step: 8
        },
        '0.75': {
            space: 106.6,
            step: 7.995
        },
        '1': {
            space: 80,
            step: 8
        },
        '1.25': {
            space: 64,
            step: 8,
        },
        '1.5': {
            space: 53.3,
            step: 7.995
        },
        '1.75': {
            space: 45.72,
            step: 8.001,
        },
        '2': {
            space: 40,
            step: 8
        },
        '2.25': {
            space: 35.56,
            step: 8.001,
        },
        '2.5': {
            space: 32,
            step: 8
        },
        '2.75': {
            space: 29.1,
            step: 8.0025
        },
        '3': {
            space: 26.67,
            step: 8.001
        },
        '3.25': {
            space: 24.62,
            step: 8.0015,
        },
        '3.5': {
            space: 22.86,
            step: 8.001
        },
        '3.75': {
            space: 21.34,
            step: 8.0025
        },
        '4': {
            space: 20,
            step: 8
        }
    },
    'q': mm,
};
export default View.extend({
    tmpl: '@:axis.html',
    init() {
        //监听设计区域的滚动事件，来同步标尺的位置
        let scrollCallback = this['@:{sync.scroll}'].bind(this);
        this['@:{scroll.node}'] = node<HTMLElement>('_rd_stage');
        // node('_rd_stage').addEventListener('scroll',scrollCallback,{
        //     passive:true
        // });
        this.set({
            abs,
            dpr: State.get('@:{global#env.dpr}'),
            toUnit(v) {
                return Const['@:{const#scale.to.unit}'](Const['@:{const#to.unit}'](v));
            },
            bar: 4,//普通刻度条的高度
            hbar: 12,//关键指示条的高度，带数字,
            bc: '#aaa'//颜色
        });
        let update = GenericProvider['@:{generic#debounce}'](this.render, 30, this);
        let toggleHelpLine = e => {
            if (!State.get('@:{global#pointer.is.active}') &&
                e['@:{keypress#is.key.down}'] &&
                !e['@:{keypress#active.is.input}']) {
                let {
                    '@:{keypress#code}': code,
                    '@:{keypress#shift.key}': shiftKey,
                    '@:{keypress#ctrl.key}': ctrlKey,
                    '@:{keypress#alt.key}': altKey
                } = e;
                if (code == Keyboard['@:{key#h}']) {
                    e['@:{keypress#prevent.default}']();
                    if (altKey) {
                        this.render({ '@:{clear}': 1 });
                    } else if (!(shiftKey || ctrlKey)) {
                        this.render({ '@:{toggle}': 1 });
                    }
                }
            }
        };
        let updateLang = ({ to }: Report.EventOfLangChange) => {
            this.digest({
                lang: to
            });
        };
        this['@:{cached.rerender}'] = GenericProvider['@:{generic#debounce}'](this['@:{rerender}'], 20, this);
        State.on('@:{event#lang.change}', updateLang);
        State.on('@:{event#history.shift.change}', update);
        State.on('@:{event#stage.scale.change}', update, HIGH);
        State.on('@:{event#stage.page.change}', update);
        State.on('@:{event#stage.size.change}', update);
        State.on('@:{event#stage.page.and.elements.change}', update);
        State.on('@:{event#key.press}', toggleHelpLine);
        State.on('@:{event#stage.scroll}', scrollCallback, HIGH);
        AxisShadow['@:{axis.shadow#setup}']();
        this.on('destroy', () => {
            State.off('@:{event#lang.change}', updateLang);
            State.off('@:{event#history.shift.change}', update);
            State.off('@:{event#stage.scale.change}', update, HIGH);
            State.off('@:{event#stage.size.change}', update);
            State.off('@:{event#stage.page.change}', update);
            State.off('@:{event#stage.page.and.elements.change}', update);
            State.off('@:{event#key.press}', toggleHelpLine);
            State.off('@:{event#stage.scroll}', scrollCallback, HIGH);
            AxisShadow['@:{axis.shadow#teardown}']();
        });
        this['@:{set.help.line.state}'](1);
    },
    '@:{set.help.line.state}'(show) {
        State.set({
            '@:{global#stage.axis.show.help.lines}': show
        });
        this.set({
            show
        });
    },
    async '@:{rerender}'() {
        if (this['@:{can.render}']) {
            let n = this['@:{scroll.node}'];
            let sa = State.get('@:{global#stage.scale}');
            let rootSize = GenericProvider['@:{generic#get.root.size}']();
            //以下计算滚动区域的宽和高，当区域小于电脑屏幕时，则使用电脑屏幕的尺寸
            let max = this.get('mmax');
            let width = 1.5 * max(n.scrollWidth, rootSize['@:{width}']);
            let height = 1.5 * max(n.scrollHeight, rootSize['@:{height}']);
            let xStart = 0;//水平标尺的起始值
            let xEnd = 0;//水平结束值
            let axisWidth = Const["@:{const#axis.size}"];//标尺尺寸
            let yStart = 0;//垂直标尺的起始值
            let yEnd = 0;//结束值
            let outer = node<HTMLElement>('_rd_so');
            let offset = Transform['@:{transform#get.stage.dom.rect}']();
            let outerOffset = outer.getBoundingClientRect();
            //计算设计区的左上角坐标
            let left = round(offset.x - outerOffset.x);
            //水平开始位置设计区左上角坐标加标尺宽度
            xStart = left + axisWidth;
            //结束
            xEnd = width - xStart;
            //y同理
            yStart = round(offset.y - outerOffset.y);
            yEnd = height - yStart;
            let vHeight = n.offsetHeight;//设计区的可视尺寸
            //let vWidth = n.offsetWidth;
            let unit = State.get('@:{global#stage.unit}');
            let map = scalesMap[unit];
            let si = map[sa];
            let m = mark(this, '@:{render}');
            await this.digest({
                unit: State.get('@:{global#stage.unit}'),
                d: map['@:{decimals}'],
                st: n.scrollTop,
                sl: n.scrollLeft,
                width,
                scale: sa,
                space: si.space,
                step: si.step,
                height,
                xs: xStart,
                xe: xEnd,
                ys: yStart,
                vh: vHeight,
                ye: yEnd
            });
            if (m() &&
                !this['@:{x.axis}']) {
                //缓存节点对象，防止反复读取
                let { id } = this;
                this['@:{x.axis}'] = node(`_rd_${id}_x`);
                this['@:{y.axis}'] = node(`_rd_${id}_y`);
                this['@:{x.line}'] = node(`_rd_${id}_x_line`);
                this['@:{y.line}'] = node(`_rd_${id}_y_line`);
                this['@:{x.line.tip}'] = node(`_rd_${id}_x_tip`);
                this['@:{y.line.tip}'] = node(`_rd_${id}_y_tip`);
                this['@:{x.axis.help}'] = node(`_rd_${id}_x_help`);
                this['@:{y.axis.help}'] = node(`_rd_${id}_y_help`);
            }
        }
    },
    '@:{sync.scroll}'({ x: left, y: top }) {//根据滚动位置同步标尺位置
        let xNode = this['@:{x.axis}'];
        let yNode = this['@:{y.axis}'];
        let yHelpNode = this['@:{y.axis.help}'];
        let xHelpNode = this['@:{x.axis.help}'];
        if (xNode) {//水平标尺
            xNode.scrollLeft = left;
        }
        if (yNode) {//垂直标尺
            yNode.scrollTop = top;
        }
        if (xHelpNode) {//水平辅助线
            xHelpNode.style.transform = `translateX(-${left}px)`;
        }
        if (yHelpNode) {//垂直辅助线
            yHelpNode.style.transform = `translateY(-${top}px)`;
        }
        this.set({
            sl: left,
            st: top
        });
    },
    render(e) {
        let m = mark(this, '@:{render}');
        let xHelpers = State.get('@:{global#stage.x.help.lines}');
        let yHelpers = State.get('@:{global#stage.y.help.lines}');
        let show = this.get('show');
        if (xHelpers.length ||
            yHelpers.length) {
            if (e) {
                // if (e.type == '@:{event#history.shift.change}') {
                //     show = 1;
                // } else
                if (e['@:{toggle}']) {
                    this['@:{set.help.line.state}'](!show);
                } else if (e['@:{clear}']) {
                    xHelpers.length = 0;
                    yHelpers.length = 0;
                    DHistory["@:{history#save}"](DHistory['@:{history#clear.help.line}']);
                }
            }
        }
        this.set({
            xhs: xHelpers,
            yhs: yHelpers,
        });
        //因为设计区和标尺并不在一起，所以以下尝试在设计区就绪后再初始化标尺
        let test = () => {
            if (node('_rd_sc')) {
                Runner["@:{task.remove}"](test);
                if (m()) {
                    this['@:{can.render}'] = 1;
                    this['@:{rerender}']();
                }
            }
        };
        Runner["@:{task.remove}"](test);
        Runner["@:{task.add}"](20, test);
    },
    '@:{show.x.line}<pointermove>'(e) {//鼠标在水平移动时显示垂直辅助线
        if (Const['@:{const#support.axis.help.line}']) {
            let preventKeypress = State.get('@:{global#pointer.is.active}');
            let xNode = this['@:{x.axis}'];
            if (!preventKeypress && xNode) {
                let offset = this.root.getBoundingClientRect();
                let v = (e.pageX - offset.x - scrollX) | 0;//实际坐标需要鼠标坐标减去节点的左上角坐标
                let start = this.get('xs');
                let styles = this['@:{x.line}'].style;
                styles.display = 'block';
                styles.left = v + 'px';
                this['@:{moved.x.value}'] = v;
                let mm = v - start + xNode.scrollLeft;
                let scale = this.get('scale');//根据缩放转化成需要显示的值
                let toUnit = this.get('toUnit');
                this['@:{x.line.tip}'].innerText = toUnit(mm / scale);
            }
        }
    },
    '@:{hide.x.line}<pointerout>'(e) {//鼠标离开后，隐藏跟随鼠标的垂直辅助线
        if (!inside(e.relatedTarget, e.eventTarget) &&
            this['@:{x.line}']) {
            this['@:{x.line}'].style.display = 'none';
        }
    },
    '@:{show.y.line}<pointermove>'(e) {//同x的处理
        if (Const['@:{const#support.axis.help.line}']) {
            let preventKeypress = State.get('@:{global#pointer.is.active}');
            let yNode = this['@:{y.axis}'];
            if (!preventKeypress && yNode) {
                let offset = this.root.getBoundingClientRect();
                let v = (e.pageY - offset.y - scrollY) | 0;
                let start = this.get('ys');
                let styles = this['@:{y.line}'].style;
                styles.display = 'block';
                styles.top = v + 'px';
                this['@:{moved.y.value}'] = v;
                let mm = v - start - Const["@:{const#axis.size}"] + yNode.scrollTop;
                let scale = this.get('scale');
                let toUnit = this.get('toUnit');
                this['@:{y.line.tip}'].innerText = toUnit(mm / scale);
            }
        }
    },
    '@:{hide.y.line}<pointerout>'(e) {//同x的处理
        if (!inside(e.relatedTarget, e.eventTarget) &&
            this['@:{y.line}']) {
            this['@:{y.line}'].style.display = 'none';
        }
    },
    '@:{add.x.help.line}<click>'() {//在水平标尺上点击时，添加垂直辅助线
        let xLine = this['@:{x.line}'];
        if (xLine &&
            Const['@:{const#support.axis.help.line}']) {
            let v = this['@:{moved.x.value}'];
            xLine.style.display = 'none';
            let start = this.get('xs');
            let xNode = this['@:{x.axis}'];
            let scale = this.get('scale');
            //计算需要显示的px单位的值
            let mm = ((v - start + xNode.scrollLeft) / scale) | 0;
            let xHelpers = this.get('xhs');
            xHelpers.push(mm);
            this['@:{set.help.line.state}'](1)
            this.digest({
                xhs: xHelpers
            });
            State.fire('@:{event#stage.axis.help.lines.change}');
            DHistory["@:{history#save}"](DHistory['@:{history#add.help.line}'], I18n('@:{lang#help.line.v}'));
        }
    },
    '@:{add.y.help.line}<click>'() {//在垂直标尺上点击时，添加水平辅助线
        let yLine = <HTMLDivElement>this['@:{y.line}'];
        if (yLine &&
            Const['@:{const#support.axis.help.line}']) {
            yLine.style.display = 'none';
            let v = this['@:{moved.y.value}'];
            let start = this.get('ys');
            let yNode = this['@:{y.axis}'];
            let scale = this.get('scale');
            let mm = ((v - start - Const["@:{const#axis.size}"] + yNode.scrollTop) / scale) | 0;
            let yHelpers = this.get('yhs');
            yHelpers.push(mm);
            this['@:{set.help.line.state}'](1);
            this.digest({
                yhs: yHelpers
            });
            State.fire('@:{event#stage.axis.help.lines.change}');
            DHistory["@:{history#save}"](DHistory['@:{history#add.help.line}'], I18n('@:{lang#help.line.h}'));
        }
    },
    '@:{delete.help.line}<click>'(e) {//点击删除辅助线
        let { type, i } = e.params;
        let key = type + 'hs';
        let list = this.get(key);
        list.splice(i, 1);
        this.digest({
            [key]: list
        });
        State.fire('@:{event#stage.axis.help.lines.change}');
        DHistory["@:{history#save}"](DHistory['@:{history#delete.help.line}'], I18n(type == 'x' ? '@:{lang#help.line.v}' : '@:{lang#help.line.h}'));
    },
    '@:{drag.help.line}<pointerdown>'(e) {//拖动辅助线
        if (e.target == e.eventTarget) {
            // let oldSelected = StageSelection["@:{selection#set}"]();
            // if (oldSelected) {//辅助线按下拖动时，清除编辑区元素的选中状态
            //     DHistory["@:{history#save}"](DHistory['@:{history#element.lost.focus}'], StageGeneric['@:{generic#query.element.name}'](oldSelected));
            // }
            let { type, i, c: current } = e.params;
            let key = type + 'hs';
            let list = this.get(key);
            let start = this.get(type + 's');
            let showedCursor = 0;
            State.fire('@:{event#pointer.using}', {
                active: 1
            });
            this['@:{drag.drop}'](e, (evt) => {
                if (!showedCursor) {
                    showedCursor = 1;
                    Cursor["@:{show}"](e.eventTarget);
                }
                let oft;
                if (type == 'x') {
                    oft = evt.pageX - e.pageX + current;
                } else {
                    oft = evt.pageY - e.pageY + current - Const["@:{const#axis.size}"];
                }
                list[i] = ((oft - start) / this.get('scale')) | 0;
                this.digest({
                    [key]: list
                });
            }, () => {
                State.fire('@:{event#pointer.using}');
                if (showedCursor) {
                    Cursor["@:{hide}"]();
                    DHistory["@:{history#save}"](DHistory['@:{history#move.help.line}'], I18n(type == 'x' ? '@:{lang#help.line.v}' : '@:{lang#help.line.h}'));
                }
            });
        }
    },
    //通过键盘按键来移动辅助线
    '@:{move.help.line}<keydown>'(e: Magix5.MagixKeyboardEvent) {
        let { code, shiftKey, eventTarget, params } = e;
        let step = shiftKey ? Const["@:{const#keyboard.with.shift.move.step}"] : Const["@:{const#keyboard.move.step}"];
        let { type, i } = params;
        let key = `${type}hs`;
        let list = this.get(key);
        if (code == Keyboard["@:{key#tab}"] ||
            code == Keyboard['@:{key#escape}']) {//按tab键时，需要把焦点移走
            eventTarget.blur();
        } else if (code == Keyboard["@:{key#delete}"] ||
            code == Keyboard["@:{key#backspace}"]) {//按删除键时，删除辅助线
            eventTarget.blur();
            list.splice(i, 1);
            this.digest({
                [key]: list
            });
            DHistory["@:{history#save}"](DHistory['@:{history#delete.help.line}'], I18n(type == 'x' ? '@:{lang#help.line.v}' : '@:{lang#help.line.h}'));
        } else {
            //不同方向的辅助线，键盘移动的方向键不同
            if (type == 'x' &&
                (code == Keyboard["@:{key#left}"] ||
                    code == Keyboard["@:{key#right}"])) {
                if (code == Keyboard["@:{key#left}"]) {
                    step *= -1;
                }
                list[i] += step;
                this.digest({
                    [key]: list
                });
                DHistory["@:{history#save}"](DHistory['@:{history#move.help.line}'], I18n('@:{lang#help.line.v}'), '@:{x.help.lines.keyboard.move}', Const['@:{const#hisotry.save.continous.delay}']);
            } else if (type == 'y' &&
                (code == Keyboard["@:{key#up}"] ||
                    code == Keyboard["@:{key#down}"])) {
                if (code == Keyboard["@:{key#up}"]) {
                    step *= -1;
                }
                list[i] += step;
                this.digest({
                    [key]: list
                });
                DHistory["@:{history#save}"](DHistory['@:{history#move.help.line}'], I18n('@:{lang#help.line.h}'), '@:{y.help.lines.keyboard.move}', Const['@:{const#hisotry.save.continous.delay}']);
            }
        }
    },
    '@:{toggle.help.lines}<click>'(e: Magix5.MagixPointerEvent) {
        this['@:{set.help.line.state}'](!this.get('show'));
        this.digest();
    },
    '@:{wheel.axis}<wheel>&{passive:false}'(e: WheelEvent & Magix5.MagixPointerEvent) {
        this['@:{prevent.default}'](e);
        let { type } = e.params;
        let { x, y } = StageGeneric['@:{generic#query.delta.by.wheel}'](e);
        let xType = type == 'x';
        if ((xType && x) ||
            (!xType && y)) {
            let line = <HTMLDivElement>this[xType ? '@:{x.line}' : '@:{y.line}'];
            if (line?.style.display != 'none') {
                this[xType ? '@:{show.x.line}<pointermove>' : '@:{show.y.line}<pointermove>'](e);
            }
            if (xType) {
                y = 0;
            } else {
                x = 0;
            }
            let stageNode = node<HTMLElement>('_rd_stage');
            StageGeneric['@:{generic#scroll.node.by.wheel}'](x, y, stageNode);
        }
    }
}).merge(DragDrop);