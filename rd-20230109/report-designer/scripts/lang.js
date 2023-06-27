

let combineTool = require('../../magix-composer/index');

(async () => {
    let langReg = /@:\{lang#[\S\s]+?\}/g;
    let chineseRegexp = /[\u4e00-\u9fa5]+/g;
    /**
     * 对项目中的多语言进行检测，检测哪些中文未收集到多语言文件中，检测多语言文件中，是否有未使用到的多语言，方便代码清理删除
     * 后续开发中，并未对所有的中文都收集到多语言文件中。
     */
    let c = combineTool.readFile('../tmpl/i18n/zh-cn.ts');
    let lMap = {}, missed = {};
    let needi18n = {};
    c.replace(langReg, m => {
        lMap[m] = 0;
    });
    combineTool.walk('../tmpl', f => {
        if (!f.includes('/lib/') &&
            !f.includes('/i18n/')) {
            let c = combineTool.readFile(f);
            if (f.endsWith('.html')) {
                c = c.replace(/<!--[\s\S]+?-->/g, '');
            } else if (f.endsWith('.ts')) {
                c = c.replace(/\/\/[^\r\n]+/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
            }
            c.replace(langReg, m => {
                if (lMap.hasOwnProperty(m)) {
                    lMap[m]++;
                } else {
                    missed[m] = 'missed';
                }
            });
            if (f.endsWith('.html')) {
                c.replace(chineseRegexp, m => {
                    needi18n[m] = f;
                });
            }
        }
    });
    combineTool.config({
        commonFolder: '../tmpl/',
        stringProcessor(content, from) {
            if (!from.includes('lib/') &&
                !from.includes('i18n/') &&
                !from.includes('/shortcuts') &&
                !from.includes('/format')) {
                content.replace(chineseRegexp, m => {
                    needi18n[m] = from;
                });
            }
        }
    });
    await combineTool.processString();
    for (let p in lMap) {
        if (lMap[p] > 0) {
            delete lMap[p];
        }
    }
    console.table(lMap);
    console.table(missed);
    console.table(needi18n);
})();