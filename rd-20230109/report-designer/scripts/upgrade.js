let fs = require('fs');
let https = require('https');
let oldVersions = {};
let verFile = './pver.json';
if (fs.existsSync(verFile)) {
    let pds = fs.readFileSync(verFile).toString();
    oldVersions = JSON.parse(pds);
}
let list = ['ckeditor', 'jsbarcode', 'codemirror', 'file-saver', 'html2canvas', 'jspdf', 'leaflet', 'mathjax', '@keeex/qrcodejs-kx', 'underscore', 'chart.js', 'echarts', 'signature_pad', 'animate.css', 'monaco-editor', 'luckysheet', 'function-plot', 'swiper'];
let upgradeVersions = {};
let hasUpgrade;
let request = p => {
    console.log('检测' + p);
    let url;
    if (p == 'ckeditor') {
        url = 'https://ckeditor.com/ckeditor-5/demo/'
    } else {
        url = 'https://registry.npmmirror.com/' + p;
        //url = 'https://registry.npmjs.org/' + p;
    }
    https.get(url, (response) => {
        let rawData = '';
        response.on('data', (chunk) => { rawData += chunk; });
        response.on('end', () => {
            try {
                let v;
                if (p == 'ckeditor') {
                    //console.log(rawData);
                    rawData.replace(/ckeditor5\/([\d\.]+)\/ckeditor.js/, (_, $1) => {
                        v = $1;
                    });
                    //console.log(v);
                } else {
                    const parsedData = JSON.parse(rawData);
                    let key = 'latest';
                    if (p == 'codemirror') {
                        key = 'version5';
                    }
                    v = parsedData['dist-tags'][key];
                }
                if (v != oldVersions[p]) {
                    hasUpgrade = true;
                    upgradeVersions[p] = `${oldVersions[p] ?? 'unknown'}->${v}`;
                    oldVersions[p] = v;
                }
                if (list.length) {
                    setTimeout(request, 500, list.pop());
                } else if (hasUpgrade) {
                    console.table(upgradeVersions);
                    fs.writeFileSync(verFile, JSON.stringify(oldVersions, null, 4));
                }
            } catch (e) {
                console.error(e.message);
            }
        });
    });
};
//request(list[0]);
request(list.pop());