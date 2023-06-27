/*
    author:https://github.com/xinglie
*/
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import DesignerProvider from '../../provider/designer';
import GenericProvider from '../../provider/generic';
import Designer from '../designer';
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./dshow'
        });
    }
}).static({
    type: 'pbar',
    title: '@:{lang#elements.progressbar}',
    icon: '&#xe689;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'] |
        Enum['@:{enum#modifier.nomask}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            height: Const['@:{const#to.unit}'](10),
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            width: Const['@:{const#to.unit}'](240),
            locked: false,
            background: '#e2e2e2',
            barcolor: GenericProvider['@:{generic#get.brand.color}'](),
            value: 50,
            radius: Const['@:{const#to.unit}'](5),
            showText: true,
            textColor: '#000',
            textFontsize: Const['@:{const#to.unit}'](12),
            bind: {},
            animations: [],
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.width}'](),
        DesignerProvider['@:{designer#shared.props.height}'](),
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.rotate}'],
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            tip: '@:{lang#props.preset.value}',
            key: 'value',
            type: Enum['@:{enum#prop.number}'],
            min: 0,
            max: 100,
            json: 1,
            fixed: 1,
        },
        DesignerProvider['@:{designer#shared.props.bind.roost}']('@:{lang#props.preset.value}'),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.background}', 'background'),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.bar.color}', 'barcolor'), {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.border.radius}',
            key: 'radius',
            min: 0,
        },
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.show.text}', 'showText'), {
            tip: '@:{lang#props.forecolor}',
            key: 'textColor',
            json: 1,
            type: Enum['@:{enum#prop.color}'],
            '@:{if.show}'({ showText }) {
                return showText;
            }
        }, {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.font.size}',
            key: 'textFontsize',
            min: 0,
            '@:{if.show}'({ showText }) {
                return showText
            }
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});