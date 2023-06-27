
import Owner from '../index';
import SVGArc from './arc/designer';
import SVGBattry from './battery/designer';
import SVGBezier2 from './bezier2/designer';
import SVGBezier3 from './bezier3/designer';
import SVGBrace from './brace/designer';
import SVGCircle from './circle/designer';
import SVGEllipse from './ellipse/designer';
import SVGFan from './fan/designer';
import SVGHeart from './heart/designer';
import SVGLine from './line/designer';
import SVGPolyline2 from './polyline2/designer';
import SVGRArrow from './rarrow/designer';
import SVGRBubble from './rbubble/designer';
import SVGRCard from './rcard/designer';
import SVGRCorner from './rcorner/designer';
import SVGRCross from './rcross/designer';
import SVGRCube from './rcube/designer';
import SVGRCylinder from './rcylinder/designer';
import SVGRDArrow from './rdarrow/designer';
import SVGRect1 from './rect/designer';
import SVGRect2 from './rect2/designer';
import SVGRMoon from './rmoon/designer';
import SVGRPie from './rpie/designer';
import SVGRStar from './rstar/designer';
import SVGSignal from './signal/designer';
import SVGSpeaker from './speaker/designer';
import SVGStar from './star/designer';
import SVGTriangle from './triangle/designer';
import SVGWiFi from './wifi/designer';
export default () => {
    Owner['@:{element.manager#register.layout}']({
        icon: '&#xe60a;',
        title: 'SVG',
        large: 1,
        subs: [{
            ctrl: SVGLine
        }, {
            ctrl: SVGBezier2
        }, {
            ctrl: SVGBezier3
        }, {
            ctrl: SVGArc
        }, {
            ctrl: SVGPolyline2
        }, {
            ctrl: SVGTriangle
        }, {
            ctrl: SVGRect1
        }, {
            ctrl: SVGRect2
        }, {
            ctrl: SVGCircle
        }, {
            ctrl: SVGEllipse
        }, {
            ctrl: SVGBrace
        }, {
            ctrl: SVGRStar
        }, {
            ctrl: SVGRArrow
        }, {
            ctrl: SVGRBubble
        }, {
            ctrl: SVGRCross
        }, {
            ctrl: SVGRDArrow
        }, {
            ctrl: SVGRCylinder
        }, {
            ctrl: SVGRCube
        }, {
            ctrl: SVGRMoon
        }, {
            ctrl: SVGRPie
        }, {
            ctrl: SVGRCard
        }, {
            ctrl: SVGRCorner
        }, {
            ctrl: SVGStar
        }, {
            ctrl: SVGFan
        }, {
            ctrl: SVGBattry
        }, {
            ctrl: SVGWiFi
        }, {
            ctrl: SVGSignal
        }, {
            ctrl: SVGSpeaker
        }, {
            ctrl: SVGHeart
        }]
    });
};