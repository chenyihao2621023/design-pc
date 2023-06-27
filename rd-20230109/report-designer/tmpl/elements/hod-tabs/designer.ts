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
    type: 'hod-tabs',
    as: Enum['@:{enum#as.hod}'],
    title: '@:{lang#elements.tabs}',
    icon: '&#xe660;',
    '@:{modifier}': Enum['@:{enum#modifier.icon}'] |
        Enum['@:{enum#modifier.nomask}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{update.props}'(props) {
        let { rows, activeTab } = props;
        let height = 0,
            width = rows[0].cols[activeTab].width;
        for (let row of rows) {
            for (let col of row.cols) {
                col.width = width;
            }
            height += row.height;
        }
        props.width = width;
        props.height = height;
    },
    '@:{get.props}'(x, y) {
        return {
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            alpha: 1,
            focusRow: 0,
            focusCol: 0,
            activeTab: 0,
            rows: [{
                height: Const['@:{const#to.unit}'](2 * CellProvider["@:{cell#default.height}"]),
                cols: [{
                    width: Const['@:{const#to.unit}'](2 * CellProvider["@:{cell#default.width}"]),
                    text: 'Tab 1',
                    elements: [
                        //textElement
                    ]
                }, {
                    width: Const['@:{const#to.unit}'](2 * CellProvider["@:{cell#default.width}"]),
                    text: 'Tab 2',
                    elements: [
                        //textElement
                    ],
                }]
            }],
            animations: [],
            locked: false
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.label.width}'],
        DesignerProvider['@:{designer#shared.props.label.height}'],
        DesignerProvider['@:{designer#shared.props.alpha}'], {
            tip: '@:{lang#props.active}',
            type: Enum['@:{enum#prop.collection}'],
            key: 'activeTab',
            json: 1,
            items({ rows }) {
                let list = [];
                let index = 0;
                for (let r of rows) {
                    for (let c of r.cols) {
                        list.push({
                            text: c.text,
                            value: index++
                        });
                    }
                }
                return list;
            },
            write(v, props) {
                props.focusRow = 0;
                props.focusCol = v;
            }
        }, {
            type: Enum['@:{enum#prop.box.tabs}'],
            '@:{json.encode}'(dest, { rows }, toNormalScale) {
                CellProvider['@:{cell#json.encode.cells}'](dest, rows, transformFields, toNormalScale);
            },
            '@:{unit.convert}'({ rows }, toUnit) {
                CellProvider['@:{cell#unit.convert.cells}'](rows, toUnit, transformFields);
            },
            '@:{stage.scale}'(props, step, dest) {
                CellProvider['@:{cell#stage.scale.cells}'](props, step, transformFields, dest);
            }
        }, {
            type: Enum["@:{enum#prop.spliter}"],
            '@:{if.show}': isCellFocused,
        }, {
            tip: '@:{lang#props.cell.size}',
            type: Enum["@:{enum#prop.cell.h.size}"],
            //'@:{dock.top}': 1,
            '@:{if.show}': isCellFocused,
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});