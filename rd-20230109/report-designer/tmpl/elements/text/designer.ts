/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import DesignerProvider from '../../provider/designer';
import Designer from '../designer';
let { config/*, Cache, State*/ } = Magix;
//let fsUnitCache = new Cache();

let sharedProps = [
    DesignerProvider['@:{designer#shared.props.fontsize}'](10),
    DesignerProvider['@:{designer#shared.props.fontfamily}'](), {
        tip: '@:{lang#props.line.height}',
        key: 'lineheight',
        type: Enum['@:{enum#prop.number}'],
        json: 1,
        min: 1,
        max: 10,
        step: 0.1,
        fixed: 1
    },
    DesignerProvider['@:{designer#shared.props.letter.sapcing}'](),
    DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.background}', 'background', 1, 1),
    DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.forecolor}', 'forecolor'), {
        tip: '@:{lang#props.font.style}',
        type: Enum["@:{enum#prop.font.style}"],
        ref: '@:{batches#style}',
        json: 1,
        keys: ['styleBold', 'styleUnderline', 'styleItalic', 'styleStrike', 'styleOverline'],
    }, {
        tip: '@:{lang#props.font.align}',
        type: Enum["@:{enum#prop.align}"],
        ref: '@:{batches#align}',
        json: 1,
        keys: ['hpos', 'vpos'],
    }, {
        tip: '@:{lang#props.unicolor}',
        type: Enum['@:{enum#prop.unicolor}'],
        ref: '@:{batches#unicolor}',
        json: 1,
        keys: ['background', 'forecolor'],
    }, DesignerProvider['@:{designer#shared.props.spliter}'],
    DesignerProvider['@:{designer#shared.props.border.width}'],
    DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.border.color}', 'bordercolor'),
    DesignerProvider['@:{designer#shared.props.border.type}']()];

/**
 * 获取文本公用属性
 * @param x x坐标
 * @param y y坐标
 * @param width 默认宽
 * @param height 默认高
 * @returns 共用属性
 */
let getSahredProps = (x, y, width, height) => {
    return {
        x: Const['@:{const#to.unit}'](x),
        y: Const['@:{const#to.unit}'](y),
        width: Const['@:{const#to.unit}'](width),
        height: Const['@:{const#to.unit}'](height),
        alpha: 1,
        rotate: 0,
        forecolor: '#000',
        background: '',
        richText: false,
        autoHeight: true,
        fontsize: Const['@:{const#to.unit}'](14),
        fontfamily: 'tahoma',
        letterspacing: 0,
        styleBold: false,
        styleUnderline: false,
        styleItalic: false,
        styleStrike: false,
        styleOverline: false,
        display: false,
        animations: [],
        borderwidth: 0,
        lineheight: 1.5,
        bordercolor: '#000',
        bordertype: 'solid',
        hpos: 'center',
        vpos: 'center',
    };
};
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./dshow'
        });
    }
}).static({
    type: 'text',
    title: '@:{lang#elements.text}',
    icon: '&#xe61d;',
    '@:{shared.props}': sharedProps,
    '@:{get.shared.props}': getSahredProps,
    '@:{modifier}': Enum['@:{enum#modifier.width}'] |
        Enum['@:{enum#modifier.height}'] |
        Enum['@:{enum#modifier.rotate}'] |
        Enum['@:{enum#modifier.nomask}'] |
        Enum['@:{enum#modifier.inputext}'],
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    // '@:{update.props}'(props: Report.StageElementProps,
    //     actions: Report.StageElementPropsUpdateActions) {
    //     let cp = actions && actions['@:{pctrl#changed.props}'];
    //     let { text, autoMatch, width, height } = props;
    //     if (text &&
    //         autoMatch &&
    //         cp && (cp['@:{size}'] ||
    //             cp.width ||
    //             cp.height ||
    //             cp.fontfamily ||
    //             cp.lineheight ||
    //             cp.letterspacing ||
    //             cp.autoMatch ||
    //             cp.text)) {
    //         let step = Const["@:{const#unit.step}"](),
    //             min = Const['@:{const#to.unit}'](10),
    //             max = Const['@:{const#to.unit}'](500),
    //             unit = State.get<string>('@:{global#stage.unit}');
    //         let searches;
    //         if (fsUnitCache.has(unit)) {
    //             searches = fsUnitCache.get(unit);
    //         } else {
    //             searches = [];
    //             while (min < max) {
    //                 searches.push(min);
    //                 min += step;
    //             }
    //             fsUnitCache.set(unit, searches);
    //         }
    //         let pxWidth = Const['@:{const#to.px}'](width),
    //             pxHeight = Const['@:{const#to.px}'](height);
    //         let size = GenericProvider['@:{generic#measure.fitted.text.size}'](props, searches, pxWidth, pxHeight);
    //         props.fontsize = size;
    //     }
    // },
    /**
     * 是否可以在设计区通过双击展示输入框，绑定数据后，不可以双击输入
     * @param param0 文本属性
     * @returns 是否可展示输入框
     */
    '@:{can.show.text}'({ bind }) {
        return !bind.id;
    },
    '@:{get.props}'(x, y) {
        let shared = getSahredProps(x, y, 200, 25);
        return {
            ...shared,
            text: '',
            locked: false,
            print: 'each',
            format: '',
            bind: {},
            link: '',
            target: 'tab',
            winWidth: 500,
            winHeight: 500,
            help: 'github.com/xinglie/report-designer/issues/31',
        };
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.width}'](),
        DesignerProvider['@:{designer#shared.props.height}'](0),
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.rotate}'],
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.print.options}'],
        DesignerProvider['@:{designer#shared.props.bind.spliter}'], {
            tip: '@:{lang#props.text.content}',
            key: 'text',
            type: Enum["@:{enum#prop.text.area}"],
            //'@:{dock.top}': 1,
            json: 1,
            '@:{if.show}'({ bind }) {
                return !bind.id;
            }
        }, {
            type: Enum["@:{enum#prop.spliter}"],
            '@:{if.show}'({ text }) {
                return !text &&
                    config('getFieldUrl')/* &&
                !props.autoMatch*/;
            }
        }, {
            tip: '@:{lang#props.bind.fields}',
            key: 'bind',
            type: Enum["@:{enum#prop.bind.field}"],
            json: 1,
            max: 1,
            '@:{if.show}'({ text }) {
                return !text &&
                    config('getFieldUrl') /*&&
                !props.autoMatch*/;
            }
        }, {
            tip: '@:{lang#props.format}',
            key: 'format',
            type: Enum["@:{enum#prop.format}"],
            json: 1,
            '@:{if.show}'({ bind }) {
                return bind.id;
            }
        },
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.richtext}', 'richText'),
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.auto.height}', 'autoHeight'),
        DesignerProvider['@:{designer#shared.props.boolean}']('@:{lang#props.only.display}', 'display'),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        ...sharedProps,
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
    batches: ['width', 'height', 'alpha', 'rotate', '-', 'print', '-', 'richText', 'autoHeight', 'fontsize', 'fontfamily', 'lineheight', 'letterspacing', 'background', 'forecolor', '@:{batches#style}', '@:{batches#align}', '@:{batches#unicolor}', '-', 'borderwidth', 'bordercolor', 'bordertype', '-', 'link', 'target', 'winWidth', 'winHeight']
});