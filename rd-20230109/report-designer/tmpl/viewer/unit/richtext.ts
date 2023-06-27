/**
 * 富文本计算方式
 */
import Magix from 'magix5';
import Const from '../../designer/const';
import DataCenterProvider from '../../provider/datacenter';
import HTML2CanvasProvider from '../../provider/html2canvas';
import PrinterGeneric from '../generic/index';
let { task, lowTaskFinale, isArray, has } = Magix;
/**
 * 以下标签不做为切分HTML的节点
 */
let ignoreTagNames = {
    TD: 1,
    BR: 1,
    TH: 1,
    P: 1,
    DIV: 1
};
let ascSort = (a, b) => a - b;
let ascRect = (a, b) => a.y - b.y;
/**
 * 两行文字中间的空白切割，如果2行文字中间的留白超多，则也要进行切割
 * 否则会出现无法正确分页，这里定义超过多少空白后进行切割
 */
let padMinHeight = 30;
let padRects = rects => {
    let newRects = [];
    let pre = rects[0];
    for (let i = 1; i < rects.length; i++) {
        newRects.push(pre);
        let now = rects[i];
        let bt = pre.y + pre.height;
        let space = now.y - bt;
        let gap = (space / padMinHeight) | 0;
        if (gap) {
            //计算需要填充多少个切割矩形
            let single = space / gap;
            for (let i = 0; i < gap; i++) {
                newRects.push({
                    y: bt + single * (i + 1) - 2,
                    height: 4
                });
            }
        }
        pre = now;
    }
    newRects.push(pre);
    return newRects;
};
/**
 * 收集切割矩形
 * @param rects 收集到的矩形列表
 * @param range 当前矩形
 */
let collectRect = (rects: object[], range: Range) => {
    let rect = range.getBoundingClientRect();
    if (rect.height) {
        let key = `${rect.y}~${rect.height}`;
        if (!rects[key]) {
            rects[key] = 1;
            rects.push({
                //x: pageXOffset + rect.x,
                y: scrollY + rect.y,
                //width: rect.width,
                height: rect.height
            });
        }
    }
};
/**
 * 从节点获取矩形
 * @param nodes 节点列表
 * @param param1 根节点位置信息
 * @returns 可切割使用的矩形列表
 */
let getRectsFromNode = async (nodes: Element[], { y, height }) => {
    let range = document.createRange();
    let rects = [];
    let collectRects = node => {
        scrollTo(0, 0);
        if (node.nodeType == 3) {
            let len = 0;
            while (len < node.length) {
                range.setStart(node, len);
                range.setEnd(node, len + 1);
                collectRect(rects, range);
                len++;
            }
        } else {
            range.setStartBefore(node);
            range.setEndAfter(node);
            collectRect(rects, range);
        }
    };
    let walk = nodes => {
        for (let e of nodes) {
            if (e.nodeType == 3) {
                task(collectRects, [e]);
            } else if (e.nodeType == 1) {
                if (e.childNodes.length) {
                    //如果包裹了纯文本，则不再拆分
                    // if (e.childNodes.length == 1 &&
                    //     e.childNodes[0].nodeType == 3) {
                    //     task(collectRects, [e]);
                    // } else {
                    task(walk, e.childNodes);
                    //}
                } else if (!has(ignoreTagNames, e.tagName.toUpperCase())) {
                    task(collectRects, [e]);
                }
            }
        }
    };
    walk(nodes);
    await lowTaskFinale();
    rects.sort(ascRect);
    if (!rects.length) {
        rects.push({
            y,
            height: 2
        });
    }
    let b = y + height;
    let last = rects[rects.length - 1];
    let lb = last.y + last.height;
    if (b - lb >= padMinHeight) {
        rects.push({
            y: b - 2,
            height: 2
        });
    }
    return padRects(rects);
};
/**
 * 获取切割线
 * @param rootBound 根节点信息
 * @param rects 矩形信息
 * @returns 切割线
 */
let getSplitLines = async (rootBound: DOMRect, rects: DOMRect[]) => {
    let lines = [];
    let test = rect => {
        let line = rect.y + rect.height;
        let canInsert = 1,
            minTop;
        for (let r of rects) {
            let bottomLine = r.y + r.height;
            if (bottomLine > line &&
                r.y < line) {
                canInsert = 0;
                break;
            } if (r.y > line &&
                (minTop == null || r.y < minTop)) {
                minTop = r.y;
            }
        }
        if (canInsert) {
            let realInsert = line - rootBound.y;
            if (minTop != null) {
                minTop -= rootBound.y;
                realInsert += (minTop - realInsert) / 2;
            }
            if (lines.indexOf(realInsert) == -1) {
                lines.push(realInsert);
            }
        }
    };
    for (let rect of rects) {
        task(test, [rect]);
    }
    await lowTaskFinale();
    return lines.sort(ascSort);
};
/**
 * 填充切割后的图片
 * @param lines 切割线
 * @param image 源图片
 * @param scale 缩放
 */
let splitImageToPieces = async (lines, image, scale) => {
    let images = [];
    let temp = document.createElement('canvas');
    let ctx = temp.getContext('2d');
    let pre = 0;
    let width = image.width;
    temp.width = width;
    lines[lines.length - 1] = image.height / scale;//最后一个强制是image的末尾
    let add = last => {
        let h = (last - pre) * scale;
        if (h > 0) {
            temp.height = h;
            ctx.drawImage(image, 0, pre * scale, width, h, 0, 0, width, h);
            images.push({
                '@:{data}': temp.toDataURL('image/png', 1.0),
                '@:{width}': width / scale,
                '@:{height}': h / scale
            });
        }
        ctx.clearRect(0, 0, width, h);
        pre = last;
    }
    for (let l of lines) {
        task(add, [l]);
    }
    await lowTaskFinale();
    return images;
};
/**
 * 获取切割后的图片
 * @param props 属性
 * @param unit 单位
 * @returns 
 */
let getImages = async (props: Report.StageElementProps,
    unit: string,
    type: string) => {
    let scale = devicePixelRatio;
    let oldX = props.x,
        oldY = props.y;
    props.x = 0;
    props.y = 0;
    PrinterGeneric['@:{show.msg}']('富文本:正在检测图片...');
    //获取渲染好的节点
    let root = await PrinterGeneric['@:{mount.display.of.element}'](type, {
        props,
        unit
    });
    props.x = oldX;
    props.y = oldY;
    let textNode = root.firstElementChild;
    //检查图片，确保dom就绪
    await PrinterGeneric['@:{double.check.images}'](textNode, false);
    PrinterGeneric['@:{show.msg}']('富文本:正在准备环境和数据...');
    await HTML2CanvasProvider();
    scrollTo(0, 0);
    //转图片
    let canvas = await html2canvas(textNode, {
        useCORS: true,
        scale
    });
    //   canvas.style.cssText='position:absolute;left:0;top:3cm';
    //   document.body.appendChild(canvas);
    PrinterGeneric['@:{show.msg}']('富文本:正在检测分割点...');
    let rootBound = textNode.getBoundingClientRect();
    //获取节点矩形
    let rects = await getRectsFromNode([textNode], rootBound);
    // let oft=Const['@:{const#to.px}'](500,'cm');
    // console.log(oft);
    // for (let r of rects) {
    //     let div = document.createElement('div');
    //     div.style.cssText = `position:absolute;left:0;top:${r.y+oft}px;width:100%;height:${r.height}px;border:solid 1px green`;
    //     document.body.appendChild(div);
    // }
    //获取切割线
    let lines = await getSplitLines(rootBound, rects);
    // for (let l of lines) {
    //     let div = document.createElement('div');
    //     div.style.cssText = `position:absolute;left:0;top:${l + rootBound.y}px;width:100%;1px;border-top:solid 1px green`;
    //     document.body.appendChild(div);
    // }
    PrinterGeneric['@:{show.msg}']('富文本:正在分割...');
    //切割图片
    return await splitImageToPieces(lines, canvas, scale);
};
export default async (richText,
    fromIndex,
    page,
    pageFooterHeight,
    resLoader,
    unit,
    newPage) => {
    let { props, type, id } = richText;
    let validHeight = Const['@:{const#to.px}'](page.height - pageFooterHeight - props.y);
    let useType = 'richtext';
    if (type == 'data-richtext') {
        richText.type = useType;
        let bind = props.bind;
        if (bind.id) {
            props.splitToPages = true;
            let { '@:{error}': err,
                '@:{data}': list
            } = DataCenterProvider['@:{fetch.data}'](bind);
            let bindField = bind.fields[0];
            if (err) {
                props.text = err
            } else {
                let first = isArray(list) ? list[0] : list;
                props.text = first[bindField.key];
            }
        } else {
            props.height = Const['@:{const#to.unit}'](30);
        }
    } else if (type == 'html') {
        let bind = props.bind;
        props.splitToPages = true;
        richText.type = useType;
        if (bind.id) {
            let { '@:{error}': err,
                '@:{data}': list
            } = DataCenterProvider['@:{fetch.data}'](bind);
            if (!err) {
                bind._data = list;
            }
        }
        useType = 'html';
    }
    if (props.splitToPages) {
        try {
            let imgs = resLoader[`@:{source.of.images}_${id}`];
            if (!imgs) {
                imgs = await getImages(props, unit, useType);
                resLoader[`@:{source.of.images}_${id}`] = imgs;
            }
            let start = fromIndex;
            let end = imgs.length;
            let usedImages = [];
            while (start < end) {
                let i = imgs[start];
                if (validHeight < i['@:{height}']) {
                    if (!usedImages.length) {
                        start++;
                        usedImages.push(i);
                    }
                    break;
                } else {
                    validHeight -= i['@:{height}'];
                    usedImages.push(i);
                }
                start++;
            }
            let recastHTML = `<div style="display:flex;flex-direction:column;">`;
            for (let i of usedImages) {
                recastHTML += `<img src="${i['@:{data}']}" style="width:${i['@:{width}']}px;height:${i['@:{height}']}px"/>`;
            }
            recastHTML += `</div>`;
            props.text = recastHTML;
            newPage.push(richText);
            return start < end ? start : -1;
        } catch (ex) {
            props.text = ex.message || ex.name;
        } finally {
            PrinterGeneric['@:{hide.msg}']();
        }
    }
    newPage.push(richText);
    return -1;
};