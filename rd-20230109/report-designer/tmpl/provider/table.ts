import Magix from 'magix5';
/**
 * 用于操作描述表格生成的数据对象，如
 * {
 *     rows:[{
 *          cols:[{rowspan:1,colspan:1},{rowspan:1,colspan:1}]
 *      },{
 *          cols:[{colspan:2}]
 *      }],
 *      focusRow:1,//当前聚焦在哪一行上
 * 　　　focusCol:2,//当前聚焦在哪一列上
 * }
 * 描述了2行2列的数据表格，其中第2行进行了列合并
 * 该对象用于操作上述数据，进行添加、删除、合并、拆分行、列、单元格等
 */

let { isArray } = Magix;
let { abs, min, max } = Math;
let tags = ['head', 'label', 'data', 'total', 'foot'];
/**
 * 对新生成的行添加标签描述
 * @param toRow 添加到的行对象
 * @param fromRow 来源行对象
 * @returns 添加到的行对象
 */
let addTag = (toRow, fromRow) => {
    for (let tag of tags) {
        if (fromRow[tag]) {
            toRow[tag] = true;
        }
    }
    return toRow;
};
/**
 * 查找列合并的最大值
 * @param rows 行对象
 * @param colIndex 当前列
 * @param colMax 最大列
 * @returns 
 */
let findMaxColspan = (rows, colIndex, colMax) => {
    let spanned = colMax;
    for (let row of rows) {
        for (let col of row.cols) {
            let end = col['@:{start.col.index}'] + col.colspan - 1;
            if (col['@:{start.col.index}'] <= colIndex &&
                end >= colIndex) {
                let s = end - colIndex;
                if (s < spanned) {
                    spanned = s;
                }
            }
        }
    }
    return spanned;
};
/**
 * 查找行合并的最大值
 * @param rows 行对象
 * @param rowIndex 当前行
 * @param rowMax 最大行
 * @returns 
 */
let findMaxRowspan = (rows, rowIndex, rowMax) => {
    let spanned = rowMax;
    for (let row of rows) {
        for (let col of row.cols) {
            let end = col['@:{start.row.index}'] + col.rowspan - 1;
            if (col['@:{start.row.index}'] <= rowIndex &&
                end >= rowIndex) {
                let s = end - rowIndex;
                if (s < spanned) {
                    spanned = s;
                }
            }
        }
    }
    return spanned;
};
export default {
    /**
     * 对表格对象添加扩展信息，方便在其它方法中使用
     * @param table 表格对象
     * @param canCheck 能否检查并使用已有的缓存信息
     * @returns 表格对象
     */
    '@:{table.provider#add.ext.meta}'(table, canCheck?) {
        if (!canCheck ||
            (table['@:{row.max}'] == null ||
                table['@:{col.max}'] == null)) {
            let ri = 0, ci = 0,
                colSpanned = {},
                rowSpanned = {},
                { rows } = table,
                colMax = 0,
                rowMax = 0,
                rci = 0;
            for (let row of rows) {
                ci = 0;
                rci = 0;
                for (let cell of row.cols) {
                    while (colSpanned[ci] &&
                        rowSpanned[ci] &&
                        ri < rowSpanned[ci]) {
                        ci += colSpanned[ci];
                    }
                    cell['@:{col.index}'] = rci++;
                    cell['@:{row.index}'] = ri;
                    cell['@:{start.row.index}'] = ri;
                    cell['@:{start.col.index}'] = ci;
                    if (cell.rowspan) {
                        rowSpanned[ci] = cell.rowspan + ri;
                        cell['@:{end.row.index}'] = ri + cell.rowspan - 1;
                    } else {
                        cell['@:{end.row.index}'] = ri;
                    }
                    if (cell.colspan) {
                        colSpanned[ci] = cell.colspan;
                        ci += cell.colspan - 1;
                    }
                    cell['@:{end.col.index}'] = ci++;
                    if (ci > colMax) {
                        colMax = ci;
                    }
                }
                ri++;
                if (ri > rowMax) {
                    rowMax = ri;
                }
            }
            table['@:{row.max}'] = rowMax;
            table['@:{col.max}'] = colMax;
        }
        return table;
    },
    /**
     * 合并单元格
     * @param table 表格对象
     * @param to 向哪个方法合并 left top right bottom
     * @returns 表格对象
     */
    '@:{table.provider#merge.cell}'(table, to) {
        let { focusCol, focusRow, rows } = table,
            cells,
            syncHeight = 0,
            syncWidth = 0;
        if (to == 'left') {
            cells = [[focusRow, focusCol - 1], [focusRow, focusCol]];
            syncWidth = 1;
        } else if (to == 'right') {
            cells = [[focusRow, focusCol], [focusRow, focusCol + 1]];
            syncWidth = 1;
        } else {
            syncHeight = 1;
            let dest = rows[focusRow].cols[focusCol];
            let maxRowIndex = dest['@:{end.row.index}'] + 1;
            let maxColIndex = dest['@:{end.col.index}'];
            let find = 0;
            for (let rowIndex = 0; rowIndex <= maxRowIndex; rowIndex++) {
                for (let colIndex = 0; colIndex <= maxColIndex; colIndex++) {
                    let row = rows[rowIndex];
                    if (row) {
                        let cell = row.cols[colIndex];
                        if (cell &&
                            cell != dest) {
                            let realColIndex = cell['@:{col.index}'];
                            if (cell['@:{start.col.index}'] == dest['@:{start.col.index}'] &&
                                cell['@:{end.col.index}'] == dest['@:{end.col.index}']) {
                                if (cell['@:{end.row.index}'] + 1 == dest['@:{start.row.index}']) {
                                    if (to == 'top') {
                                        cells = [[rowIndex, realColIndex], [focusRow, focusCol]];
                                        find = 1;
                                        break;
                                    }
                                } else if (dest['@:{end.row.index}'] + 1 == cell['@:{start.row.index}']) {
                                    if (to == 'bottom') {
                                        cells = [[focusRow, focusCol], [rowIndex, realColIndex]];
                                        find = 1;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                if (find) {
                    break;
                }
            }
        }
        let [first, second] = cells;
        table.focusRow = first[0];
        table.focusCol = first[1];

        let spannedCols = 0,
            spannedRows = 0,
            spannedMaxRowIndex = -1,
            spannedMaxColIndex = -1;
        for (let cell of cells) {
            let dest = rows[cell[0]].cols[cell[1]];
            let maxRowIndex = dest['@:{end.row.index}'];
            if (maxRowIndex > spannedMaxRowIndex) {
                spannedMaxRowIndex = maxRowIndex;
            }
            let maxColIndex = dest['@:{end.col.index}'];
            if (maxColIndex > spannedMaxColIndex) {
                spannedMaxColIndex = maxColIndex;
            }
        }
        let dest = rows[first[0]].cols[first[1]];
        let from = rows[second[0]].cols[second[1]];
        spannedRows = spannedMaxRowIndex - dest['@:{start.row.index}'] + 1;
        spannedCols = spannedMaxColIndex - dest['@:{start.col.index}'] + 1;
        if (syncWidth) {
            dest.width += from.width;
        }
        if (syncHeight) {
            dest.height += from.height;
        }
        if (isArray(dest.elements)) {
            dest.elements.push(...from.elements);
        } else if (!dest.bindKey &&
            from.bindKey) {
            dest.bindKey = from.bindKey;
            dest.bindName = from.bindName;
            dest.type = from.type;
        }

        dest.colspan = spannedCols;
        dest.rowspan = spannedRows;
        for (let i = cells.length - 1; i > 0; i--) {
            let c = cells[i];
            let row = rows[c[0]];
            row.cols.splice(c[1], 1);
        }
        let rowMax = table['@:{row.max}'];
        for (let i = rowMax; i--;) {
            let row = rows[i];
            if (!row.cols.length) {
                rows.splice(i, 1);
                rowMax--;
            }
        }
        for (let i = 0; i < rowMax; i++) {
            let s = findMaxRowspan(rows, i, rowMax);
            if (s > 0) {
                for (let j = 0; j <= i; j++) {
                    let trow = rows[j];
                    for (let col of trow.cols) {
                        let end = col['@:{start.row.index}'] + col.rowspan - 1;
                        if (col['@:{start.row.index}'] <= i &&
                            end >= i) {
                            col.rowspan -= s;
                        }
                    }
                }
                break;
            }
        }
        // for (let i = rows.length; i--;) {
        //     let row = rows[i];
        //     if (!row.cols.length) {
        //         rows.splice(i, 1);
        //     } else {
        //         let spannedMinRows = table['@:{row.max}'];
        //         for (let cell of row.cols) {
        //             if (cell.rowspan < spannedMinRows) {
        //                 spannedMinRows = cell.rowspan;
        //             }
        //         }
        //         spannedMinRows -= 1;
        //         if (spannedMinRows > 0) {
        //             for (let cell of row.cols) {
        //                 cell.rowspan -= spannedMinRows;
        //             }
        //         }
        //     }
        // }
        let colMax = table['@:{col.max}'];
        for (let i = 0; i < colMax; i++) {
            let s = findMaxColspan(rows, i, colMax);
            if (s > 0) {
                for (let row of rows) {
                    for (let col of row.cols) {
                        let end = col['@:{start.col.index}'] + col.colspan - 1;
                        if (col['@:{start.col.index}'] <= i &&
                            end >= i) {
                            col.colspan -= s;
                        }
                    }
                }
                break;
            }
        }
        return table;
    },
    /**
     * 拆分单元格
     * @param table 表格对象
     * @param h 是否水平拆分
     * @param cellProps 新拆分的单元格默认属性
     * @param minWidth 最小宽度
     * @param minHeight 最小高度
     */
    '@:{table.provider#split.cell}'(table, h, cellProps, minWidth, minHeight) {
        let { focusRow, focusCol, rows } = table;
        let destRow = rows[focusRow];
        let dest = destRow.cols[focusCol];
        let sizes = this['@:{table.provider#get.sizes}'](table);
        if (h) {
            let addColspan,
                addWidth;
            if (dest.colspan > 1) {
                let right = (dest.colspan / 2) | 0;
                let left = dest.colspan - right;
                let rightWidth = 0;//findWidth(rows, dest['@:{end.col.index}'] - right, dest['@:{end.col.index}']);
                let rightEnd = dest['@:{end.col.index}'],
                    rightStart = rightEnd - right + 1;
                for (let i = rightStart; i <= rightEnd; i++) {
                    rightWidth += sizes['@:{col.widths}'][i];
                }
                dest.colspan = left;
                dest.width -= rightWidth;
                addColspan = right;
                addWidth = rightWidth;
            } else {
                let oldWidth = dest.width;
                let w = oldWidth / 2;
                if (w < minWidth) {
                    w = minWidth;
                }
                dest.width = w;
                addWidth = w;
                addColspan = 1;
                let diffWidth = 2 * w - oldWidth;
                for (let row of rows) {
                    for (let col of row.cols) {
                        if (col != dest &&
                            col['@:{start.col.index}'] <= dest['@:{start.col.index}'] && col['@:{end.col.index}'] >= dest['@:{end.col.index}']) {
                            col.colspan++;
                            col.width += diffWidth;
                        }
                    }
                }
            }

            let dc = {
                ...cellProps,
                elements: [],
                colspan: addColspan,
                rowspan: dest.rowspan,
                width: addWidth,
                height: dest.height,
            };
            destRow.cols.splice(focusCol + 1, 0, dc);
        } else {
            let addRowspan,
                addHeight;
            if (dest.rowspan > 1) {
                let bottom = (dest.rowspan / 2) | 0;
                let top = dest.rowspan - bottom;
                let bottomHeight = 0;// findHeight(rows, dest['@:{end.row.index}'] - bottom, dest['@:{end.row.index}']);
                let bottomEnd = dest['@:{end.row.index}'],
                    bottomStart = bottomEnd - bottom + 1;
                for (let i = bottomStart; i <= bottomEnd; i++) {
                    bottomHeight += sizes['@:{row.heights}'][i];
                }
                dest.rowspan = top;
                dest.height -= bottomHeight;
                addRowspan = bottom;
                addHeight = bottomHeight;
                destRow = rows[dest['@:{start.row.index}'] + top];
                let ci = 0;
                for (let c of destRow.cols) {
                    if (c['@:{start.col.index}'] > dest['@:{start.col.index}']) {
                        focusCol = ci;
                        break;
                    }
                    ci++;
                }
            } else {
                let oldHeight = dest.height;
                let h = oldHeight / 2;
                if (h < minHeight) {
                    h = minHeight;
                }
                dest.height = h;
                addHeight = h;
                addRowspan = 1;
                let diffHeight = 2 * h - oldHeight;
                for (let row of rows) {
                    for (let col of row.cols) {
                        if (col != dest &&
                            col['@:{start.row.index}'] <= dest['@:{start.row.index}'] && col['@:{end.row.index}'] >= dest['@:{end.row.index}']) {
                            col.rowspan++;
                            col.height += diffHeight;
                        }
                    }
                }
                rows.splice(dest['@:{end.row.index}'] + 1, 0, destRow = addTag({
                    cols: []
                }, destRow));
            }
            let dc = {
                ...cellProps,
                elements: [],
                colspan: dest.colspan,
                rowspan: addRowspan,
                width: dest.width,
                height: addHeight,
            }
            destRow.cols.splice(focusCol, 0, dc);
        }
    },
    /**
     * 添加行
     * @param table 表格对象
     * @param rowAt 添加到哪一行
     * @param cellProps 单元格默认属性
     * @param rowHeight 行高
     * @returns 表格对象
     */
    '@:{table.provider#insert.row.at}'(table, rowAt, cellProps, rowHeight) {
        let skipCols = {};
        let { rows,
            focusRow,
            '@:{col.max}': colMax } = table;
        let currentRow = rows[focusRow];
        let sizes = this['@:{table.provider#get.sizes}'](table);
        for (let rowIndex = 0; rowIndex < rowAt; rowIndex++) {
            let row = rows[rowIndex];
            for (let cell of row.cols) {
                if (cell['@:{end.row.index}'] >= rowAt) {
                    cell.rowspan++;
                    cell.height += rowHeight;
                    let start = cell['@:{start.col.index}'],
                        end = start + cell.colspan;
                    for (let i = start; i < end; i++) {
                        skipCols[i] = 1;
                    }
                }
            }
        }
        let newRow = {
            cols: []
        };
        if (currentRow) {
            addTag(newRow, currentRow);
        }
        for (let colIndex = 0; colIndex < colMax; colIndex++) {
            if (!skipCols[colIndex]) {
                let dest = {
                    ...cellProps,
                    elements: [],
                    width: sizes['@:{col.widths}'][colIndex],
                    height: rowHeight,
                    rowspan: 1,
                    colspan: 1,
                };
                newRow.cols.push(dest);
            }
        }
        rows.splice(rowAt, 0, newRow);
        return table;
    },
    /**
     * 添加列
     * @param table 表格对象
     * @param colAt 添加到哪一列
     * @param cellProps 单元格默认属性
     * @param cellWidth 单元格宽度
     * @returns 表格对象
     */
    '@:{table.provider#insert.col.at}'(table, colAt, cellProps, cellWidth) {
        let { rows } = table;
        let spannedCells = [],
            ri = 0;
        let sizes = this['@:{table.provider#get.sizes}'](table);
        for (let row of rows) {
            let cellsCount = row.cols.length;
            let insertColAt = cellsCount;
            for (let colIndex = 0; colIndex < cellsCount; colIndex++) {
                let cell = row.cols[colIndex];
                if (cell.rowspan > 1) {
                    spannedCells.push(cell);
                }
                if (cell['@:{start.col.index}'] < colAt &&
                    cell['@:{end.col.index}'] >= colAt) {
                    cell.colspan++;
                    cell.width += cellWidth;
                    insertColAt = -1;
                    break;
                } else if (cell['@:{start.col.index}'] >= colAt) {
                    insertColAt = colIndex;
                    break;
                }
            }
            for (let cell of spannedCells) {
                if (cell['@:{start.col.index}'] < colAt &&
                    cell['@:{end.col.index}'] >= colAt &&
                    cell['@:{start.row.index}'] < ri &&
                    cell['@:{end.row.index}'] >= ri) {
                    insertColAt = -1;
                    break;
                }
            }
            if (insertColAt != -1) {
                let dest = {
                    ...cellProps,
                    elements: [],
                    height: sizes['@:{row.heights}'][ri],
                    width: cellWidth,
                    rowspan: 1,
                    colspan: 1,
                };
                row.cols.splice(insertColAt, 0, dest);
            }
            ri++;
        }
        return table;
    },
    /**
     * 删除表格行
     * @param table 表格对象
     * @param deletedRowIndex 删除哪一行
     * @returns 表格对象
     */
    '@:{table.provider#delete.row}'(table, deletedRowIndex?) {
        let { rows, focusRow, focusCol } = table;
        let rowRange;
        if (deletedRowIndex != null) {
            rowRange = [deletedRowIndex, deletedRowIndex];
        } else {
            let dest = rows[focusRow].cols[focusCol];
            rowRange = [dest['@:{start.row.index}'], dest['@:{end.row.index}']];
        }
        let movedCells = {},
            hasMoved = 0;
        let removedRows = (rowRange[1] - rowRange[0] + 1);
        let nextRow = rows[rowRange[1] + 1];
        let halfDeleteRows = removedRows / 2
        for (let rowIndex = rowRange[1]; rowIndex >= 0; rowIndex--) {
            let row = rows[rowIndex],
                singRowHeight = 0;
            for (let colIndex = row.cols.length; colIndex--;) {
                let cell = row.cols[colIndex];
                let cellStartColIndex = cell['@:{start.col.index}'];
                let cellEndRowIndex = cell['@:{end.row.index}'];
                let cellStartRowIndex = cell['@:{start.row.index}'];
                let spannedRows = cellEndRowIndex - cellStartRowIndex + 1;
                if (spannedRows == 1) {
                    singRowHeight = cell.height;
                }
                if (spannedRows > 1) {
                    let halfSpannedRows = spannedRows / 2;
                    let centerDiff = abs(rowRange[0] + halfDeleteRows - cellStartRowIndex - halfSpannedRows);
                    if (centerDiff < halfDeleteRows + halfSpannedRows) {
                        if (rowRange[0] == cell['@:{start.row.index}'] &&
                            (cell['@:{end.row.index}'] - cell['@:{start.row.index}']) >= removedRows) {
                            movedCells[cellStartColIndex] = cell;
                            hasMoved = 1;
                        }
                        if (!singRowHeight) {
                            for (let tempCI = colIndex; tempCI--;) {
                                let tCell = row.cols[tempCI];
                                if (tCell['@:{end.row.index}'] == tCell['@:{start.row.index}']) {
                                    singRowHeight = tCell.height;
                                    break;
                                }
                            }
                        }
                        let minEndRowIndex = min(cellEndRowIndex, rowRange[1]);
                        let maxStartRowIndex = max(rowRange[0], cellStartRowIndex);
                        let diffRows = minEndRowIndex - maxStartRowIndex + 1;
                        cell.rowspan -= diffRows;
                        cell.height -= singRowHeight * diffRows;
                    }
                }
            }
            if (rowIndex <= rowRange[1] &&
                rowIndex >= rowRange[0]) {
                rows.splice(rowIndex, 1);
            }
        }
        if (hasMoved) {
            let maxCol = table['@:{col.max}'];
            if (nextRow) {
                for (let colIndex = maxCol,
                    lastCellIndex = nextRow.cols.length; colIndex--;) {
                    let movedCell = movedCells[colIndex];
                    if (movedCell) {
                        let insertIndex = 0;
                        for (let findIndex = lastCellIndex; findIndex--;) {
                            let cell = nextRow.cols[findIndex];
                            if (cell['@:{start.col.index}'] < colIndex) {
                                lastCellIndex = findIndex;
                                insertIndex = findIndex + 1;
                                break;
                            }
                        }
                        nextRow.cols.splice(insertIndex, 0, movedCell);
                    }
                }
            }
        }
        return table;
    },
    /**
     * 删除列
     * @param table 表格对象
     * @param deletedColStartIndex 删除单元格开始的列
     * @param deletedColEndIndex 删除单元格结束的列
     * @returns 表格对象
     */
    '@:{table.provider#delete.col}'(table,
        deletedColStartIndex?: number,
        deletedColEndIndex?: number) {
        let { focusRow, focusCol, rows } = table;
        let colRange;
        let singleCellWidth = 0;
        if (deletedColStartIndex != null) {
            if (deletedColEndIndex == null) {
                deletedColEndIndex = deletedColStartIndex;
            }
            colRange = [deletedColStartIndex, deletedColEndIndex];
            let find;
            for (let row of rows) {
                for (let colIndex = row.cols.length; colIndex--;) {
                    let cell = row.cols[colIndex];
                    if (cell['@:{start.col.index}'] == deletedColStartIndex &&
                        cell['@:{end.col.index}'] == deletedColEndIndex) {
                        find = 1;
                        singleCellWidth = cell.width;
                        break;
                    }
                }
                if (find) {
                    break;
                }
            }
        } else {
            let row = rows[focusRow];
            let cellToDelete = row.cols[focusCol];
            colRange = [cellToDelete['@:{start.col.index}'],
            cellToDelete['@:{end.col.index}']];
            singleCellWidth = cellToDelete.width;
        }
        let deletedCols = colRange[1] - colRange[0] + 1;
        let halfCols = deletedCols / 2;
        for (let row of rows) {
            for (let colIndex = row.cols.length; colIndex--;) {
                let cell = row.cols[colIndex];
                let cellStartColIndex = cell['@:{start.col.index}']
                let cellEndColIndex = cell['@:{end.col.index}'];
                if (cellStartColIndex >= colRange[0] &&
                    cellEndColIndex <= colRange[1]) {
                    row.cols.splice(colIndex, 1);
                } else if (cell.colspan > 1) {
                    let spannedCols = cellEndColIndex - cellStartColIndex + 1;
                    let halfSpannedCols = spannedCols / 2;
                    let centerDiff = abs(colRange[0] + halfCols - cellStartColIndex - halfSpannedCols);
                    if (centerDiff < halfCols + halfSpannedCols) {
                        let minEndColIndex = min(cellEndColIndex, colRange[1]);
                        let maxStartColIndex = max(colRange[0], cellStartColIndex);
                        let diffCols = minEndColIndex - maxStartColIndex + 1;
                        cell.colspan -= diffCols;
                        cell.width -= singleCellWidth;
                    }
                }
            }
        }
        return table;
    },
    /**
     * 获取表格行列尺寸
     * @param table 表格对象
     * @param refCell 参考的表格
     * @returns 表格对象
     */
    '@:{table.provider#get.sizes}'(table, refCell?) {
        let colWidths = [],
            rowHeights = [];
        let { rows } = table;
        let usedRefCellWidth = false,
            usedRefCellHeight = false;
        for (let row of rows) {
            for (let col of row.cols) {
                if (col.colspan == 1) {
                    let colIndex = col['@:{start.col.index}'];
                    if (colWidths[colIndex] == null ||
                        (!usedRefCellWidth && col.width > colWidths[colIndex]) ||
                        refCell == col) {
                        usedRefCellWidth = usedRefCellWidth || refCell == col;
                        colWidths[colIndex] = col.width;
                    }
                }
                if (col.rowspan == 1) {
                    let rowIndex = col['@:{start.row.index}'];
                    if (rowHeights[rowIndex] == null ||
                        (!usedRefCellHeight && col.height > rowHeights[rowIndex]) ||
                        refCell == col) {
                        usedRefCellHeight = usedRefCellHeight || refCell == col;
                        rowHeights[rowIndex] = col.height;
                    }
                }
            }
        }
        for (let row of rows) {
            for (let col of row.cols) {
                if (col.colspan > 1) {
                    let findColsWidth = 0, findCols = 0;
                    let startCol = col['@:{start.col.index}'],
                        endCol = startCol + col.colspan;
                    for (let i = startCol; i < endCol; i++) {
                        if (colWidths[i] != null && colWidths[i] >= 0) {
                            findColsWidth += colWidths[i];
                            findCols++;
                        }
                    }
                    if (findCols < col.colspan) {
                        let w = max(col.width - findColsWidth, 0) / (col.colspan - findCols);
                        for (let i = startCol; i < endCol; i++) {
                            if (colWidths[i] == null || colWidths[i] < 0) {
                                colWidths[i] = w;
                            }
                        }
                    } else if ((findColsWidth < col.width && (!refCell || refCell == col) || (findColsWidth > col.width && refCell && refCell == col))) {
                        for (let i = startCol; i < endCol; i++) {
                            if (findColsWidth > 0) {
                                colWidths[i] = colWidths[i] / findColsWidth * col.width;
                            } else {
                                colWidths[i] = col.width / col.colspan;
                            }
                        }
                    }
                }
                if (col.rowspan > 1) {
                    let findRowsHeight = 0, findRows = 0;
                    let startRow = col['@:{start.row.index}'],
                        endRow = startRow + col.rowspan;
                    for (let i = startRow; i < endRow; i++) {
                        if (rowHeights[i] != null && rowHeights[i] >= 0) {
                            findRowsHeight += rowHeights[i];
                            findRows++;
                        }
                    }
                    if (findRows < col.rowspan) {
                        let h = max(0, col.height - findRowsHeight) / (col.rowspan - findRows);
                        for (let i = startRow; i < endRow; i++) {
                            if (rowHeights[i] == null || rowHeights[i] < 0) {
                                rowHeights[i] = h;
                            }
                        }
                    } else if ((findRowsHeight < col.height && (!refCell || refCell == col)) || (findRowsHeight > col.height && refCell && col == refCell)) {
                        for (let i = startRow; i < endRow; i++) {
                            if (findRowsHeight > 0) {
                                rowHeights[i] = rowHeights[i] / findRowsHeight * col.height;
                            } else {
                                rowHeights[i] = col.height / col.rowspan;
                            }
                        }
                    }
                }
            }
        }
        return {
            '@:{col.widths}': colWidths,
            '@:{row.heights}': rowHeights
        };
    },
    /**
     * 更新表格单元格尺寸
     * @param table 表格对象
     * @param refCell 参考表格
     */
    '@:{table.provider#update.cell.size}'(table, refCell) {
        let sizes = this['@:{table.provider#get.sizes}'](table, refCell);
        let { rows } = table;
        for (let row of rows) {
            for (let col of row.cols) {
                let rowspan = col.rowspan || 1;
                let colspan = col.colspan || 1;
                let colStartIndex = col['@:{start.col.index}'],
                    rowStartIndex = col['@:{start.row.index}'];
                let w = 0,
                    h = 0;
                for (let i = colStartIndex + colspan - 1; i >= colStartIndex; i--) {
                    w += sizes['@:{col.widths}'][i];
                }
                for (let i = rowStartIndex + rowspan - 1; i >= rowStartIndex; i--) {
                    h += sizes['@:{row.heights}'][i];
                }
                col.width = w;
                col.height = h;
            }
        }
    }
};