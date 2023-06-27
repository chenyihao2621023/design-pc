/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Enum from '../../designer/enum';
import StageGeneric from '../../designer/generic';
import GenericProvider from '../../provider/generic';
import DataCenterProvider from '../../provider/datacenter';
let { State, View, applyStyle, toMap, node, config } = Magix;
applyStyle('@:./index.less');
/**
 * 准备树形需要的数据格式，在这里进行统一转换，以适应不同的后端接口数据格式
 * 当后端接口数据与我们需求不同时，只需要修改这里的逻辑
 * @param dataSourceList 数据源列表
 */
let prepareTreeViewData = dataSourceList => {
    let treeViewData = [];
    for (let dataSource of dataSourceList) {
        let viewData = {//一个树形分支的数据
            expand: dataSource.expand,
            headless: dataSource.headless,
            name: dataSource.name,
            id: dataSource.id,
            tag: dataSource.tag,
            children: [...dataSource.fields]
        };
        treeViewData.push(viewData);
    }
    //以下进行嵌套测试，最后包含拖动字段的父级需要有id和url，不包含拖动字段的不要设置id和url
    // let subs = [];
    // for (let i = 0; i < 200; i++) {
    //     subs.push({
    //         expand: false,
    //         name: '接口分组a' + i,
    //         children: treeViewData
    //     }, {
    //         expand: false,
    //         name: '接口分组b' + i,
    //         children: treeViewData
    //     });
    // }
    // treeViewData = [{
    //     expand: false,
    //     name: '接口分组',
    //     children: treeViewData
    // }, {
    //     expand: true,
    //     name: '接口分组1',
    //     children: treeViewData
    // }, {
    //     expand: false,
    //     name: '接口分组3',
    //     children: treeViewData
    // }, {
    //     expand: false,
    //     name: '接口分组',
    //     children: subs
    // }];
    return treeViewData;
};
/**
 * 递归遍历树形数据设置禁用状态
 * @param treeViewData 树形数据
 * @param parentBindId 父级绑定id
 */
let updateTeeViewDataDisabled = (treeViewData, parentBindId) => {
    for (let sub of treeViewData) {
        if (sub.children) {
            if (sub.id) {
                sub.disabled = parentBindId && sub.id != parentBindId;
                if (sub.disabled &&
                    !sub.headless) {//如果禁用且非隐藏则折叠
                    sub.expand = false;
                }
            } else {
                updateTeeViewDataDisabled(sub.children, parentBindId);
            }
        }
    }
};
export default View.extend({
    tmpl: '@:index.html',
    init() {
        // this.set({
        //     treeView: Const['@:{const#data.source.panel.tree.view}']
        // });
        this['@:{imme.search}'] = (kw = '') => {
            let source = this['@:{origional.data.source}'];
            let searchedList;
            if (kw) {
                searchedList = [];
                let search = (fromList, toList) => {
                    for (let from of fromList) {
                        if (from.name.includes(kw) &&
                            !from.headless) {
                            toList.push(from);
                        } else if (from.children) {
                            let newList = [];
                            search(from.children, newList);
                            if (newList.length) {
                                let copied = {
                                    ...from,
                                    expand: true,//如果节点未命中，子节点命中，则自动展开
                                    children: newList
                                };
                                toList.push(copied);
                            }
                        }
                    }
                };
                search(source, searchedList);
            } else {
                searchedList = source;
            }
            this.digest({
                kw,
                source: searchedList
            });
        };
        this['@:{delay.search}'] = GenericProvider['@:{generic#debounce}'](this['@:{imme.search}'], 300, this);
        let normalWatch = GenericProvider['@:{generic#debounce}'](this['@:{update.ui}'], 30, this);
        let propWatch = ({ '@:{props}': props }: Report.EventOfSelectElementsPropsChange) => {
            if (props['@:{focus.cell}'] ||
                props['@:{bind}'] ||
                props.bind) {
                normalWatch();
            }
        };
        let updateLang = ({ to }: Report.EventOfLangChange) => {
            this.digest({
                lang: to
            });
        };
        State.on('@:{event#lang.change}', updateLang);
        State.on('@:{event#stage.select.elements.change}', normalWatch);
        State.on('@:{event#stage.select.element.props.change}', propWatch);
        State.on('@:{event#history.shift.change}', normalWatch);
        State.on('@:{event#stage.page.change}', normalWatch);
        State.on('@:{event#stage.page.and.elements.change}', normalWatch);
        this.on('destroy', () => {
            State.off('@:{event#lang.change}', updateLang);
            State.off('@:{event#stage.select.elements.change}', normalWatch);
            State.off('@:{event#stage.select.element.props.change}', propWatch);
            State.off('@:{event#history.shift.change}', normalWatch);
            State.off('@:{event#stage.page.change}', normalWatch);
            State.off('@:{event#stage.page.and.elements.change}', normalWatch);
        });
    },
    /**
     * 更新界面
     */
    '@:{update.ui}'() {
        /**
         * 标签与通用设计器在数据源的启用和禁用上不同，需要单独处理
         */
        if (config('label')) {
            this['@:{update.label.ui}']();
        } else {
            this['@:{update.normal.ui}']();
        }
    },
    /**
     * 更新标签设计器的界面
     */
    '@:{update.label.ui}'() {
        let stageElements = State.get<Report.StageElement[]>('@:{global#stage.elements}');
        let { readonly } = State.get<Report.StagePage>('@:{global#stage.page}');
        let source = this.get('source');
        let elements = State.get<Report.StageElement[]>('@:{global#stage.select.elements}');
        let canUseBind,
            bindFieldsMap = {},
            bindId = '';
        /**
         * 能否直接拖动数据源到设计区上
         * 如果不能拖动则提示先选中可绑定数据的元素
         */
        let providerOfStageDrop = State.get<number>('@:{global#provider.of.stage.drop}');
        if (providerOfStageDrop) {
            canUseBind = 1;
        }
        //单个元素选中，禁用已经绑定的数据
        if (elements?.length == 1) {
            let single = elements[0];
            let { props, ctrl } = single;
            let { bind } = props;
            if (ctrl['@:{get.bind.info}']) {
                bind = ctrl['@:{get.bind.info}'](props);
            }
            if (bind) {
                let { fields, id } = bind;
                if (id) {//注释以下语句，可阻止数据源禁用效果
                    if (fields?.length) {
                        bindId = id;
                        bindFieldsMap = toMap(fields, 'key');
                    }
                }
            }
        }
        //从设计区查找带有绑定信息的元素，进行其它数据源的禁用
        let pId;
        for (let { props, ctrl } of stageElements) {
            let { bind } = props;
            if (ctrl['@:{get.bind.info}']) {
                bind = ctrl['@:{get.bind.info}'](props);
            }
            if (bind?.id) {
                pId = bind.id;
                break;
            }
        }
        updateTeeViewDataDisabled(source, pId);
        this.digest({
            bindId,
            source,
            readonly,
            canUseBind,
            bindFieldsMap
        });
    },
    /**
     * 更新通用设计器的数据绑定界面
     */
    '@:{update.normal.ui}'() {
        let m,
            parentElement,
            atRow,
            atCol;
        let elements = State.get('@:{global#stage.select.elements}');
        if (elements?.length == 1) {
            m = elements[0];
            let find = StageGeneric['@:{generic#query.element.parent}'](m);
            parentElement = find['@:{element}'];
            atRow = find['@:{at.row}'];
            atCol = find['@:{at.col}'];
            if (parentElement) {
                let { props: pProps, ctrl: pCtrl } = parentElement;
                if (pCtrl.as & Enum['@:{enum#as.data.hod}']) {
                    pCtrl['@:{update.props}']?.(pProps);
                }
            }
        }
        let { readonly } = State.get<Report.StagePage>('@:{global#stage.page}');
        let source = this.get('source');
        //let treeView = Const['@:{const#data.source.panel.tree.view}']
        //如果元素支持绑定，则显示数据源
        //如果元素支持绑定，且不支持拖放数据源，则显示提示话语
        let canUseBind,
            bindFieldsMap = {},
            bindId = '',
            disableOthers;
        let providerOfStageDrop = State.get<number>('@:{global#provider.of.stage.drop}');
        if (providerOfStageDrop) {
            canUseBind = 1;
        }
        let pBind,
            currentBind,
            hasDisableOthers;
        if (m) {
            let { props, ctrl } = m;
            if (ctrl.as & Enum['@:{enum#as.data.hod}']) {
                currentBind = props.bind;
                if (ctrl['@:{disable.other.data.source}']) {
                    hasDisableOthers = 1;
                    disableOthers = ctrl['@:{disable.other.data.source}'](props, props.focusRow, props.focusCol);
                }
            }
            let pCtrl: Report.StageElementCtrl,
                pProps: Report.StageElementProps;
            if (parentElement) {
                pCtrl = parentElement.ctrl;
                pProps = parentElement.props;
                pBind = pProps.bind;
            }
            if (pCtrl &&
                (pCtrl.as & Enum['@:{enum#as.data.hod}'])) {
                disableOthers = 1;
                if (pCtrl['@:{disable.other.data.source}']) {
                    disableOthers = pCtrl['@:{disable.other.data.source}'](pProps, atRow, atCol);
                }
            }
            let { bind } = props;
            if (ctrl['@:{get.bind.info}']) {
                bind = ctrl['@:{get.bind.info}'](props);
            }
            if (bind) {
                let { fields, id } = bind;
                canUseBind = 1;
                if (id) {//注释以下语句，可阻止数据源禁用效果
                    if (fields?.length) {
                        bindId = id;
                        bindFieldsMap = toMap(fields, 'key');
                    }
                }
            }
        }

        let pId = disableOthers && pBind && pBind.id;
        if (!pId &&
            currentBind &&
            currentBind.id) {
            if (!hasDisableOthers ||
                disableOthers) {
                pId = currentBind.id;
            }
        }
        updateTeeViewDataDisabled(source, pId);
        this.digest({
            bindId,
            source,
            readonly,
            canUseBind,
            bindFieldsMap
        });
    },
    render() {
        let globalSource = DataCenterProvider['@:{get.global.source}']();
        let error = globalSource['@:{error}'];
        let source = globalSource['@:{data}'];
        //if (Const['@:{const#data.source.panel.tree.view}']) {
        //树形数据需要跳过第一个选择数据源的提示
        //因数据源在其它地方也有使用，所以不能直接删除提示
        source = prepareTreeViewData(source.slice(1));
        //}
        this['@:{origional.data.source}'] = source;
        this.set({
            error,
            kw: '',
            source,
            selected: ''
        });
        this['@:{update.ui}']();
    },
    '@:{clear.keyword}<click>'() {
        this['@:{imme.search}']();
    },
    '@:{search.data.source}<input>'(e: Magix5.MagixKeyboardEvent) {
        let target = e.eventTarget as HTMLInputElement;
        this['@:{delay.search}'](target.value);
    },
    //https://github.com/xinglie/report-designer/issues/45
    '@:{fix.drag.clip.bug}<treeitemdown>'(e: Magix5.MagixPointerEvent & {
        node: HTMLElement
    }) {
        GenericProvider['@:{generic#fix.drag.clip.element.bug}'](e.node, this.root);
    },
    '$root<scroll>&{capture:true}'() {
        let { root, id } = this;
        let searchInput = node<HTMLElement>(`si_${id}`);
        if (searchInput) {
            let { classList } = searchInput;
            let selector = '@:./index.less:search-input-boxshadow';
            if (root.scrollTop != 0) {
                classList.add(selector);
            } else {
                classList.remove(selector);
            }
        }
    }
});