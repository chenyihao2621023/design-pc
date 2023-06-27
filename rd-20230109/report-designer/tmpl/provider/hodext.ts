/**
 * 容器元素扩展方法
 */
import Magix from 'magix5';
import DHistory from '../designer/history';
import StageSelection from '../designer/selection';
import Dragdrop from '../gallery/mx-dragdrop/index';
import TableProvider from './table';
import StageGeneric from '../designer/generic';
let { State } = Magix;
export default {
    '@:{when.data.field.enter}<dragenter>'(e) {
        let props = this.get('props');
        if (!props.locked) {
            let { row, col } = e.params;
            let key = `${row}_${col}`;
            let s = this['@:{drag.key.set}'];
            if (!s) {
                s = new Set();
                this['@:{drag.key.set}'] = s;
            }
            s.add(key);
            e['@:{halt}'] = 1;
            if (Dragdrop['@:{is.dragenter}'](this, key)) {
                TableProvider["@:{table.provider#add.ext.meta}"](props, true);
                let { rows } = props;
                let ri = 0,
                    dataRowIndex = -1;
                for (let row of rows) {
                    if (row.data) {
                        dataRowIndex = ri;
                    }
                    ri++;
                }
                if (row == dataRowIndex) {
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
    '@:{when.data.field.leave}<dragleave>'(e: DragEvent & Magix5.MagixPointerEvent) {
        let { row, col } = e.params;
        if (Dragdrop['@:{is.dragleave}'](this, `${row}_${col}`) &&
            this.get('fieldRow') == row &&
            this.get('fieldCol') == col) {
            this.digest({
                fieldRow: -1,
                fieldCol: -1
            });
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
        let row = this.get('fieldRow'),
            col = this.get('fieldCol');
        let src = State.get('@:{global#bind.field.drag.data}');
        //let inNode = inside(e.target as HTMLElement, this.root);
        if (src &&
            //inNode &&
            row != -1 &&
            col != -1) {
            e['@:{halt}'] = 1;
            let { id, tag, field, name } = src;
            let props = this.get('props');
            TableProvider["@:{table.provider#add.ext.meta}"](props, true);
            let element = this.get('element');
            let { rows, ename, bind } = props;
            if (bind.id != id) {
                let bindRow = rows[row];
                let headRow = rows[row - 1];
                for (let br of bindRow.cols) {
                    let startColIndex = br['@:{start.col.index}'];
                    let endColIndex = br['@:{end.col.index}'];
                    for (let col of headRow.cols) {
                        if (col['@:{start.col.index}'] == startColIndex &&
                            col['@:{end.col.index}'] == endColIndex &&
                            col.textContent == br.bindName) {
                            col.textContent = '';
                        }
                    }
                    if (br.bindKey) {
                        delete br.bindKey;
                        delete br.bindName;
                    }
                }
            }
            bind.id = id;
            bind.tag = tag;
            bind.name = name;
            props.focusRow = row;
            props.focusCol = col;
            let cell = rows[row].cols[col];
            let startColIndex = cell['@:{start.col.index}'];
            let endColIndex = cell['@:{end.col.index}'];
            let headRow = rows[row - 1];
            for (let col of headRow.cols) {
                if (col['@:{start.col.index}'] == startColIndex &&
                    col['@:{end.col.index}'] == endColIndex) {
                    if (!col.textContent ||
                        cell.bindName == col.textContent) {
                        col.textContent = field.name;
                    }
                }
            }
            cell.bindKey = field.key;
            cell.bindName = field.name;
            this.set({
                fieldRow: -1,
                fieldCol: -1
            });
            StageSelection["@:{selection#set}"](element);
            StageGeneric['@:{generic#update.stage.element}'](element, '@:{bind}', this.owner.parent());
            DHistory["@:{history#save}"](DHistory['@:{history#element.modified.props}'], ename);
        }
    },
    '@:{delete.bind.field}<click>'(e) {
        let props = this.get('props');
        if (!props.locked) {
            let element = this.get('element');
            let { row, col } = e.params;
            TableProvider["@:{table.provider#add.ext.meta}"](props, true);
            let { rows, ename, bind } = props;
            let bindRow = rows[row];
            let cell = bindRow.cols[col];
            let startColIndex = cell['@:{start.col.index}'];
            let endColIndex = cell['@:{end.col.index}'];

            let headRow = rows[row - 1];
            for (let col of headRow.cols) {
                if (col['@:{start.col.index}'] == startColIndex &&
                    col['@:{end.col.index}'] == endColIndex &&
                    col.textContent == cell.bindName) {
                    col.textContent = '';
                }
            }
            delete cell.bindKey;
            delete cell.bindName;
            let hasBindKey = 0;
            for (let col of bindRow.cols) {
                if (col.bindKey) {
                    hasBindKey = 1;
                    break;
                }
            }
            if (!hasBindKey) {
                bind.id = '';
                bind.tag = '';
                bind.name = '';
            }
            StageGeneric['@:{generic#update.stage.element}'](element, '@:{bind}', this.owner.parent());
            DHistory["@:{history#save}"](DHistory['@:{history#element.modified.props}'], ename);
        }
    },
}