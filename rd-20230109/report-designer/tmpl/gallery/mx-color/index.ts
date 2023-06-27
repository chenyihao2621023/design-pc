/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Color from '../../designer/color';
import GenericProvider from '../../provider/generic';
import Dragdrop from '../mx-dragdrop/index';
import Monitor from '../mx-monitor/index';
let { node, View, applyStyle, dispatch, inside, mark, delay } = Magix;
let { round } = Math;
applyStyle('@:index.less');
let ShortCuts = ['d81e06', 'ffff00', '1afa29', '1296db', '13227a', 'd4237a', 'ffffff', 'e6e6e6', 'dbdbdb', 'cdcdcd', 'bfbfbf', '8a8a8a', '707070', '515151', '2c2c2c', '000000', 'ea986c', 'eeb174', 'f3ca7e', 'f9f28b', 'c8db8c', 'aad08f', '87c38f', '83c6c2', '7dc5eb', '87a7d6', '8992c8', 'a686ba', 'bd8cbb', 'be8dbd', 'e89abe', 'e8989a', 'e16632', 'e98f36', 'efb336', 'f6ef37', 'afcd51', '7cba59', '36ab60', '1baba8', '17ace3', '3f81c1', '4f68b0', '594d9c', '82529d', 'a4579d', 'db649b', 'dd6572', 'd84e06', 'e0620d', 'ea9518', 'f4ea2a', '8cbb1a', '2ba515', '0e932e', '0c9890', '1295db', '0061b2', '0061b0', '004198', '122179', '88147f', 'd3227b', 'd6204b'];

let hexReg = /^#[a-fA-f0-9]{3}$/,
    hexReg2 = /^#[a-fA-f0-9]{6}$/,
    hexReg3 = /^#[a-fA-f0-9]{4}$/,
    hexReg4 = /^#[a-fA-f0-9]{8}$/;
let threshold = 0.43;
export default View.extend({
    tmpl: '@:index.html',
    init() {
        this.set({
            nativeEye: window.EyeDropper,
            shortcuts: ShortCuts
        });
        Monitor["@:{setup}"]();
        this.on('destroy', () => {
            Monitor['@:{remove}'](this);
            Monitor['@:{teardown}']();
        });
    },
    assign(data) {
        let rootNode = node<HTMLDivElement>('_mx_root_' + this.id);
        if (rootNode) {
            let { classList } = rootNode;
            if (classList.contains('@:./index.less:color-focus')) {
                return false;
            }
        }
        let {
            color = '',
            //text = '',
            clear = false,
            disabled = false,
            align = 'left',
            alpha = false,
            placement = 'bottom',
            //textWidth = 0
        } = data;
        color = Color['@:{c#normalize.hex}'](color);
        this['@:{color}'] = color;
        this['@:{show.alpha}'] = alpha;
        let c = new Color<Report.Color>(color);
        this['@:{hsv.info}'] = c.toHSV();
        this['@:{alpha}'] = c.a;
        this.set({
            dark: c.luma() > threshold,
            clear,
            //text,
            disabled,
            align,
            //textWidth,
            placement
        });
    },
    render() {
        this.digest({
            alpha: this['@:{show.alpha}'],
            color: this['@:{color}']
        });
    },
    '@:{set.hsv}'(hsv, ignoreSyncUI) {
        let me = this;
        let selfHSV = me['@:{hsv.info}'];
        selfHSV.h = hsv.h;
        selfHSV.s = hsv.s;
        selfHSV.v = hsv.v;
        let rgb = Color['@:{c#hsv.to.rgb}'](hsv.h, hsv.s, hsv.v);
        let hex = rgb.hex;
        let cpickerNode = node<HTMLElement>('_mx_cz_' + me.id);
        let colorZone = Color['@:{c#hsv.to.rgb}'](hsv.h, 1, 1);
        me['@:{hex.color}'] = hex;
        me['@:{sync.color}']();
        let shortcutNode = node<HTMLElement>('_mx_scs_' + me.id);
        if (shortcutNode) {
            let selected = shortcutNode.querySelector('li[class$="@:./index.less:selected"]');
            if (selected) {
                selected.classList.remove('@:index.less:selected');
            }
        }
        if (cpickerNode) {
            cpickerNode.style.background = colorZone.hex;
            let pickerZone = cpickerNode.offsetWidth;
            let snode = node<HTMLElement>('_mx_si_' + me.id);
            let slider = snode.offsetHeight / 2;
            let top = selfHSV.h * pickerZone / 360 - slider;
            let cnode = node<HTMLElement>('_mx_ci_' + me.id);
            let pickerIndicator = cnode.offsetWidth / 2;
            if (!ignoreSyncUI) {
                snode.style.top = top + 'px';
            }
            top = (1 - selfHSV.v) * pickerZone - pickerIndicator;
            let left = selfHSV.s * pickerZone - pickerIndicator;
            cnode.style.left = left + 'px';
            cnode.style.top = top + 'px';
        }
        let sc = node<HTMLElement>('_mx_sc_' + hex.substring(1, 7) + '_' + me.id);
        if (sc) {
            sc.classList.add('@:index.less:selected');
        }
    },
    '@:{set.color}'(hex) {
        let me = this;
        let hsv = this['@:{hsv.info}'];
        if (hex) {
            let c = new Color<Report.Color>(hex);
            hsv = c.toHSV();
            this['@:{alpha}'] = c.a;
        }
        me['@:{set.hsv}'](hsv);
        if (me['@:{show.alpha}']) {
            me['@:{set.alpha}'](this['@:{alpha}']);
        }
    },
    '@:{set.alpha}'(a) {
        let me = this;
        let ai = node<HTMLElement>('_mx_ai_' + me.id);
        if (ai) {
            let alphaWidth = node<HTMLElement>('_mx_at_' + me.id).offsetWidth;
            let slider = ai.offsetWidth / 2;
            a /= 255;
            a *= alphaWidth;
            a -= slider;
            ai.style.left = a + 'px';
        }
    },
    '@:{sync.color}'() {
        let me = this;
        let n = node<HTMLElement>('_mx_bc_' + me.id);
        if (n) {
            let hex = me['@:{hex.color}'];
            if (me['@:{show.alpha}']) {
                node<HTMLElement>('_mx_at_' + me.id).style.background = 'linear-gradient(to right, ' + hex + '00 0%,' + hex + ' 100%)';
                hex += ('0' + me['@:{alpha}'].toString(16)).slice(-2);
            }
            n.style.background = hex;
            let n1 = node<HTMLInputElement>('_mx_v_' + me.id);
            n1.value = hex;
        }
    },
    '@:{color.zone.drag}<pointerdown>'(e) {
        let me = this,
            pickerZone = node<HTMLElement>('_mx_cz_' + me.id).offsetWidth,
            pickerIndicator = node<HTMLElement>('_mx_ci_' + me.id).offsetWidth / 2,
            offset = e.eventTarget.getBoundingClientRect(),
            left = e.pageX - offset.x - scrollX,
            top = e.pageY - offset.y - scrollY,
            s = left / pickerZone,
            v = (pickerZone - top) / pickerZone;
        me['@:{set.hsv}']({
            h: me['@:{hsv.info}'].h,
            s: s,
            v: v
        });
        let current = node<HTMLElement>('_mx_ci_' + me.id);
        let styles = getComputedStyle(current);
        let sleft = styles.left;
        let stop = styles.top;
        let startX = parseInt(sleft, 10);
        let startY = parseInt(stop, 10);
        let pos = e;
        let lowFreDispatch = GenericProvider['@:{generic#throttle}'](() => {
            this['@:{dispatch}']();
        });
        me['@:{drag.drop}'](e, (event) => {
            let offsetY = event.pageY - pos.pageY;
            let offsetX = event.pageX - pos.pageX;
            offsetY += startY;
            if (offsetY <= -pickerIndicator) offsetY = -pickerIndicator;
            else if (offsetY >= (pickerZone - pickerIndicator)) offsetY = pickerZone - pickerIndicator;

            offsetX += startX;

            if (offsetX <= -pickerIndicator) offsetX = -pickerIndicator;
            else if (offsetX >= (pickerZone - pickerIndicator)) offsetX = pickerZone - pickerIndicator;
            current.style.left = offsetX + 'px';
            current.style.top = offsetY + 'px';
            let s = (offsetX + pickerIndicator) / pickerZone;
            let v = (pickerZone - (offsetY + pickerIndicator)) / pickerZone;
            me['@:{set.hsv}']({
                h: me['@:{hsv.info}'].h,
                s: s,
                v: v
            }, true);
            lowFreDispatch();
        }, () => {
            this['@:{dispatch}']();
        });
    },
    '@:{slide.drag}<pointerdown>'(e) {
        let me = this;
        let current = e.eventTarget;
        let indicator = node<HTMLElement>('_mx_si_' + me.id);
        let pickerZone = node<HTMLElement>('_mx_cz_' + me.id).offsetWidth;
        let slider = indicator.offsetHeight / 2;
        let offset = current.getBoundingClientRect(),
            top = e.pageY - offset.y - scrollY,
            h = top / pickerZone * 360;
        me['@:{set.hsv}']({
            h: h,
            s: me['@:{hsv.info}'].s,
            v: me['@:{hsv.info}'].v
        });
        let lowFreDispatch = GenericProvider['@:{generic#throttle}'](() => {
            this['@:{dispatch}']();
        });
        let startY = parseInt(getComputedStyle(indicator).top, 10);
        me['@:{drag.drop}'](e, event => {
            let offsetY = event.pageY - e.pageY;
            offsetY += startY;
            if (offsetY <= -slider) offsetY = -slider;
            else if (offsetY >= (pickerZone - slider)) offsetY = pickerZone - slider;
            indicator.style.top = offsetY + 'px';
            let h = (offsetY + slider) / pickerZone * 360;
            me['@:{set.hsv}']({
                h: h,
                s: me['@:{hsv.info}'].s,
                v: me['@:{hsv.info}'].v
            }, true);
            lowFreDispatch();
        }, () => {
            this['@:{dispatch}']();
        });
    },
    '@:{alpha.drag}<pointerdown>'(e: Magix5.MagixPointerEvent) {
        let current = e.eventTarget;
        let me = this;
        let indicator = node<HTMLElement>('_mx_ai_' + me.id);
        let alphaWidth = node<HTMLElement>('_mx_at_' + me.id).offsetWidth;
        let slider = indicator.offsetWidth / 2;
        let offset = current.getBoundingClientRect(),
            left = e.pageX - offset.x,
            a = (left / alphaWidth * 255) | 0;
        me['@:{alpha}'] = a;
        me['@:{set.alpha}'](a);
        me['@:{sync.color}']();
        let styles = getComputedStyle(indicator);
        let startX = parseInt(styles.left, 10);

        let lowFreDispatch = GenericProvider['@:{generic#throttle}'](() => {
            this['@:{dispatch}']();
        });
        me['@:{drag.drop}'](e, (event) => {
            let offsetX = event.pageX - e.pageX;
            offsetX += startX;
            if (offsetX <= -slider) offsetX = -slider;
            else if (offsetX >= (alphaWidth - slider)) offsetX = alphaWidth - slider;
            indicator.style.left = offsetX + 'px';
            let a = round((offsetX + slider) / alphaWidth * 255);
            me['@:{alpha}'] = a;
            me['@:{sync.color}']();
            lowFreDispatch();
        }, () => {
            this['@:{dispatch}']();
        });
    },
    '@:{dispatch}'() {
        let me = this;
        let n = node<HTMLInputElement>('_mx_v_' + me.id);
        let c = n.value;
        if (c != me['@:{color}']) {
            let dark;
            if (me.get('clear')) {
                dark = new Color<Report.Color>(c).luma() > threshold;
            }
            this.digest({
                dark,
                color: c
            });
            dispatch(me.root, 'input', {
                color: me['@:{color}'] = c
            });
        }
    },
    '@:{shortcuts.picked}<click>'({ params, eventTarget }) {
        this['@:{set.color}'](params.color);
        eventTarget.classList.add('@:index.less:selected');
        this['@:{dispatch}']();
    },
    '@:{inside}'(node) {
        return inside(node, this.root);
    },
    async '@:{show}'() {
        let n = node<HTMLElement>('_mx_bd_' + this.id);
        let d = getComputedStyle(n).display;
        if (d == 'none') {
            n.style.display = 'block';
            Monitor["@:{add}"](this);
            node<HTMLElement>('_mx_root_' + this.id).classList.add('@:./index.less:color-focus');
            if (!this['@:{init.sync.color}']) {
                await this.digest({
                    renderUI: true
                })
                this['@:{init.sync.color}'] = 1;
            }
            this['@:{set.color}']();
        }
    },
    '@:{hide}'() {
        let n = node<HTMLElement>('_mx_bd_' + this.id);
        let d = getComputedStyle(n).display;
        if (d != 'none') {
            node<HTMLElement>('_mx_root_' + this.id).classList.remove('@:./index.less:color-focus');
            n.style.display = 'none';
            Monitor["@:{remove}"](this);
        }
    },
    '@:{toggle}<click>'() {
        if (!this.get('disabled')) {
            let n = node<HTMLElement>('_mx_bd_' + this.id);
            let d = getComputedStyle(n).display;
            if (d == 'none') {
                this['@:{show}']();
            } else {
                this['@:{hide}']();
            }
        }
    },
    '@:{clear}'() {
        this['@:{set.color}']('#ffffffff');
        this.digest({
            color: '',
        });
        dispatch(this.root, 'input', {
            color: this['@:{color}'] = ''
        });

    },
    '@:{clear.color}<click>'() {
        if (!this.get('disabled')) {
            this['@:{clear}']();
        }
    },
    '@:{color.input}<input>'(e: Magix5.MagixPointerEvent) {
        this['@:{stop.propagation}'](e);
        let { eventTarget } = e;
        let v = (eventTarget as HTMLInputElement).value.trim();
        let //r1 = hexReg,
            r2 = hexReg2;
        if (this['@:{show.alpha}']) {
            //r1 = hexReg3;
            r2 = hexReg4;
        }
        if (//r1.test(v) ||
            r2.test(v)) {
            //v = normalizeHex(v);
            this['@:{set.color}'](v);
            this['@:{dispatch}']();
        } else if (this.get('clear') &&
            !v) {
            this['@:{clear}']();
        }
    },
    async '@:{color.focus}<pointerup>'(e: Magix5.MagixPointerEvent) {
        let m = mark(this, '@:{focus.by.pointer}');
        let target = e.eventTarget as HTMLInputElement;
        await delay(20);
        if (m()) {
            target.setSelectionRange(1, target.value.length);
        }
    },
    '@:{color.paste}<paste>&{passive:false}'(e: ClipboardEvent) {
        this['@:{prevent.default}'](e);
        let data = e.clipboardData.getData('text/plain');
        if (data &&
            !data.startsWith('#')) {
            data = '#' + data;
        }
        let r1 = hexReg,
            r2 = hexReg2;
        if (this['@:{show.alpha}']) {
            r1 = hexReg3;
            r2 = hexReg4;
        }
        if (r1.test(data) ||
            r2.test(data)) {
            data = Color['@:{c#normalize.hex}'](data);
            this['@:{set.color}'](data);
            this['@:{dispatch}']();
        }
    },
    async '@:{open.eye.dropper}<click>'() {
        try {
            this.digest({
                eyeOpen: true
            });
            let eyeDropper = this['@:{eye.dropper.entity}'];
            if (!eyeDropper) {
                eyeDropper = this['@:{eye.dropper.entity}'] = new EyeDropper();
            }
            let value = await eyeDropper.open();
            this['@:{set.color}'](value.sRGBHex);
            this.digest({
                eyeOpen: false
            });
            this['@:{dispatch}']();
        } catch {
            this.digest({
                eyeOpen: false
            });
        }
    }
}).merge(Dragdrop);