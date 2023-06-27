import Magix from 'magix5';
import GenericProvider from '../provider/generic';
let { Base } = Magix;
let { max, min, round, pow, random, abs, } = Math;
let hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
};
let HSL = Base.extend<Report.HSL>({
    ctor(h, s, l, a) {
        this.h = h;
        this.s = s;
        this.l = l;
        this.a = a;
    },
    toHex() {
        let r, g, b;
        let { h, s, l, a } = this;
        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        r = round(r * 255);
        g = round(g * 255);
        b = round(b * 255);
        a = round(a * 255);
        let hex = '#' + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1);
        if (a != 255) {
            hex += GenericProvider['@:{generic#pad.start}'](a.toString(16));
        }
        return hex;
    }
});


export default Base.extend<Report.Color>({
    ctor(hex: string) {
        this.r = 255;
        this.g = 255;
        this.b = 255;
        this.a = 255;
        if (hex.startsWith('#')) {
            hex = hex.substring(1);
        }
        let hs = hex.split('');
        if (hs.length <= 4) {
            this.r = parseInt(hs[0] + hs[0], 16);
            this.g = parseInt(hs[1] + hs[1], 16);
            this.b = parseInt(hs[2] + hs[2], 16);
            if (hs[3]) {
                this.a = parseInt(hs[3] + hs[3], 16)
            }
        } else {
            this.r = parseInt(hs[0] + hs[1], 16);
            this.g = parseInt(hs[2] + hs[3], 16);
            this.b = parseInt(hs[4] + hs[5], 16);
            if (hs[6] &&
                hs[7]) {
                this.a = parseInt(hs[6] + hs[7], 16)
            }
        }
    },
    luma() {
        let { r, g, b } = this;
        r /= 255;
        g /= 255;
        b /= 255;
        r = (r <= 0.03928) ? r / 12.92 : pow(((r + 0.055) / 1.055), 2.4);
        g = (g <= 0.03928) ? g / 12.92 : pow(((g + 0.055) / 1.055), 2.4);
        b = (b <= 0.03928) ? b / 12.92 : pow(((b + 0.055) / 1.055), 2.4);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    },
    toHSL() {
        let { r, g, b, a } = this;
        r /= 255;
        g /= 255;
        b /= 255;
        a /= 255;
        let mx = max(r, g, b),
            mn = min(r, g, b);
        let h;
        let s;
        let l = (mx + mn) / 2;
        let d = mx - mn;
        if (mx == mn) {
            h = s = 0;
        }
        else {
            s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
            switch (mx) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return new HSL(h, s, l, a);
    },
    toHSV() {
        let { r, g, b, a } = this;
        //if (r > 0 || g > 0 || b > 0) {
        r /= 255;
        g /= 255;
        b /= 255;
        //}
        let H, S, V, C;
        V = max(r, g, b);
        C = V - min(r, g, b);
        H = (C === 0 ? null : V == r ? (g - b) / C + (g < b ? 6 : 0) : V == g ? (b - r) / C + 2 : (r - g) / C + 4);
        H = (H % 6) * 60;
        S = C === 0 ? 0 : C / V;
        return {
            h: H,
            s: S,
            v: V
        };
    }
}, {
    /**
     * 获取随机颜色
     * @returns 随机颜色
     */
    '@:{c#random.color}': () => '#' + ('00000' + (0x1000000 * random() | 0).toString(16)).slice(-6),
    /**
     * hsv转rgb
     * @param h h value
     * @param s s value
     * @param v v value
     * @returns rgb and hex
     */
    '@:{c#hsv.to.rgb}'(h, s, v) {
        let R, G, B, X, C;
        h = (h % 360) / 60;
        C = v * s;
        X = C * (1 - abs(h % 2 - 1));
        R = G = B = v - C;

        h = ~~h;
        R += [C, X, 0, 0, X, C][h];
        G += [X, C, C, X, 0, 0][h];
        B += [0, 0, X, C, C, X][h];

        let r = round(R * 255),
            g = round(G * 255),
            b = round(B * 255);
        return {
            r: r,
            g: g,
            b: b,
            hex: '#' + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1)
        };
    },
    /**
     * 转成规范的十六进制颜色
     * @param hex 十六进制颜色
     * @returns 规范的颜色
     */
    '@:{c#normalize.hex}'(hex) {
        let r = hex;
        if (hex.length == 4) {
            r = ['#', hex[1], hex[1], hex[2], hex[2], hex[3], hex[3]].join('');
        } else if (hex.length == 5) {
            r = ['#', hex[1], hex[1], hex[2], hex[2], hex[3], hex[3], hex[4], hex[4],].join('');
        }
        return r;
    }
});