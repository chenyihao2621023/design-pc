import Magix from 'magix5';
import Enum from '../designer/enum';
import I18n from '../i18n/index';
import Barcode from './barcode/designer';
import BatchBarcode from './batch-barcode/designer';
import BatchQRCode from './batch-qrcode/designer';
import BatchText from './batch-text/designer';
import BWIP from './bwip/designer';
import Calendar from './calendar/designer';
import Circle from './circle/designer';
import Clock from './clock/designer';
import CircleProgress from './cprogress/designer';
import DataCellTable from './data-celltable/designer';
import DataColTable from './data-coltable/designer';
import DataDTable from './data-dtable/designer';
import DataFTable from './data-ftable/designer';
import DataRepeater from './data-repeater/designer';
import DataRichText from './data-richtext/designer';
import DateTimeText from './datetime/designer';
import FormCheckbox from './form-checkbox/designer';
import FormCollect from './form-collect/designer';
import FormDropdown from './form-dropdown/designer';
import FormInput from './form-input/designer';
import FormRadio from './form-radio/designer';
import Formula from './formula/designer';
import Fx from './fx/designer';
import Heat from './heat/designer';
import HodFooter from './hod-footer/designer';
import HodHeader from './hod-header/designer';
import HodHFlex from './hod-hflex/designer';
import HodTable from './hod-table/designer';
import HodTabs from './hod-tabs/designer';
import HodVFlex from './hod-vflex/designer';
import RDHTML from './html/designer';
import XImage from './image/designer';
import Line from './line/designer';
import XMap from './map/designer';
import XNumber from './number/designer';
import Page from './page/designer';
import Pager from './pager/designer';
import Progressbar from './pbar/designer';
import QRCode from './qrcode/designer';
import Rate from './rate/designer';
import Rect from './rect/designer';
import Repeat from './repeat/designer';
import RichText from './richtext/designer';
import Rod from './rod/designer';
import Tag from './tag/designer';
import XText from './text/designer';
import Todo from './todo/designer';
import XVideo from './video/designer';
import XSheet from './xsheet/designer';
let { applyStyle, State, has, isFunction, mix } = Magix;
let DefaultAllElementsGroups: Report.StageElementListConfig[] = [{
    ctrl: Line
}/*,{
    ctrl: Base//这是一个基础元素，用于复制它快速产生其它元素
} */, {
    ctrl: Rect
}, {
    ctrl: Circle
}, {
    ctrl: XText
}, {
    ctrl: XImage
}, {
    ctrl: QRCode
}, {
    ctrl: Barcode
}, {
    bar: 1
}, {
    icon: '&#xe622;',
    title: '容器',
    subs: [{
        ctrl: HodTable
    }, {
        ctrl: HodHFlex
    }, {
        ctrl: HodVFlex
    }, {
        ctrl: HodHeader
    }, {
        ctrl: HodFooter
    }, {
        ctrl: DataRepeater
    }, {
        ctrl: DataFTable
    }, {
        ctrl: HodTabs
    }]
}, {
    icon: '&#xe745;',
    title: '数据',
    large: 1,
    subs: [{
        ctrl: DataColTable
    }, {
        ctrl: DataCellTable
    }, {
        ctrl: DataDTable
    }, {
        ctrl: RichText
    }, {
        ctrl: DataRichText
    }, {
        ctrl: RDHTML
    }, {
        ctrl: Pager
    }, {
        ctrl: Repeat
    }, {
        ctrl: XVideo
    }, {
        ctrl: XMap
    }, {
        ctrl: Progressbar
    }, {
        ctrl: XSheet
    }, {
        ctrl: FormCollect
    }, {
        ctrl: FormInput
    }, {
        ctrl: FormRadio
    }, {
        ctrl: FormCheckbox
    }, {
        ctrl: FormDropdown
    }, {
        ctrl: Formula
    }, {
        ctrl: Fx
    }, {
        ctrl: BatchBarcode
    }, {
        ctrl: BatchQRCode
    }, {
        ctrl: BatchText
    }, {
        ctrl: Todo
    }, {
        ctrl: Calendar
    }, {
        ctrl: Rate
    }, {
        ctrl: Heat
    }, {
        ctrl: CircleProgress
    }, {
        ctrl: Tag
    }, {
        ctrl: Clock
    }, {
        ctrl: XNumber
    }, {
        ctrl: Rod
    }, {
        ctrl: DateTimeText
    }, {
        ctrl: BWIP
    }]
}/*, {
    icon: '&#xe625;',
    title: '管道',
    subs: [{
        ctrl: XImage,
        image: '//image.flaticon.com/icons/png/128/357/357578.png',
        props: {
            image: '//image.flaticon.com/icons/png/128/357/357578.png'
        }
    }, {
        ctrl: XImage,
        image: '//image.flaticon.com/icons/png/128/357/357608.png',
        title: '管道2',
        props() {
            return {
                height: Const['@:{const#to.unit}'](181),
                width: Const['@:{const#to.unit}'](200),
                ename: '管道2',
                image: '//image.flaticon.com/icons/png/128/357/357608.png'
            };
        }
    }]
}*/];
/**
 * 由所有元素type组成的对象
 */
let ElementsMap: Report.StageElementCtrlMapObject = {};
/**
 * 注册元素到map里
 * @param elementLayout 元素布局
 */
let registerElementsToMap = (elementLayout: Report.StageElementListConfig[]) => {
    for (let { ctrl, subs } of elementLayout) {
        if (ctrl) {
            ElementsMap[ctrl.type] = ctrl;
        } else if (subs) {
            for (let { ctrl: sCtrl } of subs) {
                ElementsMap[sCtrl.type] = sCtrl;
            }
        }
    }
};
registerElementsToMap(DefaultAllElementsGroups);
applyStyle('@:./index.less');
applyStyle('@:./svg.less');
State.set({
    '@:{global#stage.elements.map}': ElementsMap,
    '@:{global#stage.page.ctrl}': Page
});
export default {
    /**
     * 获取所有可用的元素分组
     */
    '@:{element.manager#element.list}'() {
        //自定义元素布局
        // let custom: Report.StageElementListConfig[] = [{
        //     use: 'text'
        // }, {
        //     use: 'data-dtable'
        // }, {
        //     bar: 1
        // }, {
        //     use: 'svg-bezier2'
        // }, {
        //     title: 'test',
        //     icon: '&#xe658;',
        //     subs: [{
        //         use: 'text'
        //     }]
        // }];
        // for (let p of custom) {
        //     if (p.subs) {
        //         for (let s of p.subs) {
        //             s.ctrl = ElementsMap[s.use];
        //         }
        //     } else if (p.use) {
        //         p.ctrl = ElementsMap[p.use];
        //     }
        // }
        // return custom;
        // if (config('@:{header.groups#is.flow}') == 1) {
        //     return FlowElementsGroups;
        // }
        return DefaultAllElementsGroups;
    },
    /**
     * 注册新的元素
     * @param elements 元素列表
     */
    '@:{element.manager#register.elements.to.map}'(...elements: Report.StageElementCtrl[]) {
        for (let e of elements) {
            ElementsMap[e.type] = e;
        }
    },
    /**
     * 注册新的布局
     * @param layout 布局
     */
    '@:{element.manager#register.layout}'(...layout: Report.StageElementListConfig[]) {
        registerElementsToMap(layout);
        DefaultAllElementsGroups.push(...layout);
    },
    /**
     * 根据json还原成设计区需要的数据对象
     * @param elements json对象
     * @param fillProps 是否填充属性
     */
    '@:{element.manager#by.json}'(elements: Report.StageElement[],
        page: Report.StagePage,
        fillProps?: boolean | number) {
        let map = {};
        let props = [];
        let flowConnectors = [];
        let scale = State.get<number>('@:{global#stage.scale}');
        //let idMap: Report.StringMapObject = {};
        // let getNewId = (id: string): string => {//根据旧id生成新id
        //     if (!idMap[id]) {
        //         idMap[id] = guid('rde_');
        //     }
        //     return idMap[id];
        // };
        let walk = es => {
            if (es) {
                for (let e of es) {
                    let ctrl = ElementsMap[e.type];
                    if (!ctrl) {
                        throw new Error('can not find:' + e.type);
                    }
                    e.ctrl = ctrl;
                    if (fillProps) {//填充属性，设计区需要的属性比序列化后的属性多
                        let oldProps = e.props;
                        let newProps = ctrl['@:{get.props}'](0, 0);//先获取所有属性
                        e.props = mix(newProps, oldProps);//再把json中的属性覆盖到新属性上
                        if (page.readonly) {//如果page只读，则所有元素只读
                            e.props.readonly = true;
                        }
                        //如果有流程图且是连接线，则处理连接的id
                        if ((ctrl['@:{modifier}'] & Enum['@:{enum#modifier.linkage}'])) {
                            //newProps.linkFromId = getNewId(newProps.linkFromId);
                            //newProps.linkToId = getNewId(newProps.linkToId);
                            flowConnectors.push([ctrl, e.props]);
                        } else if (ctrl['@:{update.props}']) {//计算属性
                            props.push([ctrl, e.props]);
                        }

                        //根据当前设计区进行缩放
                        for (let s of ctrl.props) {
                            if (isFunction(s['@:{stage.scale}'])) {
                                s['@:{stage.scale}'](e.props, scale);
                            } else if (s['@:{is.scale.and.unit.field}']) {
                                e.props[s.key] *= scale;
                            }
                        }
                        //增加元素面板的名称
                        if (!has(e.props, 'ename')) {
                            e.props.ename = I18n(ctrl.title);
                        }
                        //e.id = getNewId(e.id);
                    }
                    map[e.id] = e;
                    //处理容器
                    if (ctrl.as & Enum['@:{enum#as.hod}']) {
                        for (let row of e.props.rows) {
                            for (let col of row.cols) {
                                if (col.elements) {
                                    walk(col.elements);
                                }
                            }
                        }
                    }
                }
            }
        };
        walk(elements);
        props.push(...flowConnectors);
        return {
            '@:{emanager#elements}': elements,
            '@:{emanager#map}': map,
            '@:{emanager#props}': props,
            //'@:{emanager#id.map}': idMap
        };
    }
};