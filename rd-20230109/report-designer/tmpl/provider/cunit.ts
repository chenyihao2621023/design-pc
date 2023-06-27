/**
 * change unit plugin
 */
import Magix from 'magix5';
import Const from '../designer/const';
import Enum from '../designer/enum';
let { State } = Magix;
/**
 * 转换单位
 * @param dest 目标属性
 * @param ctrl 控制对象
 * @param toUnit 转换后的单位
 * @param fixed 是否修正小数位
 */
let convertUnitOfProps = (dest,
    ctrl: Report.StageElementCtrl,
    toUnit, fixed?: number) => {
    let v,
        changed;
    for (let df of ctrl.props) {
        if (df['@:{unit.convert}']) {//属性有unit.convert方法，表明这个属性单位转换比较复杂，交与提供的方法进行转换
            changed = 1;
            df['@:{unit.convert}'](dest, toUnit);
        } else if (df['@:{is.scale.and.unit.field}']) {//表明这个属性需要单位转换，那就使用我们默认的单位转换进行计算
            changed = 1;
            v = Const['@:{const#unit.to.unit}'](dest[df.key], toUnit);
            if (fixed) {
                v = Const['@:{const#scale.to.unit}'](v, null, toUnit);
            }
            dest[df.key] = v;
        }
    }
    return changed;
};
/**
 * 转换到目标单位
 * @param elements 待转换的元素
 * @param toUnit 目标单位
 * @param refNormalPorps 普通元素属性
 * @param refFlowConnectorProps 流程图连接线元素
 */
let convertToUnit = (elements: Report.StageElement[],
    toUnit: string,
    refNormalPorps: object[],
    refFlowConnectorProps: object[]) => {
    for (let m of elements) {
        let { props, ctrl } = m;
        //转换属性列表中需要单位转换的属性，并不是所有的都需要转换，因此这里只对有转换的进行后续的属性更新
        if (convertUnitOfProps(props, ctrl, toUnit)) {
            if (ctrl['@:{update.props}']) {
                if ((ctrl['@:{modifier}'] & Enum['@:{enum#modifier.linkage}'])) {
                    refFlowConnectorProps.push([ctrl['@:{update.props}'], props]);
                } else {
                    refNormalPorps.push([ctrl['@:{update.props}'], props]);
                }
            }
        }
        //容器元素需要进行深层遍历
        if (ctrl.as & Enum['@:{enum#as.hod}']) {
            for (let row of props.rows) {
                for (let col of row.cols) {
                    if (col.elements) {
                        convertToUnit(col.elements, toUnit, refNormalPorps, refFlowConnectorProps);
                    }
                }
            }
        }
    }
};

/**
 * 转换单位
 * @param e 单位转换事件
 */
let changeUnit = (e: Report.EventOfStageUnitChange) => {
    let elements = State.get<Report.StageElement[]>('@:{global#stage.elements}');
    let toUnit = e['@:{to.unit}'];
    let page = State.get<Report.StagePage>('@:{global#stage.page}');
    let pageCtrl = State.get<Report.StagePageCtrl>('@:{global#stage.page.ctrl}');
    convertUnitOfProps(page, pageCtrl, toUnit, 1);
    let refNormalPorps = [],
        refFlowConnectorProps = [];
    //普通属性和流程图连线元素有更新顺序，普通在前，连接线在后
    convertToUnit(elements, toUnit, refNormalPorps, refFlowConnectorProps);
    State.set({
        '@:{global#stage.unit}': toUnit
    });
    //其它属性更新需要先设置单位，否则缺省单位不正确
    let allProps = refNormalPorps.concat(refFlowConnectorProps);
    for (let [update, p] of allProps) {
        update(p);
    }
    pageCtrl['@:{update.computed.props}'](page);
    State.fire('@:{event#stage.page.and.elements.change}');
};

export default {
    '@:{cunit#setup}'() {
        State.on('@:{event#stage.unit.change}', changeUnit);
    },
    '@:{cunit#teardown}'() {
        State.off('@:{event#stage.unit.change}', changeUnit);
    }
}