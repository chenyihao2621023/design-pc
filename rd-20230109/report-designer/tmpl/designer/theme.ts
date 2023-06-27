import Magix from 'magix5';
import Toast from '../gallery/mx-toast/index';
import Color from './color';
import Const from './const';
import Service from './service';
let { View, node, config, applyStyle, mark } = Magix;
applyStyle('@:./theme.less');
let dark = new Color<Report.Color>('#000');
let light = new Color<Report.Color>('#fff');
let threshold = 0.43;
let docElement = document.documentElement;
let rootStyle = docElement.style;
let cssContrastVarList = [{
    key: '@:scoped.style:var(--scoped-contrast-color)',
    value(c: Report.Color) {
        if (c.luma() < threshold) {
            return light;
        }
        return dark;
    }
}, {
    key: '@:scoped.style:var(--scoped-contrast-color-15)',
    value(c) {
        let hsl = c.toHSL();
        hsl.a = 0.15;
        return hsl;
    }
}, {
    key: '@:scoped.style:var(--scoped-contrast-color-60)',
    value(c) {
        let hsl = c.toHSL();
        hsl.a = 0.6;
        return hsl;
    }
}];
let cssBrandVarList = [{
    key: '@:scoped.style:var(--scoped-color-brand)',
    value(c) {
        let hsl = c.toHSL();
        return hsl;
    }
}, {
    key: '@:scoped.style:var(--scoped-color-brand-light)',
    value(c) {
        let hsl = c.toHSL();
        hsl.l += 0.2;
        return hsl;
    }
}, {
    key: '@:scoped.style:var(--scoped-color-brand-lighter)',
    value(c) {
        let hsl = c.toHSL();
        hsl.l += 0.3;
        return hsl;
    }
}, {
    key: '@:scoped.style:var(--scoped-color-brand-dark)',
    value(c) {
        let hsl = c.toHSL();
        hsl.l -= 0.04;
        return hsl;
    }
}, {
    key: '@:scoped.style:var(--scoped-color-brand-darker)',
    value(c) {
        let hsl = c.toHSL();
        hsl.l -= 0.08;
        return hsl;
    }
}, {
    key: '@:scoped.style:var(--scoped-color-brand-darkest)',
    value(c) {
        let hsl = c.toHSL();
        hsl.l -= 0.1;
        return hsl;
    }
}, {
    key: '@:scoped.style:var(--scoped-color-brand-5)',
    value(c) {
        let hsl = c.toHSL();
        hsl.a = 0.05;
        return hsl;
    }
}, {
    key: '@:scoped.style:var(--scoped-color-brand-10)',
    value(c) {
        let hsl = c.toHSL();
        hsl.a = 0.1;
        return hsl;
    }
}, {
    key: '@:scoped.style:var(--scoped-color-brand-20)',
    value(c) {
        let hsl = c.toHSL();
        hsl.a = 0.2;
        return hsl;
    }
}, {
    key: '@:scoped.style:var(--scoped-color-brand-30)',
    value(c) {
        let hsl = c.toHSL();
        hsl.a = 0.3;
        return hsl;
    }
}, {
    key: '@:scoped.style:var(--scoped-color-brand-60)',
    value(c) {
        let hsl = c.toHSL();
        hsl.a = 0.6;
        return hsl;
    }
}];

let presetList = [{
    brand: '#fa742b',
    contrast: '#ffffff'
}, {
    brand: '#dd6572',
    contrast: '#ffffff'
}, {
    brand: '#cc6666',
    contrast: '#ffffff'
}, {
    brand: '#dd6572',
    contrast: '#f4ea2a'
}, {
    brand: '#17ace3',
    contrast: '#ffffff'
}, {
    brand: '#1295db',
    contrast: '#ffffff'
}, {
    brand: '#4e9da3',
    contrast: '#dbdbdb'
}, {
    brand: '#4e9da3',
    contrast: '#ffffff'
}, {
    brand: '#63babd',
    contrast: '#ffffff'
}, {
    brand: '#639eab',
    contrast: '#ffffff'
}, {
    brand: '#73a86f',
    contrast: '#ffffff'
}, {
    brand: '#4f9792',
    contrast: '#ffffff'
}, {
    brand: '#b870c7',
    contrast: '#ffffff'
}, {
    brand: '#6950a1',
    contrast: '#ffffff'
}, {
    brand: '#b58bab',
    contrast: '#eeeeee'
}, {
    brand: '#a87b99',
    contrast: '#ffffff'
}, {
    brand: '#6aa17a',
    contrast: '#ffffff'
}, {
    brand: '#817936',
    contrast: '#e6e6e6'
}, {
    brand: '#f26671',
    contrast: '#ffffff'
}, {
    brand: '#faac46',
    contrast: '#ffffff'
}, {
    brand: '#5877bf',
    contrast: '#ffffff'
}, {
    brand: '#777777',
    contrast: '#ffffff'
}];

let updateContrast = (color, force?: number) => {
    let contrast = force ? color : cssContrastVarList[0].value(color);
    for (let i = 0; i < cssContrastVarList.length; i++) {
        let v = cssContrastVarList[i],
            hex;
        if (i) {
            let s = v.value(contrast);
            hex = s.toHex();
        } else {
            hex = contrast.toHSL().toHex();
        }
        rootStyle.setProperty(v.key, hex);
    }
};
let updateBrand = (color) => {
    for (let v of cssBrandVarList) {
        let s = v.value(color);
        let hex = s.toHex();
        rootStyle.setProperty(v.key, hex);
    }
};
let applyTheme = (brand = '', contrast = '') => {
    updateBrand(new Color(brand));
    updateContrast(new Color(contrast), 1);
};
export default View.extend({
    tmpl: '@:./theme.html',
    init({ _close }) {
        this.set({
            hl: Const['@:{const#show.help.and.ow.links}'],
            presets: presetList,
            url: config<string>('saveThemeUrl')
        });
        this['@:{close}'] = _close;
    },
    render() {
        let rootId = config<string>('rootId');
        let root = node<HTMLElement>(rootId);
        let styles = getComputedStyle(root);
        let brand = styles.getPropertyValue(cssBrandVarList[0].key).trim();
        let contrast = styles.getPropertyValue(cssContrastVarList[0].key).trim();
        this.digest({
            brand,
            contrast
        });
    },
    '@:{update.brand}<input>'(e) {
        let c = new Color(e.color);
        updateBrand(c);
        updateContrast(c);
        this.render();
    },
    '@:{update.contrast}<input>'(e) {
        let c = new Color(e.color);
        updateContrast(c, 1);
        this.render();
    },
    '@:{use.theme}<click>'({ params }: Magix5.MagixPointerEvent) {
        let i = presetList[params.at];
        applyTheme(i.brand, i.contrast);
        this.render();
    },
    '@:{copy}<click>'() {
        try {
            let brand = this.get('brand');
            let contrast = this.get('contrast');
            navigator.clipboard.writeText(`@main-color:${brand};\n@main-contrast-color:${contrast};`);
            Toast.show(`复制成功~`, 1000);
        } catch {
            let p2 = this.owner.parent(2);
            p2.invoke('alert', '您的浏览器不支持复制功能～');
        }
    },
    '@:{save}<click>'() {
        try {
            let saveThemeUrl = this.get('url');
            let m = mark(this, '@:{save.theme}');
            let s = new Service();
            s.save({
                name: '@:{post.by.url}',
                url: saveThemeUrl,
                '@:{body}': {
                    brand: this.get('brand'),
                    contrast: this.get('contrast')
                },
            }, ex => {
                if (m()) {
                    if (ex) {
                        let p2 = this.owner.parent(2);
                        p2.invoke('alert', `保存失败[${ex.message}]`);
                    } else {
                        Toast.show('保存成功~', 2000);
                        this['@:{close}']();
                    }
                }
            });
        } catch (ex) {
            let p2 = this.owner.parent(2);
            p2.invoke('alert', `保存失败[${ex.message}]`);
        }
    },
    '@:{cancel}<click>'() {
        this['@:{close}']();
    },
}).static({
    '@:{show}'(owner) {
        owner.mxDialog({
            view: '@:{moduleId}',
            width: 430,
        });
    },
    '@:{apply.theme}': applyTheme
});