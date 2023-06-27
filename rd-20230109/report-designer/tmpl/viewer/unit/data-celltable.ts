/**
 * 单元格计算方式
 */
import DataCenterProvider from '../../provider/datacenter';
/**
 * 填充单元格元素数据
 * @param table 单元格元素json描述对象
 * @param fromIndex 从第几页开始
 */
export default (table, fromIndex, newPage, inHod) => {
    if (!inHod) {
        newPage.push(table);
    }
    let { props } = table;
    let { bind } = props;
    if (bind.id) {
        let { '@:{error}': err,
            '@:{data}': list
        } = DataCenterProvider['@:{fetch.data}'](bind);
        if (err) {
            bind._tip = err;
        } else {
            bind._data = list[fromIndex];
            return fromIndex == list.length - 1 ? -1 : fromIndex + 1;
        }
    }
    return -1;
};