/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import DHistory from '../../designer/history';
import StageGeneric from '../../designer/generic';
import StageSelection from '../../designer/selection';
import XSheetProvider from '../../provider/xsheet';
let { mark, node, dispatch, State } = Magix;
import IndexView from './index';
export default IndexView.extend({
    tmpl: '@:dshow.html',
    async render() {
        let m = mark(this, '@:{render}');
        if (!this['@:{exception}']) {
            await this.digest({
                scale: State.get('@:{global#stage.scale}') || 1
            });
            let sheet = this['@:{sheet.instance}'];
            try {
                if (!sheet) {
                    await XSheetProvider();
                    if (m()) {
                        let props = this.get('props');
                        luckysheet.create({
                            showtoolbar: false,
                            showsheetbar: false,
                            showinfobar: false,
                            enableAddBackTop: false,
                            enableAddRow: false,
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
                            hook: {
                                updated() {
                                    props.sheetData = luckysheet.getAllSheets();
                                }
                            },
                            container: '_rd_sheet_' + this.id
                        });

                        let tipNode = node<HTMLElement>(`_rd_tip_${this.id}`);
                        tipNode.remove();
                        this['@:{sheet.instance}'] = 1;
                    }
                } else {
                    dispatch(window, 'resize');
                }
            } catch (ex) {
                this.digest({
                    error: this['@:{exception}'] = ex
                });
            }
        } else {
            this.digest({
                error: this['@:{exception}']
            });
        }
    },
    '@:{stop}<pointerdown,contextmenu>'(e: PointerEvent) {
        if (!e['@:{halt}']) {
            // let { target } = e;
            // if (target.id != `${this.id}_pv`) {
            e['@:{halt}'] = 1;
            let element = this.get('element');
            if (StageSelection["@:{selection#set}"](element)) {
                let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
                DHistory["@:{history#save}"](DHistory['@:{history#element.get.focus}'], ename);
            }
            //}
        }
    },
    '@:{stop}<wheel>'(e: PointerEvent) {
        if (!e['@:{halt}']) {
            e['@:{halt}'] = 1;
        }
    }
});