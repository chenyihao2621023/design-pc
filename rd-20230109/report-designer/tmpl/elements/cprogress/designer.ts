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
    type: 'cprogress',
    title: '@:{lang#elements.cprogress}',
    icon: '&#xe626;',
    '@:{modifier}': Enum['@:{enum#modifier.size}'] |
        Enum['@:{enum#modifier.nomask}'] |
        Enum['@:{enum#modifier.sync.size}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            height: Const['@:{const#to.unit}'](150),
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            width: Const['@:{const#to.unit}'](150),
            locked: false,
            border: Const['@:{const#to.unit}'](10),
            background: '#f0f0f0',
            roundCap: true,
            fillcolor: GenericProvider['@:{generic#get.brand.color}'](),
            forecolor: '#666666',
            value: 50,
            showText: true,
            fontsize: Const['@:{const#to.unit}'](14),
            fontfamily: 'Tahoma',
            bind: {},
            animations: []
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.width}'](20),
        DesignerProvider['@:{designer#shared.props.height}'](20),
        DesignerProvider['@:{designer#shared.props.alpha}'],
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
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.border.width}',
            key: 'border',
            min: () => Const['@:{const#to.unit}'](2),
            max: () => Const['@:{const#to.unit}'](30),
        },
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.background}', 'background'),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.highlight.color}', 'fillcolor'),
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.line.cap}', 'roundCap'),
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.show.text}', 'showText'), {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.font.size}',
            key: 'fontsize',
            min: 0,
            '@:{if.show}'({ showText }) {
                return showText;
            }
        }, {
            tip: '@:{lang#props.font.family}',
            key: 'fontfamily',
            type: Enum["@:{enum#prop.collection}"],
            items: Const["@:{const#font.family}"],
            json: 1,
            '@:{if.show}'({ showText }) {
                return showText;
            }
        }, {
            tip: '@:{lang#props.forecolor}',
            key: 'forecolor',
            type: Enum["@:{enum#prop.color}"],
            json: 1,
            '@:{if.show}'({ showText }) {
                return showText;
            }
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});