/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import TableProvider from '../../provider/table';
import Const from '../../designer/const';
let { View, dispatch } = Magix;
export default View.extend({
    tmpl: '@:./share.html',
    assign(data) {
        let { props, disabled, defined } = data;
        TableProvider['@:{table.provider#add.ext.meta}'](props, true);
        let sizes = TableProvider['@:{table.provider#get.sizes}'](props);
        let canSetWidth = false,
            canSetHeight = false;
        let widths = sizes['@:{col.widths}'],
            heights = sizes['@:{row.heights}'];
        let fw = widths[0],
            fh = heights[0];
        for (let w of widths) {
            if (w != fw) {
                canSetWidth = true;
                break;
            }
        }
        let { rows, hideHead, hideLabel, hideTotal, hideFoot } = props;
        let firstCompare,
            firstSetted,
            findLabelRow,
            findTotalRow,
            findFootRow, ri = 0;
        for (let row of rows) {
            if (row.label) {
                findLabelRow = 1;
            } else if (row.total) {
                findTotalRow = 1;
            } else if (findTotalRow) {
                findFootRow = 1;
            }
            if ((row.label && !hideLabel) ||
                row.data ||
                (row.total && !hideTotal) ||
                (!findLabelRow && !hideHead) ||
                (findFootRow && !hideFoot)) {
                if (firstSetted) {
                    if (firstCompare != heights[ri]) {
                        canSetHeight = true;
                        break;
                    }
                } else {
                    firstCompare = heights[ri];
                    firstSetted = 1;
                }
            }
            ri++;
        }
        this['@:{props}'] = props;
        this['@:{data.pad}'] = defined.dataPad || 0;
        this.set({
            disabled,
            canSetWidth,
            canSetHeight
        });
    },
    render() {
        this.digest();
    },
    '@:{share}<click>'(e: Magix5.MagixPointerEvent) {
        let { type } = e.params;
        let props = this['@:{props}'];
        let { rows, hideHead, hideLabel, hideTotal, hideFoot } = props;
        let sizes = TableProvider['@:{table.provider#get.sizes}'](props);
        let widths = sizes['@:{col.widths}'],
            heights = sizes['@:{row.heights}'];
        let dataPad = this['@:{data.pad}'];
        if (type == 'x') {
            let totalWidth = 0,
                avgWidth = 0;
            for (let w of widths) {
                totalWidth += w;
            }
            avgWidth = Const['@:{const#scale.to.unit}'](totalWidth / widths.length);
            for (let row of rows) {
                for (let col of row.cols) {
                    col.width = (col.colspan || 1) * avgWidth;
                }
            }
        } else {
            let totalHeight = 0,
                avgHeight = 0,
                totalRows = heights.length;
            for (let h of heights) {
                totalHeight += h;
            }
            totalRows += dataPad;
            let ri = 0,
                labelRowIndex = -1,
                dataRowIndex = -1,
                totalRowIndex = -1;
            for (let row of rows) {
                if (!row.label &&
                    labelRowIndex == -1) {
                    if (hideHead) {
                        totalHeight -= heights[ri];
                        totalRows--;
                    }
                } else if (row.label) {
                    if (labelRowIndex == -1) {
                        labelRowIndex = ri;
                    }
                    if (hideLabel) {
                        totalHeight -= heights[ri];
                        totalRows--;
                    }
                } else if (row.data) {
                    totalHeight += dataPad * heights[ri];
                    if (dataRowIndex == -1) {
                        dataRowIndex = ri;
                    }
                } else if (row.total) {
                    if (hideTotal) {
                        totalHeight -= heights[ri];
                        totalRows--;
                    }
                    if (totalRowIndex == -1) {
                        totalRowIndex = ri;
                    }
                } else if (totalRowIndex != -1 &&
                    hideFoot) {
                    totalHeight -= heights[ri];
                    totalRows--;
                }
                ri++;
            }
            avgHeight = Const['@:{const#scale.to.unit}'](totalHeight / totalRows);
            let findLabelRow,
                findTotalRow,
                findFootRow;
            for (let row of rows) {
                if (row.label) {
                    findLabelRow = 1;
                } else if (row.total) {
                    findTotalRow = 1;
                } else if (findTotalRow) {
                    findFootRow = 1;
                }
                if ((row.label && !hideLabel) ||
                    row.data ||
                    (row.total && !hideTotal) ||
                    (!findLabelRow && !hideHead) ||
                    (findFootRow && !hideFoot)) {
                    for (let col of row.cols) {
                        col.height = (col.rowspan || 1) * avgHeight;
                    }
                }
            }
        }
        dispatch(this.root, 'change', {
            use: 'rows',
            isSize: 1,
            pkey:'rows',
            rows
        });
    }
});