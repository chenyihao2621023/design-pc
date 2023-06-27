/**
 * 右键菜单配置及管理对象
 */
import Magix from 'magix5';
import I18n from '../i18n/index';
import Const from './const';
let { guid, config } = Magix;
let MenuSpliter = {
    bar: 1
};
let MenuAll = {//全选
    id: 0,
    icon: '&#xe6b2;',
    text: '@:{lang#menu.select.all}',
    short: 'Ctrl+A'
};
let MenuCopy = {//复制
    id: 1,
    icon: '&#xe69a;',
    text: '@:{lang#menu.copy}',
    short: 'Ctrl+C'
};
let MenuCut = {//剪切
    id: 2,
    icon: '&#xe6bf;',
    text: '@:{lang#menu.cut}',
    short: 'Ctrl+X'
};

let MenuTop = {//到顶移动z轴
    id: 3,
    icon: '&#xe607;',
    text: '@:{lang#menu.to.top}',
    short: 'T'
};
let MenuBottom = {//到底移动z轴
    id: 4,
    icon: '&#xe607;',
    r180: 1,
    text: '@:{lang#menu.to.bottom}',
    short: 'B'
};

let MenuUp = {//向上移动z轴
    id: 5,
    icon: '&#xe632;',
    text: '@:{lang#menu.move.up}',
    short: 'U'
};
let MenuDown = {//向下移动z轴
    id: 6,
    icon: '&#xe632;',
    r180: 1,
    text: '@:{lang#menu.move.down}',
    short: 'D'
};

let MenuDuplicate = {//复制粘贴
    id: 7,
    icon: '&#xe6b1;',
    text: '@:{lang#menu.duplicate}',
    short: 'Ctrl+D'
};
let MenuPaste = {//粘贴
    id: 8,
    icon: '&#xe6c1;',
    text: '@:{lang#menu.paste}',
    short: 'Ctrl+V'
};

let MenuDelete = {//删除
    id: 9,
    icon: '&#xe6b3;',
    text: '@:{lang#menu.delete}',
    short: 'Delete'
};
let MenuClear = {//清空
    id: 10,
    icon: '&#xe7db;',
    text: '@:{lang#menu.clear}',
    short: 'C'
};

let MenuNew = {//新建
    id: 11,
    icon: '&#xe612;',
    text: '@:{lang#menu.new}',
    short: 'N'
};

let MenuReverse = {//反选
    id: 12,
    icon: '&#xe678;',
    text: '@:{lang#menu.reverse}',
    short: 'Ctrl+Shift+I'
};

let MenuAllMovable = {//全选
    id: 13,
    icon: '&#xe64e;',
    text: '@:{lang#menu.select.movable.all}',
    short: 'Shift+A'
};


let MenuAlignLeft = {//左对齐
    id: 20,
    icon: '&#xe70b;',
    text: '@:{lang#align.left}',
    to: '@:{align#left}',
    short: 'Alt+L'
};
let MenuAlignRight = {//右对齐
    id: 21,
    icon: '&#xe70b;',
    r180: 1,
    text: '@:{lang#align.right}',
    to: '@:{align#right}',
    short: 'Alt+R'
};
let MenuAlignCenter = {//水平居中对齐
    id: 22,
    icon: '&#xe711;',
    text: '@:{lang#align.center}',
    to: '@:{align#center}',
    short: 'Alt+C'
};
let MenuAlignTop = {//顶对齐
    id: 23,
    icon: '&#xe70d;',
    text: '@:{lang#align.top}',
    to: '@:{align#top}',
    short: 'Alt+T'
};
let MenuAlignBottom = {//底对齐
    id: 24,
    icon: '&#xe70d;',
    r180: 1,
    text: '@:{lang#align.bottom}',
    to: '@:{align#bottom}',
    short: 'Alt+B'
};
let MenuAlignMiddle = {//垂直居中对齐
    id: 25,
    icon: '&#xe711;',
    r90: 1,
    text: '@:{lang#align.middle}',
    to: '@:{align#middle}',
    short: 'Alt+M'
};


let MenuGroup = {//组合
    id: 31,
    icon: '&#xe669;',
    text: '@:{lang#menu.context.group}',
    short: 'Ctrl/Shift+G'
};
let MenuUngroup = {//取消组合
    id: 32,
    icon: '&#xe684;',
    text: '@:{lang#menu.context.ungroup}',
    short: 'Shift/Ctrl+G'
};

let MenuSyncWidthAsHeight = {//同步宽做为高
    id: 41,
    icon: '&#xe67a;',
    r90: 1,
    text: '@:{lang#menu.sync.width.as.height}'
};
let MenuSyncHeightAsWidth = {//同步高做为宽
    id: 42,
    icon: '&#xe67a;',
    text: '@:{lang#menu.sync.height.as.width}'
};
let MenuSyncWidth = {//同步宽
    id: 43,
    icon: '&#xe671;',
    r90: 1,
    text: '@:{lang#menu.sync.width}'
};
let MenuSyncHeight = {//同步高
    id: 44,
    icon: '&#xe671;',
    text: '@:{lang#menu.sync.height}'
};

let MenuClearHodStage = {//清空格子
    id: 50,
    icon: '&#xe7db;',
    text: '@:{lang#menu.clear.hod.stage}'
};
let MenuPreview = {//预览
    id: 51,
    icon: '&#xe679;',
    text: '@:{lang#preview}',
    short: 'Ctrl+P'
};

let MenuHelp = {//帮助
    id: 52,
    icon: '&#xe657;',
    text: '@:{lang#help}',
    short: 'Ctrl+/'
};
let MenuTemplate = {
    id: 53,
    icon: '&#xe63f;',
    text: '@:{lang#template}',
    short: 'Ctrl+E'
};
let MenuZoomIn = {//放大
    id: 61,
    icon: '&#xe681;',
    text: '@:{lang#zoom.in}',
    short: '@:{lang#zoom.in.short}'
};
let MenuZoomOut = {//缩小
    id: 62,
    icon: '&#xe680;',
    text: '@:{lang#zoom.out}',
    short: '@:{lang#zoom.out.short}'
};
let MenuZoomReset = {
    id: 63,
    icon: '&#xe67b;',
    text: '@:{lang#zoom.reset}',
    short: '@:{lang#zoom.reset.short}'
};
let Cache = {};
let TranslateMenu = menus => {//根据语言翻译菜单
    return lang => {
        if (!menus['@:{menu#u.id}']) {//给菜单列表临时增加id，用于缓存
            menus['@:{menu#u.id}'] = guid('m_');
        }
        let key = lang + '~' + menus['@:{menu#u.id}'];
        if (!Cache[key]) {
            let a = [];
            for (let m of menus) {//根据菜单内容翻译相应的菜单显示
                if (m) {
                    if (m.bar) {
                        a.push(m);
                    } else {
                        a.push({
                            id: m.id,
                            to: m.to,
                            icon: m.icon,
                            r180: m.r180,
                            r90: m.r90,
                            text: I18n(m.text),
                            short: I18n(m.short)
                        });
                    }
                }
            }
            Cache[key] = a;
        }
        return Cache[key];
    };
};
export default {
    '@:{cm#all.id}': MenuAll.id,
    '@:{cm#all.movable.id}': MenuAllMovable.id,
    '@:{cm#paste.id}': MenuPaste.id,
    '@:{cm#top.id}': MenuTop.id,
    '@:{cm#up.id}': MenuUp.id,
    '@:{cm#bottom.id}': MenuBottom.id,
    '@:{cm#down.id}': MenuDown.id,
    '@:{cm#cut.id}': MenuCut.id,
    '@:{cm#copy.id}': MenuCopy.id,
    '@:{cm#duplicate.id}': MenuDuplicate.id,
    '@:{cm#delete.id}': MenuDelete.id,
    '@:{cm#clear.id}': MenuClear.id,
    '@:{cm#new.id}': MenuNew.id,
    '@:{cm#ungroup.id}': MenuUngroup.id,
    '@:{cm#group.id}': MenuGroup.id,
    '@:{cm#sync.width.as.height.id}': MenuSyncWidthAsHeight.id,
    '@:{cm#sync.height.as.width.id}': MenuSyncHeightAsWidth.id,
    '@:{cm#sync.width.id}': MenuSyncWidth.id,
    '@:{cm#sync.height.id}': MenuSyncHeight.id,
    '@:{cm#align.bottom.id}': MenuAlignBottom.id,
    '@:{cm#align.center.id}': MenuAlignCenter.id,
    '@:{cm#align.left.id}': MenuAlignLeft.id,
    '@:{cm#align.middle.id}': MenuAlignMiddle.id,
    '@:{cm#align.right.id}': MenuAlignRight.id,
    '@:{cm#align.top.id}': MenuAlignTop.id,
    '@:{cm#clear.hod.stage.id}': MenuClearHodStage.id,
    '@:{cm#reverse.id}': MenuReverse.id,
    '@:{cm#help.id}': MenuHelp.id,
    '@:{cm#template.id}': MenuTemplate.id,
    '@:{cm#preview.id}': MenuPreview.id,
    '@:{cm#zoom.in.id}': MenuZoomIn.id,
    '@:{cm#zoom.out.id}': MenuZoomOut.id,
    '@:{cm#zoom.reset.id}': MenuZoomReset.id,
    //单个元素的右键菜单
    '@:{cm#single.element}': TranslateMenu([MenuDuplicate, MenuCopy, MenuCut, MenuDelete, MenuSpliter, MenuTop, MenuUp, MenuDown, MenuBottom, MenuSpliter, MenuGroup, MenuUngroup, MenuSpliter, MenuReverse]),
    //2个元素
    '@:{cm#double.element}': TranslateMenu([MenuDuplicate, MenuCopy, MenuCut, MenuDelete, MenuSpliter, MenuAlignLeft, MenuAlignCenter, MenuAlignRight, MenuAlignTop, MenuAlignMiddle, MenuAlignBottom, MenuSpliter, MenuSyncWidth, MenuSyncHeight, MenuSyncWidthAsHeight, MenuSyncHeightAsWidth, MenuSpliter, MenuGroup, MenuUngroup, MenuSpliter, MenuReverse]),
    //多选元素时的右键菜单
    '@:{cm#multiple.element}': TranslateMenu([MenuDuplicate, MenuCopy, MenuCut, MenuDelete, MenuSpliter, MenuAlignLeft, MenuAlignCenter, MenuAlignRight, MenuAlignTop, MenuAlignMiddle, MenuAlignBottom, MenuSpliter, MenuGroup, MenuUngroup, MenuSpliter, MenuReverse]),
    //在设计区时的右键菜单
    '@:{cm#stage}': TranslateMenu([MenuPaste, MenuAll, MenuAllMovable, MenuSpliter, MenuClear, MenuNew, config('getTemplateUrl') && MenuTemplate, MenuPreview, MenuSpliter, MenuZoomIn, MenuZoomOut, MenuZoomReset, Const['@:{const#support.help}'] && MenuSpliter, Const['@:{const#support.help}'] && MenuHelp]),
    //在容器上时的右键菜单
    '@:{cm#hod.stage}': TranslateMenu([MenuPaste, MenuAll, MenuAllMovable, MenuClearHodStage, MenuSpliter, MenuDuplicate, MenuCopy, MenuCut, MenuDelete, MenuSpliter, MenuUp, MenuTop, MenuDown, MenuBottom, MenuSpliter, MenuReverse])
}