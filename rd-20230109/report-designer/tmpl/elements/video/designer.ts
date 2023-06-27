/*
    author:https://github.com/xinglie
*/
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import DesignerProvider from '../../provider/designer';
import Designer from '../designer';
let showSrcOption = ({ src }) => src;
let booleanProp = (tip, key) => {
    return {
        tip,
        key,
        type: Enum["@:{enum#prop.boolean}"],
        json: 1,
        '@:{if.show}': showSrcOption,
    };
}
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./index'
        });
    }
}).static({
    type: 'video',
    title: '@:{lang#elements.video}',
    icon: '&#xe640;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            height: Const['@:{const#to.unit}'](300),
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            rotate: 0,
            width: Const['@:{const#to.unit}'](400),
            locked: false,

            src: '',
            poster: '',
            autoplay: false,
            controls: true,
            loop: false,
            muted: false,
            animations: []
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
            tip: '@:{lang#props.video.src}',
            type: Enum["@:{enum#prop.text.area}"],
            key: 'src',
            json: 1
        }, {
            tip: '@:{lang#props.video.poster}',
            type: Enum["@:{enum#prop.text.input}"],
            key: 'poster',
            json: 1,
            '@:{if.show}': showSrcOption,
        },
        booleanProp('@:{lang#props.autoplay}', 'autoplay'),
        booleanProp('@:{lang#props.loop}', 'loop'),
        booleanProp('@:{lang#props.muted}', 'muted'),
        booleanProp('@:{lang#props.controls}', 'controls'),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});