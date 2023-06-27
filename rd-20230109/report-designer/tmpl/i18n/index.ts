import Magix from 'magix5';
import EN from './en-us';
import ZH from './zh-cn';
let { has, config, Cache, isArray, mix } = Magix;
let mEn = mix({}, ZH, EN);
let I18n = {
    en: mEn,
    'en-us': mEn,
    zh: ZH,
    'zh-cn': ZH
};
let DefaultLang = 'zh';
//占位符识别正则
let Reg = /\{(\d+)\}/g;
//对翻译的结果进行缓存，避免每次都翻译
let tranlateCache = new Cache(400, 100);
/**
 * key: 待翻译的多语言属性key
 * args: 多语言中如果有占位符，则需要额外传入的占位符对应的内容
 */
export default (key: string, ...args: string[]) => {
    let lang = config<string>('lang');
    if (!has(I18n, lang)) {
        lang = DefaultLang;
    }
    let l = I18n[lang];
    let cacheKey = [lang, key, ...args].join('\x00');
    let res;
    if (tranlateCache.has(cacheKey)) {
        res = tranlateCache.get(cacheKey);
    } else {
        if (isArray(key)) {
            res = '';
            for (let k of key) {
                res += has(l, k) ? l[k] : k;
            }
        } else {
            res = has(l, key) ? l[key] : key;//根据key拿到对应的多语言
            if (args.length) {//如果有占位符，则对占位符进行填充
                res = res.replace(Reg, (m, i, k) => {
                    i |= 0;
                    if (args.length > i) {
                        k = args[i];
                        return has(l, k) ? l[k] : k;
                    }
                    return m;
                });
            }
        }
        tranlateCache.set(cacheKey, res);
    }
    return res;
};