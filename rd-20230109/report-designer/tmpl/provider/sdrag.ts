/**
 * 拖动提示插件
 */
import Magix from 'magix5';
import StageGeneric from '../designer/generic';
import Select from '../gallery/mx-pointer/select';
import I18n from '../i18n/index';
let { State, node } = Magix;
let lastHover,
    lastHod;
let dragElementMoveFromToolbox = (e: Report.EventOfDragToolboxElementMove) => {
    //fromToolbxSize = e;
    let { node: hover,
        stage: insideStage,
        ctrl,
        allowedTotal,
        allowedStage,
        pageX, pageY,
        width, height, hod,
        total, count } = e;
    if (insideStage) {//在设计区才进行相应的提示处理
        //更新跟随鼠标移动的矩形
        let hasSize = width || height;
        if (hasSize) {
            // +1 for snap line
            Select["@:{update}"](pageX, pageY, width, height);
            //更新icon
            Select["@:{update.icon}"](ctrl);
        }
        let canDrop,
            page = State.get<Report.StagePage>('@:{global#stage.page}');
        if (page.readonly) {
            Select["@:{update.text}"](I18n('@:{lang#pointer.not.find.destination}'));
        } else {
            //如果鼠标下的节点变化了，这里进行性能处理，只有变化的才进入处理
            if (lastHover != hover) {
                lastHover = hover;
                //容器的提示节点
                let dashedNode = hod && node(hod['@:{dashed.id}']);
                if (!hod ||
                    dashedNode != lastHod) {
                    //不在容器或容器有变化
                    if (lastHod) {//从一个容器变换到另一个
                        let { classList } = lastHod;
                        //, '@:scoped.style:full-fill'
                        classList.remove('@:scoped.style:hod-drop-tip');
                        lastHod = null;
                    }
                    //查询一共允许多少个
                    canDrop = allowedTotal == null || total < allowedTotal;
                    let tip;
                    if (!hod) {//在设计区
                        //查询节点是否支持放在设计区
                        canDrop = canDrop && (!ctrl['@:{allowed.to.hod}'] ||
                            ctrl['@:{allowed.to.hod}'].root);
                        if (canDrop) {//查询设计区允许多少个
                            canDrop = allowedStage == null || count < allowedStage;
                        }
                        tip = '@:{lang#pointer.release.element.to.stage}';
                        //console.log(tip);
                    } else {//在容器里
                        //console.log('enter');
                        lastHod = dashedNode;
                        //同样需要查询能放多少个
                        if (canDrop && allowedStage >= 0) {
                            let cc = StageGeneric['@:{generic#query.elements.count.by.type}'](hod['@:{elements}'], ctrl.type);
                            canDrop = cc < allowedStage;
                        }
                        tip = '@:{lang#pointer.release.element.to.cell}';
                    }
                    if (canDrop) {//能放置
                        if (lastHod) {//容器显示可放置提示
                            let { classList } = lastHod;
                            //, '@:scoped.style:full-fill'
                            classList.add('@:scoped.style:hod-drop-tip');
                        }
                        if (hasSize) {
                            //可放置提示文字
                            Select["@:{update.text}"](I18n(tip));
                        }
                    } else if (hasSize) {
                        //不可放置
                        Select["@:{update.text}"](I18n('@:{lang#pointer.not.find.destination}'));
                    }
                }
            }
        }
        // if (lastHover &&
        //     (lastHover.id == '_rd_sc' ||
        //         lastHover.classList.contains('@:./stage.less:stage-workaround'))) {
        //     updateElementToAreaUI(e);
        // }
    } else {//不在设计区
        if (lastHod) {//如果有容器，需要移除容器的提示
            let { classList } = lastHod;
            //, '@:scoped.style:full-fill'
            classList.remove('@:scoped.style:hod-drop-tip');
        }
        //隐藏鼠标样式及清除相应的缓存信息
        Select["@:{hide}"]();
        lastHover = null;
        lastHod = null;
    }
};

export default {
    '@:{sdrag#get.last.hod}'() {
        return lastHod;
    },
    '@:{sdrag#clear}'() {
        lastHod = lastHover = null;
    },
    '@:{sdrag#setup}'() {
        State.on('@:{event#starter.element.drag.move}', dragElementMoveFromToolbox);
    },
    '@:{sdrag#teardown}'() {
        State.off('@:{event#starter.element.drag.move}', dragElementMoveFromToolbox);
    }
}