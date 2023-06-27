/**
 * 通用元素计算方式
 */
import Magix from 'magix5';
import DataCenterProvider from '../../provider/datacenter';
let { isArray } = Magix;
/**
 * 填充普通元素数据
 * @param element 元素描述json对象
*/
export default (element, newPage, resLoader, inHod) => {
    let { props } = element;
    let { bind } = props;
    if (bind.id &&
        !bind._tip &&
        !bind._data) {
        let { '@:{error}': err,
            '@:{data}': data
        } = DataCenterProvider['@:{fetch.data}'](bind);
        if (err) {
            bind._tip = err;
        } else {
            bind._data = data;
        }
    }
    if (/*element.type == 'image' ||*/
        element.type == 'repeat') {
        let image = props.image;
        if (bind._data) {
            let src = bind._data;
            if (isArray(src)) {
                src = src[0];
            }
            let bindField = bind.fields[0];
            image = src[bindField.key];
        }
        resLoader['@:{add}']('@:{image}', image);
    }
    if (!inHod) {
        newPage.push(element);
    }
};