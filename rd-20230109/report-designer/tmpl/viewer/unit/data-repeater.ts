/**
 * 重复容器计算方式
 */
import Magix from 'magix5';
import DataCenterProvider from '../../provider/datacenter';
import GenericProvider from '../../provider/generic';
let { guid, isArray } = Magix;
/**
 * 填充重复容器元素数据
 * @param element 元素描述json对象
 * @param fromIndex 从第几页开始
 * @param page 页面对象
 * @param footerHeight 页脚高度
 * @param elementType 当前元素类型
 * @param currentPage 当前页面数组对象
 */
export default async (element, fromIndex, page, pageFooterHeight, currentPage, inHod,) => {
    let { props, type, id } = element;
    let { x, y, width, height, hspace, vspace } = props;
    let nextIndex;
    let validHeight = page.height - pageFooterHeight;
    let nextX = x,
        nextY = y;
    let currentMaxHeight = height;
    //let currentLineStart = 0;
    for (; ;) {
        //属性需要克隆
        let clonedProps = GenericProvider['@:{generic#clone}'](props);
        //更新坐标
        clonedProps.x = nextX;
        clonedProps.y = nextY;
        let bind = clonedProps.bind;
        if (bind.id) {
            let { '@:{error}': err,
                '@:{data}': data
            } = DataCenterProvider['@:{fetch.data}'](bind);
            if (err) {
                bind._tip = err;
            } else {
                if (!isArray(data)) {
                    data = [data];
                }
                //设置数据并更新下一个的索引
                let currentData = data[fromIndex];
                bind._data = currentData;
            }
            fromIndex++;
            if (!data?.length || fromIndex >= data.length) {//遍历完所有数据
                nextIndex = -1;
            }
        } else {
            nextIndex = -1;
        }
        for (let row of clonedProps.rows) {//循环容器行
            for (let col of row.cols) {//循环列
                if (col.elements?.length) {
                    for (let se of col.elements) {//循环列里面的元素
                        let seProps = se.props;
                        let seBind = seProps.bind;
                        if (seBind?.id == bind.id) {//子元素有数据绑定且与当前容器绑定一致
                            seBind._data = bind._data;
                        }
                    }
                }
            }
        }
        let clonedElement = {
            type,
            id: guid(id),
            props: clonedProps
        };
        if (!inHod) {
            currentPage.push(clonedElement);
        }
        if (nextIndex == -1) {//已经最后一页，直接退出
            break;
        } else {
            nextX += width + hspace;//更新水平位置的下一个坐标
            if (nextX + width > page.width) {//如果坐标+宽度超出打印页面宽度，则换行
                nextX = x;//下一行起始位置是设计器中指定的位置
                nextY += currentMaxHeight + vspace;//更新垂直坐标
                //currentLineStart = currentPage.length;
                if (nextY + height > validHeight) {//垂直坐标超出页面高度
                    nextIndex = fromIndex;//记录下一页从数据的哪一条开始
                    break;
                }
                currentMaxHeight = height;
            }
        }
    }
    return nextIndex;
};