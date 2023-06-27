/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import DesignerProvider from '../../provider/designer';
import QRCodeProvider from '../../provider/qrcode';
import Designer from '../designer';
let { config } = Magix;
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./dshow'
        });
    }
}).static({
    type: 'qrcode',
    title: '@:{lang#elements.qrcode}',
    icon: '&#xe61c;',
    '@:{modifier}': Enum['@:{enum#modifier.size}'] |
        Enum['@:{enum#modifier.rotate}'] |
        Enum['@:{enum#modifier.nomask}'] |
        Enum['@:{enum#modifier.sync.size}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            height: Const['@:{const#to.unit}'](150),
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            width: Const['@:{const#to.unit}'](150),
            text: '',
            locked: false,
            animations: [],
            print: 'each',
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: 'H',
            //render: 'img',
            help: 'github.com/xinglie/report-designer/issues/31',
            bind: {},
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.width}'](20),
        DesignerProvider['@:{designer#shared.props.height}'](20),
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.rotate}'],
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.print.options}'],
        DesignerProvider['@:{designer#shared.props.bind.spliter}'], {
            tip: '@:{lang#props.text.content}',
            key: 'text',
            type: Enum["@:{enum#prop.text.area}"],
            json: 1,
            '@:{if.show}'({ bind }) {
                return !bind.id;
            }
        }, {
            type: Enum["@:{enum#prop.spliter}"],
            '@:{if.show}'({ text }) {
                return !text && config('getFieldUrl');
            }
        }, {
            tip: '@:{lang#props.bind.fields}',
            key: 'bind',
            type: Enum["@:{enum#prop.bind.field}"],
            json: 1,
            max: 1,
            '@:{if.show}'({ text }) {
                return !text && config('getFieldUrl');
            }
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.qrcode.color.dark}', 'colorDark'),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.qrcode.color.light}', 'colorLight'), {
            tip: '@:{lang#props.qrcode.correct.level}',
            type: Enum['@:{enum#prop.collection}'],
            json: 1,
            key: 'correctLevel',
            items: QRCodeProvider['@:{correct.levels}']
        }/*, {
            tip: '@:{lang#props.render}',
            key: 'render',
            type: Enum['@:{enum#prop.collection}'],
            json: 1,
            items: BarcodeProvider['@:{render.types}']
        }*/,
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.help}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']],
    batches: ['width', 'height', 'alpha', 'rotate', '-', 'print']
});