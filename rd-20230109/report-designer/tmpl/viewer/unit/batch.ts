/**
 * 批量元素计算方式
 */
import Magix from 'magix5';
import Const from '../../designer/const';
import Transform from '../../designer/transform';
import DataCenterProvider from '../../provider/datacenter';
import GenericProvider from '../../provider/generic';
import PrinterGeneric from '../generic/index';
let { guid, isArray } = Magix;
let { max, abs } = Math;
/**
 * 填充批量元素数据
 * @param element 元素描述json对象
 * @param fromIndex 从第几页开始
 * @param page 页面对象
 * @param footerHeight 页脚高度
 * @param elementType 当前元素类型
 * @param currentPage 当前页面数组对象
 */
export default async (element, fromIndex, page, pageFooterHeight, currentPage, inHod, unit) => {
    let { props, type, id } = element;
    let { x, y, width, hspace, vspace, rotate, bind } = props;
    if (!bind ||
        !bind.id) {
        return -1;
    }
    type = type.substring(6);//batch-text to text;
    let nextIndex;
    //计算页面可用区域高度
    let validHeight = page.height - pageFooterHeight;
    //旋转后的元素使用外接矩形进行计算
    let rotatedRect = Transform['@:{transform#rotate.rect}'](props);
    let realHeight = rotatedRect['@:{height}'];
    let realWidth = rotatedRect['@:{width}'];
    let realX = rotatedRect['@:{left}'];
    let realY = rotatedRect['@:{top}'];
    let fixedPoint = rotatedRect['@:{point}'][0],//默认左上角进行固定计算
        diffX = realX - x,
        diffY = realY - y,
        nextY = y,
        nextX = x,
        maxHeightOfLine = 0,//以下特为高度不固定的文本使用 当前行最大高度
        prevRightX,//上一个元素最右侧的坐标
        prevBottomY,//上一个元素最底部坐标
        nextLineStart = currentPage.length,//换行后从哪个下标开始的
        fillOneLine,
        maxDataLines = 0;//是否填充了一行，如果页面太小不中以放下元素，则至少放一行
    let { '@:{error}': err,
        '@:{data}': data
    } = DataCenterProvider['@:{fetch.data}'](bind);
    if (!isArray(data)) {
        data = [data];
    }
    maxDataLines = data.length;
    for (; ;) {
        //属性需要克隆
        let clonedProps = GenericProvider['@:{generic#clone}'](props);
        let bind = clonedProps.bind;
        if (err) {
            bind._tip = err;
        } else {
            //设置数据并更新下一个的索引
            let currentData = data[fromIndex++];
            bind._data = currentData;
            if (fromIndex > maxDataLines) {//遍历完所有数据
                nextIndex = -1;
            }
        }
        if (nextIndex == -1) {//已经最后一页，直接退出
            break;
        } else {
            //更新坐标
            clonedProps.x = nextX;
            clonedProps.y = nextY;
            let clonedElement = {
                type,
                id: guid(id),
                props: clonedProps
            };
            if (!inHod) {
                currentPage.push(clonedElement);
            }
            if (type == 'text' &&
                clonedProps.autoHeight) {//文本自动换行需要从真实dom计算出高度
                /**
                 * 文本我们采用先放进来再进行检测是否需要换行和换页操作
                 */
                let root = await PrinterGeneric['@:{mount.display.of.element}'](type, {
                    props: clonedProps,
                    unit
                });
                //先拿动态高度
                let textHeight = Const['@:{const#to.unit}']((root.firstElementChild as HTMLDivElement).offsetHeight);
                //计算旋转后的矩形
                let rect = Transform['@:{transform#rotate.rect}']({
                    x,
                    y,
                    width,
                    rotate,
                    height: textHeight
                });
                //固定点
                let newFixed = rect['@:{point}'][0];
                //计算旋转后的矩形放到合适位置上的水平及垂直位置
                let offsetX = fixedPoint.x - newFixed.x + nextX - x + (prevRightX ? prevRightX - rect['@:{left}'] + hspace : 0),
                    offsetY = fixedPoint.y - newFixed.y + nextY - y + (prevBottomY ? prevBottomY - rect['@:{top}'] + vspace : 0);

                clonedProps.x += offsetX;
                clonedProps.y += offsetY;

                //更新右侧坐标
                realX = rect['@:{right}'] + offsetX;

                if (realX > page.width) {//如果右侧超出了页面，需要换行显示
                    fillOneLine = 1;//填充了一行
                    nextLineStart = currentPage.length;//更新索引
                    //计算垂直及水平移动元素的距离
                    let movedY = realY - (rect['@:{top}'] + offsetY) + vspace;
                    let movedX = clonedProps.x - x;
                    //更新元素坐标
                    clonedProps.y += movedY;
                    clonedProps.x = x;
                    //更新x指示
                    realX -= movedX;
                    //缓存当前右侧及底部坐标信息
                    prevBottomY = realY;
                    prevRightX = realX;
                    //更新最大高度及y真实坐标
                    maxHeightOfLine = rect['@:{height}'];
                    realY = rect['@:{bottom}'] + offsetY + movedY;
                } else {
                    //在计算中，有可能出现突然变高的元素
                    realY = max(realY, rect['@:{bottom}'] + offsetY);
                    maxHeightOfLine = max(maxHeightOfLine, rect['@:{height}']);
                    prevRightX = realX;
                }

                if (fillOneLine &&
                    realY > validHeight) {//处理最后一行如果中间遇到超出高度的文本
                    let count = currentPage.length - nextLineStart + 1;
                    nextIndex = fromIndex - count;//需要把超出高度的一整行移动到下页展示
                    currentPage.splice(nextLineStart - 1, count);
                    break;
                }
            } else {//固定外接矩形的，我们采用预算方式，即如果下一个元素不能放进来，则中止
                //nextX += realWidth + hspace;//更新水平位置的下一个坐标
                realX += realWidth + hspace;
                nextX = realX - diffX;
                if (realX + realWidth > page.width) {//如果坐标+宽度超出打印页面宽度，则换行
                    //nextX = x;//下一行起始位置是设计器中指定的位置
                    realX = rotatedRect['@:{left}'];
                    nextX = realX - diffX;
                    //nextY += realHeight + vspace;//更新垂直坐标
                    realY += realHeight + vspace;
                    nextY = realY - diffY;

                    if (realY + realHeight > validHeight) {//垂直坐标超出页面高度
                        nextIndex = fromIndex;//记录下一页从数据的哪一条开始
                        break;
                    }
                }
            }
        }
    }
    //console.log('next', nextIndex);
    return nextIndex == maxDataLines ? -1 : nextIndex;
};