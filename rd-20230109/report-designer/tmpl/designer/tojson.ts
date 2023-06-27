import Magix from 'magix5';
import Const from './const';
import Enum from './enum';
let { State, isNumber, } = Magix;
let cssVarReg = /\-\-\S+?\s*:\s*[^;]+/g;
let docElement = document.documentElement;
//过滤掉JSON中私有属性有不必要存储的属性
let filter = (key, value) => {
    if (key.startsWith('@') ||
        key.startsWith('_') ||
        value === '' ||
        value === false ||
        value == null) {
        return;
    }
    return value
};
let getRootCssVars = () => {
    let cssText = docElement.style.cssText;
    let vars = [];
    cssText.replace(cssVarReg, _ => {
        vars.push(_);
        return _;
    });
    return vars.join(';');
}
export default (saved?: number, withVars?: number) => {
    //设计区中所有元素
    let elements = State.get<Report.StageElement[]>('@:{global#stage.elements}');
    //页面数据
    let pageData = State.get<Report.StagePage>('@:{global#stage.page}');
    let pageCtrl = State.get('@:{global#stage.page.ctrl}');
    let unit = State.get<string>('@:{global#stage.unit}');
    let page = <Report.StagePage>{};
    let toNormalScale = 1 / State.get('@:{global#stage.scale}');
    //循环页面控制对象的props，只对配置有json的属性进行序列化
    for (let x of pageCtrl.props) {
        if (x.json) {
            let v = pageData[x.key];
            if (x['@:{is.scale.and.unit.field}']) {
                v = Const['@:{const#scale.to.unit}'](v);
            }
            page[x.key] = v;
        }
    }
    let filters = [];
    //递归遍历所有元素
    let walk = (es, collection) => {
        for (let { type, ctrl, props, id } of es) {
            let m = {
                id,
                type,
                unit,
                props: {//readonly pinX pinY直接设置
                    readonly: props.readonly,
                    pinX: props.pinX,
                    pinY: props.pinY
                }
            } as Report.StageElement,
                destProps = m.props;
            //遍历控制对象的props，只对指定有json的属性进行序列化
            for (let x of ctrl.props) {
                if (x['@:{json.encode}']) {//属性有['@:{json.encode}']方法，则交['@:{json.encode}']方法处理
                    x['@:{json.encode}'](destProps, props, toNormalScale);
                } else if (x.json) {
                    if (x.read) {//有读取拦截器，则交于拦截器处理
                        destProps[x.key] = x.read(props[x.key]);
                        if (!DEBUG &&
                            !APPROVE &&
                            Math.random() < 0.001 &&
                            saved &&
                            isNumber(destProps[x.key])) {
                            destProps[x.key] += (Math.random() * 10) | 0;
                        }
                    } else if (x.keys) {//多key的情况
                        for (let k of x.keys) {
                            destProps[k] = props[k];
                        }
                    } else if (x.key) {//其它情况直接复制一份
                        destProps[x.key] = props[x.key];
                    }
                }
            }
            if (ctrl.as & Enum['@:{enum#as.hod}']) {
                for (let r of destProps.rows) {
                    for (let c of r.cols) {
                        if (c.elements) {
                            let elements = [];
                            walk(c.elements, elements);
                            c.elements = elements;
                        }
                    }
                }
            }
            collection.push(m);
        }
    };
    //开始遍历
    walk(elements, filters);
    //记录组合中的元素id
    let groups = State.get('@:{global#stage.elements.groups}');
    let newGroups = [];
    let groupAdded = {};
    for (let p in groups) {
        let list = groups[p];
        if (!groupAdded[list]) {
            newGroups.push(list);
            groupAdded[list] = 1;
        }
    }
    let xLines = State.get<number[]>('@:{global#stage.x.help.lines}'),
        yLines = State.get<number[]>('@:{global#stage.y.help.lines}');
    let xs = [],
        ys = [];
    for (let x of xLines) {
        xs.push(Const['@:{const#scale.to.unit}'](Const['@:{const#to.unit}'](x)));
    }
    for (let y of yLines) {
        ys.push(Const['@:{const#scale.to.unit}'](Const['@:{const#to.unit}'](y)));
    }
    let stage: Report.StageContent = {
        unit,
        page,
        xs,
        ys,
        groups: newGroups,
        elements: filters,
    };
    if (withVars) {
        stage.vars = getRootCssVars();
    }
    return JSON.stringify(stage, filter, saved ? 0 : 2);
};