/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import Transform from '../../designer/transform';
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
    type: 'repeat',
    title: '@:{lang#elements.repeat}',
    icon: '&#xe78f;',
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
            width: Const['@:{const#to.unit}'](200),
            tfs: Const['@:{const#to.unit}'](14),
            radius: 0,
            image: '',
            webUrl: '',
            repeat: 'repeat',
            imageWidth: 0,
            imageHeight: 0,
            backgroundXOffset: 0,
            backgroundYOffset: 0,
            locked: false,
            help: 'github.com/xinglie/report-designer/issues/31',
            bind: {},
            animations: []
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.tfs}'],
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.width}'](),
        DesignerProvider['@:{designer#shared.props.height}'](),
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.rotate}'], {
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
            write(v, props, changed, e) {
                e.width = Const["@:{const#to.unit}"](e.width);
                e.height = Const["@:{const#to.unit}"](e.height);
                props.imageWidth = Transform["@:{transform#to.real.value}"](e.width);
                props.imageHeight = Transform["@:{transform#to.real.value}"](e.height);
            },
            '@:{if.show}'({ bind, webUrl }) {
                return !bind.id && config('getImageUrl') && !webUrl;
            },
            json: 1
        }, {
            type: Enum["@:{enum#prop.spliter}"],
            '@:{if.show}'({ image, webUrl }) {
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
        }, {
            type: Enum["@:{enum#prop.spliter}"],
            '@:{if.show}'({ image, webUrl, bind }) {
                return image || bind.id || webUrl;
            },
        }, {
            tip: '@:{lang#props.background.repeat}',
            key: 'repeat',
            type: Enum["@:{enum#prop.collection}"],
            '@:{if.show}'({ image, webUrl, bind }) {
                return image || bind.id || webUrl;
            },
            items: [{
                text: '@:{lang#props.repeat}',
                value: 'repeat'
            }, {
                text: '@:{lang#props.repeat.x}',
                value: 'repeat-x'
            }, {
                text: '@:{lang#props.repeat.y}',
                value: 'repeat-y'
            }, {
                text: '@:{lang#props.full}',
                value: 'full'
            }, {
                text: '@:{lang#props.no.repeat}',
                value: 'no-repeat'
            }],
            json: 1
        }, {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.border.radius}',
            key: 'radius',
            min: 0,
            '@:{if.show}'({ image, webUrl, bind }) {
                return image || bind.id || webUrl;
            },
        }, {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.image.width}',
            key: 'imageWidth',
            min: 0,
            write: Transform["@:{transform#to.real.value}"],
            '@:{if.show}'({ image, bind, webUrl, repeat }) {
                return (image || bind.id || webUrl) && repeat != 'full';
            },
        }, {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.image.height}',
            key: 'imageHeight',
            write: Transform["@:{transform#to.real.value}"],
            '@:{if.show}'({ image, bind, webUrl, repeat }) {
                return (image || bind.id || webUrl) && repeat != 'full';
            },
        }, {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.offset.hor}',
            key: 'backgroundXOffset',
            min: () => -Const['@:{const#to.unit}'](Const['@:{const#page.max.width}']),
            max: () => Const['@:{const#to.unit}'](Const['@:{const#page.max.width}']),
            '@:{if.show}'({ image, bind, webUrl, repeat }) {
                return (image || bind.id || webUrl) && repeat != 'full';
            },
        }, {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.offset.ver}',
            key: 'backgroundYOffset',

            min: () => -Const['@:{const#to.unit}'](Const['@:{const#page.max.height}']),
            max: () => Const['@:{const#to.unit}'](Const['@:{const#page.max.height}']),
            '@:{if.show}'({ image, bind, webUrl, repeat }) {
                return (image || bind.id || webUrl) && repeat != 'full';
            },
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.help}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']],

    batches: ['width', 'height', 'alpha', 'rotate']
});