/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import XSheetProvider from '../../provider/xsheet';
let { View, mark, node } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    init() {
        this.on('destroy', () => {
            let sheet = this['@:{sheet.instance}'];
            if (sheet && window.luckysheet) {
                luckysheet.destroy({
                    container: '_rd_sheet_' + this.id
                });
            }
        })
    },
    assign(data) {
        this.set(data);
    },
    async render() {
        let m = mark(this, '@:{render}');
        if (this['@:{exception}']) {
            this.digest({
                error: this['@:{exception}']
            });
        } else {
            await this.digest();
            let sheet = this['@:{sheet.instance}'];
            if (!sheet) {
                try {
                    await XSheetProvider();
                    if (m()) {
                        let props = this.get('props');
                        luckysheet.create({
                            showtoolbar: false,
                            showsheetbar: false,
                            showinfobar: false,
                            enableAddBackTop: false,
                            enableAddRow: false,
                            sheetFormulaBar: false,
                            showstatisticBar: false,
                            data: props.sheetData,
                            cellRightClickConfig: {
                                copy: true, // 复制
                                copyAs: true, // 复制为
                                paste: true, // 粘贴
                                insertRow: true, // 插入行
                                insertColumn: true, // 插入列
                                deleteRow: true, // 删除选中行
                                deleteColumn: true, // 删除选中列
                                deleteCell: true, // 删除单元格
                                hideRow: false, // 隐藏选中行和显示选中行
                                hideColumn: false, // 隐藏选中列和显示选中列
                                rowHeight: false, // 行高
                                columnWidth: false, // 列宽
                                clear: false, // 清除内容
                                matrix: false, // 矩阵操作选区
                                sort: false, // 排序选区
                                filter: false, // 筛选选区
                                chart: false, // 图表生成
                                image: false, // 插入图片
                                link: false, // 插入链接
                                data: false, // 数据验证
                                cellFormat: false // 设置单元格格式
                            },
                            container: '_rd_sheet_' + this.id
                        });
                        this['@:{sheet.instance}'] = 1;
                        let tipNode = node<HTMLElement>(`_rd_tip_${this.id}`);
                        tipNode.remove();
                    }
                } catch (ex) {
                    this.digest({
                        error: this['@:{exception}'] = ex
                    });
                }
            }
        }
    }
});