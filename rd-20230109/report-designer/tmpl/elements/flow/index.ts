
import Magix from 'magix5';
import Enum from '../../designer/enum';
import StageGeneric from '../../designer/generic';
import Owner from '../index';
import FlowAnnotation from './annotation/designer';
import FlowCard from './card/designer';
import FlowConnector from './connector/designer';
import FlowData from './data/designer';
import FlowDatabase from './database/designer';
import FlowDecision from './decision/designer';
import FlowDisplay from './display/designer';
import FlowDocument from './document/designer';
import FlowEStore from './estore/designer';
import FlowIStore from './istore/designer';
import FlowLoopLimit from './looplimit/designer';
import FlowManual from './manual/designer';
import FlowMOperation from './moperation/designer';
import FlowPageRef from './pageref/designer';
import FlowParallel from './parallel/designer';
import FlowPrepare from './prepare/designer';
import FlowProcess from './process/designer';
import FlowQData from './qdata/designer';
import FlowRef from './ref/designer';
import FlowSubProcess from './subprocess/designer';
import FlowTape from './tape/designer';
import FlowTerminator from './terminator/designer';
let { Vframe, State, node, toMap } = Magix;
let hasConnector;
let addFlowLinkLine = (e: Report.EventOfLinkLineAdd) => {
    let { from, to } = e;
    let fromKey = from.key;
    let toKey = to.key;
    let ownerId = from.ownerId;
    hasConnector = 1;
    State.set({
        '@:{global#memory.cache.element}': [{
            ctrl: FlowConnector,
            first: 1,
            silent: 1,
            props: {
                linkFromId: from.id,
                linkFromKey: fromKey,
                linkToId: to.id,
                linkToKey: toKey,
                lineType: 'polyline',
                endArrow: 2
            }
        }]
    });
    State.fire('@:{event#starter.element.add}', {
        pageX: 0,
        pageY: 0,
        node: ownerId == 's' ? null : node(ownerId)
    });
};
let watchPropsChange = (e: Report.EventOfSelectElementsPropsChange) => {
    if (hasConnector) {//仅在有连接线的情况下进行处理
        //console.log('has connector');
        let { '@:{ids}': ids, '@:{props}': changedProps } = e;
        if (changedProps['@:{position}'] ||
            changedProps['@:{size}'] ||
            changedProps['@:{rotate}'] ||
            changedProps.x ||
            changedProps.y ||
            changedProps.width ||
            changedProps.height ||
            changedProps.rotate) {
            let { '@:{generic.all#elements}': stageElements } = StageGeneric['@:{generic#query.all.elements.and.map}']();
            let findConnector;
            for (let element of stageElements) {
                let { props, ctrl, id } = element;
                if ((ctrl['@:{modifier}'] & Enum['@:{enum#modifier.linkage}'])) {
                    findConnector = 1;
                    if (ids[props.linkFromId] ||
                        ids[props.linkToId]) {
                        ctrl['@:{update.props}'](props);
                        let n = node(id);
                        let vf = Vframe.byNode(n);
                        vf?.invoke('render', element);
                    }
                }
            }
            if (!findConnector) {
                hasConnector = 0;
            }
        }
    }
};
let watchElementsChange = (e: Report.EventOfStageElementsChange) => {
    if (e['@:{type}'] == '@:{remove}') {
        let { '@:{generic.all#elements}': stageElements } = StageGeneric['@:{generic#query.all.elements.and.map}'](),
            idMap = {};
        for (let { props, id, ctrl } of stageElements) {
            if ((ctrl['@:{modifier}'] & Enum['@:{enum#modifier.linkage}']) &&
                (e['@:{changed.ids}'][props.linkFromId] ||
                    e['@:{changed.ids}'][props.linkToId])) {
                idMap[id] = 1;
            }
        }
        StageGeneric["@:{generic#internal.delete.element.by.id.map.silent}"](idMap);
    } else {
        hasConnector = 1;
    }
};
let setConnector = () => hasConnector = 1;
//增加flow　provider
State.set({
    '@:{global#provider.of.flow}': {
        /**
         * 安装事件监听
         */
        '@:{flow.provider#setup.flow.monitor}'() {
            State.on('@:{event#stage.element.link.line.add}', addFlowLinkLine);
            State.on('@:{event#stage.select.element.props.change}', watchPropsChange);
            State.on('@:{event#stage.elements.change}', watchElementsChange);
            State.on('@:{event#history.shift.change}', setConnector);
            State.on('@:{event#example.change}', setConnector);
        },
        /**
         * 卸载事件监听
         */
        '@:{flow.provider#teardown.flow.monitor}'() {
            State.off('@:{event#stage.element.link.line.add}', addFlowLinkLine);
            State.off('@:{event#stage.select.element.props.change}', watchPropsChange);
            State.off('@:{event#stage.elements.change}', watchElementsChange);
            State.off('@:{event#history.shift.change}', setConnector);
            State.off('@:{event#example.change}', setConnector);
        },
        /**
         * 从元素中移除连接线元素
         * @param elements 元素列表
         * @param removeAllConnector 是否彻底移除所有连接线
         */
        '@:{flow.provider#remove.connector.from.elements}'(elements: Report.StageElement[],
            removeAllConnector?: number | boolean): Report.StageElement[] {
            let elementsMap = toMap(elements, 'id');
            let filteredElements = [];
            for (let element of elements) {
                let { ctrl, props } = element;
                if (!(ctrl['@:{modifier}'] & Enum['@:{enum#modifier.linkage}']) ||//不是连接线
                    (!removeAllConnector &&//如果不是彻底移除所有连接线
                        elementsMap[props.linkFromId] &&
                        elementsMap[props.linkToId])) {//连接线连接的开始和结束都在当前集合里，也不移除
                    filteredElements.push(element);
                }
            }
            return filteredElements;
        },
        /**
         * 给元素添加上连接线
         * @param elements 待添加连接线的元素
         */
        '@:{flow.provider#add.connector.from.elements}'(elements: Report.StageElement[]): Report.StageElement[] {
            let elementsMap = toMap(elements, 'id');
            let modifiedElements = [];
            let { '@:{generic.all#elements}': stageElements } = StageGeneric['@:{generic#query.all.elements.and.map}']();// State.get('@:{global#stage.elements}');
            for (let element of stageElements) {
                let { props, id, ctrl } = element;
                if ((ctrl['@:{modifier}'] & Enum['@:{enum#modifier.linkage}']) &&
                    elementsMap[props.linkFromId] &&
                    elementsMap[props.linkToId]) {
                    modifiedElements.push(element);
                } else if (!(ctrl['@:{modifier}'] & Enum['@:{enum#modifier.linkage}']) &&
                    elementsMap[id]) {
                    modifiedElements.push(element);
                }
            }
            return modifiedElements;
        },
        /**
         * 在元素复制前，先收集保存相关连接线的关系记录
         * @param elements 元素集合
         */
        '@:{flow.provider#collect.before.clone.relationships}'(elements: Report.StageElement[]): Report.NumberMapObject {
            let relationships = {};
            for (let { ctrl, props, id } of elements) {
                if ((ctrl['@:{modifier}'] & Enum['@:{enum#modifier.linkage}'])) {
                    relationships[props.linkFromId] = 1;
                    relationships[props.linkToId] = 1;
                    relationships[id] = 1;
                }
            }
            return relationships;
        },
        /**
         * 复制后恢复元素间的连线关系
         * @param elements 元素集合
         * @param relationships 关系对象
         */
        '@:{flow.provider#rebuild.relationship.after.clone}'(elements: Report.StageElement[], relationships: Report.NumberMapObject) {
            for (let { props, ctrl } of elements) {
                if ((ctrl['@:{modifier}'] & Enum['@:{enum#modifier.linkage}'])) {
                    props.linkFromId = relationships[props.linkFromId];
                    props.linkToId = relationships[props.linkToId];
                    ctrl['@:{update.props}'](props);
                }
            }
        },
    }
});

export default () => {
    Owner['@:{element.manager#register.elements.to.map}'](FlowConnector);
    Owner['@:{element.manager#register.layout}']({
        icon: '&#xe625;',
        title: '流程图',
        subs: [{
            ctrl: FlowProcess
        }, {
            ctrl: FlowDecision
        }, {
            ctrl: FlowTerminator
        }, {
            ctrl: FlowData
        }, {
            ctrl: FlowDocument
        }, {
            ctrl: FlowSubProcess
        }, {
            ctrl: FlowManual
        }, {
            ctrl: FlowRef
        }, {
            ctrl: FlowIStore
        }, {
            ctrl: FlowCard
        }, {
            ctrl: FlowMOperation
        }, {
            ctrl: FlowParallel
        }, {
            ctrl: FlowPrepare
        }, {
            ctrl: FlowDatabase
        }, {
            ctrl: FlowEStore
        }, {
            ctrl: FlowQData
        }, {
            ctrl: FlowTape
        }, {
            ctrl: FlowPageRef
        }, {
            ctrl: FlowDisplay
        }, {
            ctrl: FlowLoopLimit,
        }, {
            ctrl: FlowAnnotation,
        }]
    });
};