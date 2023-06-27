/*
    author:https://github.com/xinglie
*/
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import CellProvider from '../../provider/cell';
import DesignerProvider from '../../provider/designer';
import Designer from '../designer';

let borderNumbers = ['borderLeftWidth', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth'];

let borders = ['borderLeftColor', 'borderLeftStyle',
    'borderTopColor', 'borderTopStyle',
    'borderRightColor', 'borderRightStyle',
    'borderBottomColor', 'borderBottomStyle'];
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./index'
        });
    }
}).static({
    type: 'rect',
    title: '@:{lang#elements.rect}',
    icon: '&#xeb97;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        let borderWidth = Const['@:{const#to.unit}'](1);
        return {
            fillcolor: '',
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            width: Const['@:{const#to.unit}'](200),
            height: Const['@:{const#to.unit}'](100),
            alpha: 1,
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
            borderBottomColor: '#000',
            print: 'each',
            radius: '0% 0% 0% 0%/0% 0% 0% 0%',
            animations: [],
            locked: false
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.width}'](),
        DesignerProvider['@:{designer#shared.props.height}'](),
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.rotate}'],
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.print.options}'],
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.fill.color}', 'fillcolor', 1, 1), {
            type: Enum['@:{enum#prop.cell.border}'],
            ref: '@:{batches#border}',
            keys: [...borderNumbers, ...borders],
            '@:{json.encode}'(dest, props, toNormalScale) {
                for (let b of borders) {
                    dest[b] = props[b];
                }
                for (let n of borderNumbers) {
                    dest[n] = props[n] * toNormalScale;
                }
            },
            '@:{unit.convert}'(props, toUnit) {
                for (let n of borderNumbers) {
                    props[n] = Const['@:{const#to.unit}'](props[n], toUnit);
                }
            },
            '@:{stage.scale}'(props, step, dest) {
                for (let n of borderNumbers) {
                    props[n] *= step;
                    if (dest) {
                        dest[n] = props[n];
                    }
                }
            }
        }, {
            key: 'radius',
            type: Enum['@:{enum#prop.cell.radius}'],
            '@:{json.encode}'(dest, { radius }, toNormalScale) {
                dest.radius = CellProvider['@:{cell#scale.radius}'](radius, toNormalScale);
            },
            '@:{unit.convert}'(props, toUnit) {
                props.radius = CellProvider['@:{cell#unit.convert.radius}'](props.radius, toUnit);
            },
            '@:{stage.scale}'(props, step, dest) {
                props.radius = CellProvider['@:{cell#scale.radius}'](props.radius, step);
                if (dest) {
                    dest.radius = props.radius;
                }
            }
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']],
    batches: ['width', 'height', 'alpha', 'rotate', '-', 'print', '-', 'fillcolor', '@:{batches#border}', 'radius']
});