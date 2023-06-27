/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import Enum from '../../designer/enum';
import StageGeneric from '../../designer/generic';
import Service from '../../designer/service';
import Transform from '../../designer/transform';
import DesignerProvider from '../../provider/designer';
import GenericProvider from '../../provider/generic';
import Designer from '../designer';
import TableConsts from './consts';
let BaseDesigner = Designer.prototype;
let { State, Cache, mark, config, mix } = Magix;
let { floor } = Math;
let calcTableSize = (props, list?: object[], err?: { message: string }) => {
    let { bind, columns } = props;
    let scale = State.get('@:{global#stage.scale}');
    if (bind.fields?.length) {
        let footerHeight = 0;
        let stageElements = State.get('@:{global#stage.elements}');
        for (let e of stageElements) {
            if (e.type == 'hod-footer') {
                footerHeight = e.props.height;
            }
        }
        let width = 0;
        for (let field of bind.fields) {
            width += (columns[field.key] || TableConsts["@:{default.cell.width}"] * scale);
        }
        let oneBorder = Const['@:{const#to.unit}'](1);
        props.width = width + oneBorder;
        if (err || !list) {
            props.loadingHeight = TableConsts["@:{loading.tip.height}"] * scale;
            props.height = TableConsts["@:{loading.tip.height}"] * scale + props.theadRowHeight + Const['@:{const#to.unit}'](3) + props.tfootSpacing;
            props.bind._tip = err?.message || '正在加载数据...';
        } else {
            let page = State.get('@:{global#stage.page}');
            let y = props.y;
            let rh = page.height * scale;
            let pn = y / rh;
            let pageNumber = pn | 0;
            let rest = pn - pageNumber;
            if (rest > 0.9999) {//类似这种在设计区动态高度的组件后续不再维护，也不再修正bug
                pageNumber++;
            }
            if (pageNumber < 0) {
                pageNumber = 0;
            }
            y -= pageNumber * rh;
            let restHeight = rh - y - props.theadRowHeight - oneBorder - props.tfootSpacing - footerHeight;
            let rows = floor(restHeight / (props.tbodyRowHeight + oneBorder));
            if (rows < 1) rows = 1;
            if (list.length > rows) {
                list = list.slice(0, rows);
            }
            props.height = props.theadRowHeight + props.tbodyRowHeight * list.length + (list.length + 2) * oneBorder + props.tfootSpacing;
            props.bind._data = list;
            props.bind._tip = '';
        }
    } else {
        props.height = props.theadRowHeight + props.tbodyRowHeight + Const['@:{const#to.unit}'](3) + props.tfootSpacing;
        props.width = Const['@:{const#to.unit}'](TableConsts["@:{default.empty.width}"]) * scale;
    }
};
let apiDataCache = new Cache();
export default Designer.extend({
    ctor() {
        this.set({
            view: '@:./dshow'
        });
        let updateSize = GenericProvider['@:{generic#debounce}'](e => {
            //console.log(e);
            if (!e['@:{types}'] ||
                e['@:{types}']['hod-footer']) {
                let element = this.get('element');
                this.render(element);
            }
        }, 20, this);
        State.on('@:{event#stage.page.change}', updateSize);
        State.on('@:{event#stage.select.element.props.change}', updateSize);
        // State.on('@:{event#stage.scale.change}', updateSize);
        this.on('destroy', () => {
            State.off('@:{event#stage.page.change}', updateSize);
            State.off('@:{event#stage.select.element.props.change}', updateSize);
        });
    },
    '@:{attach.data}'(element) {
        let { props } = element;
        let { bind } = props;
        if (bind.tag) {
            let data = apiDataCache.get(bind.tag);
            if (data) {
                calcTableSize(props, data.list, data.error);
            } else {
                calcTableSize(props);
                let m = mark(this, '@:{attach.data}');
                let s = new Service();
                s.all({
                    //name: '@:{get.by.url}',
                    url: bind.tag
                }, (err: { message: string }, bag) => {
                    let list = bag.get('data', []);
                    apiDataCache.set(bind.tag, {
                        list,
                        error: err
                    });
                    calcTableSize(props, list, err);
                    let element = this.get('element');
                    if (m()) {
                        StageGeneric['@:{generic#update.stage.element}'](element, '@:{bind}', this.owner);
                    }
                });
            }
        } else {
            calcTableSize(props);
        }
    },
    assign(data) {
        this['@:{attach.data}'](data.element);
        BaseDesigner.assign.call(this, data);
    },
    render(element) {
        if (element) {
            this['@:{attach.data}'](element);
        }
        BaseDesigner.render.call(this, element);
    }
}).static({
    type: 'data-coltable',
    title: '@:{lang#elements.data.coltable}',
    icon: '&#xeb47;',
    '@:{move.props}': DesignerProvider['@:{designer#shared.move.props}'],
    '@:{modifier}': Enum['@:{enum#modifier.dheight}'],
    '@:{allowed.to.hod}': {
        root: 1
    },
    '@:{get.props}'(x, y) {
        return {
            alpha: 1,
            x: Const['@:{const#to.unit}'](x),
            y: Const['@:{const#to.unit}'](y),
            //rotate: 0,
            width: Const['@:{const#to.unit}'](200),
            height: Const['@:{const#to.unit}'](93),
            locked: false,
            cellAlign: 'center',
            tfootSpacing: Const['@:{const#to.unit}'](20),
            theadFontsize: Const['@:{const#to.unit}'](16),
            theadRowHeight: Const['@:{const#to.unit}'](40),
            theadForecolor: '#000',
            tbodyRowHeight: Const['@:{const#to.unit}'](30),
            tbodyFontsize: Const['@:{const#to.unit}'](14),
            tbodyForecolor: '#000',
            theadRowBackground: '#ffda95',
            tbodyEvenRowBackground: '#dde09d',
            tbodyOddRowBackground: '#f2f5cc',
            bordercolor: '#000',
            bind: {},
            help: 'github.com/xinglie/report-designer/issues/24',
            columns: {},
            animations: []
        }
    },
    props: [
        DesignerProvider['@:{designer#shared.props.x}'],
        DesignerProvider['@:{designer#shared.props.y}'],
        DesignerProvider['@:{designer#shared.props.alpha}'],
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            tip: '@:{lang#props.bind.fields}',
            key: 'bind',
            type: Enum["@:{enum#prop.bind.field}"],
            json: 1,
            '@:{if.show}'() {
                return config('getFieldUrl');
            },
            write(v, props) {
                let columns = props.columns || {};
                let old = { ...columns };
                for (let p in columns) {
                    delete columns[p];
                }
                for (let p of v.fields) {
                    columns[p.key] = old[p.key] ?? Const['@:{const#to.unit}'](TableConsts["@:{default.cell.width}"]);
                }
            }
        }, {
            tip: '@:{lang#props.table.columns.width}',
            key: 'columns',
            type: Enum["@:{enum#prop.column.width}"],
            min: () => Const["@:{const#to.unit}"](20),
            max: () => Const["@:{const#to.unit}"](300),
            '@:{unit.convert}'({ columns }, toUnit) {
                for (let e in columns) {
                    columns[e] = Const['@:{const#unit.to.unit}'](columns[e], toUnit);
                }
            },
            '@:{stage.scale}'({ columns }, step, dest) {
                for (let e in columns) {
                    columns[e] *= step;
                }
                if (dest) {
                    dest.columns = columns;
                }
            },
            read(values) {
                let newColumns = {};
                for (let p in values) {
                    newColumns[p] = Transform["@:{transform#to.show.value}"](values[p]);
                }
                return newColumns;
            },
            write(values) {
                let newColumns = {};
                for (let p in values) {
                    newColumns[p] = Transform["@:{transform#to.real.value}"](values[p]);
                }
                return newColumns;
            },
            json: 1,
            //'@:{dock.top}': 1
        }, {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.table.foot.spacing}',
            min: 0,
            key: 'tfootSpacing',
        },
        DesignerProvider['@:{designer#shared.props.spliter}'], {
            tip: '@:{lang#props.table.style}',
            type: Enum["@:{enum#prop.table.style}"],
            write(skin, props) {
                mix(props, skin);
            }
        },
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.border.color}', 'bordercolor'), {
            tip: '@:{lang#props.table.cell.align}',
            key: 'cellAlign',
            type: Enum['@:{enum#prop.font.align}'],
            json: 1
        }, {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.table.head.row.height}',
            min: () => Const["@:{const#to.unit}"](25),
            max: () => Const["@:{const#to.unit}"](100),
            key: 'theadRowHeight',
        }, {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.table.body.row.height}',
            min: () => Const["@:{const#to.unit}"](25),
            max: () => Const["@:{const#to.unit}"](100),
            key: 'tbodyRowHeight',
        }, {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.table.head.font.size}',
            min: () => Const["@:{const#to.unit}"](12),
            max: () => Const["@:{const#to.unit}"](100),
            key: 'theadFontsize',
        },
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.forecolor}', 'theadForecolor'),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.table.head.row.background}', 'theadRowBackground', 1, 1), {
            ...DesignerProvider['@:{designer#shared.props.partial.number}'],
            tip: '@:{lang#props.table.body.font.size}',
            min: () => Const["@:{const#to.unit}"](12),
            max: () => Const["@:{const#to.unit}"](100),
            key: 'tbodyFontsize',
        },
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.forecolor}', 'tbodyForecolor'),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.table.body.even.row.background}', 'tbodyEvenRowBackground', 1, 1),
        DesignerProvider['@:{designer#shared.props.color}']('@:{lang#props.table.body.odd.row.background}', 'tbodyOddRowBackground', 1, 1),
        DesignerProvider['@:{designer#shared.props.spliter}'],
        DesignerProvider['@:{designer#shared.props.help}'],
        DesignerProvider['@:{designer#shared.props.ename}'],
        DesignerProvider['@:{designer#shared.props.locked}'],
        DesignerProvider['@:{designer#shared.props.animations}']]
});