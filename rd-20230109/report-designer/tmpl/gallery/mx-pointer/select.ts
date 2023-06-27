/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Enum from '../../designer/enum';
let { node, applyStyle, guid, config } = Magix;
applyStyle('@:select.less');
let selectId = guid('_mx_select_');
let domIds = [selectId, selectId + '_i', selectId + '_t'];
let rootRect,
    selectStyle,
    borderLeft,
    borderTop;
let getRoot = () => {
    let root = config<string>('rootId');
    return node<HTMLElement>(root) || document.body;
};
let prepareRootRect = () => {
    if (!rootRect) {
        let dest = getRoot();
        let rootStyle = getComputedStyle(dest);

        rootRect = dest.getBoundingClientRect();
        selectStyle = node<HTMLElement>(selectId).style;

        borderLeft = parseInt(rootStyle.borderLeftWidth, 10) || 0;
        borderTop = parseInt(rootStyle.borderTopWidth, 10) || 0;
    }
};
export default {
    '@:{init}'() {
        let n = node(selectId);
        if (!n) {
            let dest = getRoot();
            dest.insertAdjacentHTML('beforeend', `<div id="${selectId}" class="@:scoped.style:{select-rect,none,pointer-events-none,pa,z-index-2}"><div class="@:scoped.style:{pa,iconfont} @:./select.less:icon" id="${selectId}_i"></div><div class="@:scoped.style:{pa,fontsize-12} @:./select.less:text" id="${selectId}_t"></div></div>`)
        }
    },
    '@:{update.icon}'(ctrl: Report.StageElementCtrl) {
        let n = node<HTMLElement>(selectId + '_i');
        let tn = node<HTMLElement>(selectId + '_t');
        if (n.style.display != 'block') {
            n.innerHTML = ctrl.icon;
            n.style.display = 'block';
            let nList = n.classList,
                tnList = tn.classList;
            if (ctrl['@:{modifier}'] & Enum['@:{enum#modifier.top.icon}']) {
                nList.remove('@:./select.less:left-icon');
                nList.add('@:./select.less:top-icon');
                tnList.remove('@:./select.less:left-icon-text');
            } else {
                nList.remove('@:./select.less:top-icon');
                nList.add('@:./select.less:left-icon');
                tnList.add('@:./select.less:left-icon-text');
            }
        }
    },
    '@:{update.text}'(text) {
        let n = node<HTMLElement>(selectId + '_t');
        n.innerHTML = text;
        n.style.display = 'block';
    },
    '@:{update}'(left, top, width, height) {
        prepareRootRect();
        //console.log(borderLeft, borderTop);
        selectStyle.left = (left - rootRect.x - borderLeft - scrollX) + 'px';
        selectStyle.top = (top - rootRect.y - borderTop - scrollY) + 'px';
        selectStyle.width = width + 'px';
        selectStyle.height = height + 'px';
        selectStyle.display = 'block';
    },
    '@:{hide}'() {
        for (let i of domIds) {
            node<HTMLElement>(i).style.display = 'none';
        }
        rootRect = null;
        selectStyle = null;
    }
};