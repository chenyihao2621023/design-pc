/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { config, node, guid } = Magix;
let tId = guid('_mx_tip_');
let tipNode: HTMLDivElement;
let tipNodeClassList: DOMTokenList;
let tipNodeStyle: CSSStyleDeclaration;
let none = '@:scoped.style:none';
let xOffset = 8,
    yOffset = 13,
    rootRect,
    borderLeft,
    borderTop;

let getRoot = () => {
    let root = config<string>('rootId');
    return node<HTMLElement>(root) || document.body;
};
let init = () => {
    tipNode = node(tId);
    if (!tipNode) {
        tipNode = document.createElement('div');
        tipNode.className = `@:scoped.style:{pa,fontsize-12,border-radius-x,margin-2,background-color-brand,contrast-color,padding-2-4} ${none}`;
        tipNode.id = tId;
        let root = getRoot();
        root.appendChild(tipNode);
        tipNodeClassList = tipNode.classList;
        tipNodeStyle = tipNode.style;
    }
};

let prepareRootRect = () => {
    if (!rootRect) {
        let dest = getRoot();
        rootRect = dest.getBoundingClientRect();
        let rootStyle = getComputedStyle(dest);
        borderLeft = parseInt(rootStyle.borderLeftWidth, 10) || 0;
        borderTop = parseInt(rootStyle.borderTopWidth, 10) || 0;
    }
};
export default {
    '@:{show.text}'(text) {
        init();
        tipNode.innerHTML = text;
        if (tipNodeClassList.contains(none)) {
            tipNodeClassList.remove(none);
        }
    },
    '@:{update.position}'(x, y, z = '8') {
        if (tipNodeStyle) {
            prepareRootRect();
            tipNodeStyle.zIndex = z;
            tipNodeStyle.left = (x - rootRect.x - borderLeft + xOffset - scrollX) + 'px';
            tipNodeStyle.top = (y - rootRect.y - borderTop + yOffset - scrollY) + 'px';
        }
    },
    '@:{hide}'() {
        tipNodeClassList?.add(none);
        rootRect = null;
    }
};