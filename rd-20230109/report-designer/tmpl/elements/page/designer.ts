/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import I18n from '../../i18n/index';
import CellProvider from '../../provider/cell';
import DesignerProvider from '../../provider/designer';
let { config, State, toMap } = Magix;
let { round } = Math;
let papers = [{
    text: 'A1',
    value: '2245x3178'
}, {
    text: 'A2',
    value: '1587x2245'
}, {
    text: 'A3',
    value: '1122x1587'
}, {
    text: 'A4',
    value: '793x1122'
}, {
    text: 'A5',
    value: '559x793'
}, {
    text: 'A6',
    value: '396x559'
}, {
    text: 'A7',
    value: '277x396'
}, {
    text: 'B1',
    value: '2672x3779'
}, {
    text: 'B2',
    value: '1889x2672'
}, {
    text: 'B3',
    value: '1334x1889'
}, {
    text: 'B4',
    value: '944x1334'
}, {
    text: 'B5',
    value: '665x944'
}, {
    text: 'B6',
    value: '472x665'
}, {
    text: 'B7',
    value: '332x472'
}, {
    text: 'C1',
    value: '2449x3465'
}, {
    text: 'C2',
    value: '1731x2449'
}, {
    text: 'C3',
    value: '1224x1731'
}, {
    text: 'C4',
    value: '865x1224'
}, {
    text: 'C5',
    value: '612x865'
}, {
    text: 'C6',
    value: '430x612'
}, {
    text: 'C7',
    value: '306x430'
}];
let papersMap = toMap(papers, 'value');
let screens = [{
    text: '1024x600',
    value: '1024x600'
}, {
    text: '1024x768',
    value: '1024x768'
}, {
    text: '1280x1024',
    value: '1280x1024'
}, {
    text: '1600x900',
    value: '1600x900'
}, {
    text: '1440x1550',
    value: '1440x1550'
}, {
    text: '1600x1200',
    value: '1600x1200'
}, {
    text: '1280x800',
    value: '1280x800'
}, {
    text: '1366x768',
    value: '1366x768'
}, {
    text: '1440x900',
    value: '1440x900'
}];
let screensMap = toMap(screens, 'value');
let scaleNumber = {
    type: Enum["@:{enum#prop.number}"],
    step: () => Const["@:{const#unit.step}"](),
    fixed: () => Const["@:{const#unit.fixed}"](),
    '@:{is.scale.and.unit.field}': 1,
    json: 1,
};
let roundToPx = v => round(Const['@:{const#to.px}'](v));
//let hidden = () => false;
let updateComputedProps = page => {
    let { width, height } = page;
    let size = `${roundToPx(width)}x${roundToPx(height)}`;
    page.paper = size;
    page.screen = size;
};
let presetSizeWrite = (v, props) => {
    let [width, height] = v.split('x');
    props.width = Const['@:{const#to.unit}'](width);
    props.height = Const['@:{const#to.unit}'](height);
    updateComputedProps(props);
    State.fire('@:{event#stage.preset.size.change}');
};
export default {
    title: '@:{lang#elements.page}',
    '@:{update.computed.props}': updateComputedProps,
    '@:{get.props}'() {
        let width = Const['@:{const#to.unit}'](Const["@:{const#page.width}"]),
            height = Const['@:{const#to.unit}'](Const["@:{const#page.height}"]);
        let size = width + 'x' + height;
        return {
            width,
            height,
            background: '#fff',
            backgroundImage: '',
            backgroundRepeat: 'no-repeat',
            backgroundWidth: 0,
            backgroundHeight: 0,
            scaleType: 'auto',
            radius: '0% 0% 0% 0%/0% 0% 0% 0%',
            preformat: false,
            copies: 1,
            unit: State.get('@:{global#stage.unit}'),
            readonly: false,
            grid: false,
            snapGrid: true,
            gridWidth: Const['@:{const#to.unit}'](Const["@:{const#page.grid.width}"]),
            gridHeight: Const['@:{const#to.unit}'](Const["@:{const#page.grid.height}"]),
            gridColor: '#c8cdd060',
            paper: size,
            screen: size,
            xOffset: 0,
            yOffset: 0,
            backgroundXOffset: 0,
            backgroundYOffset: 0,
            snap: Const['@:{const#page.enable.snap.align.elements}'] ? true : false,
            pages: 1,
            title: ''
        }
    },
    props: [{
        key: 'readonly',
        json: 1
    }, {
        tip: '@:{lang#props.page.unit}',
        key: 'unit',
        type: Enum['@:{enum#prop.collection}'],
        items: [{
            text: '@:{lang#unit.human.mm}',
            value: 'mm'
        }, {
            text: '@:{lang#unit.human.cm}',
            value: 'cm'
        }, {
            text: '@:{lang#unit.human.px}',
            value: 'px'
        }, {
            text: '@:{lang#unit.human.pt}',
            value: 'pt'
        }, {
            text: '@:{lang#unit.human.in}',
            value: 'in'
        }, {
            text: '@:{lang#unit.human.pc}',
            value: 'pc'
        }, {
            text: '@:{lang#unit.human.q}',
            value: 'q'
        }],
        '@:{if.disabled}'() {
            return Const['@:{const#unit.allow.change}'] ? false : true
        },
    }, {
        ...scaleNumber,
        tip: '@:{lang#props.width}',
        key: 'width',
        min: () => Const['@:{const#to.unit}'](Const['@:{const#page.min.width}']),
        max: () => Const['@:{const#to.unit}'](Const['@:{const#page.max.width}']),
        write(v, page) {
            page.width = v;
            updateComputedProps(page);
        },
    }, {
        ...scaleNumber,
        tip: '@:{lang#props.height}',
        key: 'height',
        min: () => Const['@:{const#to.unit}'](Const['@:{const#page.min.height}']),
        max: () => Const['@:{const#to.unit}'](Const['@:{const#page.max.height}']),
        write(v, page) {
            page.height = v;
            updateComputedProps(page);
        },
    }, {
        tip: '@:{lang#props.pages}',
        key: 'pages',
        type: Enum["@:{enum#prop.number}"],
        min: 1,
        max: 5,
        json: 1,
        '@:{if.show}'() {
            return !SCENE_IOT && !SCENE_LABEL;
        },
    }, {
        tip: '@:{lang#props.page.paper.size}',
        type: Enum["@:{enum#prop.collection}"],
        key: 'paper',
        items({ paper }) {
            let list = papers;
            if (!papersMap[paper]) {
                list = [{
                    text: '@:{lang#custom}',
                    value: paper
                }, ...papers];
            }
            return list;
        },
        write: presetSizeWrite,
    }, DesignerProvider['@:{designer#shared.props.spliter}'], {
        tip: '@:{lang#props.screen.size}',
        key: 'screen',
        type: Enum["@:{enum#prop.collection}"],
        items({ screen }) {
            let list = screens;
            if (!screensMap[screen]) {
                list = [{
                    text: '@:{lang#custom}',
                    value: screen
                }, ...screens];
            }
            return list;
        },
        write: presetSizeWrite,
    }, {
        tip: '@:{lang#props.page.scale}',
        key: 'scaleType',
        json: 1,
        type: Enum["@:{enum#prop.collection}"],
        items: [{
            text: '@:{lang#props.auto}',
            value: 'auto'
        }, {
            text: '@:{lang#props.full}',
            value: 'full'
        }],
    }, DesignerProvider['@:{designer#shared.props.spliter}'], {
        tip: '@:{lang#props.short.radius}',
        type: Enum['@:{enum#prop.collection}'],
        key: 'radius',
        items({ radius }) {
            let fifty = Const['@:{const#scale.to.unit}'](Const['@:{const#to.unit}'](50));
            let unit = State.get('@:{global#stage.unit}');
            let rText = I18n('@:{lang#props.border.radius}');
            let fText = fifty + unit + rText;
            let fValue = `${fifty}${unit} ${fifty}${unit} ${fifty}${unit} ${fifty}${unit}/${fifty}${unit} ${fifty}${unit} ${fifty}${unit} ${fifty}${unit}`;
            let list = [{
                text: '无' + rText,
                value: '0% 0% 0% 0%/0% 0% 0% 0%'
            }, {
                text: '25%' + rText,
                value: '25% 25% 25% 25%/25% 25% 25% 25%'
            }, {
                text: '50%' + rText,
                value: '50% 50% 50% 50%/50% 50% 50% 50%'
            }, {
                text: fText,
                value: fValue
            }];
            let map = toMap(list, 'value');
            if (!map[radius]) {
                list.unshift({
                    text: '@:{lang#custom}',
                    value: radius
                });
            }
            return list;
        },
    }, {
        type: Enum['@:{enum#prop.cell.radius}'],
        key: 'radius',
        '@:{unit.convert}'(dest, toUnit) {
            dest.radius = CellProvider['@:{cell#unit.convert.radius}'](dest.radius, toUnit);
        },
        json: 1,
    }, DesignerProvider['@:{designer#shared.props.spliter}'], {
        tip: '@:{lang#props.print.copies}',
        key: 'copies',
        type: Enum['@:{enum#prop.number}'],
        min: 1,
        max: 20,
        json: 1,
    }, {
        ...scaleNumber,
        tip: '@:{lang#props.x.offset}',
        key: 'xOffset',
    }, {
        ...scaleNumber,
        tip: '@:{lang#props.y.offset}',
        key: 'yOffset',
    },
    DesignerProvider['@:{designer#shared.props.spliter}'], {
        tip: '@:{lang#props.page.title}',
        key: 'title',
        type: Enum['@:{enum#prop.text.input}'],
        json: 1,
    }, {
        tip: '@:{lang#props.element.snap}',
        key: 'snap',
        type: Enum['@:{enum#prop.boolean}'],
        '@:{if.show}'() {
            return Const['@:{const#page.enable.snap.align.elements}'];
        }
    }, {
        tip: '@:{lang#props.page.grid}',
        key: 'grid',
        type: Enum["@:{enum#prop.boolean}"],
    }, {
        ...scaleNumber,
        tip: '@:{lang#props.grid.width}',
        key: 'gridWidth',
        json: 0,
        min: () => Const["@:{const#to.unit}"](Const["@:{const#page.grid.min.width}"]),
        max: () => Const["@:{const#to.unit}"](Const["@:{const#page.grid.max.width}"]),
        '@:{if.show}'({ grid }) {
            return grid;
        }
    }, {
        ...scaleNumber,
        tip: '@:{lang#props.grid.height}',
        key: 'gridHeight',
        json: 0,
        max: () => Const["@:{const#to.unit}"](Const["@:{const#page.grid.max.height}"]),
        min: () => Const["@:{const#to.unit}"](Const["@:{const#page.grid.min.height}"]),
        '@:{if.show}'({ grid }) {
            return grid;
        }
    }, {
        tip: '@:{lang#props.grid.color}',
        key: 'gridColor',
        type: Enum['@:{enum#prop.color}'],
        alpha: 1,
        '@:{if.show}'({ grid }) {
            return grid;
        }
    }, {
        tip: '@:{lang#props.grid.snap}',
        key: 'snapGrid',
        type: Enum['@:{enum#prop.boolean}'],
        alpha: 1,
        '@:{if.show}'({ grid }) {
            return grid;
        }
    },
    DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.background}', 'background', 1), {
        tip: '@:{lang#props.background.image}',
        //dockTop: true,
        key: 'backgroundImage',
        type: Enum["@:{enum#prop.image}"],
        write(v, props, e) {
            props.backgroundWidth = Const['@:{const#to.unit}'](e.width);
            props.backgroundHeight = Const['@:{const#to.unit}'](e.height);
            if (props.preformat &&
                v) {
                props.width = props.backgroundWidth;
                props.height = props.backgroundHeight;
            }
            props.backgroundImage = v;
        },
        '@:{if.show}'() {
            return config('getImageUrl');// && !page.grid;
        },
        json: 1
    }, {
        tip: '@:{lang#props.preformat}',
        key: 'preformat',
        type: Enum['@:{enum#prop.boolean}'],
        json: 1,
        write(v, props) {
            if (v) {
                props.backgroundRepeat = 'no-repeat';
                props.width = props.backgroundWidth;
                props.height = props.backgroundHeight;
            }
            props.preformat = v;
        },
        '@:{if.show}'(props) {
            return props.backgroundImage;
        }
    }, {
        tip: '@:{lang#props.background.repeat}',
        key: 'backgroundRepeat',
        type: Enum["@:{enum#prop.collection}"],
        items: [{
            text: '@:{lang#props.no.repeat}',
            value: 'no-repeat'
        }, {
            text: '@:{lang#props.full}',
            value: 'full'
        }, {
            text: '@:{lang#props.repeat.x}',
            value: 'repeat-x'
        }, {
            text: '@:{lang#props.repeat.y}',
            value: 'repeat-y'
        }, {
            text: '@:{lang#props.repeat}',
            value: 'repeat'
        }],
        '@:{if.show}'({
            backgroundImage,
            preformat
        }) {
            return backgroundImage && !preformat;//&&!page.grid;
        },
        json: 1
    }, {
        ...scaleNumber,
        tip: '@:{lang#props.image.width}',
        key: 'backgroundWidth',
        min: 0,
        '@:{if.show}'(props) {
            let img = props.backgroundImage;
            let repeat = props.backgroundRepeat;
            let support = repeat !== 'full';
            return img && support;
        },
    }, {
        ...scaleNumber,
        tip: '@:{lang#props.image.height}',
        key: 'backgroundHeight',
        min: 0,
        '@:{if.show}'(props) {
            let img = props.backgroundImage;
            let repeat = props.backgroundRepeat;
            let support = repeat != 'full';
            return img && support;
        },
    }, {
        tip: '@:{lang#props.image.reset}',
        type: Enum["@:{enum#prop.image.reset}"],
        '@:{if.show}'(props) {
            let img = props.backgroundImage;
            let repeat = props.backgroundRepeat;
            let support = repeat != 'full';
            return img && support;
        }
    }, {
        ...scaleNumber,
        tip: '@:{lang#props.offset.hor}',
        key: 'backgroundXOffset',
        min: () => -Const['@:{const#to.unit}'](Const['@:{const#page.max.width}']),
        max: () => Const['@:{const#to.unit}'](Const['@:{const#page.max.width}']),
        '@:{if.show}'(props) {
            return props.backgroundImage &&
                props.backgroundRepeat != 'full';
        },
    }, {
        ...scaleNumber,
        tip: '@:{lang#props.offset.ver}',
        key: 'backgroundYOffset',
        min: () => -Const['@:{const#to.unit}'](Const['@:{const#page.max.height}']),
        max: () => Const['@:{const#to.unit}'](Const['@:{const#page.max.height}']),
        '@:{if.show}'(props) {
            return props.backgroundImage &&
                props.backgroundRepeat != 'full';
        },
    }]
}