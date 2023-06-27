/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import Transform from '../../designer/transform';
import CellProvider from '../../provider/cell';
import DesignerProvider from '../../provider/designer';
import Normal from '../designer';
let isCellFocused = CellProvider['@:{cell#is.cell.focused}'];
let { State } = Magix;
let transformFields = ['width', 'height', 'borderLeftWidth', 'borderTopWidth', 'borderBottomWidth', 'borderRightWidth'];
export default Normal.extend({
    ctor() {
        this.set({
            view: '@:./dshow'
        });
        let update = () => {
            let element = this.get('element');
            let page = State.get('@:{global#stage.page}');
            let scale = State.get('@:{global#stage.scale}');
            let { ctrl, props } = element;
            props.rows[0].cols[0].width = page.width * scale;
            ctrl['@:{update.props}'](props);
        };
        State.on('@:{event#stage.page.change}', update);
        this.on('destroy', () => {
            State.off('@:{event#stage.page.change}', update);
        });
    }
}).static({
    type: 'hod-footer',
    as: Enum['@:{enum#as.hod}'],
    title: '@:{lang#elements.print-footer}',
    icon: '&#xe675;',
    '@:{modifier}': Enum['@:{enum#modifier.icon}'] |
        Enum['@:{enum#modifier.nomask}'],
    '@:{allowed.to.hod}': {
        root: 1
    },
    '@:{allowed.total.count}': 1,
    '@:{update.props}'(props) {
        let { rows } = props;
        let page = State.get('@:{global#stage.page}');
        let scale = State.get('@:{global#stage.scale}');
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
        props.x = 0;
        props.y = page.pages * page.height * scale - height;
    },
    '@:{get.props}'() {
        let page = State.get('@:{global#stage.page}');
        return {
            x: 0,
            y: 0,
            alpha: 1,
            focusRow: -1,
            focusCol: -1,
            help: '//github.com/xinglie/report-designer/issues/12',
            rows: [{
                height: Const['@:{const#to.unit}'](40),
                cols: [{
                    width: page.width,
                    elements: [],
                    borderRadius: '0% 0% 0% 0%/0% 0% 0% 0%',
                    borderLeftStyle: 'dashed',
                    borderLeftWidth: 0,
                    borderLeftColor: '#cccccc',
                    borderTopStyle: 'dashed',
                    borderTopWidth: Const['@:{const#to.unit}'](1),
                    borderTopColor: '#cccccc',
                    borderRightStyle: 'dashed',
                    borderRightWidth: 0,
                    borderRightColor: '#cccccc',
                    borderBottomStyle: 'dashed',
                    borderBottomWidth: 0,
                    borderBottomColor: '#cccccc'
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
    DesignerProvider['@:{designer#shared.props.label.width}'],
    DesignerProvider['@:{designer#shared.props.label.height}'],
    DesignerProvider['@:{designer#shared.props.alpha}'], {
        type: Enum["@:{enum#prop.spliter}"],
        '@:{if.show}': isCellFocused
    }, {
        tip: '@:{lang#props.cell.size.height}',
        type: Enum["@:{enum#prop.number}"],
        read(x, props) {
            let row = props.rows[0];
            return Transform["@:{transform#to.show.value}"](row.height);
        },
        write(x, props, changed) {
            let v = Transform["@:{transform#to.real.value}"](x);
            props.rows[0].height = v;
            changed['@:{size}'] = 1;
        },
        fixed: () => Const["@:{const#unit.fixed}"](),
        step: () => Const["@:{const#unit.step}"](),
        min: () => Const["@:{const#to.unit}"](20),
        '@:{if.show}': isCellFocused
    }, {
        type: Enum["@:{enum#prop.cell.style}"],
        '@:{if.show}': isCellFocused
    },
    DesignerProvider['@:{designer#shared.props.spliter}'],
    DesignerProvider['@:{designer#shared.props.help}'],
    DesignerProvider['@:{designer#shared.props.ename}'],
    DesignerProvider['@:{designer#shared.props.locked}'],
    DesignerProvider['@:{designer#shared.props.animations}']]
});