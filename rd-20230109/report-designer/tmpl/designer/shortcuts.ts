import Magix from 'magix5';
import Const from './const';
import Panels from '../panels/index';
import I18n from '../i18n/index';
let { applyStyle, View, State, config, Cache } = Magix;
applyStyle('@:./shortcuts.less');
let isMac = navigator.userAgent.toLowerCase().includes('macintosh');
/**
 * 把控制按键转成图形(mac系统)或英文描述(其它系统)
 */
let modifiersToGlyphs = {
    '@:{keystroke#delete}': isMac ? '⌦' : 'Delete',
    '@:{keystroke#backspace}': isMac ? '⌫' : 'Backspace',
    '@:{keystroke#command}': '⌘',
    '@:{keystroke#ctrl}': isMac ? '⌃' : 'Ctrl',
    '@:{keystroke#shift}': isMac ? '⇧' : 'Shift',
    '@:{keystroke#alt}': isMac ? '⌥' : 'Alt',
    '@:{keystroke#tab}': isMac ? '⇥' : 'Tab',
    '@:{keystroke#top.arrow}': '↑',
    '@:{keystroke#right.arrow}': '→',
    '@:{keystroke#bottom.arrow}': '↓',
    '@:{keystroke#left.arrow}': '←',
    '@:{keystroke#plus}': '+',
    '@:{keystroke#minus}': '-',
    '@:{keystroke#escape}': isMac ? '⎋' : 'Esc',
    '@:{keystroke#enter}': isMac ? '↩' : 'Enter'
};
/**
 * 翻译控制按键
 */
let modifiersToTitle = {
    '@:{keystroke#escape}': 'Escape',
    '@:{keystroke#delete}': 'Delete',
    '@:{keystroke#backspace}': 'Backspace',
    '@:{keystroke#command}': 'Command',
    '@:{keystroke#ctrl}': isMac ? 'Control' : 'Ctrl',
    '@:{keystroke#shift}': 'Shift',
    '@:{keystroke#alt}': isMac ? 'Option' : 'Alt',
    '@:{keystroke#tab}': 'Tab',
    '@:{keystroke#top.arrow}': '上箭头',
    '@:{keystroke#right.arrow}': '右箭头',
    '@:{keystroke#bottom.arrow}': '下箭头',
    '@:{keystroke#left.arrow}': '左箭头',
    '@:{keystroke#plus}': '加号(+)',
    '@:{keystroke#minus}': '减号(-)',
    '@:{keystroke#enter}': '回车(Enter)'
};
let modKey = key => modifiersToGlyphs[key] || key;
let numReg = /^\d+$/;
let keyCache = new Cache();
/**
 * 翻译按键
 * @param k 按键
 */
let translateKey = k => {
    if (keyCache.has(k)) {
        return keyCache.get(k);
    }
    //数字翻译成：数字键x，其它翻译为:按键x，为了更好的语义
    let prefix;
    if (k == '◎') {
        prefix = '鼠标滚轮';
    } else {
        prefix = numReg.test(k) ? '数字键' : '按键';
        prefix += (modifiersToTitle[k] || k);
    }
    keyCache.set(k, prefix);
    return prefix;
};
/**
 * 生成按键的tooltip
 * @param keys 按键组合
 */
let modTitle = keys => {
    let key = keys.join('~');
    if (keyCache.has(key)) {
        console.log('from cache', key);
        return keyCache.get(key);
    }
    let result = [],
        translated,
        count = keys.length,
        index = 1;
    for (let k of keys) {
        result.push(translateKey(k));
        if (index < count) {
            //生成[x和y] 或 [x、y和z]的格式，更好的语义
            result.push(index == count - 1 ? '和' : '、');
        }
        index++;
    }
    translated = result.join('');
    if (count > 1) {//大于1个按键的，生成(x和y或x、y和z)的组合
        translated += '的组合';
    }
    keyCache.set(key, translated);
    return translated;
};
let toCurrentUnit = src => {
    let unit = State.get('@:{global#stage.unit}');
    let fixed = Const['@:{const#unit.fixed}'](unit);
    return (Const['@:{const#unit.step}'](unit) * src).toFixed(fixed) + unit;
};
let generateList = () => {
    if (!generateList['@:{list}']) {
        let list = [{
            '@:{ks#keys}': [['@:{keystroke#escape}']],
            '@:{ks#desc}': '取消元素选中或关闭弹窗(弹窗需允许快捷键关闭)'
        }, {
            '@:{ks#keys}': [['@:{keystroke#backspace}'], ['@:{keystroke#delete}']],
            '@:{ks#desc}': '删除选中的元素'
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', 'Z']] : []).concat([['@:{keystroke#ctrl}', 'Z']]),
            '@:{ks#desc}': '撤销操作'
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', '@:{keystroke#shift}', 'Z'], ['@:{keystroke#command}', 'Y']] : []).concat([['@:{keystroke#ctrl}', '@:{keystroke#shift}', 'Z'], ['@:{keystroke#ctrl}', 'Y']]),
            '@:{ks#desc}': '重做操作'
        }, {
            '@:{ks#keys}': [['@:{keystroke#tab}']],
            '@:{ks#desc}': '按z轴从大到小选择编辑区中的元素'
        }, {
            '@:{ks#keys}': [['@:{keystroke#shift}', '@:{keystroke#tab}']],
            '@:{ks#desc}': '按z轴从小到大选择编辑区中的元素'
        }, {
            '@:{ks#keys}': [['@:{keystroke#alt}']],
            '@:{ks#desc}': '拖动磁吸开启或关闭的情况下，按下后在拖动过程中可临时关闭或打开拖动磁吸功能。'
        }, {
            '@:{ks#keys}': [['@:{keystroke#shift}']],
            '@:{ks#desc}': '拖动改变元素尺寸的情况下，按下可等比改变宽高'
        }, {
            '@:{ks#keys}': [['@:{keystroke#left.arrow}']],
            '@:{ks#dest.is.fn}': 1,
            '@:{ks#desc}': () => `按下后编辑区选中的元素或辅助线向左移动 ${toCurrentUnit(Const['@:{const#keyboard.move.step}'])}`
        }, {
            '@:{ks#keys}': [['@:{keystroke#shift}', '@:{keystroke#left.arrow}']],
            '@:{ks#dest.is.fn}': 1,
            '@:{ks#desc}': () => `按下后编辑区选中的元素或辅助线向左移动 ${toCurrentUnit(Const['@:{const#keyboard.with.shift.move.step}'])}`
        }, {
            '@:{ks#keys}': [['@:{keystroke#top.arrow}']],
            '@:{ks#dest.is.fn}': 1,
            '@:{ks#desc}': () => `按下后编辑区选中的元素或辅助线向上移动 ${toCurrentUnit(Const['@:{const#keyboard.move.step}'])}`
        }, {
            '@:{ks#keys}': [['@:{keystroke#shift}', '@:{keystroke#top.arrow}']],
            '@:{ks#dest.is.fn}': 1,
            '@:{ks#desc}': () => `按下后编辑区选中的元素或辅助线向上移动 ${toCurrentUnit(Const['@:{const#keyboard.with.shift.move.step}'])}`
        }, {
            '@:{ks#keys}': [['@:{keystroke#right.arrow}']],
            '@:{ks#dest.is.fn}': 1,
            '@:{ks#desc}': () => `按下后编辑区选中的元素或辅助线向右移动 ${toCurrentUnit(Const['@:{const#keyboard.move.step}'])}`
        }, {
            '@:{ks#keys}': [['@:{keystroke#shift}', '@:{keystroke#right.arrow}']],
            '@:{ks#dest.is.fn}': 1,
            '@:{ks#desc}': () => `按下后编辑区选中的元素或辅助线向右移动 ${toCurrentUnit(Const['@:{const#keyboard.with.shift.move.step}'])}`
        }, {
            '@:{ks#keys}': [['@:{keystroke#bottom.arrow}']],
            '@:{ks#dest.is.fn}': 1,
            '@:{ks#desc}': () => `按下后编辑区选中的元素或辅助线向下移动 ${toCurrentUnit(Const['@:{const#keyboard.move.step}'])}`
        }, {
            '@:{ks#keys}': [['@:{keystroke#shift}', '@:{keystroke#bottom.arrow}']],
            '@:{ks#dest.is.fn}': 1,
            '@:{ks#desc}': () => `按下后编辑区选中的元素或辅助线向下移动 ${toCurrentUnit(Const['@:{const#keyboard.with.shift.move.step}'])}`
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', '@:{keystroke#left.arrow}'], ['@:{keystroke#command}', '@:{keystroke#top.arrow}']] : []).concat([['@:{keystroke#ctrl}', '@:{keystroke#left.arrow}'], ['@:{keystroke#ctrl}', '@:{keystroke#top.arrow}']]),
            '@:{ks#desc}': `按下后编辑区选中的元素在可以旋转的情况下减少 ${Const['@:{const#keyboard.rotate.step}']} 度`
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', '@:{keystroke#shift}', '@:{keystroke#left.arrow}'], ['@:{keystroke#command}', '@:{keystroke#shift}', '@:{keystroke#top.arrow}']] : []).concat([['@:{keystroke#ctrl}', '@:{keystroke#shift}', '@:{keystroke#left.arrow}'], ['@:{keystroke#ctrl}', '@:{keystroke#shift}', '@:{keystroke#top.arrow}']]),
            '@:{ks#desc}': `按下后编辑区选中的元素在可以旋转的情况下减少 ${Const['@:{const#keyboard.with.shift.rotate.step}']} 度`
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', '@:{keystroke#right.arrow}'], ['@:{keystroke#command}', '@:{keystroke#bottom.arrow}']] : []).concat([['@:{keystroke#ctrl}', '@:{keystroke#right.arrow}'], ['@:{keystroke#ctrl}', '@:{keystroke#bottom.arrow}']]),
            '@:{ks#desc}': `按下后编辑区选中的元素在可以旋转的情况下增加 ${Const['@:{const#keyboard.rotate.step}']} 度`
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', '@:{keystroke#shift}', '@:{keystroke#right.arrow}'], ['@:{keystroke#command}', '@:{keystroke#shift}', '@:{keystroke#bottom.arrow}']] : []).concat([['@:{keystroke#ctrl}', '@:{keystroke#shift}', '@:{keystroke#right.arrow}'], ['@:{keystroke#ctrl}', '@:{keystroke#shift}', '@:{keystroke#bottom.arrow}']]),
            '@:{ks#desc}': `按下后编辑区选中的元素在可以旋转的情况下增加 ${Const['@:{const#keyboard.with.shift.rotate.step}']} 度`
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', 'A']] : []).concat([['@:{keystroke#ctrl}', 'A']]),
            '@:{ks#desc}': '全选编辑区中的元素或当容器元素格子激活时，全选格子内的元素'
        }, {
            '@:{ks#keys}': [['@:{keystroke#shift}', 'A']],
            '@:{ks#desc}': '全选编辑区中的可移动元素或当容器元素格子激活时，全选格子内的可移动元素'
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', '@:{keystroke#shift}', 'I']] : []).concat([['@:{keystroke#ctrl}', '@:{keystroke#shift}', 'I']]),
            '@:{ks#desc}': '反选编辑区中的元素或当容器元素格子内元素选中时，反选格子内其它元素'
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', 'C']] : []).concat([['@:{keystroke#ctrl}', 'C']]),
            '@:{ks#desc}': '复制编辑区中选中的元素'
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', 'X']] : []).concat([['@:{keystroke#ctrl}', 'X']]),
            '@:{ks#desc}': '剪切编辑区中选中的元素'
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', 'V']] : []).concat([['@:{keystroke#ctrl}', 'V']]),
            '@:{ks#desc}': '粘贴复制或剪切的元素'
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', 'D']] : []).concat([['@:{keystroke#ctrl}', 'D']]),
            '@:{ks#desc}': '克隆选中的元素'
        }];
        let canShowContent = Const['@:{const#save.can.show.stage.content}'],
            hasSaveUrl = config('saveContentUrl');
        if (canShowContent ||
            hasSaveUrl) {
            list.push({
                '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', 'S']] : []).concat([['@:{keystroke#ctrl}', 'S']]),
                '@:{ks#desc}': (hasSaveUrl ? '保存内容' : '显示编辑区内容对话框或调用whenSave方法')
            });
            if (canShowContent &&
                hasSaveUrl) {
                list.push({
                    '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', '@:{keystroke#shift}', 'S']] : []).concat([['@:{keystroke#ctrl}', '@:{keystroke#shift}', 'S']]),
                    '@:{ks#desc}': '显示编辑区内容对话框'
                });
            }
        }
        let hasTemplateUrl = config('getTemplateUrl');
        if (hasTemplateUrl) {
            list.push({
                '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', 'E']] : []).concat([['@:{keystroke#ctrl}', 'E']]),
                '@:{ks#desc}': '显示模板对话框'
            });
        }
        list.push({
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', 'P']] : []).concat([['@:{keystroke#ctrl}', 'P']]),
            '@:{ks#desc}': '显示打印页面或对话框'
        }, {
            '@:{ks#keys}': [['H']],
            '@:{ks#desc}': '显示或隐藏辅助线'
        }, {
            '@:{ks#keys}': [['@:{keystroke#alt}', 'H']],
            '@:{ks#desc}': '清除辅助线'
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', 'H']] : []).concat([['@:{keystroke#ctrl}', 'H']]),
            '@:{ks#desc}': '隐藏或显示标尺'
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', 'G']] : []).concat([['@:{keystroke#ctrl}', 'G'], ['@:{keystroke#shift}', 'G']]),
            '@:{ks#desc}': '组合或取消组合选中的元素'
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', 'L']] : []).concat([['@:{keystroke#ctrl}', 'L'], ['@:{keystroke#shift}', 'L']]),
            '@:{ks#desc}': '编辑锁定或取消编辑锁定选中的元素'
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', 'K']] : []).concat([['@:{keystroke#ctrl}', 'K']]),
            '@:{ks#desc}': '等比或解除等比修改元素尺寸'
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', 'B']] : []).concat([['@:{keystroke#ctrl}', 'B']]),
            '@:{ks#desc}': '展示或隐藏普通元素的轮廓线'
        }, {
            '@:{ks#keys}': [['T']],
            '@:{ks#desc}': '把选中的元素调整到最顶层级'
        }, {
            '@:{ks#keys}': [['U']],
            '@:{ks#desc}': '把选中的元素向上调整一个层级'
        }, {
            '@:{ks#keys}': [['D']],
            '@:{ks#desc}': '把选中的元素向下调整一个层级'
        }, {
            '@:{ks#keys}': [['B']],
            '@:{ks#desc}': '把选中的元素调整到最底层级'
        }, {
            '@:{ks#keys}': [['F']],
            '@:{ks#desc}': '容器格子中的元素选中状态下，按下可聚焦为当前格子'
        }, {
            '@:{ks#keys}': [['C']],
            '@:{ks#desc}': '清除编辑区内容'
        }, {
            '@:{ks#keys}': [['N']],
            '@:{ks#desc}': '新建编辑区内容'
        }, {
            '@:{ks#keys}': [['Space']],
            '@:{ks#desc}': '支持文字输入的元素如文本、流程图等按下后可直接在设计区显示输入框'
        }, {
            '@:{ks#keys}': [['@:{keystroke#alt}', 'L']],
            '@:{ks#desc}': '选中的元素左对齐'
        }, {
            '@:{ks#keys}': [['@:{keystroke#alt}', 'C']],
            '@:{ks#desc}': '选中的元素水平居中对齐'
        }, {
            '@:{ks#keys}': [['@:{keystroke#alt}', 'R']],
            '@:{ks#desc}': '选中的元素右对齐'
        }, {
            '@:{ks#keys}': [['@:{keystroke#alt}', 'T']],
            '@:{ks#desc}': '选中的元素上对齐'
        }, {
            '@:{ks#keys}': [['@:{keystroke#alt}', 'M']],
            '@:{ks#desc}': '选中的元素垂直居中对齐'
        }, {
            '@:{ks#keys}': [['@:{keystroke#alt}', 'B']],
            '@:{ks#desc}': '选中的元素下对齐'
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', '@:{keystroke#plus}']] : []).concat([['@:{keystroke#ctrl}', '@:{keystroke#plus}']]),
            '@:{ks#desc}': `按${Const['@:{const#scale.step}'] * 100}%的步长放大编辑区`
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', '@:{keystroke#shift}', '@:{keystroke#plus}']] : []).concat([['@:{keystroke#ctrl}', '@:{keystroke#shift}', '@:{keystroke#plus}']]),
            '@:{ks#desc}': `按${Const['@:{const#scale.fast.increase}'] * 100}%的步长放大编辑区`
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', '@:{keystroke#alt}', '@:{keystroke#plus}']] : []).concat([['@:{keystroke#ctrl}', '@:{keystroke#alt}', '@:{keystroke#plus}']]),
            '@:{ks#desc}': `按${Const['@:{const#scale.slow.decrease}'] * 100}%的步长放大编辑区`
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', '@:{keystroke#minus}']] : []).concat([['@:{keystroke#ctrl}', '@:{keystroke#minus}']]),
            '@:{ks#desc}': `按${Const['@:{const#scale.step}'] * 100}%的步长缩小编辑区`
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', '@:{keystroke#shift}', '@:{keystroke#minus}']] : []).concat([['@:{keystroke#ctrl}', '@:{keystroke#shift}', '@:{keystroke#minus}']]),
            '@:{ks#desc}': `按${Const['@:{const#scale.fast.increase}'] * 100}%的步长缩小编辑区`
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', '@:{keystroke#alt}', '@:{keystroke#minus}']] : []).concat([['@:{keystroke#ctrl}', '@:{keystroke#alt}', '@:{keystroke#minus}']]),
            '@:{ks#desc}': `按${Const['@:{const#scale.slow.decrease}'] * 100}%的步长缩小编辑区`
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', '0']] : []).concat([['@:{keystroke#ctrl}', '0']]),
            '@:{ks#desc}': '恢复编辑区到未缩放状态'
        }, {
            '@:{ks#keys}': [['@:{keystroke#shift}']],
            '@:{ks#desc}': `按下后点击缩放按钮，以${Const['@:{const#scale.fast.increase}'] * 100}%的步长缩放编辑区`
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}']] : []).concat([['@:{keystroke#ctrl}'], ['@:{keystroke#alt}']]),
            '@:{ks#desc}': `按下后点击缩放按钮，以${Const['@:{const#scale.slow.decrease}'] * 100}%的步长缩放编辑区`
        }, {
            '@:{ks#keys}': (isMac ? [['@:{keystroke#command}']] : []).concat([['@:{keystroke#shift}'], ['@:{keystroke#ctrl}']]),
            '@:{ks#desc}': '拉框或点击选择元素的情况下，按下可叠加或取消之前已经选择的元素'
        }, {
            '@:{ks#keys}': [['@:{keystroke#shift}', '◎']],
            '@:{ks#desc}': '改变设计区鼠标滚轮的滚动方向，即由默认的垂直滚动切换为水平滚动'
        });
        if (Const['@:{const#stage.wheel.zoom}']) {
            list.push({
                '@:{ks#keys}': (isMac ? [['@:{keystroke#command}', '◎']] : []).concat([['@:{keystroke#ctrl}', '◎']]),
                '@:{ks#desc}': '依鼠标滚轮的方向，放大或缩小编辑区'
            });
        }
        let panelsMap = Panels['@:{panels#get.panels.map}']();
        //有动画面板才展示对应的快捷键
        if (panelsMap?.animate) {
            list.push({
                '@:{ks#keys}': [['W']],
                '@:{ks#desc}': '动画面板打开的情况下，停用或启用动画功能'
            }, {
                '@:{ks#keys}': [['@:{keystroke#enter}']],
                '@:{ks#desc}': '动画面板打开的情况下，播放或暂停动画'
            }, {
                '@:{ks#keys}': [['@:{keystroke#shift}', '@:{keystroke#enter}']],
                '@:{ks#desc}': '动画面板打开的情况下，重置动画播放'
            });
        }
        if (Const['@:{const#support.theme}']) {
            list.push({
                '@:{ks#keys}': [['@:{keystroke#shift}', 'T']],
                '@:{ks#desc}': '显示主题定制对话框'
            });
        }
        if (Const['@:{const#support.help}']) {
            list.push({
                '@:{ks#keys}': [['@:{keystroke#shift}', '/']],
                '@:{ks#desc}': '显示快捷键大全对话框'
            });
        }
        let panels = Panels['@:{panels#get.panels}']();
        let panelCount = 0;
        if (panels.length) {
            for (let panel of panels) {
                if (!panel.mini) {
                    list.push({
                        '@:{ks#keys}': [[`${panel.key}`]],
                        '@:{ks#desc}': '打开或关闭' + I18n(panel.title) + '面板'
                    }, {
                        '@:{ks#keys}': [['@:{keystroke#shift}', `${panel.key}`]],
                        '@:{ks#desc}': '展开或折叠' + I18n(panel.title) + '面板的内容'
                    });
                    panelCount++;
                }
            }
            list.push({
                '@:{ks#keys}': [['@:{keystroke#shift}', 'Z']],
                '@:{ks#desc}': `打开或关闭所有可拖动的面板，即数字1-${panelCount}键对应的面板`
            });
        }
        generateList['@:{list}'] = list;
    }
    return generateList['@:{list}'];
};
export default View.extend({
    tmpl: '@:./shortcuts.html',
    render() {
        this.digest({
            list: generateList(),
            hl: Const['@:{const#show.help.and.ow.links}'],
            modTitle,
            modKey
        });
    }
}).static({
    '@:{show}'(owner) {
        owner.mxDialog({
            view: '@:{moduleId}',
            width: 1050
        });
    }
});