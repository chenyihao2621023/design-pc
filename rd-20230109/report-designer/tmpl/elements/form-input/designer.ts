/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import DesignerProvider from '../../provider/designer';
import Designer from '../designer';
let { config } = Magix;
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./dshow'
        });
    }
}).static({
    type: 'form-input',
    title: '@:{lang#elements.form.input}',
    icon: '&#xe6dc;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.inputext}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'] |
        Enum['@:{enum#modifier.nomask}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{can.show.text}'({ bind }) {
        return !bind.id;
    },
    '@:{get.props}'(x, y) {
        return {
            background: '',
            height: Const['@:{const#to.unit}'](25),
            alpha: 1,
            text: '',
            placeholder: '',
            letterspacing: 0,
            markAs: '',
            className: '',
            multiline: false,
            inputName: '',
            textAlign: 'left',
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            width: Const['@:{const#to.unit}'](200),
            forecolor: '#000',
            fontsize: Const['@:{const#to.unit}'](14),
            fontfamily: 'tahoma',
            bind: {},
            locked: false,
            animations: [],
            help: 'github.com/xinglie/report-designer/issues/39'
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
            tip: '@:{lang#props.bind.fields}',
            key: 'bind',
            type: Enum["@:{enum#prop.bind.field}"],
            json: 1,
            max: 1,
            '@:{if.show}'({ userValue, text }) {
                return !userValue &&
                    !text &&
                    config('getFieldUrl');
            }
        }, {
            type: Enum["@:{enum#prop.spliter}"],
            '@:{if.show}'({ userValue, text }) {
                return !userValue &&
                    !text &&
                    config('getFieldUrl');
            }
        }, {
            tip: '@:{lang#props.default.text}',
            key: 'text',
            type({ multiline }) {
                return multiline ? Enum['@:{enum#prop.text.area}'] : Enum['@:{enum#prop.text.input}'];
            },
            '@:{if.show}'({ bind }) {
                return !bind.id;
            },
            '@:{is.dynamic.type}': 1,
            json: 1
        }, {
            tip: '@:{lang#props.placeholder}',
            key: 'placeholder',
            type: Enum["@:{enum#prop.text.input}"],
            json: 1
        }, {
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
        },
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.multiline}', 'multiline'),
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            tip: '@:{lang#props.text.align}',
            key: 'textAlign',
            type: Enum["@:{enum#prop.font.align}"],
            json: 1
        },
        DesignerProvider['@:{designer#shared.props.fontsize}'](),
        DesignerProvider['@:{designer#shared.props.fontfamily}'](),
        DesignerProvider['@:{designer#shared.props.letter.sapcing}'](),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.forecolor}', 'forecolor'),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.help}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});