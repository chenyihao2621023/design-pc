
let https = require('https');
let path = require('path');
let combineTool = require('../../magix-composer/index');

let cssIconReg = /(['"])\\([0-9a-f]{4})\1/g;
let htmlIconReg = /(&#x)([0-9a-f]{4})/g;
let exts = {
    css: 1,
    less: 1,
    html: 1,
    js: 1,
    ts: 1,
    mx: 1
};
let icons = {};
combineTool.walk('../tmpl', function (file) {
    let ext = path.extname(file);
    if (exts[ext.substring(1)]) {
        let reg;
        if (ext == '.css' ||
            ext == '.less') {
            reg = cssIconReg;
        } else {
            reg = htmlIconReg;
        }
        let c = combineTool.readFile(file);
        c.replace(reg, function (match, ignore, hex) {
            icons[hex] = 1;
        });
    }
});
https.get('https://www.iconfont.cn/open/project/detail.json?pid=890516', res => {
    let raw = '',
        unused = {};
    res.on('data', d => {
        raw += d;
    });
    res.on('end', () => {
        let json = JSON.parse(raw);
        for (let i of json.data.icons) {
            let n = parseInt(i.unicode).toString(16);
            if (!icons.hasOwnProperty(n)) {
                unused[n] = 'unused';
            }
        }
        console.table(unused);
    });
});