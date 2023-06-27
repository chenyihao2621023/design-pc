/**
 * 设计元素通用属性
 */
import Magix from 'magix5';
import Const from '../designer/const';
import Enum from '../designer/enum';
import Transform from '../designer/transform';
let { Cache, config } = Magix;
let propCache = new Cache();
let pnumber = {
    '@:{is.scale.and.unit.field}': 1,
    fixed: () => Const["@:{const#unit.fixed}"](),
    step: () => Const["@:{const#unit.step}"](),
    read: Transform['@:{transform#to.show.value}'],
    write: Transform['@:{transform#to.real.value}'],
    type: Enum["@:{enum#prop.number}"],
    json: 1
}, x = {
    ...pnumber,
    tip: '@:{lang#props.x}',//名称
    key: 'x',//属性中参与当前交互数据的key
}, y = {
    ...pnumber,
    tip: '@:{lang#props.y}',
    key: 'y',
}, width = (w = 0, maxW = Const['@:{const#page.max.width}']) => {
    let key = `w${w}_${maxW}`;
    let dest;
    if (propCache.has(key)) {
        dest = propCache.get(key);
    } else {
        dest = {
            ...pnumber,
            tip: '@:{lang#props.width}',
            key: 'width',
            min: () => Const['@:{const#to.unit}'](w),
            max: () => Const['@:{const#to.unit}'](maxW)
        };
        propCache.set(key, dest);
    }
    return dest;
}, height = (h = 0, maxH = Const['@:{const#page.max.height}']) => {
    let key = `h${h}_${maxH}`;
    let dest;
    if (propCache.has(key)) {
        dest = propCache.get(key);
    } else {
        dest = {
            ...pnumber,
            tip: '@:{lang#props.height}',
            key: 'height',
            min: () => Const['@:{const#to.unit}'](h),
            max: () => Const['@:{const#to.unit}'](maxH)
        };
        propCache.set(key, dest);
    }
    return dest;
}, fBoolean = (tip, key) => {
    let k = `b${tip}_${key}`;
    let dest;
    if (propCache.has(k)) {
        dest = propCache.get(k);
    } else {
        dest = {
            tip,
            key,
            type: Enum['@:{enum#prop.boolean}'],
            json: 1
        };
        propCache.set(k, dest);
    }
    return dest;
}, fColor = (tip, key, alpha = 0, clear = 0) => {
    let k = `c${tip}_${key}_${alpha}_${clear}`;
    let dest;
    if (propCache.has(k)) {
        dest = propCache.get(k);
    } else {
        dest = {
            tip,
            key,
            alpha,
            clear,
            type: Enum["@:{enum#prop.color}"],
            json: 1,
        };
        propCache.set(k, dest);
    }
    return dest;
}, fontfamily = (key = 'fontfamily') => {
    let k = `ff${key}`;
    let dest;
    if (propCache.has(k)) {
        dest = propCache.get(k);
    } else {
        dest = {
            tip: '@:{lang#props.font.family}',
            key,
            type: Enum["@:{enum#prop.collection}"],
            items: Const["@:{const#font.family}"],
            json: 1
        };
        propCache.set(k, dest);
    }
    return dest;
}, letterSpacing = (key = 'letterspacing') => {
    let k = `ls${key}`;
    let dest;
    if (propCache.has(k)) {
        dest = propCache.get(k);
    } else {
        dest = {
            ...pnumber,
            key,
            tip: '@:{lang#props.letter.spacing}',
            min: 0,
        };
        propCache.set(k, dest);
    }
    return dest;
}, fontsize = (min = 0, max = 0, key = 'fontsize',) => {
    let k = `fs${key}_${min}_${max}`;
    let dest;
    if (propCache.has(k)) {
        dest = propCache.get(k);
    } else {
        dest = {
            ...pnumber,
            tip: '@:{lang#props.font.size}',
            min: () => Const['@:{const#to.unit}'](min),
            key,
        };
        if (max) {
            dest.max = () => Const['@:{const#to.unit}'](max);
        }
        propCache.set(k, dest);
    }
    return dest;
}, alpha = {
    tip: '@:{lang#props.alpha}',
    key: 'alpha',
    type: Enum["@:{enum#prop.number}"],
    step: 0.01,
    fixed: 2,
    min: 0,
    max: 1,
    json: 1
}, rotate = {
    tip: '@:{lang#props.rotate}',
    type: Enum["@:{enum#prop.number}"],
    key: 'rotate',
    min: -360,
    max: 360,
    json: 1
}, spliter = {
    type: Enum["@:{enum#prop.spliter}"],
}, borderType = (tip = '@:{lang#props.border.type}') => {
    let k = `bt${tip}`;
    let dest;
    if (propCache.has(k)) {
        dest = propCache.get(k);
    } else {
        dest = {
            tip,
            key: 'bordertype',
            type: Enum["@:{enum#prop.collection}"],
            items: Const['@:{const#border.types}'],
            json: 1
        };
        propCache.set(k, dest);
    }
    return dest;
}, borderdeed = {
    tip: '@:{lang#props.table.cell.border.deed}',
    key: 'borderdeed',
    type: Enum["@:{enum#prop.collection}"],
    items: Const['@:{const#border.deeds}'],
    json: 1
}, bindSpliter = {
    type: Enum["@:{enum#prop.spliter}"],
    '@:{if.show}'({ bind }) {
        return !bind.id;
    }
}, dataSourceSpliter = {
    type: Enum["@:{enum#prop.spliter}"],
    '@:{if.show}'() {
        return config('getFieldUrl');
    }
}, printOptions = {
    tip: '@:{lang#props.print.options}',
    type: Enum['@:{enum#prop.collection}'],
    key: 'print',
    items: Const['@:{const#print.options}'],
    json: 1,
}, help = {
    tip: '@:{lang#props.help}',
    type: Enum["@:{enum#prop.link}"],
    key: 'help'
}, link = {
    tip: '@:{lang#props.link}',
    key: 'link',
    type: Enum["@:{enum#prop.text.area}"],
    json: 1,
}, target = {
    tip: '@:{lang#props.link.target}',
    key: 'target',
    type: Enum['@:{enum#prop.collection}'],
    json: 1,
    items: [{
        text: '@:{lang#props.link.target.tab}',
        value: 'tab'
    }, {
        text: '@:{lang#props.link.target.self}',
        value: 'self'
    }, {
        text: '@:{lang#props.link.target.win}',
        value: 'win'
    }]
}, winWidth = {
    ...pnumber,
    min: 0,
    tip: '@:{lang#props.link.win.width}',
    key: 'winWidth',
    '@:{if.show}'({ target }) {
        return target == 'win';
    }
}, winHeight = {
    ...pnumber,
    min: 0,
    tip: '@:{lang#props.link.win.height}',
    key: 'winHeight',
    '@:{if.show}'({ target }) {
        return target == 'win';
    }
}, ename = {
    tip: '@:{lang#props.title}',
    key: 'ename',
    type: Enum["@:{enum#prop.text.input}"],
    json: 1
}, locked = {
    tip: '@:{lang#props.locked}',
    key: 'locked',
    type: Enum["@:{enum#prop.boolean}"],
    free: true,
    json: 1
}, ow = {
    tip: '@:{lang#props.official.website}',
    key: 'ow',
    type: Enum["@:{enum#prop.link}"]
}, bind = (max = 1) => {
    let key = `b${max}`;
    let dest;
    if (propCache.has(key)) {
        dest = propCache.get(key);
    } else {
        dest = {
            tip: '@:{lang#props.bind.fields}',
            key: 'bind',
            type: Enum["@:{enum#prop.bind.field}"],
            json: 1,
            max,
            '@:{if.show}'() {
                return config('getFieldUrl');
            }
        }
        propCache.set(key, dest);
    }
    return dest;
}, bindRoost = (...tips: string[]) => {
    let key = `br${tips.join('-')}`;
    let dest;
    if (propCache.has(key)) {
        dest = propCache.get(key);
    } else {
        dest = {
            tip: '@:{lang#props.bind.fields}',
            key: 'bind',
            type: Enum["@:{enum#prop.bind.roost}"],
            json: 1,
            tips,
            '@:{if.show}'() {
                return config('getFieldUrl');
            }
        }
        propCache.set(key, dest);
    }
    return dest;
}, animations = {
    json: 1,
    key: 'animations',
    // '@:{json.encode}'(dest, { animations }) {
    //     if (animations?.length) {
    //         dest.animations = animations;
    //     }
    // }
}, labelWidth = {
    tip: '@:{lang#props.width}',
    key: 'width',
    read: Transform["@:{transform#to.show.value}"],
    type: Enum["@:{enum#prop.label}"],
    json: 1
}, labelHeight = {
    tip: '@:{lang#props.height}',
    key: 'height',
    read: Transform["@:{transform#to.show.value}"],
    type: Enum["@:{enum#prop.label}"],
    json: 1
}, scaleLabelHeight = {
    '@:{is.scale.and.unit.field}': 1,
    ...labelHeight,
}, svgWidth = {
    key: 'width',
    read: Transform["@:{transform#to.show.value}"],
    json: 1
}, svgHeight = {
    key: 'height',
    read: Transform["@:{transform#to.show.value}"],
    json: 1
}, svgLineWidth = {
    ...pnumber,
    tip: '@:{lang#props.line.width}',
    key: 'linewidth',
    min: () => 0,
    max: () => Const["@:{const#to.unit}"](20),
}, svgColor = fColor('@:{lang#props.line.color}', 'color'), svgDash = {
    ...pnumber,
    tip: '@:{lang#props.line.dash}',
    key: 'dash',
    min: () => 0,
    max: () => Const["@:{const#to.unit}"](20),
}, svgCap = fBoolean('@:{lang#props.line.cap}', 'cap'), svgFillColor = fColor('@:{lang#props.fill.color}', 'fillcolor', 1, 1), svgClosed = fBoolean('@:{lang#props.closed}', 'closed'), tfs = {
    key: 'tfs',
    '@:{is.scale.and.unit.field}': 1,
}, borderWidth = {
    ...pnumber,
    tip: '@:{lang#props.border.width}',
    key: 'borderwidth',
    min: 0,
    max: () => Const["@:{const#to.unit}"](10),
}, lineJoin = {
    tip: '@:{lang#props.line.join}',
    key: 'linejoin',
    json: 1,
    type: Enum['@:{enum#prop.collection}'],
    items: [{
        text: '@:{lang#props.line.join.miter}',
        value: 'meter'
    }, {
        text: '@:{lang#props.line.join.bevel}',
        value: 'bevel'
    }, {
        text: '@:{lang#props.line.join.round}',
        value: 'round'
    }]
};
let moveProps = [{
    key: 'x',
    use: 'x'
}, {
    key: 'y',
    use: 'y'
}];
export default {
    /**
     * 可移动属性
     */
    '@:{designer#shared.move.props}': moveProps,
    /**
     * x设计属性
     */
    '@:{designer#shared.props.x}': x,
    /**
     * y设计属性
     */
    '@:{designer#shared.props.y}': y,
    /**
    * width设计属性
    */
    '@:{designer#shared.props.width}': width,
    /**
     * height设计属性
     */
    '@:{designer#shared.props.height}': height,
    /**
    * label width设计属性
    */
    '@:{designer#shared.props.label.width}': labelWidth,
    /**
     * label height设计属性
     */
    '@:{designer#shared.props.label.height}': labelHeight,
    /**
     * scale label height设计属性
     */
    '@:{designer#shared.props.scale.label.height}': scaleLabelHeight,
    /**
    * svg width设计属性
    */
    '@:{designer#shared.props.svg.width}': svgWidth,
    /**
     * svg height设计属性
     */
    '@:{designer#shared.props.svg.height}': svgHeight,
    /**
     * svg line width设计属性
     */
    '@:{designer#shared.props.svg.line.width}': svgLineWidth,
    /**
     * svg color设计属性
     */
    '@:{designer#shared.props.svg.color}': svgColor,
    /**
     * svg dash设计属性
     */
    '@:{designer#shared.props.svg.dash}': svgDash,
    /**
     * svg cap设计属性
     */
    '@:{designer#shared.props.svg.cap}': svgCap,
    /**
     * svg fill color设计属性
     */
    '@:{designer#shared.props.svg.fill.color}': svgFillColor,
    /**
     * svg closed设计属性
     */
    '@:{designer#shared.props.svg.closed}': svgClosed,
    /**
    * number设计属性
    */
    '@:{designer#shared.props.partial.number}': pnumber,
    /**
    * x设计属性
    */
    '@:{designer#shared.props.alpha}': alpha,
    /**
     * rotate设计属性
     */
    '@:{designer#shared.props.rotate}': rotate,
    /**
     * spliter设计属性
     */
    '@:{designer#shared.props.spliter}': spliter,
    /**
     * bind spliter设计属性
     */
    '@:{designer#shared.props.bind.spliter}': bindSpliter,
    /**
     * data source spliter设计属性
     */
    '@:{designer#shared.props.data.source.spliter}': dataSourceSpliter,
    /**
     * 打印设计属性
     */
    '@:{designer#shared.props.print.options}': printOptions,
    /**
     * ow设计属性
     */
    '@:{designer#shared.props.ow}': ow,
    /**
     * help设计属性
     */
    '@:{designer#shared.props.help}': help,
    /**
     * ename设计属性
     */
    '@:{designer#shared.props.ename}': ename,
    /**
     * link设计属性
     */
    '@:{designer#shared.props.link}': link,
    /**
     * target设计属性
     */
    '@:{designer#shared.props.target}': target,
    /**
     * win.width设计属性
     */
    '@:{designer#shared.props.win.width}': winWidth,
    /**
     * win.height设计属性
     */
    '@:{designer#shared.props.win.height}': winHeight,
    /**
    * locked设计属性
    */
    '@:{designer#shared.props.locked}': locked,
    /**
    * animations设计属性
    */
    '@:{designer#shared.props.animations}': animations,
    /**
    * bind设计属性
    */
    '@:{designer#shared.props.bind}': bind,
    /**
    * bind设计属性
    */
    '@:{designer#shared.props.bind.roost}': bindRoost,
    /**
    * boolean设计属性
    */
    '@:{designer#shared.props.boolean}': fBoolean,
    /**
    * color设计属性
    */
    '@:{designer#shared.props.color}': fColor,
    /**
    * fontfamily设计属性
    */
    '@:{designer#shared.props.fontfamily}': fontfamily,
    /**
    * letter spacing设计属性
    */
    '@:{designer#shared.props.letter.sapcing}': letterSpacing,
    /**
    * fontsize设计属性
    */
    '@:{designer#shared.props.fontsize}': fontsize,
    /**
    * tfs设计属性
    */
    '@:{designer#shared.props.tfs}': tfs,
    /**
    * border type设计属性
    */
    '@:{designer#shared.props.border.type}': borderType,
    /**
    * border deed设计属性
    */
    '@:{designer#shared.props.border.deed}': borderdeed,
    /**
    * border width设计属性
    */
    '@:{designer#shared.props.border.width}': borderWidth,
    /**
    * line join设计属性
    */
    '@:{designer#shared.props.svg.line.join}': lineJoin,
}