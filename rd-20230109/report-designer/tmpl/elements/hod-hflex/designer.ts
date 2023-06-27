/*
    author:https://github.com/xinglie
*/
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import CellProvider from '../../provider/cell';
import DesignerProvider from '../../provider/designer';
import Normal from '../designer';
let transformFields = ['width', 'height', 'borderLeftWidth', 'borderTopWidth', 'borderBottomWidth', 'borderRightWidth'];
let isCellFocused = CellProvider['@:{cell#is.cell.focused}'];
export default Normal.extend({
    ctor() {
        this.set({
            view: '@:./dshow'
        });
    }
}).static({
    type: 'hod-hflex',
    as: Enum['@:{enum#as.hod}'],
    title: '@:{lang#elements.h-flexbox}',
    icon: '&#xebd7;',
    '@:{modifier}': Enum['@:{enum#modifier.icon}'] |
        Enum['@:{enum#modifier.nomask}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{update.props}'(props) {
        let { rows } = props;
        let height = 0,
            width = 0;
        for (let row of rows) {
            let w = 0;
            for (let col of row.cols) {
                w += col.width;
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
        let borderWidth = Const['@:{const#to.unit}'](1);
        // let elementsMap = State.get<Report.StageElementCtrlMapObject>('@:{global#stage.elements.map}');
        // let textType = 'text';
        // let textCtrl = elementsMap[textType];
        // let textElement = {
        //     id: guid(textType),
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
            help: '//github.com/xinglie/report-designer/issues/12',
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
        type: Enum["@:{enum#prop.spliter}"],
        '@:{if.show}': isCellFocused,
    }, {
        tip: '@:{lang#props.cell.size}',
        type: Enum["@:{enum#prop.cell.h.size}"],
        //'@:{dock.top}': 1,
        '@:{if.show}': isCellFocused,
    }, {
        tip: '@:{lang#props.cell.operate}',
        type: Enum["@:{enum#prop.cell.h.operate}"],
        //'@:{dock.top}': 1,
        '@:{if.show}': isCellFocused,
    }, {
        type: Enum["@:{enum#prop.cell.style}"],
        '@:{if.show}': isCellFocused,
    },
    DesignerProvider['@:{designer#shared.props.spliter}'],
    DesignerProvider['@:{designer#shared.props.help}'],
    DesignerProvider['@:{designer#shared.props.ename}'],
    DesignerProvider['@:{designer#shared.props.locked}'],
    DesignerProvider['@:{designer#shared.props.animations}']]
});