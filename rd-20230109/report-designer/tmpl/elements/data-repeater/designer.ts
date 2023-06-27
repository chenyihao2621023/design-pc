/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import CellProvider from '../../provider/cell';
import DataCenterProvider from '../../provider/datacenter';
import DesignerProvider from '../../provider/designer';
import Normal from '../designer';
let { config } = Magix;
let transformFields = ['width', 'height', 'borderLeftWidth', 'borderTopWidth', 'borderBottomWidth', 'borderRightWidth'];
let checkChildrenDataBind = (subs, currentBind, force) => {
    if (subs?.length) {
        let subBindCount = 0,
            subBind;
        if (!force) {
            for (let { props: { bind } } of subs) {
                if (bind?.id) {
                    subBindCount++;
                    subBind = bind;
                }
            }
        }
        if (subBindCount == 1 &&
            !currentBind.id) {
            currentBind.id = subBind.id;
        } else {
            for (let { props: { bind } } of subs) {
                if (bind &&
                    bind.id != currentBind.id) {
                    bind.id = '';
                    bind.tag = '';
                    if (bind.fields) {
                        bind.fields.length = 0;
                    }
                }
            }
        }
    }
};
let isCellFocused = ({ focusRow, focusCol }) => focusRow != -1 && focusCol != -1;
export default Normal.extend({
    ctor() {
        this.set({
            view: '@:./dshow'
        });
    }
}).static({
    type: 'data-repeater',
    as: Enum['@:{enum#as.hod}'] | Enum['@:{enum#as.data.hod}'],
    title: '@:{lang#elements.data.repeater}',
    icon: '&#xe636;',
    '@:{modifier}': Enum['@:{enum#modifier.icon}'] |
        Enum['@:{enum#modifier.nomask}'],
    '@:{allowed.to.hod}': {//只允许放设计区
        root: 1
    },
    '@:{allowed.elements}': {//只允许哪放些元素
        barcode: 1,
        image: 1,
        qrcode: 1,
        text: 1,
        repeat: 1,
        line: 1,
        rect: 1,
        circle: 1,
        rate: 1,
        heat: 1,
        bwip: 1,
        cprogress: 1
    },
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{bind.data.added}'({ bind: parentBind }: Report.StageElementProps,
        { props: { bind: addedBind } }: Report.StageElement) {
        if (parentBind &&
            !parentBind.id) {//如果父数据容器无数据源绑定则默认为当前元素的
            parentBind.id = addedBind.id;
        }
    },
    '@:{update.props}'(props: Report.StageElementProps,
        actions: Report.StageElementPropsUpdateActions) {
        let { rows, bind } = props;
        let height = 0,
            width = 0;
        for (let row of rows) {
            let w = 0;
            for (let col of row.cols) {
                w += col.width;
                checkChildrenDataBind(col.elements, bind, actions && actions['@:{pctrl#from.props.panel}']);
            }
            if (w > width) {
                width = w;
            }
            height += row.height;
        }
        props.width = width;
        props.height = height;
        // if (old) {
        //     let newRotatedRect=Transform['@:{transform#rotate.rect}'](props);
        //     let n = newRotatedRect['@:{point}'][0];
        //     props.x += old.x - n.x;
        //     props.y += old.y - n.y;
        // }
    },
    '@:{get.props}'(x, y) {
        let borderWidth = 0;
        // let elementsMap = State.get<Report.StageElementCtrlMapObject>('@:{global#stage.elements.map}');
        // let textType = 'text';
        // let textCtrl = elementsMap[textType];
        // let textElement = {
        //     id: Magix.guid(textType),
        //     type: textType,
        //     ctrl: textCtrl,
        //     props: textCtrl['@:{get.props}'](10, 10)
        // };
        // textElement.props.text = 'abc';
        // textElement.props.ename = '文本';
        return {
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            //rotate: 0,
            alpha: 1,
            focusRow: -1,
            focusCol: -1,
            bind: {},
            hspace: Const['@:{const#to.unit}'](20),
            vspace: Const['@:{const#to.unit}'](20),
            rows: [{
                height: Const['@:{const#to.unit}'](CellProvider["@:{cell#default.height}"]),
                cols: [{
                    width: Const['@:{const#to.unit}'](CellProvider["@:{cell#default.width}"]),
                    elements: [
                        //textElement
                    ],
                    borderRadius: '0% 0% 0% 0%/0% 0% 0% 0%',
                    borderLeftStyle: 'solid',
                    borderLeftWidth: borderWidth,
                    borderLeftColor: '#000',
                    borderTopStyle: 'solid',
                    borderTopWidth: borderWidth,
                    borderTopColor: '#000',
                    borderRightStyle: 'solid',
                    borderRightWidth: borderWidth,
                    borderRightColor: '#000',
                    borderBottomStyle: 'solid',
                    borderBottomWidth: borderWidth,
                    borderBottomColor: '#000'
                }]
            }],
            animations: [],
            locked: false
        }
    },
    props: [{
        '@:{json.encode}'(dest, { rows }, toNormalScale) {
            CellProvider['@:{cell#json.encode.cells}'](dest, rows, transformFields, toNormalScale);
        },
        '@:{unit.convert}'({ rows }, toUnit) {
            CellProvider['@:{cell#unit.convert.cells}'](rows, toUnit, transformFields);
        },
        '@:{stage.scale}'(props, step, dest) {
            CellProvider['@:{cell#stage.scale.cells}'](props, step, transformFields, dest);
        }
    },
    DesignerProvider['@:{designer#shared.props.x}'],
    DesignerProvider['@:{designer#shared.props.y}'],
    DesignerProvider['@:{designer#shared.props.label.width}'],
    DesignerProvider['@:{designer#shared.props.label.height}'],
    DesignerProvider['@:{designer#shared.props.alpha}'], {
        tip: '@:{lang#props.data.source}',
        key: 'bind',
        type: Enum['@:{enum#prop.collection}'],
        textKey: 'name',
        valueKey: 'id',
        '@:{json.encode}'(destProps, srcProps) {
            destProps.bind = srcProps.bind;
        },
        read({ id }) {
            return id;
        },
        write(v, { bind }) {
            bind.id = v;
            return bind;
        },
        items() {
            let globalSource = DataCenterProvider['@:{get.global.source}']();
            return globalSource['@:{data}'];
        },
        '@:{if.show}'() {
            return config('getFieldUrl');
        }
    },
    DesignerProvider['@:{designer#shared.props.spliter}'], {
        ...DesignerProvider['@:{designer#shared.props.partial.number}'],
        tip: '@:{lang#props.h.space}',
        key: 'hspace',
        min: 0,
        max: () => Const['@:{const#to.unit}'](200)
    }, {
        ...DesignerProvider['@:{designer#shared.props.partial.number}'],
        tip: '@:{lang#props.v.space}',
        key: 'vspace',
        min: 0,
        max: () => Const['@:{const#to.unit}'](200)
    }, {
        type: Enum["@:{enum#prop.spliter}"],
        '@:{if.show}': isCellFocused,
    }, {
        tip: '@:{lang#props.cell.size}',
        type: Enum["@:{enum#prop.cell.h.size}"],
        //'@:{dock.top}': 1,
        '@:{if.show}': isCellFocused,
    }, {
        type: Enum["@:{enum#prop.cell.style}"],
        '@:{if.show}': isCellFocused,
    },
    DesignerProvider['@:{designer#shared.props.spliter}'],
    DesignerProvider['@:{designer#shared.props.ename}'],
    DesignerProvider['@:{designer#shared.props.locked}'],
    DesignerProvider['@:{designer#shared.props.animations}']]
});