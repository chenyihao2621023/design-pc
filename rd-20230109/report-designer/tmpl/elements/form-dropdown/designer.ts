/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import Transform from '../../designer/transform';
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
    type: 'form-dropdown',
    title: '@:{lang#elements.form.dropdown}',
    icon: '&#xe6e4;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.icon}'] |
        Enum['@:{enum#modifier.nomask}'] |
        Enum['@:{enum#modifier.rotate}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            background: '',
            height: Const['@:{const#to.unit}'](25),
            alpha: 1,
            text: '',
            letterspacing: 0,
            inputName: guid('rd-dropdown-'),
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            width: Const['@:{const#to.unit}'](200),
            markAs: '',
            className: '',
            multipleSelect: false,
            items: [],
            bind: {},
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
            tip: '@:{lang#props.extend.mark}',
            key: 'markAs',
            type: Enum["@:{enum#prop.text.input}"],
            json: 1
        }, {
            tip: '@:{lang#props.extend.class.name}',
            key: 'className',
            type: Enum["@:{enum#prop.text.input}"],
            json: 1
        }, {
            tip: '@:{lang#props.multile.selected}',
            key: 'multipleSelect',
            type: Enum['@:{enum#prop.boolean}'],
            write(v, props) {
                if (!v) {
                    let { items } = props;
                    let findSelect;
                    for (let e of items) {
                        if (e.checked) {
                            if (findSelect) {
                                e.checked = false;
                            } else {
                                findSelect = 1;
                            }
                        }
                    }
                    if (!findSelect) {
                        items[0].checked = true;
                    }
                }
            },
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
            '@:{if.show}'({ bind }) {
                return !bind.id;
            },
            mutual({ multipleSelect }) {
                return multipleSelect;
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