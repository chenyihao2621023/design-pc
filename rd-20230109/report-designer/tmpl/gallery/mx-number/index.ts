/*
    author:https://github.com/xinglie
 */
import Magix from 'magix5';
import Runner from '../mx-runner/index';
let { node, View, applyStyle, has, mark,
    dispatch, isFunction, delay } = Magix;
let Max_Value = Number.MAX_SAFE_INTEGER;
applyStyle('@:index.less');
let getFlagByCtrlKey = e => e.shiftKey ? 1 : (e.metaKey || e.ctrlKey ? 2 : 0);
export default View.extend({
    tmpl: '@:index.html',
    init() {
        this.on('destroy', () => {
            Runner['@:{task.remove}'](this['@:{update.by.interval}']);
        });
    },
    assign({
        max = Max_Value, min = -Max_Value, fixed = 0, step = 1, props,
        empty, ratio = 10, value, keep = 1, disabled
    }) {
        let me = this;
        let { root: { classList } } = me;
        classList[disabled ? 'add' : 'remove']('@:scoped.style:input-disabled');
        if (!classList.contains('@:scoped.style:input-focus')) {
            delete me['@:{value.when.active}'];
            if (isFunction(max)) {//!important callback with props
                max = max(props);
            }
            if (isFunction(min)) {
                min = min(props);
            }
            if (isFunction(fixed)) {
                fixed = fixed(props);
            }
            if (isFunction(step)) {
                step = step(props);
            }
            me['@:{step}'] = +step;
            me['@:{support.empty}'] = empty;
            me['@:{disabled}'] = disabled;
            me['@:{max}'] = max === '' ? Max_Value : +max;
            me['@:{min}'] = min === '' ? -Max_Value : +min;
            me['@:{ratio}'] = +ratio || 10;
            me['@:{tail.length}'] = +fixed || 0;
            me['@:{value}'] = me['@:{get.value}'](value);
        } else if (keep) {
            me['@:{value.when.active}'] = me['@:{get.value}'](value);
            return false;
        }
    },
    async render() {
        let { root } = this;
        let m = mark(this, '@:{render}');
        await this.digest({
            disabled: this['@:{disabled}']
        });
        if (m() &&
            !root.classList.contains('@:scoped.style:input-focus')) {
            this['@:{fix.value}']();
        }
    },
    '@:{fix.value}'(v) {
        v = v ?? (this['@:{value.when.active}'] ?? this['@:{value}']);
        node<HTMLInputElement>('_mx_ipt_' + this.id).value = v;
        return v;
    },
    '@:{get.value}'(v) {
        if (this['@:{support.empty}'] &&
            v === '') {
            return v;
        }
        let min = this['@:{min}'];
        v = +v;
        if (v || v === 0) {
            let max = this['@:{max}'];
            if (v > max) {
                v = max;
            } else if (v < min) {
                v = min;
            }
            v = +v.toFixed(this['@:{tail.length}']);
        }
        let mmax = this.get('mmax');
        return isNaN(v) ? (this['@:{support.empty}'] ? '' : mmax(min, 0)) : v;
    },
    '@:{set.value}'(v, ignoreFill) {
        if (v === '' &&
            this['@:{support.empty}']) {
            dispatch(this.root, 'input', {
                value: this['@:{value}'] = v
            });
        } else {
            v = this['@:{get.value}'](v);
            if (v !== this['@:{value}']) {
                if (!ignoreFill) {
                    this['@:{fix.value}'](v);
                }
                dispatch(this.root, 'input', {
                    value: this['@:{value}'] = v
                });
            }
            return this['@:{value}'];
        }
    },
    '@:{key.num.change}'(increase, flag) {
        let value = this['@:{value}'];
        if (value === '') value = 0; //for init
        let step = this['@:{step}'];
        if (flag) {
            if (flag == 1) {
                step *= this['@:{ratio}'];
            } else {
                let len = this['@:{tail.length}'];
                let t = +(step / this['@:{ratio}']).toFixed(len);
                if (t != 0) {
                    step = t;
                }
            }
        }
        if (increase) {
            value += step;
        } else {
            value -= step;
        }
        this['@:{set.value}'](value);
    },
    '@:{cursor.show}'() {
        let ipt = node<HTMLInputElement>('_mx_ipt_' + this.id);
        if (ipt) {
            ipt.focus();
            ipt.selectionStart = ipt.selectionEnd = ipt.value.length;
        }
    },
    '@:{simulator.active}'() {
        this.root.classList.add('@:scoped.style:input-focus');
        if (!has(this, '@:{last.value}')) {
            this['@:{last.value}'] = this['@:{value}'];
        }
    },
    '@:{active}<focusin>'() {
        this['@:{simulator.active}']();
    },
    '@:{deactive}<focusout>'() {
        if (!this['@:{ui.keep.active}']) {
            let { root } = this;
            root.classList.remove('@:scoped.style:input-focus');
            let initialValue = this['@:{value.when.active}'] ?? this['@:{last.value}'];
            let currentValue = this['@:{value}'];
            this['@:{value}'] = this['@:{fix.value}']();
            if (initialValue != currentValue) {
                dispatch(root, 'change', {
                    will: this['@:{value.when.active}'] ?? currentValue,
                    value: currentValue
                });
            }
            delete this['@:{value.when.active}'];
            delete this['@:{last.value}'];
        }
    },
    '@:{key.num.change}<click>'(e) {
        if (!this['@:{disabled}'] &&
            !this['@:{fast.change.start}']) {
            this['@:{key.num.change}'](e.params.i, getFlagByCtrlKey(e));
            this['@:{cursor.show}']();
        }
    },
    async '@:{fast.start}<pointerdown>'(e) {
        if (!this['@:{disabled}']) {
            this['@:{ui.keep.active}'] = 1;
            this['@:{simulator.active}']();
            let i = e.params.i;
            let m = mark(this, '@:{pointerdown}');
            await delay(300);
            if (m()) {
                Runner['@:{task.add}'](30, this['@:{update.by.interval}'] = () => {
                    if (m()) {
                        this['@:{fast.change.start}'] = 1;
                        this['@:{key.num.change}'](i, getFlagByCtrlKey(e));
                        this['@:{cursor.show}']();
                    }
                });
            }
        }
    },
    '@:{press.check}<keydown>&{passive:false}'(e) {
        if (e.code == 'ArrowUp' ||
            e.code == 'ArrowDown') {
            this['@:{prevent.default}'](e);
            this['@:{key.num.change}'](e.code == 'ArrowUp', getFlagByCtrlKey(e));
        }
    },
    '@:{wheel}<wheel>&{passive:false}'(e: WheelEvent) {
        if (this.root.classList.contains('@:scoped.style:input-focus')) {
            this['@:{prevent.default}'](e);
            this['@:{key.num.change}'](e.deltaY < 0, getFlagByCtrlKey(e));
        }
    },
    '@:{input.check}<input>'(e) {
        this['@:{stop.propagation}'](e);
        let target = e.eventTarget;
        this['@:{set.value}'](target.value, 1);
    },
    async '$doc<pointerup>'() {
        mark(this, '@:{pointerdown}');
        Runner['@:{task.remove}'](this['@:{update.by.interval}']);
        delete this['@:{ui.keep.active}'];
        let m = mark(this, '@:{pointerup}');
        await delay(0);
        if (m()) {
            delete this['@:{fast.change.start}'];
        }
    }
});