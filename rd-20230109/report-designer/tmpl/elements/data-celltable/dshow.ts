/*
    author:https://github.com/xinglie
*/
'ref@:../index.less';
import Magix from 'magix5';
import Const from '../../designer/const';
import StageGeneric from '../../designer/generic';
import DHistory from '../../designer/history';
import StageSelection from '../../designer/selection';
import Dragdrop from '../../gallery/mx-dragdrop/index';
import GenericProvider from '../../provider/generic';
import HodBaseProvider from '../../provider/hodbase';
let { State, View } = Magix;
let hasContent = (props, row, col) => {
    let cell = props.rows[row].cols[col];
    if (cell.type == 'text') {
        return cell.textContent;
    }
};
export default View.extend({
    tmpl: '@:dshow.html',
    init() {
        this.set({
            cv: 'var(@:scoped.style:var(--scoped-element-outline-color))',
            toPx: Const['@:{const#to.px}'],
            toUnit: Const['@:{const#to.unit}'],
            cursor: GenericProvider['@:{generic#cursor.shape}'],
            td: GenericProvider['@:{generate.text.decoration}'],
        });
    },
    assign(data) {
        this.set(data);
    },
    render() {
        this.digest();
    },
    '@:{when.data.field.enter}<dragenter>'(e: Magix5.MagixPointerEvent) {
        let props = this.get('props');
        if (!props.locked) {
            e['@:{halt}'] = 1;
            let { row, col } = e.params;
            let key = `${row}_${col}`;
            let s = this['@:{drag.key.set}'];
            if (!s) {
                s = new Set();
                this['@:{drag.key.set}'] = s;
            }
            s.add(key);
            if (Dragdrop['@:{is.dragenter}'](this, key)) {
                if (hasContent(props, row, col)) {
                    this.digest({
                        fieldRow: -1,
                        colRow: -1
                    });
                } else {
                    let src = State.get('@:{global#bind.field.drag.data}');
                    if (src) {
                        this.digest({
                            fieldRow: row,
                            fieldCol: col
                        });
                    }
                }
            }
        }
    },
    '@:{when.data.field.leave}<dragleave>'(e: Magix5.MagixPointerEvent) {
        let { row, col } = e.params;
        if (Dragdrop['@:{is.dragleave}'](this, `${row}_${col}`)) {
            if (this.get('fieldRow') == row &&
                this.get('fieldCol') == col) {
                this.digest({
                    fieldRow: -1,
                    fieldCol: -1
                });
            }
        }
    },
    '@:{delete.bind.field}<click>'(e) {
        let props = this.get('props');
        if (!props.locked) {
            let element = this.get('element');
            let { row, col } = e.params;
            let { rows, bind } = props;
            let cell = rows[row].cols[col];
            delete cell.bindKey;
            delete cell.bindName;
            let hasBindKey = 0;
            for (let row of rows) {
                for (let col of row.cols) {
                    if (col.bindKey) {
                        hasBindKey = 1;
                        break;
                    }
                }
                if (hasBindKey) {
                    break;
                }
            }
            if (!hasBindKey) {
                bind.id = '';
                bind.tag = '';
                bind.name = '';
            }
            StageGeneric['@:{generic#update.stage.element}'](element, '@:{bind}');
            let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
            DHistory["@:{history#save}"](DHistory['@:{history#element.modified.props}'], ename);
        }
    },
    '@:{when.data.field.drop}<drop>&{passive:false}'(e) {
        this['@:{prevent.default}'](e);
        let s = this['@:{drag.key.set}'];
        if (s) {
            for (let e of s) {
                Dragdrop['@:{clear.drag}'](this, e);
            }
        }
        e['@:{halt}'] = 1;
        let row = this.get('fieldRow'),
            col = this.get('fieldCol');
        let src = State.get('@:{global#bind.field.drag.data}');
        if (src &&
            row != -1 &&
            col != -1) {
            let { id, tag, name, field } = src;
            let props = this.get('props');
            let element = this.get('element');
            let { rows, bind } = props;
            if (props.bind.id != id) {
                for (let row of rows) {
                    for (let col of row.cols) {
                        if (col.bindKey) {
                            delete col.bindKey;
                            delete col.bindName;
                        }
                    }
                }
            }
            bind.id = id;
            bind.tag = tag;
            bind.name = name;
            props.focusRow = row;
            props.focusCol = col;
            let cell = rows[row].cols[col];
            cell.bindKey = field.key;
            cell.bindName = field.name;
            this.set({
                fieldRow: -1,
                fieldCol: -1
            });
            StageGeneric['@:{generic#update.stage.element}'](element, '@:{bind}');
            StageSelection["@:{selection#set}"](element);
            let ename = StageGeneric['@:{generic#query.ename.by.single}'](element);
            DHistory["@:{history#save}"](DHistory['@:{history#element.modified.props}'], ename);
        }
    }
}).merge(Dragdrop, HodBaseProvider);