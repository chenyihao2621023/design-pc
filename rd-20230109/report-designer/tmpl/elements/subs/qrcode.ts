/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import QRCodeProvider from '../../provider/qrcode';
let { View, mark, node, task } = Magix;
export default View.extend({
    tmpl: '@:qrcode.html',
    assign(data) {
        this.set(data);
    },
    async render() {
        let m1 = mark(this, '@:{render}');
        await this.digest({
            //msg: 'loading...'
        });
        try {
            await QRCodeProvider['@:{load.library}']();
            let { value, props } = this.get();
            // await this.digest({
            //     msg: null
            // });
            task(() => {
                if (m1()) {
                    if (!value) {
                        value = props.qrcodeContent;
                    }
                    if (value &&
                        (value != this['@:{cached.text}'] ||
                            props.qrcodeColorDark != this['@:{cached.color.dark}'] ||
                            props.qrcodeColorLight != this['@:{cached.color.light}'] ||
                            props.qrcodeCorrectLevel != this['@:{cached.correct.level}'])) {
                        let entity = this['@:{qrcode.entity}'];
                        if (!entity) {
                            let n = node(`_rd_${this.id}_qr`)
                            entity = new QRCode(n, {
                                width: 512,
                                height: 512,
                                //useSVG: 1
                            });
                            this['@:{qrcode.entity}'] = entity;
                        }
                        let m2 = mark(this, '@:{render.qrcode}');
                        task(() => {
                            if (m1() &&
                                m2()) {
                                entity._htOption.colorDark = this['@:{cached.color.dark}'] = props.qrcodeColorDark;
                                entity._htOption.colorLight = this['@:{cached.color.light}'] = props.qrcodeColorLight;
                                entity._htOption.correctLevel = this['@:{cached.correct.level}'] = QRCode.CorrectLevel[props.qrcodeCorrectLevel];
                                entity.makeCode(this['@:{cached.text}'] = value);
                                let { classList } = this.root.querySelector('img');
                                classList.add('@:scoped.style:tag-img', '@:scoped.style:mhp100', '@:scoped.style:mwp100');
                            }
                        });
                    }
                }
            });
        } catch (ex) {
            if (m1()) {
                this.digest({
                    msg: ex
                });
            }
        }
    }
});