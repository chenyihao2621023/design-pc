import Magix from 'magix5';
import Transform from '../../designer/transform';
import Runner from '../../gallery/mx-runner/index';
import DataCenterProvider from '../../provider/datacenter';
import TableProvider from '../../provider/table';
let { Vframe, node, has, guid, delay,
    lowTaskFinale, now,
    isArray, toMap } = Magix;

/**
 * 哪些元素在分页时，使用y坐标进行判断
 * 大部分元素采用元素中间坐标进行判断，如果正好处在分页处，则切割
 * 而自动分页的元素不可以采用中间点，而采用元素的y坐标进行判断
 */
let UseYElements = {
    'data-coltable': 1,
    'data-dtable': 1,
    'data-rdtable': 1,
    'data-ftable': 1,
    'data-richtext': 1,
    video: 1
};
/**
 * 独立不能分隔的元素
 */
let StandaloneElements = {
    xsheet: 1
};

/**
 * 是否进行深层数据绑定的容器元素
 */
let SearchHodBindElements = {
    'hod-table': 1,
    'hod-hflex': 1,
    'hod-vflex': 1,
    'hod-footer': 1,
    'hod-header': 1,
    'data-dtable': 1,
    'hod-tabs': 1,
    'data-rdtable': 1
};
/**
 * 目前有哪些容器元素，对于容器元素，需要递归查找里面的子元素
 */
let HodElements = {
    ...SearchHodBindElements,
    'data-repeater': 1,
    'data-ftable': 1,
    'data-celltable': 1
};

//标签正则
let tagReg = /<[^>]+>/g;
//删除不必要的属性正则
let tagAttReg = /\s*(?:id|_\d?[a-z]*)\s*=\s*"[^"]+"/gi;

/**
 * 查找属于某个页码内的元素
 * @param page 页面对象，包含宽、高，背景色等
 * @param current 当前第几页
 * @param elements 设计区所有元素
 * @param oy y坐标的偏移量
 */
let findCurrentPageElements = (page, current, elements, oy) => {
    let filterElements = [];
    let { width, height } = page;
    let startY = current * height;
    let endY = startY + height;
    let pageRect = {
        x: 0,
        y: startY,
        width: width,
        height: height
    };
    for (let e of elements) {
        let { props, type } = e;
        if (e.used &&
            StandaloneElements[type]) {
            continue;
        }
        e.used = 1;
        if (type == 'hod-header' ||
            type == 'hod-footer') {
            //页头页脚固定在一个分页的顶或底部
            props.x = 0;
            props.width = width;
            if (type == 'hod-header') {
                props.y = current * height;
            } else {
                props.y = (current + 1) * height - props.height;
            }
            filterElements.push(e);
        } else {
            let { x, y, width, height, rotate } = props;
            y += oy;
            //如果元素采用y坐标，则查看当前分页是否包含该元素的y坐标
            if (has(UseYElements, type)) {
                if ((
                    y >= startY &&
                    y <= endY) || (
                        y < 0 &&
                        current == 0
                    )) {
                    filterElements.push(e);
                }
            } else {
                /**
                 * 采用矩形碰撞的做法，允许在设计时，把临时不需要的元素放在设计区外
                 * 这些放在设计区外的元素在打印是会被忽略
                 */
                //采用矩形碰撞检测，碰撞后则在当前分页内
                //需要考虑矩形旋转的情况
                let newRect = Transform["@:{transform#rotate.rect}"]({
                    x, y, width, height,
                    rotate
                });
                let testRect = {
                    x: newRect['@:{left}'],
                    y: newRect['@:{top}'],
                    width: newRect['@:{width}'],
                    height: newRect['@:{height}']
                };
                if (Transform["@:{transform#rect.intersect}"](testRect, pageRect)) {
                    filterElements.push(e);
                }
            }
        }
    }
    return filterElements;
};
let mountDisplayOfElementId = guid('_rd_mdt');
let mountDisplayOfElement = async (type, data) => {
    let container = node<HTMLElement>(mountDisplayOfElementId);
    if (!container) {
        container = document.createElement('div');
        container.className = '@:scoped.style:{designer-root,designer-ff,offscreen-holder,pf,pointer-events-none,opacity-0}';
        container.id = mountDisplayOfElementId;
        document.body.appendChild(container);
    }
    let vfRoot = Vframe.root();
    vfRoot.unmount(container);
    vfRoot.mount(container, `@:../../elements/${type}/index`, data);
    for (; ;) {
        if (container.childNodes.length) {
            break;
        }
        await delay(10);
    }
    await lowTaskFinale();
    await delay(50);
    return container;
};

let hidden = '@:scoped.style:none';
let tipMsg = msg => {
    let n = node<HTMLDivElement>('_rd_tip');
    let { classList } = n;
    if (classList.contains(hidden)) {
        classList.remove(hidden);
    }
    n.innerHTML = msg;
};

let hideMsg = () => {
    let n = node<HTMLDivElement>('_rd_tip');
    let { classList } = n;
    if (!classList.contains(hidden)) {
        classList.add(hidden);
    }
};

/**
 * 再次检查图片，在开着调试工具的时候，disable cahce 图片每次均会重新请求
 * @param root 根节点
 */
let doubleCheckImages = async (root: Element, tip = true) => {
    let images = root.getElementsByTagName('img');
    for (; ;) {
        let hasAllReady = 1,
            readyCount = 0;
        for (let i = images.length; i--;) {
            let img = images[i];
            if (img.complete) {
                readyCount++;
            } else {
                hasAllReady = 0;
            }
        }
        if (tip) {
            tipMsg(`图片完成进度：${readyCount} / ${images.length}`);
        }
        if (hasAllReady) {
            if (tip) {
                hideMsg();
            }
            break;
        }
        await delay(6);
    }
};
/**
 * 获取数据表格的删除列的信息
 * @param rows 设计器产出的数据表格的行对象
 * @param anchorData 参考的真实数据
 * @returns 删除信息
 */
let getDTableRemovedInfo = (rows, anchorData) => {
    let removedColIndexes = [];
    let removedColWidth = 0;
    let dataRowIndex = 0;
    for (let row of rows) {
        if (row.data) {
            for (let i = row.cols.length; i--;) {
                let col = row.cols[i];
                if (col.bindKey &&
                    anchorData[col.bindKey] == null) {
                    removedColIndexes.push(i);
                    removedColWidth += col.width;
                }
            }
            break;
        }
        dataRowIndex++;
    }
    return {
        '@:{generic.recast.table#data.row.index}': dataRowIndex,
        '@:{generic.recast.table#removed.indexes}': removedColIndexes,
        '@:{generic.recast.table#removed.width}': removedColWidth,
    };
};
/**
 * 判断元素中是否有绑定的数据
 * @param elements 元素列表
 * @param anchorData 参考的真实数据
 * @returns 是否有绑定的数据
 */
let elementHasData = (elements, anchorData) => {
    if (elements?.length) {
        let findData;
        for (let { props } of elements) {
            if (props.bind?.fields?.length) {
                let bindField = props.bind.fields[0];
                if (anchorData[bindField.key] != null) {
                    findData = 1;
                    break;
                }
            } else {
                findData = 1;
                break;
            }
        }
        return findData;
    }
    return 1;
};
/**
 * 获取自由表格的删除列的信息
 * @param rows 设计器产出的自由表格的行对象
 * @param anchorData 参考的真实数据
 * @returns 删除信息
 */
let getFTableRemovedInfo = (rows, anchorData) => {
    let removedColIndexes = [];
    let removedColWidth = 0;
    let dataRowIndex = 0;
    for (let row of rows) {
        if (row.data) {
            for (let i = row.cols.length; i--;) {
                let col = row.cols[i];
                if (!elementHasData(col.elements, anchorData)) {
                    removedColIndexes.push(i);
                    removedColWidth += col.width;
                }
            }
            break;
        }
        dataRowIndex++;
    }
    return {
        '@:{generic.recast.table#data.row.index}': dataRowIndex,
        '@:{generic.recast.table#removed.indexes}': removedColIndexes,
        '@:{generic.recast.table#removed.width}': removedColWidth,
    };
};
/**
 * 获取参考数据对象
 * @param list 数据
 */
let getRefData = list => {
    if (isArray(list)) {
        let ref = {};
        for (let e of list) {
            for (let k in e) {
                if (e[k] != null) {
                    ref[k] = k;
                }
            }
        }
        return ref;
    }
    return list;
};
/**
 * 对集合中的数据进行删除处理
 * @param elements 页面中的元素
 * @param pageIndex 当前第几页
 * @param locker 数据处理辅助对象，方便跨页的数据处理
 */
let collateCollection = (elements, pageIndex, locker) => {
    for (let i = elements.length; i--;) {
        let { id, type, props } = elements[i];
        if (has(HodElements, type)) {
            let { rows } = props;
            for (let row of rows) {
                for (let col of row.cols) {
                    if (col.elements?.length) {
                        collateCollection(col.elements, pageIndex, locker);
                    }
                }
            }
        }
        if (props.print) {
            if (props.print == 'odd') {
                if (pageIndex % 2) {
                    elements.splice(i, 1);
                }
            } else if (props.print == 'even') {
                if (pageIndex % 2 == 0) {
                    elements.splice(i, 1);
                }
            } else if (props.print == 'last') {
                let prev = `${id}:${pageIndex + 1}`;
                let key = `${id}:${pageIndex}`;
                if (locker[prev]) {
                    elements.splice(i, 1);
                }
                locker[key] = 1;
            } else if (props.print == 'first') {
                let prev = `${id}:${pageIndex + 1}`;
                if (locker[prev]) {
                    for (let pes of locker[prev]) {
                        let [es, idx] = pes;
                        es.splice(idx, 1);
                    }
                    locker[prev] = null;
                }
                let key = `${id}:${pageIndex}`;
                if (!locker[key]) {
                    locker[key] = [];
                }
                locker[key].push([elements, i]);
            }
        }
    }
};

let isChildOf = (vf, pVfId) => {
    while (vf && vf.pId) {
        if (vf.pId == pVfId) {
            return 1;
        }
        vf = Vframe.byId(vf.pId);
    }
};
export default {
    /**
     * 查找绑定数据的元素
     */
    '@:{search.hod.bind.elements}': SearchHodBindElements,
    /**
     * 容器元素
     */
    '@:{hod.elements}': HodElements,
    /**
     * 展示消息
     */
    '@:{show.msg}': tipMsg,
    /**
     * 隐藏消息
     */
    '@:{hide.msg}': hideMsg,
    /**
     * 渲染元素的展示层
     */
    '@:{mount.display.of.element}': mountDisplayOfElement,
    /**
     * 查询处于当前页面中的元素
     */
    '@:{find.current.page.elements}': findCurrentPageElements,
    /**
     * 二次检查图片
     */
    '@:{double.check.images}': doubleCheckImages,
    /**
     * 清理html中不需要的属性
     * @param html 源html
     */
    '@:{clean.html}'(html: string) {
        return html.replace(tagReg, m => m.replace(tagAttReg, ''));
    },
    /**
     * 对部分元素，如带奇偶打印的元素进行删除处理
     * @param pages 分好页的数据
     */
    '@:{collate}': pages => {
        let locker = {};
        for (let j = pages.length; j--;) {
            let elements = pages[j];
            collateCollection(elements, j, locker);
        }
    },
    '@:{collect.bind.and.resource}'(elements, resourcesLoader, fromVirtual?) {
        let bindApis = [];
        let footerHeight = 0;
        let apisManagers = {};
        //let bindFielsMap = {};
        /**
         * 收集所有元素的接口地址
         * @param elements 元素列表
         */
        let collectBindInfo = elements => {
            for (let e of elements) {
                if (!e.id) {
                    e.id = guid('e');
                }
                let { props, type } = e;
                let { bind, } = props;
                //有可能不同的元素使用了相同的api,而数据只需要取一份即可
                if (bind?.id) {
                    if (fromVirtual) {
                        let url = DataCenterProvider['@:{rebuild.bind.url}'](bind);
                        if (!DataCenterProvider['@:{has}'](url)) {//如果绑定了数据中心没有的数据
                            DataCenterProvider['@:{register}'](url, null, `未提供${url}的数据`);
                        }
                    } else {
                        let key = bind.url + '~' + bind.id;
                        if (!apisManagers[key]) {
                            apisManagers[key] = SCENE_LABEL ? bind : 1;
                            DataCenterProvider['@:{register.bind}'](bind);
                            bindApis.push(bind);
                        } else if (SCENE_LABEL) {
                            let b = apisManagers[key];
                            if (!b.fields) {
                                b.fields = [];
                            }
                            if (bind.fields) {
                                let map = toMap(b.fields, 'key');
                                for (let bf of bind.fields) {
                                    if (!map[bf.key]) {
                                        b.fields.push(bf);
                                    }
                                }
                            }
                        }
                    }
                }
                //容器需要递归处理
                if (has(HodElements, type)) {
                    let { rows } = props;
                    for (let row of rows) {
                        for (let col of row.cols) {
                            if (col.type == 'qrcode' ||
                                col.type == 'barcode') {
                                resourcesLoader['@:{add}']('@:{provider}', col.type);
                            }
                            if (col.elements?.length) {
                                collectBindInfo(col.elements);
                            }
                            if (col.bindKey) {
                                if (!bind.fields) {
                                    bind.fields = [];
                                }
                                bind.fields.push({
                                    key: col.bindKey,
                                    name: col.bindName
                                });
                            }
                        }
                    }
                }
                if (type == 'data-richtext') {
                    type = 'richtext';
                } else if (type.startsWith('batch-')) {
                    type = type.substring(6);
                }
                resourcesLoader['@:{add}']('@:{script}', type);
                if (type == 'hod-footer') {//页脚
                    footerHeight = props.height;
                } else if (type == 'barcode' ||
                    type == 'qrcode' ||
                    type == 'fx' ||
                    type == 'signature' ||
                    type == 'bwip') {
                    resourcesLoader['@:{add}']('@:{provider}', type);
                } else if (type.startsWith('chart/')) {
                    if (type == 'chart/chartjs') {
                        type = 'chart';
                    } else {
                        type = 'echarts';
                    }
                    resourcesLoader['@:{add}']('@:{provider}', type);
                } else if (type == 'formula') {
                    resourcesLoader['@:{add}']('@:{provider}', 'mathjax');
                } else if (type == 'richtext') {
                    resourcesLoader['@:{add}']('@:{provider}', 'html2canvas');
                } else if (type == 'html') {
                    resourcesLoader['@:{add}']('@:{provider}', 'underscore');
                } else if (type == 'datetime') {
                    resourcesLoader['@:{add}']('@:{provider}', 'qrcode');
                }
            }
        };
        collectBindInfo(elements);
        return {
            '@:{footer.height}': footerHeight,
            '@:{apis}': bindApis,
        };
    },
    /**
     * 重新编排表格描述对象数据
     * @param table 表格描述对象
     */
    '@:{recast.table.by.data}'(table) {
        let { props, type } = table;
        let { bind, rows,
            dynamicCols, avgDynamicColsWidth } = props;
        if (bind.id &&
            dynamicCols) {

            let { '@:{error}': err,
                '@:{data}': list
            } = DataCenterProvider['@:{fetch.data}'](bind);
            if (!err) {
                let anchorData = getRefData(list);
                let info;
                if (type == 'data-dtable') {
                    info = getDTableRemovedInfo(rows, anchorData);
                } else {
                    info = getFTableRemovedInfo(rows, anchorData);
                }

                let removedColIndexes = info['@:{generic.recast.table#removed.indexes}'];
                let removedColWidth = info['@:{generic.recast.table#removed.width}'];
                let dataRowIndex = info['@:{generic.recast.table#data.row.index}'];
                props.focusRow = dataRowIndex;
                //附加单元格信息，方便删除
                TableProvider['@:{table.provider#add.ext.meta}'](props);
                for (let ri of removedColIndexes) {
                    props.focusCol = ri;
                    //根据focusRow及focusCol逻辑聚焦到某个单元格上，然后删除这个聚焦的格子所在的列
                    TableProvider['@:{table.provider#delete.col}'](props);
                    //删除后需要再次更新单元格元信息
                    TableProvider['@:{table.provider#add.ext.meta}'](props);
                }
                if (avgDynamicColsWidth == 'none') {
                    props.width -= removedColWidth;
                } else if (avgDynamicColsWidth == 'direct') {//采用直接均分的方式
                    let restCols = props['@:{col.max}'];
                    let singleColWidth = removedColWidth / restCols;
                    for (let row of rows) {
                        for (let col of row.cols) {
                            let spannedCells = col.colspan;
                            col.width += singleColWidth * spannedCells;
                        }
                    }
                } else {
                    //以下是占比均分，根据剩余单元格的宽度在整体里的占比，对宽度按占比均分
                    let sizes = TableProvider['@:{table.provider#get.sizes}'](props);
                    let colWidths = sizes['@:{col.widths}'];
                    let restTotalWidth = 0;
                    for (let cw of colWidths) {
                        restTotalWidth += cw;
                    }
                    for (let row of rows) {
                        for (let col of row.cols) {
                            col.width += (col.width / restTotalWidth) * removedColWidth;
                        }
                    }
                }
            }
        }
    },
    /**
     * 等待所有子节点渲染完成
     * @param vfId vframeId
     * @param timeout 超时
     * @returns 子节点渲染完成
     */
    '@:{wait.all.views.ready}'(vfId: string, timeout = 30 * 1000) {
        let start = now();
        return new Promise<void>(resolve => {
            let test = () => {
                let vframes = Vframe.all();
                let stop = now() >= timeout + start;
                if (!stop) {
                    stop = true;
                    for (let p in vframes) {
                        let vf = Vframe.byId(p);
                        if (isChildOf(vf, vfId)) {
                            let view = vf['@:{vframe.view.entity}'];
                            if (!view?.['@:{view.rendered}']) {
                                stop = false;
                                break;
                            }
                        }
                    }
                }
                if (stop) {
                    Runner['@:{task.remove}'](test);
                    resolve();
                }
            };
            Runner['@:{task.add}'](400, test);
        });
    }
};