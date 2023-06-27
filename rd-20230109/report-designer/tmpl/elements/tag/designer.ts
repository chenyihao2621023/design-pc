/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import DesignerProvider from '../../provider/designer';
import GenericProvider from '../../provider/generic';
import Designer from '../designer';
let { config } = Magix;
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./dshow'
        });
    }
}).static({
    type: 'tag',
    title: '@:{lang#elements.tag}',
    icon: '&#xe66e;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'] |
        Enum['@:{enum#modifier.nomask}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            width: Const['@:{const#to.unit}'](300),
            height: Const['@:{const#to.unit}'](100),
            alpha: 1,
            locked: false,
            overflow: 'auto',
            words: [],
            animations: [],
            // words: [{
            //     text: '标签',
            //     url: '//xinglie.github.io',
            //     forecolor: '#fff',
            //     background: GenericProvider['@:{generic#get.brand.color}']()
            // }],
            bind: {},
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
            '@:{if.show}'({ words }) {
                return !words.length && config('getFieldUrl');
            }
        }, {
            tip: '@:{lang#props.bind.fields}',
            key: 'bind',
            type: Enum["@:{enum#prop.bind.field}"],
            json: 1,
            max: 1,
            '@:{if.show}'({ words }) {
                return !words.length && config('getFieldUrl');
            }
        },
        DesignerProvider['@:{designer#shared.props.bind.spliter}'], {
            type: Enum['@:{enum#prop.box.tags}'],
            '@:{json.encode}'(dest, { words }) {
                let cloned = [];
                for (let e of words) {
                    cloned.push({ ...e });
                }
                dest.words = cloned;
            },
            '@:{if.show}'({ bind }) {
                return !bind.id;
            }
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});