/**
 * 撑杆插件
 * 防止从高向低拖动时高度随着变化，只有在放置元素后才收缩高度
 */
import Magix from 'magix5';
let { State, node } = Magix;
let poleStyle: CSSStyleDeclaration;
let ownerViewRoot: HTMLElement;
let owenrViewId: string;
let updateSize = () => {
    if (poleStyle) {
        poleStyle.width = ownerViewRoot.scrollWidth + 'px';
        poleStyle.height = ownerViewRoot.scrollHeight + 'px';
    }
};
let togglePole = e => {
    if (!poleStyle) {
        poleStyle = node<HTMLElement>('_rd_pole_' + owenrViewId).style;
    }
    if (e.active) {
        updateSize();
        poleStyle.display = 'block';
    } else {
        let st = ownerViewRoot.scrollTop;
        let before = st;
        poleStyle.display = 'none';
        let after = st;
        if (before > after) {//fix chrome cache old scrolltop;
            ownerViewRoot.scrollTop = after - 1;
        }
        //o.scrollTop = o.scrollHeight - o.offsetHeight - 80;
    }
};

export default {
    /**
     * 安装
     * @param view 所属view
     */
    '@:{pole#setup}'(view: Magix5.View) {
        ownerViewRoot = view.root;
        owenrViewId = view.id;
        State.on('@:{event#stage.scrolling}', togglePole);
    },
    /**
     * 卸载
     */
    '@:{pole#teardown}'() {
        ownerViewRoot = null;
        poleStyle = null;
        State.off('@:{event#stage.scrolling}', togglePole);
    },
    /**
     * 更新
     */
    '@:{pole#update.size}': updateSize
};