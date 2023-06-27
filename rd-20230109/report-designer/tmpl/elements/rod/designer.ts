/*
    author:https://github.com/xinglie
*/
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import Transform from '../../designer/transform';
import DesignerProvider from '../../provider/designer';
import Designer from '../designer';
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./index'
        });
    }
}).static({
    type: 'rod',
    title: '@:{lang#elements.rod}',
    icon: '&#xe6a2;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{update.props}'(props) {
        if (props.customText) {
            props.text = props.customText;
        } else {
            props.text = Transform["@:{transform#to.show.value}"](props.width);
        }
    },
    '@:{get.props}'(x, y) {
        return {
            height: Const['@:{const#to.unit}'](14),
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            textRotate: 0,
            startBorder: true,
            endBorder: true,
            width: Const['@:{const#to.unit}'](400),
            bordertype: 'solid',
            color: '#000',
            customText: '',
            locked: false,
            animations: []
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'], {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.long}',
            key: 'width',
            min: () => 0,
        },
        DesignerProvider['@:{designer#shared.props.height}'](),
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.rotate}'],
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            '@:{json.encode}'(dest, props) {
                if (props.customText) {
                    dest.text = props.customText;
                } else {
                    dest.text = Transform["@:{transform#to.show.value}"](props.width);
                }
            }
        }, {
            tip: '@:{lang#props.show.text}',
            json: 1,
            type: Enum['@:{enum#prop.text.input}'],
            key: 'customText'
        }, {
            tip: '@:{lang#props.text.rotate}',
            type: Enum["@:{enum#prop.number}"],
            key: 'textRotate',
            min: -360,
            max: 360,
            json: 1
        },
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.start.border}', 'startBorder'),
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.end.border}', 'endBorder'),
        DesignerProvider['@:{designer#shared.props.border.type}']('@:{lang#props.line.type}'),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.color}', 'color'),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});