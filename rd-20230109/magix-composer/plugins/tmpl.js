/*
    模板处理总入口
 */
let path = require('path');
let fs = require('fs');
let chalk = require('ansis');
let utils = require('./util');
let fd = require('./util-fd');
let deps = require('./util-deps');
let atpath = require('./util-atpath');
let configs = require('./util-config');
let tmplCmd = require('./tmpl-cmd');
let tmplArt = require('./tmpl-art');
let tmplCutsomTag = require('./tmpl-customtag');
let tmplAttr = require('./tmpl-attr');
let tmplStatic = require('./tmpl-static');
let unmatchChecker = require('./checker-tmpl-unmatch');
let tmplVars = require('./tmpl-vars');
let md5 = require('./util-md5');
let tmplQuick = require('./tmpl-quick');
let cssChecker = require('./checker-css');
let tmplChecker = require('./checker-tmpl');
let tmplSource = require('./tmpl-tag-source');
let asyncReplacer = require('./util-asyncr');
let { revisableGReg,
    tmplGlobalDataRoot,
} = require('./util-const');
let regexp = require('./util-rcache');

let commentReg = /<!--[\s\S]*?-->/g;
let htmlCommentCelanReg = /<!--[\s\S]*?-->/g;
let sep = path.sep;
let removeVdReg = /\x02/g;
let removeIdReg = /\x01/g;
let removeAsReg = /\x10/g;
let stringReg = /\x17([^\x17]*?)\x17/g;
let unsupportCharsReg = /[\x00-\x07\x11-\x19\x1e\x1f\x10]/g;
let globalTmplRootReg = /[\x03\x06]\./g;
let globalRootReg = /\x03/g;
let commandAnchorRecover = (tmpl, refTmplCommands) => tmplCmd.recover(tmpl, refTmplCommands).replace(stringReg, '$1');
//let refKeyPrefixReg = /\x00xl\x00/g;
let idRemove = tmpl => {
    return tmpl.replace(globalTmplRootReg, '')
        .replace(globalRootReg, regexp.encode(tmplGlobalDataRoot))
        .replace(removeVdReg, '')
        .replace(removeIdReg, '')
        .replace(removeAsReg, '')
    //.replace(refKeyPrefixReg, '');
}
let brReg = /(?:\r\n|\r|\n)/;
let brPlaceholder = m => {
    let count = m.split(brReg).length;
    return new Array(count).join('\n');
};
let descLength = (a, b) => b.length - a.length;
let recoverRevisableStrings = (tmpl, values) => {
    values.sort(descLength);
    for (let v of values) {
        tmpl = tmpl.replace(v, v.slice(1));
    }
    return tmpl;
};
let processTmpl = async (fileContent, cssNamesMap, e, reject, lang, outString, quickStaticVars, prefix) => {
    e.revisableStrings = [];
    let file = e.srcHTMLFile;
    let shared = {};
    if (configs.debug && unsupportCharsReg.test(fileContent)) {
        console.log(chalk.red(`[MXC Error(tmpl)] unsupport character : ${unsupportCharsReg.source}`), 'at', chalk.magenta(e.shortHTMLFile));
        reject(new Error('[MXC Error(tmpl)] unsupport character'));
        return;
    }
    e.templateLang = lang;
    try {
        fileContent = configs.compileTmplStart(fileContent, shared, e);
    } catch (ex) {
        console.log(chalk.red('[MXC Error(tmpl)] compile template error ' + ex.message), 'at', chalk.magenta(e.shortHTMLFile));
        ex.message += ' at ' + e.shortHTMLFile;
        reject(ex);
        return;
    }
    fileContent = tmplSource.translate(fileContent, e);
    fileContent = fileContent.replace(commentReg, brPlaceholder);
    //console.log(fileContent);
    try {
        tmplArt.check(fileContent, e);
    } catch {
        return;
    }
    fileContent = tmplQuick.preProcess(fileContent, e);
    //console.log(fileContent);
    fileContent = tmplArt(fileContent, e);
    let srcContent = fileContent;
    try {
        fileContent = await tmplCutsomTag.process(fileContent, {
            moduleId: e.moduleId,
            pkgName: e.pkgName,
            srcOwnerHTMLFile: file,
            shortOwnerHTMLFile: e.shortHTMLFile
        }, e);
    } catch (ex) {
        console.log(chalk.red('MXC-Error(tmpl) process custom tag error:' + ex.message), 'at', chalk.magenta(e.shortHTMLFile));
        ex.message += ' at ' + e.shortHTMLFile;
        reject(ex);
        return;
    }
    //console.log(fileContent);
    if (srcContent != fileContent) {
        tmplArt.check(fileContent, e);
        fileContent = tmplQuick.preProcess(fileContent, e);
        fileContent = tmplArt(fileContent, e);
    }
    if (configs.debug) {
        try {
            unmatchChecker(fileContent, e);
        } catch (ex) {
            console.log(chalk.red(ex.message), 'at', chalk.magenta(e.shortHTMLFile));
            ex.message += ' at ' + e.shortHTMLFile;
            reject(ex);
            return;
        }
    }

    fileContent = fileContent.replace(htmlCommentCelanReg, '').trim();
    fileContent = tmplCmd.compile(fileContent);
    //console.log(fileContent);

    //console.log(fileContent);
    let refTmplCommands = Object.create(null);
    try {
        fileContent = tmplVars.process(fileContent, e);
    } catch (ex) {
        reject(ex);
    }

    //console.log(fileContent);
    fileContent = tmplCmd.store(fileContent, refTmplCommands); //模板命令移除，防止影响分析

    //console.log(fileContent);
    fileContent = fileContent.replace(revisableGReg, m => {
        //console.log(m);
        let src = tmplCmd.recover(m, refTmplCommands);
        tmplChecker.checkStringRevisable(m, src, e);
        let r = '\x12' + utils.getRSString(m);
        e.revisableStrings.push(r);
        return r;
    });
    fileContent = configs.compileTmplEnd(fileContent, shared, e);

    //console.log(JSON.stringify(fileContent),refTmplCommands);
    //console.log(fileContent);
    fileContent = await tmplAttr.process(fileContent, e, refTmplCommands, cssNamesMap);
    //console.log(fileContent);
    try {
        //console.log(fileContent);
        fileContent = tmplCmd.tidy(fileContent);
    } catch (ex) {
        console.log(chalk.red('[MXC Error(tmpl)] minify html error : ' + ex.message), 'at', chalk.magenta(e.shortHTMLFile));
        reject(ex);
        return;
    }
    //console.log(fileContent);
    if (!outString) {
        fileContent = tmplStatic(fileContent, e.shortHTMLFile, e.shortHTMLUId);
    }
    if (outString) {
        fileContent = commandAnchorRecover(fileContent, refTmplCommands);
        fileContent = idRemove(fileContent);
        return JSON.stringify(fileContent);
    }
    fileContent = commandAnchorRecover(fileContent, refTmplCommands);
    //console.log(JSON.stringify(fileContent));
    fileContent = recoverRevisableStrings(fileContent, e.revisableStrings);
    //console.log(fileContent);
    fileContent = idRemove(fileContent);
    let { source, statics } = tmplQuick.process(fileContent, e, prefix);
    for (let s of statics) {
        //let testKey = `~${s.key}`;
        //if (!quickStaticVars[testKey]) {
        //   quickStaticVars[testKey] = 1;
        quickStaticVars.push(s);
        //}
    }
    return source;
};
module.exports = e => {
    return new Promise(async (resolve, reject) => {
        let cssNamesMap = e.cssNamesMap,
            from = e.from,
            moduleId = e.moduleId,
            quickStaticVars = [];
        //console.log(e);
        //debugger;
        //仍然是读取view.js文件内容，把里面@到的文件内容读取进来
        e.content = await asyncReplacer(e.content, configs.fileTmplReg, async (match, prefix, quote, ctrl, name, ext) => {
            name = atpath.resolvePath(name, moduleId);
            let file = path.resolve(path.dirname(from) + sep + name + '.' + ext);
            let fileContent = name;
            let singleFile = (name == 'template' && e.contentInfo);
            if (!singleFile) {
                deps.addFileDepend(file, e.from, e.to);
                e.fileDeps[file] = 1;
                cssChecker.hostAddTemplate(e.from, file);
            } else {
                file = e.from;
            }
            if (singleFile || fs.existsSync(file)) {
                fileContent = singleFile ? e.contentInfo.template : fd.read(file);
                let lang = singleFile ? e.contentInfo.templateLang : ext;
                e.htmlModuleId = utils.extractModuleId(file);
                e.srcHTMLFile = file;
                e.shortHTMLFile = file.replace(configs.commonFolder, '').substring(1);
                if (ext != lang) {
                    console.log(chalk.red('[MXC Tip(tmpl)] conflicting template language'), 'at', chalk.magenta(e.shortHTMLFile), 'near', chalk.magenta(match + ' and ' + e.contentInfo.templateTag));
                }
                let outputString = ctrl == 'compiled';
                let p = (prefix || '').trim();
                if (p.startsWith('tmpl')) {
                    p = 'tmpl';
                }
                let fn = await processTmpl(fileContent, cssNamesMap, e, reject, lang, outputString, quickStaticVars, prefix);
                if (!fn) {
                    fn = `(){throw new Error("compile template [${JSON.stringify(e.shortHTMLFile).slice(1, -1)}] error,see terminal output")}`;
                }
                return p + fn;
            }
            return (prefix || '') + quote + 'unfound file:' + name + '.' + ext + quote;
        });
        e.quickStaticVars = quickStaticVars;
        resolve(e);
    });
};