/*
    author:https://github.com/xinglie
*/
'ref@:./share.less';
import Magix from 'magix5';
import FormatProvider from '../../provider/format';
import GenericProvider from '../../provider/generic';
import './share';
let { isArray, isString, View } = Magix;
export default View.extend({
    tmpl: '@:list.html',
    init({ format, _close, done }) {
        let me = this;
        me['@:{format}'] = format;
        me['@:{dialog.close}'] = _close;
        me['@:{done.callback}'] = done;
    },
    '@:{fix.parts}'(parts, list) {
        if (!list) {
            list = this.get('list');
        }
        let first = list[0];
        if (!parts.length) {
            parts[0] = first.id;
        }
        if (parts[0] == first.id &&
            !parts[1]) {
            parts[1] = { type: first.subs[0].id, body: [] };
        }
    },
    render() {
        let list = FormatProvider["@:{get.groups}"](),
            parts = FormatProvider["@:{get.parts}"](this['@:{format}']);
        this['@:{fix.parts}'](parts, list);
        this['@:{init.parts}'] = GenericProvider['@:{generic#clone}'](parts);
        this.digest({
            list,
            parts
        });
    },
    '@:{use.fix.format}<click>'(e) {
        let { format, key } = e.params;
        let parts = this.get('parts');
        let dest = parts[1];
        if (dest[key] == format) {
            dest[key] = '';
        } else {
            dest[key] = format;
        }
        this.digest({
            parts
        });
    },
    '@:{update.fix.custom}<input>'(e) {
        let { key } = e.params;
        let parts = this.get('parts');
        let dest = parts[1];
        dest[key] = e.eventTarget.value;
        this.digest({
            parts
        });
    },
    '@:{use.format}<click>'(e) {
        let { at, format } = e.params;
        let parts = this.get('parts');
        let dest = parts[1];
        let bd = dest.body;
        if (bd[at] == format) {
            bd[at] = '';
        } else {
            bd[at] = format;
        }
        this.digest({
            parts
        });
    },
    '@:{update.custom}<input>'(e) {
        let { at } = e.params;
        let parts = this.get('parts');
        let dest = parts[1];
        dest.body[at] = e.eventTarget.value;
        this.digest({
            parts
        });
    },
    '@:{update.codemirror.format}<cmchange>'(e) {
        let parts = this.get('parts');
        parts[1] = e.value.trim();
    },
    '@:{change.sub.tab}<click>'(e) {
        let { to } = e.params;
        let parts = this.get('parts');
        let dest = parts[1];
        let initParts = this['@:{init.parts}'];
        let srcDest = initParts[1];
        if (srcDest?.type == to) {
            dest.body = GenericProvider['@:{generic#clone}'](srcDest.body) || [];
        } else {
            dest.body = [];
        }
        dest.type = to;
        this.digest({
            parts
        });
    },
    '@:{change.tab}<click>'(e: Magix5.MagixPointerEvent) {
        let { to } = e.params;
        let initParts = this['@:{init.parts}'];
        let p;
        if (initParts[0] == to) {
            p = GenericProvider['@:{generic#clone}'](initParts);
        } else {
            p = [to];
        }
        this['@:{fix.parts}'](p);
        this.digest({
            parts: p
        });
    },
    '@:{apply}<click>'() {
        this['@:{dialog.close}']();
        let parts = this.get('parts');
        let [prefix, rest] = parts;
        let hasOut;
        if (prefix != 'custom') {
            for (let p in rest) {
                let d = rest[p];
                if ((isString(d) &&
                    p != 'type' &&
                    d.length) || (isArray(d) &&
                        d.length)) {
                    hasOut = 1;
                }
            }
            rest = JSON.stringify(rest);
        } else {
            hasOut = rest.length;
        }
        let result = '';
        if (hasOut) {
            result = prefix + ':' + rest;
        }
        this['@:{done.callback}'](result);
    },
    '@:{close}<click>'() {
        this['@:{dialog.close}']();
    }
});