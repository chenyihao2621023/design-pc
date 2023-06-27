/**
 * 全局常用方法
 */
import Magix from 'magix5';
import Transform from '../designer/transform';
import I18n from '../i18n/index';
let { guid, mark, now, node,
    State, config,
    isArray, isObject } = Magix;
let rootNodeStyle;
let scriptStyleReg = /<(script|style)[^>]*>[\S\s]*<\/\1[^>]*>/gi;
//let textId = guid('_rd_mtxt_');
let barId = guid('_rd_bar_');
let barInfo;
//处理textarea中的回车换行
let returnReg = /(?:\r\n|\r|\n)/g;
let charMap = {
    '&': 38,
    '<': 60,
    '>': 62,
    '"': 34,
    '\'': 39,
    '\`': 96
};
let charReg = /[&<>"'\`]/g;
let charReplacer = m => `&#${charMap[m]};`;
let empty = /\s/g;
let guard = str => str == null ? '' : str + '';
let tagReg = /<[^>]+>/g;
let tagRecoverReg = /\x1f\d+\x1f/g;
//let enSpace = v => guard(v).replace(empty, '&nbsp;');
let enHTML = str => {
    str = guard(str);
    return str.replace(charReg, charReplacer)
        .replace(returnReg, '<br/>').replace(empty, '&nbsp;');
};
let safeHTML = v => guard(v).replace(scriptStyleReg, '');


let clone = a => {
    if (a) {
        if (isArray(a)) {
            let c = [];
            for (let b of a) {
                c.push(clone(b));
            }
            a = c;
        } else if (isObject(a)) {
            let c = {};
            for (let b in a) {
                c[b] = clone(a[b]);
            }
            a = c;
        }
    }
    return a;
};
/**
 * 获取滚动信息
 * @param moveNode 待展示节点
 * @param scollerNode 滚动节点
 */
let getScrollXY = (moveNode: HTMLElement, scollerNode: HTMLElement) => {
    let rect1 = scollerNode.getBoundingClientRect();
    let rect2 = moveNode.getBoundingClientRect();
    if (!Transform["@:{transform#rect.intersect}"](rect1, rect2, true)) {
        let { offsetHeight, offsetWidth,
            scrollLeft, scrollTop,
            scrollHeight, scrollWidth } = scollerNode;
        let offsetY = offsetHeight / 3;
        let offsetX = offsetWidth / 3;
        let toLeft = rect2.x + scrollLeft - rect1.x - offsetX;
        let toTop = rect2.y + scrollTop - rect1.y - offsetY;
        let maxTop = scrollHeight - offsetHeight;
        let maxLeft = scrollWidth - offsetWidth;
        if (toLeft < 0) {
            toLeft = 0;
        } else if (toLeft > maxLeft) {
            toLeft = maxLeft;
        }
        if (toTop < 0) {
            toTop = 0;
        } else if (toTop > maxTop) {
            toTop = maxTop;
        }
        return {
            x: toLeft,
            y: toTop
        };
    }
};
/**
 * 使节点滚动到可视范围内
 * @param id 节点id
 * @param scrollerNode 滚动节点
 * @param count 重试次数
 */
let scrollIntoView = (id: string,
    scrollerNode?: HTMLElement,
    count: number = 1) => {
    if (count < 5) {
        let n = node(scrollerNode ? id : '_rdm_' + id) as HTMLDivElement;
        if (!n) {
            setTimeout(scrollIntoView, 20, id, scrollerNode, count++);
        } else {
            //console.log('count', count);
            let scroller = scrollerNode || node('_rd_stage') as HTMLDivElement;
            let info = getScrollXY(n, scroller);
            if (info) {
                scroller.scrollTo(info.x, info.y);
            }
        }
    }
};

let sortAnimation = (a, b) => {
    if (a.repeat != b.repeat) {
        if (a.repeat == 'infinite') {
            return 1;
        }
        if (b.repeat == 'infinite') {
            return -1;
        }
        return a.repeat - b.repeat;
    }
    return 0;
};
export default {
    /**
     * 复制数据
     */
    '@:{generic#clone}': clone,
    /**
     * 获取滚动信息
     */
    '@:{generic#get.scroll.xy}': getScrollXY,
    /**
     * 使节点滚动出现在可视范围内
     */
    '@:{generic#scroll.into.view}': scrollIntoView,
    /**
     * 移除不必要的标签
     * @param v 源字符串
     * @returns 处理后的字符串
     */
    '@:{generic#safe.html}': safeHTML,
    /**
     * 延迟执行方法
     * @param fn 待执行的方法
     * @param timespan 时间
     * @param context this指向
     * @returns 优化后的方法
     */
    '@:{generic#debounce}'(fn, timespan: number, context: object = null) {
        timespan = timespan || 150;
        let timer,
            markKey = guid('dm_'),
            view = this;
        return (...args) => {
            clearTimeout(timer);
            let m = mark(view, markKey);
            timer = setTimeout(() => {
                if (m()) {
                    fn.apply(context, args);
                }
            }, timespan);
        };
    },
    /**
     * 节流
     * @param fn 待执行方法
     * @param wait 等待时间
     * @returns 优化后的方法
     */
    '@:{generic#throttle}'(fn, wait = 50) {
        // 上一次执行 fn 的时间
        let previous = 0,
            current;
        return (...args) => {
            current = now();
            if (current - previous > wait) {
                previous = current;
                fn(...args);
            }
        };
    },
    /**
     * 把数字转为A或AB这样的excel列标题
     * @param index 开始下标
     * @param base 从哪个字符转换
     * @returns 转换后的字符串
     */
    '@:{generic#excel.col.title}'(index: number, base = 65) {
        let str = '',
            rest;
        index += 1;
        while (index) {
            rest = (index - 1) % 26;
            str = String.fromCharCode(rest + base) + str;
            index = (index - rest - 1) / 26;
        }
        return str;
    },
    /**
     * 对字符串中的<>&等转义且对回车换行转成<br/>
     * @param str 待处理的字符串
     * @returns 处理后的字符串
     */
    '@:{generic#encode.html}': enHTML,
    /**
     * 对字符串中的空格等转义成html实体
     * @param str 待处理的字符串
     * @returns 处理后的字符串
     */
    //'@:{generic#encode.space}': enSpace,

    /**
     * 根据角度计算鼠标样式
     * @param rotate 旋转角度
     * @param offset 偏移角度
     * @returns 鼠标样式
     */
    '@:{generic#cursor.shape}'(rotate: number, offset: number = 0) {
        rotate = (rotate + offset) % 180;
        if (rotate <= 22.5 ||
            rotate > 157.5) {
            return 'ew';
        }
        if (rotate <= 67.5) {
            return 'nwse';
        }
        if (rotate <= 112.5) {
            return 'ns'
        }
        if (rotate <= 157.5) {
            return 'nesw';
        }
    },
    // '@:{generic#measure.fitted.text.size}'(props: Report.StageElementProps,
    //     presets: number[],
    //     containerWidth: number, containerHeight: number) {
    //     let unit = State.get('@:{global#stage.unit}');
    //     let host = node<HTMLDivElement>(textId);
    //     if (!host) {
    //         host = document.createElement('div');
    //         host.id = textId;
    //         document.body.appendChild(host);
    //         host.className = `@:scoped.style:{designer-root,offscreen-holder,pf,pointer-events-none,opacity-0}`;
    //     }
    //     let { text, richtext,
    //         letterspacing, lineheight, fontfamily,
    //         fontsize } = props;
    //     let hostStyle = host.style;
    //     let size = fontsize;
    //     if (text) {
    //         hostStyle.cssText = `letter-spacing:${letterspacing}${unit};line-height:${lineheight};font-family:${fontfamily}`;
    //         host.innerHTML = richtext ? safeHTML(text) : enHTML(text);
    //         let search = (min, max) => {
    //             let half = min + ((max - min) / 2) | 0;
    //             if (half == min) {
    //                 size = presets[half];
    //             } else {
    //                 hostStyle.fontSize = presets[half] + unit;
    //                 if (host.offsetHeight > containerHeight ||
    //                     host.offsetWidth > containerWidth) {
    //                     search(min, half);
    //                 } else {
    //                     search(half, max);
    //                 }
    //             }
    //         };
    //         search(0, presets.length);
    //     }
    //     return size;
    // },
    /**
     * 测量文本尺寸
     * @param props 文本属性
     */
    // '@:{generic#measure.text.size}'(props: Report.StageElementProps) {
    //     let unit = State.get('@:{global#stage.unit}');
    //     let host = node<HTMLDivElement>(textId);
    //     if (!host) {
    //         host = document.createElement('div');
    //         host.id = textId;
    //         document.body.appendChild(host);
    //         host.className = `@:scoped.style:{designer-root,pa}`;
    //     }
    //     host.style.cssText = `left:-1000px;top:-1000px;font-size:${props.fontsize}${unit};letter-spacing:${props.letterspacing}${unit};line-height:${props.lineheight};font-family:${props.fontfamily}`;
    //     let { text, richtext } = props;
    //     host.innerHTML = richtext ? safeHTML(text) : enHTML(text);
    //     return {
    //         '@:{width}': host.offsetWidth + 1,//for safe size
    //         '@:{height}': host.offsetHeight + 1,
    //     };
    // },
    /**
     * 在字符串前面填充内容
     * @param str 原字符串
     * @param n 长度
     * @param char 填充字符
     * @returns 处理后的字符串
     */
    '@:{generic#pad.start}'(str: any, n: number = 2, char: string = '0') {
        str += '';
        if (str.length < n) {
            str = char.repeat(n - str.length) + str;
        }
        return str;
    },
    /**
     * 获取品牌色
     */
    '@:{generic#get.brand.color}'() {
        if (!rootNodeStyle) {
            let rootId = config<string>('rootId');
            let rootNode = node<Element>(rootId);
            rootNodeStyle = getComputedStyle(rootNode);
        }
        return rootNodeStyle.getPropertyValue('@:scoped.style:var(--scoped-color-brand)');
    },
    /**
     * 获取主设计区尺寸
     */
    '@:{generic#get.root.size}'() {
        let rootId = config<string>('rootId');
        let rootNode = node<HTMLElement>(rootId);
        return {
            '@:{width}': rootNode.offsetWidth,
            '@:{height}': rootNode.offsetHeight
        };
    },
    /**
     * 生成设计区动画
     * @param animations 动画
     */
    '@:{generic#generate.design.animation}'(animations) {
        if (State.get('@:{global#panels.animate.enable}') !== false &&
            animations?.length) {
            let time = State.get<number>('@:{global#panels.animate.current.time}');
            let names = [],
                delays = [],
                repeats = [],
                fns = [],
                durations = [],
                modes = [],
                directions = [];
            for (let { delay, repeat, fn, use,
                duration, direction, mode, hidden } of animations) {
                if (hidden ||
                    !use.trim() ||
                    time < delay) {
                    continue;
                }
                let us = use.split(',');
                for (let u of us) {
                    let destTime = time;
                    if (repeat != 'infinite') {
                        let max = delay + duration * repeat;
                        if (time > max) {
                            destTime = max;
                        }
                    }
                    names.push(u);
                    delays.push(`-${destTime - delay}s`);
                    repeats.push(repeat);
                    fns.push(fn);
                    durations.push(`${duration}s`);
                    modes.push(mode);
                    directions.push(direction);
                }
            }
            if (names.length) {
                return `animation-name:${names};animation-delay:${delays};animation-iteration-count:${repeats};animation-timing-function:${fns};animation-play-state:paused;animation-duration:${durations};animation-fill-mode:${modes};animation-direction:${directions};`;
            }
        }
        return '';
    },
    /**
     * 生成预览区动画
     * @param animations 动画
     * @returns
     */
    '@:{generic#generate.preview.animation}'(animations) {
        if (animations?.length) {
            let names = [],
                delays = [],
                repeats = [],
                fns = [],
                durations = [],
                modes = [],
                directions = [];
            animations.sort(sortAnimation);
            for (let { use, delay, repeat, fn,
                duration, mode, direction, hidden } of animations) {
                if (hidden ||
                    !use.trim()) {
                    continue;
                }
                let us = use.split(',');
                for (let u of us) {
                    names.push(u);
                    delays.push(`${delay}s`);
                    repeats.push(repeat);
                    fns.push(fn);
                    durations.push(`${duration}s`);
                    modes.push(mode);
                    directions.push(direction);
                }
            }
            if (names.length) {
                return `animation-name:${names};animation-delay:${delays};animation-iteration-count:${repeats};animation-timing-function:${fns};animation-duration:${durations};animation-fill-mode:${modes};animation-direction:${directions};`;
            }
        }
        return '';
    },
    /**
     * 获取滚动条尺寸
     */
    '@:{generic#measure.scrollbar.size}'() {
        if (!barInfo) {
            let bar = node<HTMLDivElement>(barId);
            if (!bar) {
                bar = document.createElement('div');
                bar.className = '@:scoped.style:{designer-root,designer-ff,pf,offscreen-holder,pointer-events-none,width-60,height-26,scrollable,overflow-auto,scrollbar-gutter-stable,opacity-0}';
                bar.innerHTML = `<div class="@:scoped.style:{height-100,width-242}"></div>`;
                bar.id = barId;
                document.body.appendChild(bar);
            }
            barInfo = {
                '@:{bar#width}': bar.offsetWidth - bar.clientWidth,
                '@:{bar#height}': bar.offsetHeight - bar.clientHeight
            };
        }
        return barInfo;
    },
    /**
     * 存储html片断防止干扰分析
     * @param html html片断
     * @returns
     */
    '@:{generic#store.html}'(html: string) {
        let store = {},
            idx = 0;
        html = html.replace(tagReg, m => {
            let key = store[m];
            if (!key) {
                key = '\x1f' + (idx++) + '\x1f';
                store[m] = key;
                store[key] = m;
            }
            return key;
        });
        return {
            '@:{generic#store}': store,
            '@:{generic#html}': html
        }
    },
    /**
     * 还原html片断
     * @param html 处理后的html字符串
     * @param store 存储的html片断对象
     * @returns
     */
    '@:{generic#recover.html}'(html: string, store: object) {
        return html = html.replace(tagRecoverReg, m => {
            return store[m] || m;
        });
    },
    /**
     * 存储数据
     * @param key key
     * @param value value
     */
    '@:{generic#store.set}'(key: string, value: string) {
        try {
            localStorage.setItem('@:{projectName}.' + key, value);
        } catch {

        }
    },
    /**
     * 获取数据
     * @param key key
     * @param defaults 默认值
     */
    '@:{generic#store.get}'(key: string, defaults?: any) {
        try {
            defaults = localStorage.getItem('@:{projectName}.' + key) ?? defaults;
        } catch {

        }
        return defaults;
    },
    /**
     * 比较规则
     */
    '@:{generic#compare.rules}': [{
        text: '等于',
        value: '=='
    }, {
        text: '不等于',
        value: '!='
    }, {
        text: '大于',
        value: '>'
    }, {
        text: '大于等于',
        value: '>='
    }, {
        text: '小于',
        value: '<'
    }, {
        text: '小于等于',
        value: '<='
    }],
    /**
     * 比较处理器
     */
    '@:{generic#compare.processor}': {
        '==': (value, preset) => value == preset,
        '!=': (value, preset) => value != preset,
        '>': (value, preset) => value > preset,
        '>=': (value, preset) => value >= preset,
        '<': (value, preset) => value < preset,
        '<=': (value, preset) => value <= preset,
    },
    /**
     * 尝试从json字符串转对象
     * @param str 待转换的json字符串
     */
    '@:{generic#try.parse.json}'(str) {
        let result;
        try {
            result = JSON.parse(str);
        } finally {
            return result;
        }
    },
    /**
     * 生成元素名称
     * @param param0 元素控制器
     * @param allElements 所有元素列表
     * @returns
     */
    '@:{generic#generate.ename}'({ title }: Report.StageElementCtrl,
        allElements: Report.StageElement[]): string {
        let map = {};
        //对所有的元素名称进行判断，避免用户放一个文本，把名称修改成图片1，然后放图片时再生成一个图片1
        for (let { props: { ename } } of allElements) {
            if (ename) {
                map[ename] = 1;
            }
        }
        let i = 1,
            dn = I18n(title),
            ename: string;
        while (i) {
            ename = dn + i;
            if (!map[ename]) {
                break;
            }
            i++;
        }
        return ename;
    },
    /**
     * 修正拖动时剪切节点的bug
     * @param target 待修正节点
     * @param scrollNode 滚动节点
     */
    '@:{generic#fix.drag.clip.element.bug}'(target: HTMLElement,
        scrollNode: HTMLElement) {
        let targetBound = target.getBoundingClientRect();
        let scrollNodeBound = scrollNode.getBoundingClientRect();
        let scrollOffset;
        if (targetBound.y < scrollNodeBound.y) {//目标在滚动节点的上方
            scrollOffset = targetBound.y - scrollNodeBound.y;
        } else {
            let maxTargetBottom = targetBound.y + targetBound.height;
            let maxScrollBottom = scrollNodeBound.y + scrollNodeBound.height
            if (maxTargetBottom > maxScrollBottom) {//目标在滚动节点的下方
                scrollOffset = maxTargetBottom - maxScrollBottom;
            }
        }
        if (scrollOffset) {
            scrollNode.scrollTop += scrollOffset;
        }
    },
    /**
     * 获取文本修饰字符串
     * @param props 元素属性
     * @param key 文本修饰前缀
     * @returns 文本修饰
     */
    '@:{generate.text.decoration}'(props, key = 'textStyle') {
        let textDecoration = [];
        let styleUnderline = props[key + 'Underline'];
        let styleStrike = props[key + 'Strike'];
        let styleOverline = props[key + 'Overline'];
        if (styleUnderline) {
            textDecoration.push('underline');
        }
        if (styleStrike) {
            textDecoration.push('line-through');
        }
        if (styleOverline) {
            textDecoration.push('overline');
        }
        return textDecoration.join(' ');
    },
};