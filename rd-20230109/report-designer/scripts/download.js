let fs = require('fs');
let https = require('https');
let path = require('path');
let versions = {};
let verFile = './pver.json';
if (fs.existsSync(verFile)) {
    let pds = fs.readFileSync(verFile).toString();
    versions = JSON.parse(pds);
}
let list = [{
    save: 'underscore',
    res: ['underscore-umd-min.js']
}, {
    save: 'qrcode',
    use: '@keeex/qrcodejs-kx',
    res: ['qrcode.min.js']
}, {
    save: 'mathjax',
    res: ['es5/tex-svg.js']
}, {
    save: 'leaflet',
    res: ['dist/leaflet.css', 'dist/leaflet.js']
}, {
    save: 'jspdf',
    res: ['dist/jspdf.umd.min.js']
}, {
    save: 'html2canvas',
    res: ['dist/html2canvas.min.js']
}, {
    save: 'file-saver',
    res: ['dist/FileSaver.min.js']
}, {
    save: 'codemirror',
    res: ['lib/codemirror.css',
        'lib/codemirror.js',
        'mode/javascript/javascript.js',
        'mode/xml/xml.js',
        'mode/css/css.js',
        'mode/htmlmixed/htmlmixed.js']
}, {
    save: 'jsbarcode',
    res: ['dist/JsBarcode.all.js']
}, {
    save: 'chart.js',
    res: ['dist/chart.min.js']
}, {
    save: 'echarts',
    res: ['dist/echarts.min.js']
}, {
    save: 'signature_pad',
    res: ['dist/signature_pad.umd.min.js']
}, {
    save: 'ckeditor5',
    use: 'ckeditor',
    res: ['ckeditor.js']
}, {
    save: 'animate.css',
    res: ['animate.min.css']
}, {
    save: 'luckysheet',
    res: ['dist/plugins/css/pluginsCss.css',
        'dist/plugins/plugins.css',
        'dist/css/luckysheet.css',
        'dist/assets/iconfont/iconfont.css',
        'dist/plugins/js/plugin.js',
        'dist/luckysheet.umd.js',
        'dist/css/loading.gif',
        'dist/css/waffle_sprite.png',
        'dist/fonts/fontawesome-webfont.woff2',
        'dist/fonts/fontawesome-webfont.woff',
        'dist/fonts/fontawesome-webfont.ttf',
        'dist/plugins/images/icon_dropCell.png']
}, {
    save: 'function-plot',
    res: ['dist/function-plot.js']
}, {
    save: 'swiper',
    res: ['swiper-bundle.min.css', 'swiper-bundle.min.js']
}];
let root = path.resolve('../providers/');
if (!fs.existsSync(root)) {
    fs.mkdirSync(root);
}
let request = async item => {
    console.log('start:', item.save);
    let create = (to, sub) => {
        let folders = sub.split('/');
        let save = path.join(root, to);
        if (!fs.existsSync(save)) {
            fs.mkdirSync(save);
        }
        for (let s of folders) {
            save = path.join(save, s);
            if (!fs.existsSync(save)) {
                fs.mkdirSync(save);
            }
        }
    };
    let write = (to, file, content) => {
        let d = path.join(root, to, file);
        fs.writeFileSync(d, content);
    };
    let fetch = url => {
        console.log('download:', url);
        return new Promise(resolve => {
            https.get(url, (response) => {
                let rawData;
                response.on('data', (chunk) => {
                    if (rawData) {
                        rawData = Buffer.concat([rawData, chunk]);
                    } else {
                        rawData = chunk;
                    }
                });
                response.on('end', () => {
                    resolve(rawData);
                });
            });
        });
    };
    for (let r of item.res) {
        if (item.save != 'ckeditor') {
            let owner = item.save + '@' + versions[item.use || item.save];
            create(owner, path.dirname(r));
            let url;
            if (item.save == 'ckeditor5') {
                url = 'https://ckeditor.com/assets/libs/ckeditor5/' + versions[item.use] + '/ckeditor.js';
            } else {
                url = 'https://unpkg.com/' + (item.use || item.save) + '@' + versions[item.use || item.save] + '/' + r;
            }
            let data = await fetch(url);
            write(owner, r, data);
        }
    }
    if (list.length) {
        setTimeout(() => {
            request(list.pop());
        }, 1000);
    }
};
request(list.pop());