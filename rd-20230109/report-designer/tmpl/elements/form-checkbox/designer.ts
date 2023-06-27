/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import DesignerProvider from '../../provider/designer';
import Designer from '../designer';
let { guid, config } = Magix;
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./dshow'
        });
    }
}).static({
    type: 'form-checkbox',
    title: '@:{lang#elements.form.checkbox}',
    icon: '&#xe85f;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'] |
        Enum['@:{enum#modifier.icon}'] |
        Enum['@:{enum#modifier.nomask}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            background: '',
            height: Const['@:{const#to.unit}'](50),
            alpha: 1,
            text: '',
            letterspacing: Const['@:{const#to.unit}'](0),
            inputName: guid('rd-checkboxes-'),
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            width: Const['@:{const#to.unit}'](200),
            rank: 'row',
            items: [],
            overflow: 'auto',
            bind: {},
            itemSpace: Const['@:{const#to.unit}'](10),
            textSpace: Const['@:{const#to.unit}'](4),
            forecolor: '#000',
            fontsize: Const['@:{const#to.unit}'](14),
            fontfamily: 'tahoma',
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
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            tip: '@:{lang#props.element.name}',
            key: 'inputName',
            type: Enum["@:{enum#prop.text.input}"],
            json: 1
        }, {
            tip: '@:{lang#props.element.rank}',
            key: 'rank',
            type: Enum['@:{enum#prop.collection}'],
            items: [{
                text: '@:{lang#props.element.rank.row}',
                value: 'row'
            }, {
                text: '@:{lang#props.element.rank.column}',
                value: 'column'
            }],
            json: 1
        }, {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.item.space}',
            key: 'itemSpace',
            min: 0,
        }, {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.text.space}',
            key: 'textSpace',
            min: 0,
        }, {
            tip: '@:{lang#props.content.overflow}',
            key: 'overflow',
            type: Enum['@:{enum#prop.collection}'],
            items: [{
                text: '@:{lang#props.content.overflow.auto}',
                value: 'auto'
            }, {
                text: '@:{lang#props.content.overflow.visible}',
                value: 'visible'
            }, {
                text: '@:{lang#props.content.overflow.hidden}',
                value: 'hidden'
            }],
            json: 1
        }, {
            type: Enum["@:{enum#prop.spliter}"],
            '@:{if.show}'({ items }) {
                return !items.length && config('getFieldUrl');
            }
        }, {
            tip: '@:{lang#props.bind.fields}',
            key: 'bind',
            type: Enum["@:{enum#prop.bind.field}"],
            json: 1,
            max: 1,
            '@:{if.show}'({ items }) {
                return !items.length && config('getFieldUrl');
            }
        },
        DesignerProvider['@:{designer#shared.props.bind.spliter}'], {
            key: 'items',
            type: Enum['@:{enum#prop.form.items}'],
            json: 1,
            mutual: () => 1,
            '@:{if.show}'({ bind }) {
                return !bind.id;
            }
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.fontsize}'](),
        DesignerProvider['@:{designer#shared.props.fontfamily}'](),
        DesignerProvider['@:{designer#shared.props.letter.sapcing}'](),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.forecolor}', 'forecolor'),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});