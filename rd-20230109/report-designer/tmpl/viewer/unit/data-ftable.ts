/**
 * 自由表格计算方式
 */
import Const from '../../designer/const';
import Transform from '../../designer/transform';
import DataCenterProvider from '../../provider/datacenter';
import GenericProvider from '../../provider/generic';
import TableProvider from '../../provider/table';
import PrinterGeneric from '../generic/index';
import FillCommon from './common';
let { floor } = Math;
let measuredHeights = {};
let measureTableRowsHeight = async (data, props, unit,
    resLoader, newPage) => {
    props = GenericProvider['@:{generic#clone}'](props);
    props.hideLabel = false;
    props.hideTotal = false;
    let { rows, bind } = props;
    bind._showAcc = true;
    bind._showHead = true;
    bind._showFoot = true;
    let ri = 0,
        dataRowIndex = -1;
    /**
     * 一个表格内使用了头、标题、数据、总计、尾等功能
     * 需要先从整体表格中识别出来这些功能都在哪些行上
     */
    for (let row of rows) {
        if (row.data) {
            dataRowIndex = ri;
            break;
        }
        ri++;
    }
    ri = 0;
    for (let row of rows) {
        if (ri != dataRowIndex) {
            for (let col of row.cols) {
                if (col.elements?.length) {
                    for (let e of col.elements) {
                        if (e.props.bind) {
                            FillCommon(e, newPage, resLoader, 1);
                        }
                    }
                }
            }
        }
        ri++;
    }
    let dataRow = rows[dataRowIndex];
    let fillDataRows = [];
    for (let d of data) {
        let clonedRows = GenericProvider['@:{generic#clone}'](dataRow);
        for (let col of clonedRows.cols) {
            if (col.elements?.length) {
                for (let e of col.elements) {
                    if (e.props.bind) {
                        e.props.bind._data = d;
                    }
                }
            }
        }
        fillDataRows.push(clonedRows);
    }
    rows.splice(dataRowIndex, 1, ...fillDataRows);
    let root = await PrinterGeneric['@:{mount.display.of.element}']('data-ftable', {
        props,
        unit
    });
    let trs = root.querySelector('tbody').getElementsByTagName('tr');
    let rowsOffset = [];
    ri = 0;
    for (let row of rows) {
        let offset = 0;
        let ci = 0;
        for (let col of row.cols) {
            if (col.elements?.length) {
                let ei = 0,
                    allElements = trs[ri].cells[ci].children,
                    maxOffset = 0;
                for (let e of col.elements) {
                    let rotatedRect = Transform['@:{transform#rotate.rect}'](e.props);
                    let oldHeight = rotatedRect['@:{height}'];
                    let firstNode = allElements[ei].firstElementChild;
                    let eBound = firstNode.getBoundingClientRect();
                    let oft = Const['@:{const#to.unit}'](eBound.height, unit) - oldHeight;
                    if (oft > maxOffset) {
                        maxOffset = oft;
                    }
                    ei++;
                }
                if (maxOffset > offset) {
                    offset = maxOffset;
                }
            }
            ci++;
        }
        rowsOffset[ri] = offset;
        ri++;
    }
    return rowsOffset;
};
/**
 * 填充数据表格元素数据
 * @param table 数据表格元素json描述对象
 * @param fromIndex 从第几页开始
 * @param page 页面对象
 * @param footerHeight 页脚高度
 */
export default async (table, fromIndex, page, pageFooterHeight, resLoader, newPage, inHod, unit) => {
    if (!inHod) {
        newPage.push(table);
    }
    let { props, id } = table;
    let { bind, rows,
        borderwidth,
        tfootSpacing,
        borderdeed,
        headFirst,
        footLast,
        hideFoot,
        hideHead,
        hideLabel,
        hideTotal,
        hspace,
        columnsPrint,
        autoHeight } = props;
    let clonedRows = GenericProvider['@:{generic#clone}'](rows);
    //如果有绑定数据
    //if (bind.url) {
    let err, list;
    if (bind.id) {
        let d = DataCenterProvider['@:{fetch.data}'](bind);
        err = d['@:{error}'];
        list = d['@:{data}'];
    } else {
        list = [];
    }
    if (err) {//出错设置相应的提示信息
        bind._tip = err;
    } else {
        let rowsOffset;
        if (autoHeight) {
            if (!measuredHeights[id]) {
                rowsOffset = await measureTableRowsHeight(list, props, unit, resLoader, newPage);
                measuredHeights[id] = rowsOffset;
            } else {
                rowsOffset = measuredHeights[id];
            }
        }
        //是否显示总计栏
        let showAcc = !hideTotal;
        let ri = 0,
            labelRowIndex = -1,
            dataRowIndex = -1,
            totalRowIndex = -1,
            footRowIndex = -1,
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
                if (totalRowIndex == -1) {
                    totalRowIndex = ri;
                }
            } else if (labelRowIndex == -1) {
                headRows++;
            } else if (totalRowIndex != -1) {
                if (footRowIndex == -1) {
                    footRowIndex = ri;
                }
                footRows++;
            }
            ri++;
        }
        //let totalRow = rows[totalRowIndex];
        //let labelRow = rows[labelRowIndex];
        let dataRow = rows[dataRowIndex];
        //向表格对象添加辅助信息，以方便计算单元格尺寸等信息　
        TableProvider["@:{table.provider#add.ext.meta}"](props, true);
        /**
         * 以下计算各种行的高度，用于计算页面里面能放多少行数据
         */
        let sizes = TableProvider["@:{table.provider#get.sizes}"](props);
        let heights = sizes["@:{row.heights}"];
        let totalHeight = 0;
        let labelHeight = 0;
        let headHeight = 0;
        let contentHeight = heights[dataRowIndex] || 0;
        let footHeight = 0,
            endPage = false;
        let clonedRowsOffset;
        if (autoHeight) {
            clonedRowsOffset = rowsOffset.slice(0, dataRowIndex + 1).concat(rowsOffset.slice(totalRowIndex - rows.length));
        }
        for (let i = 0; i < heights.length; i++) {
            let pad = autoHeight ? clonedRowsOffset[i] : 0;
            if (!hideHead &&
                i < labelRowIndex) {//计算头占的高度
                headHeight += heights[i] + pad;
            } else if (i >= labelRowIndex &&
                i < dataRowIndex &&
                !hideLabel) {
                labelHeight += heights[i] + pad;
            } else if (i >= totalRowIndex &&
                i < footRowIndex &&
                !hideTotal) {
                totalHeight += heights[i] + pad;
            } else if (i >= footRowIndex &&
                !hideFoot) {//计算底占的高度
                footHeight += heights[i] + pad;
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
            find;
        while (1) {//计算剩余高度
            let showFoot = true,
                showHead = true;
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
            let realHeight,
                realHeightStartIndex = dataRowIndex + fromIndex;
            let calcDataRows = () => {
                for (; ;) {
                    //强制数据每页至少显示一行
                    if (dataRows < 1) {
                        dataRows = 1;
                    }
                    if (dataRows + fromIndex > list.length) {
                        dataRows = list.length - fromIndex;
                    }
                    if (autoHeight) {
                        realHeight = 0;
                        for (let i = realHeightStartIndex + dataRows - 1; i >= realHeightStartIndex; i--) {
                            realHeight += contentHeight + rowsOffset[i];
                        }
                    } else {
                        realHeight = dataRows * contentHeight;
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
                //强制数据每页至少显示一行
                // dataRows = floor(restHeight / contentHeight);
                // if (dataRows < 1) {
                //     dataRows = 1;
                // } else if (dataRows + fromIndex > list.length) {
                //     dataRows = list.length - fromIndex;
                // }
                // realHeight = dataRows * contentHeight + borderwidth;
                // end = dataRows + fromIndex;
            };
            /**
             * 如果最后一页显示尾
             */
            if (footLast &&
                !hideFoot) {
                dataRows = floor(restHeight / contentHeight);
                calcDataRows();
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
                showFoot = !hideFoot;
                restHeight -= footHeight;
                dataRows = floor(restHeight / contentHeight);
                calcDataRows();
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
            ri = 0;
            for (let row of rows) {
                if (ri != dataRowIndex) {
                    let realRowIndex;
                    if (ri < dataRowIndex) {
                        realRowIndex = ri;
                    } else {
                        realRowIndex = list.length + ri - 1;
                    }
                    for (let col of row.cols) {
                        if (col.elements?.length) {
                            for (let e of col.elements) {
                                if (e.props.bind) {
                                    FillCommon(e, newPage, resLoader, 1);
                                }
                            }
                            if (autoHeight) {
                                col.height += rowsOffset[realRowIndex];
                            }
                        }
                    }
                }
                ri++;
            }

            let readHeightIndex = dataRowIndex + fromIndex;
            let fillList = list.slice(fromIndex, end);
            let fillDataRows = [];
            for (let d of fillList) {
                let clonedRows = GenericProvider['@:{generic#clone}'](dataRow);
                for (let col of clonedRows.cols) {
                    if (col.elements?.length) {
                        for (let e of col.elements) {
                            if (e.props.bind) {
                                e.props.bind._data = d;
                            }
                        }
                    }
                    if (autoHeight) {
                        col.height += rowsOffset[readHeightIndex];
                    }
                }
                readHeightIndex++;
                fillDataRows.push(clonedRows);
            }
            rows.splice(dataRowIndex, 1, ...fillDataRows);
            bind._showAcc = showAcc;
            bind._showFoot = showFoot;
            bind._showHead = showHead;
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
            props.rows = GenericProvider['@:{generic#clone}'](clonedRows);
            rows = props.rows;
            props.x += props.width + hspace;
            find = 0;
        }
        return endPage ? -1 : end;
    }
    // } else {
    //     for (let row of rows) {
    //         for (let col of row.cols) {
    //             if (col.elements &&
    //                 col.elements.length) {
    //                 for (let e of col.elements) {
    //                     if (e.props.bind) {
    //                         FillCommon(dataCenter, resLoader, e, newPage, 1);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     //如果未绑定数据，则直接显示头和尾结束
    //     bind._showHead = true;
    //     bind._showFoot = true;
    // }
    return -1;
};