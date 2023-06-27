/*
    author:https://github.com/xinglie
*/
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import DesignerProvider from '../../provider/designer';
import Designer from '../designer';
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./dshow'
        });
    }
}).static({
    type: 'map',
    title: '@:{lang#elements.map}',
    icon: '&#xe735;',
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.icon}'] |
        Enum['@:{enum#modifier.nomask}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{get.props}'(x, y) {
        return {
            height: Const['@:{const#to.unit}'](300),
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            //rotate: 0,
            width: Const['@:{const#to.unit}'](450),
            zoom: 8,
            lat: 30.36081488360812,
            lng: 120.02268238691616,
            locked: false,
            zoomCtrl: true,
            dragging: true,
            doubleClickZoom: true,
            animations: []
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.width}'](),
        DesignerProvider['@:{designer#shared.props.height}'](),
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            tip: '@:{lang#props.map.zoom}',
            key: 'zoom',
            type: Enum["@:{enum#prop.number}"],
            min: 1,
            max: 18,
            json: 1
        }, {
            tip: '@:{lang#props.map.lng}',
            key: 'lng',
            type: Enum["@:{enum#prop.number}"],
            min: -180,
            max: 180,
            fixed: 4,
            step: 1,
            json: 1
        }, {
            tip: '@:{lang#props.map.lat}',
            key: 'lat',
            type: Enum["@:{enum#prop.number}"],
            min: -90,
            max: 90,
            fixed: 4,
            step: 1,
            json: 1
        },
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.map.show.zoom.ctrl}', 'zoomCtrl'),
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.map.dragging}', 'dragging'),
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.map.double.click.zoom}', 'doubleClickZoom'),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});