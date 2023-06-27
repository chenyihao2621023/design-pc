/*
    author:https://github.com/xinglie
*/
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import BWIP from '../../provider/bwip';
import DesignerProvider from '../../provider/designer';
import Designer from '../designer';
let textIfShow = ({ bwipFormat }) => !BWIP['@:{no.text.options}'][bwipFormat];
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./dshow'
        });
    }
}).static({
    type: 'bwip',
    title: '@:{lang#elements.bwip}',
    icon: '&#xe619;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'] |
        Enum['@:{enum#modifier.nomask}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        let first = BWIP['@:{types}'][0];
        return {
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            width: Const['@:{const#to.unit}'](200),
            height: Const['@:{const#to.unit}'](200),
            rotate: 0,
            alpha: 1,
            bwipFormat: first.value,
            bwipValue: first.fill,
            bwipParams: '',
            bwipIncludecheckintext: false,
            bwipIncludecheck: false,
            bwipBarcolor: '',
            bwipBackgroundcolor: '',
            bwipInkspread: 0,
            bwipIncludetext: true,
            bwipTextcolor: '',
            bwipTextsize: 10,
            bwipTextxalign: 'left',
            bwipTextyalign: 'above',
            bwipTextgaps: 0,
            bwipTextyoffset: 0,
            bind: {},
            ow: '//github.com/metafloor/bwip-js',
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
            tip: '@:{lang#props.barcode.format}',
            type: Enum['@:{enum#prop.collection}'],
            json: 1,
            items: BWIP['@:{types}'],
            key: 'bwipFormat',
            write(value, props, changed, { item }) {
                props.bwipValue = item.fill || 'rd designer';
                props.bwipParams = item.opts;
            }
        }, {
            tip: '@:{lang#props.preset.value}',
            key: 'bwipValue',
            type: Enum['@:{enum#prop.text.area}'],
            json: 1,
        },
        DesignerProvider['@:{designer#shared.props.bind.roost}']('@:{lang#props.preset.value}'),
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.check}', 'bwipIncludecheck'),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.code.color}', 'bwipBarcolor', 0, 1),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.background}', 'bwipBackgroundcolor', 0, 1), {
            tip: '@:{lang#props.line.spread}',
            key: 'bwipInkspread',
            json: 1,
            type: Enum['@:{enum#prop.number}'],
            step: 0.1,
            fixed: 2,
            min: 0,
            max: 10
        }, {
            tip: '@:{lang#props.show.text}',
            key: 'bwipIncludetext',
            json: 1,
            type: Enum['@:{enum#prop.boolean}'],
            '@:{if.show}': textIfShow
        }, {
            tip: '@:{lang#props.check.text}',
            key: 'bwipIncludecheckintext',
            json: 1,
            type: Enum['@:{enum#prop.boolean}'],
            '@:{if.show}': textIfShow
        }, {
            tip: '@:{lang#props.forecolor}',
            key: 'bwipTextcolor',
            json: 1,
            type: Enum['@:{enum#prop.color}'],
            clear: 1,
            '@:{if.show}': textIfShow
        }, {
            tip: '@:{lang#props.font.size}',
            key: 'bwipTextsize',
            json: 1,
            min: 1,
            type: Enum['@:{enum#prop.number}'],
            '@:{if.show}': textIfShow
        }, {
            tip: '@:{lang#props.text.x.align}',
            key: 'bwipTextxalign',
            json: 1,
            type: Enum['@:{enum#prop.collection}'],
            items: [{
                text: '@:{lang#props.text.left}',
                value: 'left'
            }, {
                text: '@:{lang#props.text.center}',
                value: 'center'
            }, {
                text: '@:{lang#props.text.right}',
                value: 'right'
            }, {
                text: '@:{lang#props.text.justify}',
                value: 'justify'
            }],
            '@:{if.show}': textIfShow
        }, {
            tip: '@:{lang#props.text.y.align}',
            key: 'bwipTextyalign',
            json: 1,
            type: Enum['@:{enum#prop.collection}'],
            items: [{
                text: '@:{lang#props.text.above}',
                value: 'above'
            }, {
                text: '@:{lang#props.text.below}',
                value: 'below'
            }],
            '@:{if.show}': textIfShow
        }, {
            tip: '@:{lang#props.text.gap}',
            key: 'bwipTextgaps',
            json: 1,
            // fixed: 1,
            // step: 0.1,
            type: Enum['@:{enum#prop.number}'],
            //min: 0,
            '@:{if.show}': textIfShow
        }, {
            tip: '@:{lang#props.text.offset}',
            key: 'bwipTextyoffset',
            json: 1,
            type: Enum['@:{enum#prop.number}'],
            //min: 0,
            fixed: 1,
            step: 0.1,
            '@:{if.show}': textIfShow
        }, {
            tip: '@:{lang#props.url.params}',
            type: Enum['@:{enum#prop.text.area}'],
            json: 1,
            key: 'bwipParams'
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ow}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}']],
});