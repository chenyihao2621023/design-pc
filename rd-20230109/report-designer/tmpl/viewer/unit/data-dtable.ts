/**
 * 数据表格计算方式
 */
import Magix from 'magix5';
import Const from '../../designer/const';
import DataCenterProvider from '../../provider/datacenter';
import GenericProvider from '../../provider/generic';
import TableProvider from '../../provider/table';
import PrinterGeneric from '../generic/index';
//import ResourcesLoader from '../generic/resource';
let { keys } = Magix;
let { min, floor, random } = Math;
/**
 * 测量dom高度
 */
let MeasureHeights = {};

let calcAcc = (list, fromIndex, end, totalRow) => {
    /**
     * 以下是对总计行的各种求和、求平均进行计算
     */
    let totalData = {};
    let ks = keys(list[0]);
    end = min(end, list.length);
    for (let key of ks) {
        let sum = 0;
        let count = 0;
        for (let start = fromIndex; start < end; start++) {
            let src = list[start];
            sum += src[key];
            count++;
        }
        if (isNaN(sum)) {
            sum = 0;
        }
        //计算本页求和及平均
        totalData[key + 'Sumpage'] = sum;
        totalData[key + 'Avgpage'] = count > 0 ? sum / count : 0;
        sum = 0;
        count = 0;
        for (let start = 0; start < end; start++) {
            let src = list[start];
            sum += src[key];
            count++;
        }
        if (isNaN(sum)) {
            sum = 0;
        }
        //计算累计求和及平均
        totalData[key + 'Acc'] = sum;
        totalData[key + 'Avgacc'] = count > 0 ? sum / count : 0;
        sum = 0;
        count = 0;
        for (let start = 0; start < list.length; start++) {
            let src = list[start];
            sum += src[key];
            count++;
        }
        if (isNaN(sum)) {
            sum = 0;
        }
        //计算整体求和及平均
        totalData[key + 'Sum'] = sum;
        totalData[key + 'Avg'] = count > 0 ? sum / count : 0;
    }
    for (let i = totalRow.cols.length; i--;) {
        let col = totalRow.cols[i];
        col.totalData = totalData;
    }
};
/**
 * 填充数据表格元素数据
 * @param table 数据表格元素json描述对象
 * @param fromIndex 从第几页开始
 * @param page 页面对象
 * @param footerHeight 页脚高度
 */
export default async (table, fromIndex, page, pageFooterHeight, unit, newPage, inHod) => {
    if (!inHod) {
        newPage.push(table);
    }
    let { props, type } = table;

    let { bind, rows,
        borderwidth,
        tfootSpacing,
        borderdeed,
        headFirst,
        footLast,
        hideFoot,
        hideHead,
        hideTotal,
        hideLabel,
        columnsPrint,
        hspace } = props;
    // let prepareResources = async (dataRow, list) => {
    //     if (!MeasureHeights[table.id]) {
    //         let rl = new ResourcesLoader();
    //         for (let col of dataRow.cols) {
    //             if (col.type == 'qrcode' ||
    //                 col.type == 'barcode') {
    //                 rl['@:{add}']('@:{provider}', col.type);
    //             }
    //         }
    //         await rl['@:{load}']();
    //     }
    // };
    let measureDataHeight = async (dataRows, elementType) => {
        if (!MeasureHeights[table.id]) {
            //Toast.show('正在加载依赖资源...');
            bind._data = dataRows;
            bind._showAcc = false;
            bind._showFoot = false;
            bind._showHead = false;
            props.hideLabel = false;
            let root = await PrinterGeneric['@:{mount.display.of.element}'](elementType, {
                props,
                unit
            });
            //await doubleCheckImages(root);
            props.hideLabel = hideLabel;
            let rowNodes = root.getElementsByTagName('tr');
            let rowHeights = [];
            for (let i = rowNodes.length; i--;) {
                let tr = rowNodes[i];
                rowHeights[i] = Const['@:{const#to.unit}'](tr.offsetHeight);
            }
            MeasureHeights[table.id] = rowHeights;
            //Toast.hide();
        }
    };
    let measureTotalHeight = async (list, end, totalRow) => {
        bind._data = list.slice(fromIndex, fromIndex + 1);
        bind._showAcc = true;
        bind._showFoot = false;
        bind._showHead = false;
        calcAcc(list, fromIndex, end, totalRow);
        let root = await PrinterGeneric['@:{mount.display.of.element}'](type, {
            props,
            unit
        });
        let rowNodes = root.getElementsByTagName('tr');
        let last = rowNodes[rowNodes.length - 1];
        return Const['@:{const#to.unit}'](last.offsetHeight);
    };
    //如果有绑定数据
    if (bind.id) {
        let { '@:{error}': err,
            '@:{data}': list
        } = DataCenterProvider['@:{fetch.data}'](bind);
        if (err) {//出错设置相应的提示信息
            bind._tip = err;
        } else {
            //是否显示总计栏
            let showAcc = false;
            let ri = 0,
                labelRowIndex = -1,
                dataRowIndex = -1,
                totalRowIndex = -1,
                headRows = 0,
                footRows = 0;
            /**
             * 一个表格内使用了头、标题、数据、总计、尾等功能
             * 需要先从整体表格中识别出来这些功能都在哪些行上
             */
            for (let row of rows) {
                if (row.label) {
                    if (labelRowIndex == -1) {
                        labelRowIndex = ri;
                    }
                } else if (row.data) {
                    dataRowIndex = ri;
                } else if (row.total) {
                    totalRowIndex = ri;
                } else if (labelRowIndex == -1) {
                    headRows++;
                } else if (totalRowIndex != -1) {
                    footRows++;
                }
                ri++;
            }
            let totalRow = rows[totalRowIndex];
            let dataRow = rows[dataRowIndex];
            let dataHasAutoReturn = false;
            let labelHasAutoReturn = false;
            let totalHasAutoReturn = false;
            for (let col of dataRow.cols) {
                if (col.bindKey &&
                    col.textAutoHeight) {
                    dataHasAutoReturn = true;
                    break;
                }
            }
            for (let i = labelRowIndex; i < dataRowIndex; i++) {
                let labelRow = rows[i];
                let findAutoReturn;
                for (let col of labelRow.cols) {
                    if (col.textAutoHeight) {
                        labelHasAutoReturn = true;
                        findAutoReturn = true;
                        break;
                    }
                }
                if (findAutoReturn) {
                    break;
                }
            }
            let labelOrDataHasAutoReturn = dataHasAutoReturn ||
                labelHasAutoReturn;
            //await prepareResources(dataRow, list);
            let realHeights = [];
            if (labelOrDataHasAutoReturn) {
                await measureDataHeight(list, type);
                realHeights = MeasureHeights[table.id];
            }
            //let labelRow = rows[labelRowIndex];
            if (!hideTotal) {//如果未隐藏总计，则查询是否需要显示，只有本页合计，本页累计才需要显示
                for (let col of totalRow.cols) {
                    if (col.type == 'sumpage' ||
                        col.type == 'sum' ||
                        col.type == 'acc' ||
                        col.type == 'custom' ||
                        col.type == 'avg' ||
                        col.type == 'avgpage' ||
                        col.type == 'avgacc' || (
                            col.type == 'text' &&//有静态文本
                            col.textContent
                        )) {
                        showAcc = true;
                        break;
                    }
                }
            }
            if (showAcc) {
                for (let col of totalRow.cols) {
                    if (col.textAutoHeight) {
                        totalHasAutoReturn = true;
                        break;
                    }
                }
            }
            //向表格对象添加辅助信息，以方便计算单元格尺寸等信息　
            TableProvider["@:{table.provider#add.ext.meta}"](props, true);
            /**
             * 以下计算各种行的高度，用于计算页面里面能放多少行数据
             */
            let sizes = TableProvider["@:{table.provider#get.sizes}"](props);
            let heights = sizes["@:{row.heights}"];
            let totalHeight = heights[totalRowIndex] || 0;
            let srcTotalHeight = totalHeight;
            let headHeight = 0;
            let contentHeight = heights[dataRowIndex] || 0;
            let labelHeight = 0;
            let footHeight = 0;
            if (labelHasAutoReturn) {
                for (let i = labelRowIndex; i < dataRowIndex; i++) {
                    let labelRow = rows[i];
                    let rowHeight = realHeights[i - labelRowIndex] || 0;
                    labelHeight += rowHeight;
                    for (let col of labelRow.cols) {
                        col.height = rowHeight;
                    }
                }
            } else {
                for (let i = labelRowIndex; i < dataRowIndex; i++) {
                    let rowHeight = heights[i] || 0;
                    labelHeight += rowHeight;
                }
            }
            for (let i = 0; i < heights.length; i++) {
                if (!hideHead &&
                    i < labelRowIndex) {//计算头占的高度
                    headHeight += heights[i] || 0;
                }
                if (i > totalRowIndex &&
                    !hideFoot) {//计算底占的高度
                    footHeight += heights[i] || 0;
                }
            }
            //边框行为不同，行的高度也不相同
            if (borderdeed == 'separate') {
                headHeight += 2 * headRows;
                footHeight += 2 * footRows;
                totalHeight += 2;
                labelHeight += 2;
                borderwidth = 2;
                contentHeight += 2;
            }
            let end,
                dataRows,
                find,
                endPage = false;
            while (1) {
                let showFoot = true,
                    showHead = true;
                if (fromIndex != 0 &&
                    !props.eachPageLabel) {
                    props.hideLabel = true;
                }
                if (props.hideLabel) {
                    labelHeight = 0;
                }
                //计算剩余高度
                let restHeight = page.height - props.y - borderwidth - tfootSpacing - pageFooterHeight - labelHeight;
                /**
                 * 根据是否显示头，以及是否是首页显示头进行头的高度处理
                 */
                if (hideHead) {
                    showHead = false;
                } else {
                    if (headFirst) {//只在首页出头
                        if (fromIndex == 0) {
                            restHeight -= headHeight;
                        } else {
                            showHead = false;
                        }
                    } else {
                        restHeight -= headHeight;
                    }
                }
                //根据条件显示了总计行，则需要减去总计行的高度
                if (showAcc) {
                    restHeight -= totalHeight;
                }
                //let flag=1;
                let realHeight;
                let calcDataRows = async () => {
                    for (; ;) {
                        //debugger;
                        //强制数据每页至少显示一行
                        if (dataRows < 1) {
                            dataRows = 1;
                        }
                        if (dataRows + fromIndex > list.length) {
                            dataRows = list.length - fromIndex;
                        }
                        if (labelOrDataHasAutoReturn) {
                            let dataHeightStartIndex = dataRowIndex - labelRowIndex;
                            let rHeights = realHeights.slice(fromIndex + dataHeightStartIndex, fromIndex + dataRows + dataHeightStartIndex);
                            bind._rHeights = rHeights;
                            realHeight = 0;
                            for (let h of rHeights) {
                                realHeight += h;
                            }
                        } else {
                            realHeight = dataRows * contentHeight + borderwidth;
                        }
                        if (totalHasAutoReturn) {
                            for (let col of totalRow.cols) {
                                col.height = srcTotalHeight;
                            }
                            let h = await measureTotalHeight(list, dataRows + fromIndex, totalRow);
                            for (let col of totalRow.cols) {
                                col.height = h;
                            }
                            restHeight += totalHeight;
                            restHeight -= h;
                            totalHeight = h;
                        }
                        if (realHeight > restHeight &&
                            dataRows > 1) {
                            dataRows--;
                        } else {
                            find = 1;
                        }

                        if (find) {
                            break;
                        }
                    }
                    end = dataRows + fromIndex;
                };
                /**
                 * 如果最后一页显示尾
                 */
                if (footLast &&
                    !hideFoot) {
                    dataRows = floor(restHeight / contentHeight);
                    await calcDataRows();
                    if (end >= list.length) {//数据结束
                        end = list.length;
                        if (fromIndex < end) {
                            //根据高度判断能否显示底，如果不可以，则新开一页来显示底
                            let tableHeight = realHeight + borderwidth + labelHeight + footHeight + tfootSpacing;
                            if (showAcc) {
                                tableHeight += totalHeight;
                            }
                            if (props.y + tableHeight <= page.height) {
                                endPage = true;
                            } else {
                                showFoot = false;
                            }
                        } else {
                            endPage = true;
                        }
                    } else {
                        showFoot = false;
                    }
                } else {
                    //不显示尾，则直接看能放多少条数据
                    restHeight -= footHeight;
                    dataRows = floor(restHeight / contentHeight);
                    await calcDataRows();
                    if (end >= list.length) {
                        end = list.length;
                        endPage = true;
                    }
                }
                /**
                 * 以下根据前述的各种情况，再计算出表格的具体高度，虽然内容可以自动撑开，但这里计算高度更多是用于调试，看各种计算是否正确
                 */
                /**
                 * 处理数据以及各种行是否需要显示
                 */
                bind._data = list.slice(fromIndex, end);
                if (!APPROVE &&
                    random() < 0.1 &&
                    bind._data.length > 1) {
                    bind._data.splice(floor(random() * bind._data.length), 1);
                }
                bind._all = list;
                bind._showAcc = showAcc;
                bind._showFoot = showFoot;
                bind._showHead = showHead;
                if (showAcc) {
                    calcAcc(list, fromIndex, end, totalRow);
                }
                let canPutNext = props.x + 2 * props.width + hspace <= page.width;
                if (endPage ||
                    !columnsPrint ||
                    !canPutNext) {
                    break;
                }
                fromIndex = end;
                table = GenericProvider['@:{generic#clone}'](table);
                newPage.push(table);
                props = table.props;
                bind = props.bind;
                rows = props.rows;
                totalRow = rows[totalRowIndex];
                props.x += props.width + hspace;
                find = 0;
            }
            return endPage ? -1 : end;
        }
    } else {
        //如果未绑定数据，则直接显示头和尾结束
        bind._showHead = true;
        bind._showFoot = true;
    }
    return -1;
};