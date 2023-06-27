/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import QRCodeProvider from '../../provider/qrcode';
let { View, mark, node, task, isArray } = Magix;
export default View.extend({
    tmpl: '@:index.html',
    assign(data) {
        let { props } = data;
        let { bind, text = '' } = props;
        if (bind.id) {
            let bindField = bind.fields[0];
            if (bind._tip) {
                text = bind._tip;
            } else if (bind._data) {
                let src = bind._data;
                if (isArray(src)) {
                    src = src[0];
                }
                text = src[bindField.key];
            } else {
                text = `[绑定:${bindField.name}]`;
            }
        }
        this.set(data, {
            text: text + ''
        });
    },
    async render() {
        let m1 = mark(this, '@:{render}');
        try {
            await Promise.all([this.digest({
                error: null
            }), QRCodeProvider['@:{load.library}']()]);
            if (m1()) {
                let text = this.get('text');
                let props = this.get('props');
                let entity = this['@:{qrcode.entity}'];
                if (text) {
                    if (text != this['@:{cached.text}'] ||
                        props.colorDark != this['@:{cached.color.dark}'] ||
                        props.colorLight != this['@:{cached.color.light}'] ||
                        props.correctLevel != this['@:{cached.correct.level}']) {
                        if (!entity) {
                            let n = node(`_rd_${this.id}_qr`)
                            entity = new QRCode(n, {
                                width: 512,
                                height: 512,
                                //useSVG: true
                            });
                            this['@:{qrcode.entity}'] = entity;
                        }
                        let m2 = mark(this, '@:{render.qrcode}');
                        task(() => {
                            if (m1() &&
                                m2()) {
                                entity._htOption.colorDark = this['@:{cached.color.dark}'] = props.colorDark;
                                entity._htOption.colorLight = this['@:{cached.color.light}'] = props.colorLight;
                                entity._htOption.correctLevel = this['@:{cached.correct.level}'] = QRCode.CorrectLevel[props.correctLevel];
                                entity.makeCode(this['@:{cached.text}'] = text);
                                let { classList } = this.root.querySelector('img');
                                classList.add('@:scoped.style:tag-img', '@:scoped.style:wp100', '@:scoped.style:mwp100');
                                let el = entity._el as HTMLDivElement;
                                el?.classList.remove('@:scoped.style:none');
                            }
                        });
                    }
                } else if (entity) {
                    let el = entity._el as HTMLDivElement;
                    el?.classList.add('@:scoped.style:none');
                }
            }
        } catch (ex) {
            if (m1()) {
                this.digest({
                    error: ex
                });
            }
        }
    }
});