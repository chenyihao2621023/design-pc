/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../../designer/const';
import FormatProvider from '../../provider/format';
import GenericProvider from '../../provider/generic';
import TableProvider from '../../provider/table';
let { View, mark, dispatch, node, mix, toNumber } = Magix;
let filter = (key, value) => key.startsWith('_') ? undefined : value;
let calcSum = values => {
    let sum = 0;
    for (let group of values) {
        for (let one of group) {
            if (one['@:{user.input}']) {
                sum += one['@:{number}'];
            }
        }
    }
    return sum;
};
let calcAvg = values => {
    let sum = 0,
        avg = 0,
        count = 0;
    for (let group of values) {
        for (let one of group) {
            if (one['@:{user.input}']) {
                sum += one['@:{number}'];
                count++;
            }
        }
    }
    if (count > 0) {
        avg = sum / count;
    }
    return avg;
};
export default View.extend<{
    getValue: () => {
        elementInputs: [{
            node: HTMLInputElement
        }]
    }
    valid: () => void
}>({
    tmpl: '@:index.html',
    init() {
        this.set({
            format: FormatProvider["@:{format}"].bind(FormatProvider),
            td: GenericProvider['@:{generate.text.decoration}'],
            toPx: Const['@:{const#to.px}'],
            toUnit: Const['@:{const#to.unit}'],
            excelTitle: GenericProvider['@:{generic#excel.col.title}'],
            getMaxCol(props) {
                let ext = TableProvider['@:{table.provider#add.ext.meta}'](props, 1);
                return ext['@:{col.max}'];
            },
            getSumByCell: (cell) => {
                let { rows } = this.get('props');
                let colIndexToArrays = {};
                for (let row of rows) {
                    if (row.data) {//只计算数据行
                        for (let c of row.cols) {
                            let ci = c['@:{start.col.index}'];
                            if (ci >= cell['@:{start.col.index}'] &&
                                ci <= cell['@:{end.col.index}']) {
                                if (!colIndexToArrays[ci]) {
                                    colIndexToArrays[ci] = [];
                                }
                                let userValue = c.inputUserValue || c.inputText;
                                let n = toNumber(userValue);
                                let pushed;
                                if (isNaN(n)) {
                                    pushed = {
                                        '@:{number}': 0,
                                        '@:{user.input}': 0
                                    };
                                } else {
                                    pushed = {
                                        '@:{number}': n,
                                        '@:{user.input}': 1
                                    };
                                }
                                colIndexToArrays[ci].push(pushed);
                            }
                        }
                    }
                }
                let values = [];
                for (let key in colIndexToArrays) {
                    values.push(colIndexToArrays[key]);
                }
                return values;
            },
            calcSum,
            calcAvg
        });
    },
    assign(data) {
        if (data.overrideProps) {
            mix(data.props, data.overrideProps);
        }
        TableProvider["@:{table.provider#add.ext.meta}"](data.props, 1);
        // if (data.data) {
        //     let { rows } = data.props;
        //     let userData = data.data;
        //     let fillSubs = (elements, data) => {
        //         for (let i = 0; i < elements.length; i++) {
        //             let e = elements[i];
        //             if (e.type == 'form-input') {
        //                 e.props.userValue = data[i].value;
        //             }
        //         }
        //     };
        //     let headIndex = 0,
        //         labelIndex = 0,
        //         dataIndex = 0,
        //         totalIndex = 0,
        //         footIndex = 0;
        //     for (let i = 0; i < rows.length; i++) {
        //         let row = rows[i];
        //         let dest;
        //         if (row.head) {
        //             dest = userData.head[headIndex++];
        //         } else if (row.label) {
        //             dest = userData.label[labelIndex++];
        //         } else if (row.data) {
        //             dest = userData.data[dataIndex++];
        //         } else if (row.total) {
        //             dest = userData.total[totalIndex++];
        //         } else if (row.foot) {
        //             dest = userData.foot[footIndex++];
        //         }
        //         for (let j = 0; j < row.cols.length; j++) {
        //             let col = row.cols[j];
        //             if (col.elements &&
        //                 col.elements.length) {
        //                 fillSubs(col.elements, dest[j]);
        //             } else if (col.type == 'input') {
        //                 col.inputUserValue = dest[j].value;
        //             }
        //         }
        //     }
        // }
        // if (data.overrideProps) {
        //     mix(data.props, data.overrideProps);
        // }
        this.set(data);
    },
    async render() {
        let collectMark = mark(this, '@:{collect.render.mark}');
        // let props = this.get('props');
        // let sizes = TableProvider["@:{table.provider#get.sizes}"](props);
        await this.digest();
        let value = await this.getValue();
        if (collectMark() &&
            !this['@:{is.rendered}']) {
            this['@:{is.rendered}'] = 1;
            this['@:{dispatch.event}'](value);
        }
    },
    '@:{dispatch.event}'(value) {
        if (!value) {
            value = this['@:{collect.value}']();
        }
        if (value.elementProps != this['@:{cached.element.props}']) {
            this['@:{cached.element.props}'] = value.elementProps;
            delete value.id;
            delete value.type;
            dispatch(this.root, 'elementinput', value);
        }
    },
    '@:{collect.value}'() {
        let props = this.get('props');
        let stringifyProps = JSON.stringify(props, filter);
        let { rows } = props;
        let values = {
            head: [],
            label: [],
            data: [],
            total: [],
            foot: []
        };
        let elementInputs = [];
        let collectFromElements = elements => {
            let values = [];
            for (let e of elements) {
                if (e.type == 'form-input') {
                    let { userValue, text, inputName } = e.props;
                    if (userValue == null) {
                        userValue = text;
                    }
                    values.push({
                        type: 'form-input',
                        value: userValue,
                        name: inputName
                    });
                    let root = node<HTMLElement>(e.id);
                    if (root) {
                        elementInputs.push({
                            node: root.querySelector('input'),
                            type: 'form-input',
                            value: userValue,
                            name: inputName
                        });
                    }
                } else {
                    values.push(null);
                }
            }
            return values;
        };
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            let cells = [];
            for (let j = 0; j < row.cols.length; j++) {
                let col = row.cols[j];
                if (col.elements?.length) {
                    cells.push(collectFromElements(col.elements));
                } else if (col.type == 'input') {
                    let userValue;
                    if (col.inputUserValue != null) {
                        userValue = col.inputUserValue;
                    } else {
                        userValue = col.inputText;
                    }
                    cells.push({
                        value: userValue,
                        type: 'form-collect-input',
                        name: col.inputName
                    });
                    elementInputs.push({
                        node: node(`ipt_${this.id}_${i}_${j}`),
                        type: 'form-collect-input',
                        value: userValue,
                        name: col.inputName
                    });
                } else if (col.type == 'sum' ||
                    col.type == 'custom') {
                    let { getSumByCell, format, calcSum } = this.get();
                    let sum = getSumByCell(col);
                    let sumValue;
                    if (col.type == 'sum') {
                        sumValue = format(col.textFormat, calcSum(sum));
                    } else {
                        sumValue = format(col.textFormat, sum);
                    }
                    cells.push({
                        type: 'total-sum',
                        value: sumValue
                    });
                } else {
                    cells.push(null);
                }
            }
            let dest;
            if (row.head) {
                dest = values.head;
            } else if (row.label) {
                dest = values.label;
            } else if (row.data) {
                dest = values.data;
            } else if (row.total) {
                dest = values.total;
            } else if (row.foot) {
                dest = values.foot;
            }
            dest.push(cells);
        }
        let id = this.get('id');
        return {
            id,
            type: 'form-collect',
            props,
            elementId: id,
            elementType: 'form-collect',
            elementProps: stringifyProps,
            elementValue: values,
            elementInputs
        };
    },
    getValue() {
        return new Promise(resolve => {
            let startCheck = () => {
                let value = this['@:{collect.value}']();
                let allReady = 1;
                for (let e of value.elementInputs) {
                    if (!e.node) {
                        allReady = 0;
                        break;
                    }
                }
                if (allReady) {
                    resolve(value);
                } else {
                    setTimeout(startCheck, 50);
                }
            };
            setTimeout(startCheck, 50);
        });
    },
    '@:{update.value}<input>'(e: Magix5.MagixKeyboardEvent) {
        let { cell } = e.params;
        let input = e.eventTarget as HTMLInputElement;
        cell.inputUserValue = input.value;//.trim();
        let props = this.get('props');
        this.digest({
            props
        });
        this['@:{dispatch.event}']();
    },
    '@:{update.value}<change>'(e: Magix5.MagixKeyboardEvent) {
        // let { cell } = e.params;
        // let input = e.eventTarget as HTMLSelectElement;
        // let { dropdownItems } = cell;
        // for (let e of dropdownItems) {
        //     e.checked = false;
        // }
        // let current = dropdownItems[input.selectedIndex];
        // current.checked = true;
        // cell.inputUserValue = current.value;
        // let props = this.get('props');
        // this.digest({
        //     props
        // });
        // this['@:{dispatch.event}']();
    },
    '@:{sub.element.input}<elementinput>'(e: Magix5.MagixKeyboardEvent) {
        e.stopImmediatePropagation();
        this['@:{dispatch.event}']();
    },
    '@:{add.row.at}<click>'(e: Magix5.MagixKeyboardEvent) {
        let { ri } = e.params;
        let props = this.get('props');
        let { rows } = props;
        let currentRow = rows[ri];
        let lastDataRow = 0;
        for (let row of rows) {
            if (row.total) {
                break;
            }
            lastDataRow++;
        }
        TableProvider["@:{table.provider#insert.row.at}"](props, lastDataRow, {}, 0);
        let addedRow = rows[lastDataRow];
        addedRow.data = true;
        addedRow.copy = true;
        for (let i = currentRow.cols.length; i--;) {
            let oldCol = currentRow.cols[i];
            let newCol = addedRow.cols[i];
            let copiedProps = JSON.parse(JSON.stringify(oldCol));
            mix(newCol, copiedProps);
        }
        TableProvider["@:{table.provider#add.ext.meta}"](props);
        this.set({
            props
        });
        this.render();
    },
    '@:{delete.row.at}<click>'(e: Magix5.MagixKeyboardEvent) {
        let { ri } = e.params;
        let props = this.get('props');
        TableProvider["@:{table.provider#delete.row}"](props, ri);
        TableProvider["@:{table.provider#add.ext.meta}"](props);
        this.set({
            props
        });
        this.render();
    }
});