import Magix from "magix";
import Enum from './enum';
let { State } = Magix;
let { round, pow, abs } = Math;
let body = document.body;
//趋近0的数，这里认为小数点后7个0即为0
let approachZero = 1e-7;

let unitDecimals = {//单位对应的小数位置，一般来讲越多越准确，但也不益过大
    px: 0,
    mm: 2,
    cm: 3,
    pt: 2,
    in: 3,
    pc: 3,
    q: 1,
};
let unitPools = {//单位转换对象池
    px: {
        '@:{unit-pools#px.to.unit}': 1,
        '@:{unit-pools#unit.to.px}': 1,
        //'@:{unit-pools#aberration}': 0
    }
};
/**
 * 转换成相应的单位数字，避免出现如1.3333333334这样的情况
 * @param v 待处理的数字
 * @param l 小数位
 * @param unit 单位
 * @returns 处理后的数字
 */
// let scaleToUnit = (v, l?, unit?) => {
//     unit = unit || State.get('@:{global#stage.unit}');
//     if (l == null) {
//         l = unitDecimals[unit];
//     }
//     let s = pow(10, l);
//     v *= s;
//     return (round(v) / s);
// };
/**
 * 准备单位转换的规则
 * @param unit 单位
 */
let prepareUnit = unit => {
    if (!unitPools[unit]) {//只处理一次
        if (DEBUG &&
            !unit) {//开发模式下检查传入的unit参数，如果不存在就报错
            throw new Error('unset unit:' + unit);
        }
        let temp = document.createElement('div');
        let enlarge = 1e3;//1000即可，浏览器显示cm或mm单位时有上限，不宜过大
        temp.style.cssText = `width:${enlarge}${unit};position:absolute;left:-${enlarge}${unit};top:-10px`;
        body.appendChild(temp);
        let width = temp.offsetWidth;
        body.removeChild(temp);
        let toUnit = enlarge / width;
        let toPx = width / enlarge;
        unitPools[unit] = {//像素转目标单位，即1px=?目标单位
            '@:{unit-pools#px.to.unit}': toUnit,
            //目标单位转像素，即1unit=?px
            '@:{unit-pools#unit.to.px}': toPx,
            //误差，磁吸时使用
            //'@:{unit-pools#aberration}': enlarge - scaleToUnit(enlarge * toUnit, null, unit) * toPx
        };
    }
};
let toPx = (v, unit?: string) => {//把需求单位转成px
    unit = unit || State.get('@:{global#stage.unit}');
    prepareUnit(unit);
    let dest = unitPools[unit];
    //结果不要转整数，svg的点需要小数，否则显示会不精准
    return v * dest['@:{unit-pools#unit.to.px}'];
};
let unitAberration = (unit?: string) => {
    unit = unit || State.get('@:{global#stage.unit}');
    let decimals = unitDecimals[unit];
    return 1 / pow(10, decimals);
};
/**
 * 常量配置表
 */
/**
 * 本项目力求最少的资源承载最复杂的需求，因此性能至高无上
 * 如果像元素投影或拖动吸附对齐等功能不需要，可以关闭以确保性能更优
 * 以下配置项中，//[!]表示会影响性能，如果对性能有更高的要求可以酌情关闭或调小数值
 * !的多少表示对性能的影响，越多表示越有可能影响性能
 */
export default {
    '@:{const#history.max.count}': 50,//[!]历史记录最大值，多的则删除
    '@:{const#hisotry.save.continous.delay}': 800,//相同类型的历史记录间断多少毫秒后记录，比如通过键盘移动元素，并非每次移动均记录，只有松开按键超过800ms后才记录
    '@:{const#random.examples}': DEBUG || !APPROVE ? 1 : 0,//进入设计器在配置模板的情况下，是否随机显示一个示例，1打开0关闭
    '@:{const#show.help.and.ow.links}': DEBUG || !APPROVE ? 1 : 0,//是否展示相关的帮助和官方网站链接，1打开0关闭
    '@:{const#save.can.use.native.file}': 1,//是否支持从本机保存和读取文件，1打开0关闭
    '@:{const#save.can.show.stage.content}': 1,//是否支持显示设计区内容，1打开0关闭
    '@:{const#support.help}': 1,//能否使用快捷键对话框和帮助链接，1打开0关闭
    '@:{const#support.theme}': 1,//是否支持在线换肤，1打开0关闭
    '@:{const#support.axis.help.line}': 1,//是否支持标尺的辅助线
    '@:{const#clear.copy.list.when.cut.action}': 1,//使用剪切时，每次剪切、粘贴完成后，是否清除剪切板中的复制元素，1打开0关闭
    '@:{const#stage.scale}': 1,//默认编辑区的缩放，配置的数值为0.5-4之间(包含)，且为0.5的倍数
    '@:{const#stage.padding}': [80, 450, 220, 240],//设计区外围灰色区域，上、右、下、左，px单位
    '@:{const#stage.auto.center}': 1,//设计区是否自动滚动到页面中间，1打开0关闭
    '@:{const#stage.auto.scale.when.change}': 1,//[!]切换示例或加载内容时，是否自动计算缩放比例
    '@:{const#stage.wheel.zoom}': 1,//是否支持按下ctrl+鼠标滚轮缩放设计区。1打开0关闭
    '@:{const#stage.hook.wheel.event}': 1,//[!]是否拦截设计区wheel事件,1拦截0关闭，拦截事件后，滚动并不是原生，可能不平滑，好处是标尺可以和滚动区域完全一致，否则标尺数字指示的位置可能和滚动区域出现延迟
    '@:{const#page.width}': 793,//默认编辑区的宽度，px单位
    '@:{const#page.height}': 1122,//默认编辑区的高度，px单位
    '@:{const#page.max.width}': 10000,//[!!]最大宽度，px单位
    '@:{const#page.max.height}': 10000,//[!!]最大高度，px单位
    '@:{const#page.min.width}': 80,//[!!]最小宽度，px单位
    '@:{const#page.min.height}': 80,//[!!]最小高度，px单位
    '@:{const#move.near.side.area}': 20,//拖动时，四边边框响应贴边滚动的尺寸，px单位
    '@:{const#move.near.step}': 5,//拖动时，自动滚动步辐，px单位
    '@:{const#page.enable.snap.align.elements}': 1,//[!!!]是否启用拖动对齐功能
    '@:{const#page.follow.snap.align.elements}': Enum["@:{enum#follow.align.selected}"],//[!!!!]拖动多个元素时，非鼠标下的元素是否启用跟随吸附对齐
    //对齐点　默认4条线中间点，元素中间点，4个拐角
    '@:{const#align.points}': Enum["@:{enum#align.centers}"] | Enum["@:{enum#align.line.coners}"],
    '@:{const#align.svg.points}': 0,//是否开启svg点对齐
    '@:{const#align.svg.self.points}': 1,//是否开启svg自身点对齐
    '@:{const#contextmenu.paste.exactly.source.position}': 0,//右键粘贴时，是否强制粘贴的位置和鼠标复制时的位置一致，1打开0关闭
    '@:{const#page.grid.width}': 20,//默认网格宽
    '@:{const#page.grid.height}': 20,//网格高
    '@:{const#page.grid.max.width}': 60,//网格最大宽
    '@:{const#page.grid.max.height}': 60,//最大高
    '@:{const#page.grid.min.width}': 10,//最小宽
    '@:{const#page.grid.min.height}': 10,//最小高

    '@:{const#wheel.delay.time}': 200,//通过按下ctrl加鼠标滚轮缩放设计区时延迟时间，越小越灵敏
    '@:{const#axis.size}': 20,//标尺尺寸，即宽或高，px单位
    '@:{const#axis.show.shadow}': 1,//[!!!]标尺上是否显示选中元素的投影，1打开0关闭
    '@:{const#scale.max}': 4,//最大缩放值，不要超过4
    '@:{const#scale.min}': 0.5,//最小缩放值，不要小于0.5
    '@:{const#scale.step}': 0.5,//每次缩放增加值 0.5的倍数
    '@:{const#scale.fast.increase}': 1,//快速放大
    '@:{const#scale.slow.decrease}': 0.25,//缓慢缩小
    '@:{const#support.snapshot}': SCENE_LABEL,//是否支持快照
    '@:{const#auto.save}': APPROVE ? 1 : 0,//保存菜单是否展示自动保存，1打开0关闭
    '@:{const#auto.save.debouce.duration}': 1000,//自动保存时，多少时间内的保存忽略，避免频繁保存

    '@:{const#new.page.print}': 0,//预览时，是否新开浏览器tab页展示打印页面，1为新开，0为在设计区使用自定义对话框显示打印页面
    '@:{const#viewer.try.send.times}': 120,//尝试向预览页面发送数据时，重试次数
    '@:{const#viewer.try.send.interval}': 500,//重试间隔，120*500=60*1000ms
    '@:{const#keyboard.move.step}': 1,//使用键盘每次移动的距离，px单位
    '@:{const#keyboard.with.shift.move.step}': 10,//按下shift时，每次移动的距离，px单位
    '@:{const#keyboard.rotate.step}': 1,//使用键盘旋转角度，每次旋转多少
    '@:{const#keyboard.with.shift.rotate.step}': 5,//按下shift时，每次旋转角度
    '@:{const#drag.snap.to.other.element.offset}': 8,//拖动时，距离其它元素的吸附线小于该值时，则进行吸附，px单位
    '@:{const#drag.snap.degree}': 45,//拖动旋转时，在45倍数附近进行吸附
    '@:{const#drag.snap.degree.offset}': 4,//拖动旋转，在45倍数角度附近多少时，自动调整到45倍数的角度上
    '@:{const#support.readonly.element}': 1,//[!!!]是否支持只读元素，如果对性能有要求且不需要只读元素，则可以关闭该项,1打开0关闭
    '@:{const#support.panels.hide.when.nearside}': 1,//面板是否支持贴边隐藏，1打开0关闭
    '@:{const#element.same.position.offset}': 10,//元素粘贴，同位置时偏移量，防止重叠在一起，px单位
    //'@:{const#data.source.panel.tree.view}': 1,//数据源面板是否使用树形展示，1打开0关闭，该功能已下线，后续不再维护
    '@:{const#element.min.px.size}': 3,//元素对齐时最小尺寸，比如宽度小于3px，则只进行左侧对齐
    '@:{const#element.dblclick.interval.ms.time}': 200,//元素双击间隔毫秒时间
    '@:{const#panels.prop.show.group}': 0,//[!]属性面板是否对属性进行分组展示，1打开0关闭
    '@:{const#panels.prop.auto.scroll.top}': 3,//属性面板在内容改变时，是否自动滚动到顶部,0禁止滚动，1仅编辑区与元素之间切换时滚动，2仅元素之间切换时滚动，4同类型元素之间切换也滚动　3=1|2 7=1|2|4
    '@:{const#panels.tree.show.icon}': 1,//组件树面板是否展示icon
    '@:{const#element.auto.show.icon.less.than}': 12,//小于多少像素时元素自动展示icon
    '@:{const#element.show.normal.outline}': 1,//设计元素普通状态下是否展示边框线
    //常用字体集合
    '@:{const#font.family}': [{
        "value": 'simsun',
        "style": "font-family:simsun",
        "text": '@:{lang#font.simsun}'
    }, {
        "value": 'simhei',
        "style": "font-family:simhei",
        "text": '@:{lang#font.simhei}'
    }, {
        value: 'microsoft yahei',
        style: 'font-family:microsoft yahei',
        text: '@:{lang#font.microsoft.yahei}'
    }, {
        "value": "kaiti",
        "style": "font-family:kaiti",
        "text": "@:{lang#font.kaiti}"
    }, {
        "value": "fangsong",
        "style": "font-family:fangsong",
        "text": "@:{lang#font.fangsong}"
    }, {
        "value": "lisu",
        "style": "font-family:lisu",
        "text": "@:{lang#font.lisu}"
    }, {
        "value": "times new roman",
        "style": "font-family:times new roman",
        "text": "Times New Roman"
    }, {
        "value": "tahoma",
        "style": "font-family:tahoma",
        "text": "Tahoma"
    }, {
        "value": "manrope",
        "style": "font-family:manrope",
        "text": "Manrope"
    }, {
        "value": "monospace",
        "style": "font-family:monospace",
        "text": "Monospace"
    }, {
        "value": "fantasy",
        "style": "font-family:fantasy",
        "text": "Fantasy"
    }, {
        "value": "cursive",
        "style": "font-family:cursive",
        "text": "Cursive"
    }, {
        "value": "kano",
        "style": "font-family:kano",
        "text": "Kano"
    }, {
        "value": "pingfang sc",
        "text": "@:{lang#font.pingfang.sc}",
        "style": "font-family:pingfang sc"
    }, {
        "value": "stheiti",
        "text": "@:{lang#font.stheiti}",
        "style": "font-family:stheiti"
    }, {
        "value": "stxihei",
        "text": "@:{lang#font.stxihei}",
        "style": "font-family:stxihei"
    }, {
        "value": "stkaiti",
        "text": "@:{lang#font.stkaiti}",
        "style": "font-family:stkaiti"
    }, {
        "value": "stsong",
        "text": "@:{lang#font.stsong}",
        "style": "font-family:stsong"
    }, {
        "value": "stfangsong",
        "text": "@:{lang#font.stfangsong}",
        "style": "font-family:stfangsong"
    }, {
        "value": "stzhongsong",
        "text": "@:{lang#font.stzhongsong}",
        "style": "font-family:stzhongsong"
    }, {
        "value": "sthupo",
        "text": "@:{lang#font.sthupo}",
        "style": "font-family:sthupo"
    }, {
        "value": "stxinwei",
        "text": "@:{lang#font.stxinwei}",
        "style": "font-family:stxinwei"
    }, {
        "value": "stliti",
        "text": "@:{lang#font.stliti}",
        "style": "font-family:stliti"
    }, {
        "value": "stxingkai",
        "text": "@:{lang#font.stxingkai}",
        "style": "font-family:stxingkai"
    }, {
        "value": "hiragino sans gb",
        "text": "@:{lang#font.hiragino.sans.gb}",
        "style": "font-family:hiragino sans gb"
    }, {
        "value": "lantinghei sc",
        "text": "@:{lang#font.lantinghei.sc}",
        "style": "font-family:lantinghei sc"
    }, {
        "value": "hanzipen sc",
        "text": "@:{lang#font.hanzipen.sc}",
        "style": "font-family:hanzipen sc"
    }, {
        "value": "hannotate sc",
        "text": "@:{lang#font.hannotate.sc}",
        "style": "font-family:hannotate sc"
    }, {
        "value": "songti sc",
        "text": "@:{lang#font.songti.sc}",
        "style": "font-family:songti sc"
    }, {
        "value": "wawati sc",
        "text": "@:{lang#font.wawati.sc}",
        "style": "font-family:wawati sc"
    }, {
        "value": "weibei sc",
        "text": "@:{lang#font.weibei.sc}",
        "style": "font-family:weibei sc"
    }, {
        "value": "xingkai sc",
        "text": "@:{lang#font.xingkai.sc}",
        "style": "font-family:xingkai sc"
    }, {
        "value": "yuanti sc",
        "text": "@:{lang#font.yuanti.sc}",
        "style": "font-family:yuanti sc"
    }
    ],
    '@:{const#border.types}': [{//边框类型
        text: '@:{lang#props.border.type.solid}',
        value: 'solid'
    }, {
        text: '@:{lang#props.border.type.dotted}',
        value: 'dotted'
    }, {
        text: '@:{lang#props.border.type.dashed}',
        value: 'dashed'
    }, {
        text: '@:{lang#props.border.type.ridge}',
        value: 'ridge'
    }, {
        text: '@:{lang#props.border.type.double}',
        value: 'double'
    }],
    '@:{const#border.deeds}': [{//边框行为
        text: '@:{lang#props.table.cell.border.collapse}',
        value: 'collapse'
    }, {
        text: '@:{lang#props.table.cell.border.separate}',
        value: 'separate'
    }],
    '@:{const#print.options}': [{//打印选项配置
        text: '@:{lang#print.each.page}',
        value: 'each'
    }, {
        text: '@:{lang#print.first}',
        value: 'first'
    }, {
        text: '@:{lang#print.last}',
        value: 'last'
    }, {
        text: '@:{lang#print.odd}',
        value: 'odd'
    }, {
        text: '@:{lang#print.even}',
        value: 'even'
    }],
    //以下用于切换默认单位，目前默认是mm，仅支持px cm q in mm pt pc这7种
    '@:{const#unit}': SCENE_IOT ? 'px' : 'mm',//默认使用的单位
    '@:{const#unit.allow.change}': SCENE_IOT ? 0 : 1,//是否支持转换成其它单位，1打开0关闭
    '@:{const#unit.step}'(unit?: string) {//单位的最小步长，用于属性面板数字控件的调整
        unit = unit || State.get('@:{global#stage.unit}');
        prepareUnit(unit);
        let dest = unitPools[unit];
        return dest['@:{unit-pools#px.to.unit}'];
    },
    '@:{const#unit.fixed}'(unit?: string) {//小数位，px单位就不使用小数，mm单位可以使用1或2位小数
        unit = unit || State.get('@:{global#stage.unit}');
        return unitDecimals[unit];
    },
    '@:{const#scale.to.unit}'(v: number, l?: number, unit?: string) {
        unit = unit || State.get('@:{global#stage.unit}');
        if (l == null) {
            l = unitDecimals[unit];
        }
        let s = pow(10, l);
        v *= s;
        return (round(v) / s);
    },
    /**
     * 把像素转为目标单位
     * @param v 待转换数值
     * @param unit 目标单位
     * @returns 转换后的数值
     */
    '@:{const#to.unit}'(v: number, unit?: string) {
        //把系统使用的px单位转成相应的需求单位
        unit = unit || State.get('@:{global#stage.unit}');
        prepareUnit(unit);
        let dest = unitPools[unit];
        v *= dest['@:{unit-pools#px.to.unit}'];
        return v;
    },
    '@:{const#approach.zero}': approachZero,
    '@:{const#great.than.or.approach}'(value, anchor) {
        if (value < anchor) {
            return abs(value - anchor) < approachZero;
        }
        return 1;
    },
    '@:{const#approach}'(v1, v2) {
        return abs(v1 - v2) < approachZero;
    },
    // '@:{const#int.approach.unit}'(v: number, unit?: string) {
    //     let c = unitAberration(unit);
    //     let i = v | 0;
    //     let r = v - i;
    //     if (abs(1 - r) < c) {
    //         i++;
    //     }
    //     return i;
    // },
    '@:{const#to.px}': toPx, //把需求单位转成px
    //'@:{const#unit.aberration}': unitAberration,
    // '@:{const#unit.half.step.aberration}'(unit?: string) {
    //     unit = unit || State.get('@:{global#stage.unit}');
    //     return unitSteps[unit] / 2;
    // },
    '@:{const#unit.px.aberration}'(unit?: string) {
        let aberration = toPx(unitAberration(unit));
        if (aberration > 0.5) {
            aberration = 0.5;
        }
        return aberration;
    },
    /**
     * 转换单位
     * @param v 待转换数值
     * @param toUnit 目标单位
     * @param unit 来源单位
     * @returns 转换后的新单位数值
     */
    '@:{const#unit.to.unit}'(v: number, toUnit: string, unit?: string) {
        unit = unit || State.get('@:{global#stage.unit}');
        prepareUnit(unit);
        prepareUnit(toUnit);
        let from = unitPools[unit],
            to = unitPools[toUnit];
        return v * from['@:{unit-pools#unit.to.px}'] * to['@:{unit-pools#px.to.unit}'];
    }
};