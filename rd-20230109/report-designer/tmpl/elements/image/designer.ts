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
    type: 'image',
    title: '@:{lang#elements.image}',
    icon: '&#xe690;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'] |
        Enum['@:{enum#modifier.nomask}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            height: Const['@:{const#to.unit}'](100),
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            rotateX: false,
            rotateY: false,
            print: 'each',
            width: Const['@:{const#to.unit}'](200),
            image: '',
            webUrl: '',
            locked: false,
            animations: [],
            help: 'github.com/xinglie/report-designer/issues/31',
            bind: {},
            link: '',
            target: 'tab',
            winWidth: 500,
            winHeight: 500,
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
        DesignerProvider['@:{designer#shared.props.print.options}'], {
            type: Enum["@:{enum#prop.spliter}"],
            '@:{if.show}'({ bind, image }) {
                return !bind.id && !image;
            }
        }, {
            tip: '@:{lang#props.web.image}',
            key: 'webUrl',
            type: Enum['@:{enum#prop.text.input}'],
            json: 1,
            '@:{if.show}'({ bind, image }) {
                return !bind.id && !image;
            },
        }, {
            type: Enum["@:{enum#prop.spliter}"],
            '@:{if.show}'({ bind, webUrl }) {
                return !bind.id && !webUrl;
            }
        }, {
            tip: '@:{lang#props.image}',
            key: 'image',
            type: Enum["@:{enum#prop.image}"],
            // write(v, props, changed,e) {
            //     if (!v) {
            //         e.width = 200;
            //         e.height = 100;
            //     }
            //     e.width = Const["@:{const#to.unit}"](e.width);
            //     e.height = Const["@:{const#to.unit}"](e.height);
            //     props.width = Transform["@:{transform#to.real.value}"](e.width);
            //     props.height = Transform["@:{transform#to.real.value}"](e.height);
            // },
            json: 1,
            '@:{if.show}'({ bind, webUrl }) {
                return !bind.id &&
                    config('getImageUrl') &&
                    !webUrl;
            }
        }, {
            tip: '@:{lang#props.image.reset}',
            type: Enum["@:{enum#prop.image.reset}"],
            key: 'image',
            '@:{if.show}'({ image }) {
                return image;
            }
        }, {
            type: Enum["@:{enum#prop.spliter}"],
            '@:{if.show}'({ image, webUrl }: Report.StageElementProps) {
                return !image && config('getFieldUrl') && !webUrl;
            }
        }, {
            tip: '@:{lang#props.bind.fields}',
            key: 'bind',
            type: Enum["@:{enum#prop.bind.field}"],
            json: 1,
            max: 1,
            '@:{if.show}'({ image, webUrl }) {
                return !image && config('getFieldUrl') && !webUrl;
            }
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.rotate.x}', 'rotateX'),
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.rotate.y}', 'rotateY'),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.link}'],
        DesignerProvider['@:{designer#shared.props.target}'],
        DesignerProvider['@:{designer#shared.props.win.width}'],
        DesignerProvider['@:{designer#shared.props.win.height}'],
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.help}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']],
    batches: ['width', 'height', 'alpha', 'rotate', '-', 'print', '-', 'rotateX', 'rotateY', '-', 'link', 'target', 'winWidth', 'winHeight']
});