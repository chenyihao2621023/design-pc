let fs = require('fs');
let gulp = require('gulp');
let watch = require('gulp-watch');
let ts = require('typescript');
let concat = require('gulp-concat');
let through = require('through2');
let terser = require('terser');


let tmplFolder = 'tmpl'; //template folder
let srcFolder = 'src'; //source folder
let buildFolder = 'build';

let projectSettings = {//项目配置
    APPROVE: true,//设置为true移除未注册等代码
    SUPPORT_RDS: true,//是否支持rds服务
    REWRITE_CODE: true,//是否对部分路径代码进行重写，防止根据打包后的代码反推目录结构
    LOCALRESOURCE: false,//本地资源
    SCENE: 'default',//场景
};
let del = folder => {
    return new Promise(resolve => {
        fs.rm(folder, {
            recursive: true,
            force: true
        }, resolve);
    });
};
let minify = options => {
    return through.obj(async function (chunk, enc, callback) {
        if (chunk.isBuffer()) {
            let code = chunk.contents.toString('utf8');
            let output = await terser.minify(code, options);
            if (output.error) {
                throw output.error;
            }
            chunk.contents = Buffer.from(output.code.replace(/([;{])0;/g, '$1'));
            this.push(chunk);
            return callback();
        }
    });
};



let combineTool = require('../magix-composer/index');
let removeESModuleReg = /"use strict";(?:\s*\/\*[\s\S]+?\*\/)?\s*Object\.defineProperty\(exports,\s*"__esModule",\s*\{\s*value:\s*true\s*\}\);?/g;

let exportsReg = /\bexports\.default\s*=/g;
//let returnReg = /_return_\s*=\s*/g;
let removeMiddleDefault = /(?:0\s*,\s*)?([a-zA-Z0-9$.]+_\d+)\.default/g;
let constReg = /\bconst\s+/g;
let commaExprReg = /\(0\s*,\s*([a-zA-Z0-9$._]+)\)\(/g;
let emptyDeps = /s\.d\(("[^"]+"),\s*\[\s*\]\s*,\s*require/g;
let sceneReg = /'\$\{SCENE_([A-Z]+)\}'/g;
//清理编译后的代码，减少文件体积
let cleanCode = code => {
    return code.replace(removeESModuleReg, '')
        //.replace(exportsReg, '_return_=')
        .replace(removeMiddleDefault, '$1')
        .replace(constReg, 'let ')
        .replace(commaExprReg, '$1(');
};
let uStart = 123 + Math.floor(Math.random() * 300);//随机起始数字，每次编译的代码不同，防止反编译
let time = new Date();
let stamp = [time.getFullYear(),
(time.getMonth() + 1 + '').padStart(2, '0'),
(time.getDate() + '').padStart(2, '0'),
(time.getHours() + '').padStart(2, '0'),
(time.getMinutes() + '').padStart(2, '0')].join('');
combineTool.config({//打包工具配置
    debug: true,//开发时设置debug为true,方便输出更多的log日志。发布时设置为false
    tmplRadioOrCheckboxRename: false,//禁止工具重写radio的name
    commonFolder: tmplFolder,//开发目录，即原始代码，需要编译转换的文件目录
    compiledFolder: srcFolder,//编译后的目录，即代码编译后，存放在哪个目录里
    projectName: 'rd',//项目名称，用于样式前缀、内部id规则生成等
    loaderType: 'scmd',//加载器类型，或转换成amd iife等
    loaderFactory: 's.d',
    tmplSupportSlotFn: false,//关闭部分功能以生成更少的编译代码
    tmplSupportSlot: false,//
    tmplShortMX: true,//
    //approve: projectSettings.APPROVE,
    uniqueStart: uStart,
    galleries: {//组件的配置
        mxRoot: 'gallery/',
    },
    checker: {//代码检测
        /**
         * 模板中class的代码检测
         * @param {string} selector 模板中使用到的样式选择器
         */
        tmplClassCheck(selector) {
            return selector &&
                !selector.startsWith('el-') &&
                !selector.startsWith('ant-') &&
                !selector.startsWith('swiper');
        }
    },
    scopedCss: [//全局样式，因为要嵌入到其它页面里以及开发的方便，所有的样式均要编译，通过该方案即能在项目中方便的使用全局样式，也能保证所有的样式被编译，不与其它页面中的样式冲突
        './tmpl/assets/_vars.less',
        './tmpl/assets/index.less'
    ],
    compileJSStart(content, e) {//对代码转换的钩子，这里使用typescript进行代码转换，也可以换成babel等转换器
        let str = ts.transpileModule(content, {
            compilerOptions: {
                lib: ['es7'],
                target: 'ESNext',//'es2018'
                module: ts.ModuleKind.None
            }
        });
        str = str.outputText;
        str = cleanCode(str);
        if (e.from.endsWith('tmpl/designer.ts') ||
            e.from.endsWith('tmpl/viewer.ts')) {
            str = str.replace(sceneReg, (m, s) => {
                return projectSettings.SCENE.toUpperCase() == s;
            });
            str = str.replace(/\$\{U_START\}/g, uStart);
            str = str.replace(/'\$\{LOCALRES\}'/g, (m, s) => {
                return projectSettings.LOCALRESOURCE;
            });
            str = str.replace(/\$\{MARK\}/g, () => {
                return `46b92dd1f42c5c69aeeeec2fc3a5bd07f90383be9799dcf5b15b10e25afe9cbd`;
            });
        }
        return str;
    },
    compileJSEnd(content) {
        return content.replace(exportsReg, 'return ');
    },
    progress({ completed, file, total }) {//编译进度条，这里在命令行输出当前编译到的文件和相关进度
        console.log(file, completed + '/' + total);
    },
    resolveImport(reqInfo) {
        if (reqInfo.mId == 'magix') {
            reqInfo.mId = 'magix5';
        }
    },
    applyStyleProcessor(cssContent, quote) {
        //这里处理applyStyle中的样式，把绝对或其它路径转换为相对打包后文件的路径
        if (projectSettings.LOCALRESOURCE) {
            cssContent = cssContent.replace(/\/\/at.alicdn.com\/t\/a\/([^')]+)/g, (m, $1) => {
                return `${quote}+pathRelativeBoot('../fonts/iconfont.woff2?t=${Date.now().toString(36)}')+${quote}`;
            });
        }
        return cssContent;
    }
});
//清除src目录
gulp.task('cleanSrc', () => del(srcFolder));

/*
    对tmpl目录编译一次到src目录，主要是方便排查生成的可运行代码是否有问题
*/
gulp.task('combine', gulp.series('cleanSrc', () => {
    return combineTool.combine().then(() => {
        console.log('complete');
    }).catch(ex => {
        console.log('gulpfile:', ex);
        process.exit();
    });
}));
/**
 * 启动监听任务，实时编译tmpl目录到src目录，开发时使用
 */
gulp.task('watch', gulp.series('combine', () => {
    return watch(tmplFolder + '/**/*', e => {
        if (fs.existsSync(e.path)) {
            let c = combineTool.processFile(e.path);
            c.catch(ex => {
                console.log('ex', ex);
            });
        } else {
            combineTool.removeFile(e.path);
        }
    });
}));


//压缩选项
let terserOptions = {
    toplevel: true,
    compress: {
        drop_console: true,
        drop_debugger: true,
        keep_fargs: false,
        ecma: 2019,
        global_defs: {
            DEBUG: false,//设置为false删除调试代码
            APPROVE: projectSettings.APPROVE,//设置为true移除未注册等代码
            SUPPORT_RDS: projectSettings.SUPPORT_RDS,
            SCENE_LABEL: projectSettings.SCENE == 'label',
            SCENE_IOT: projectSettings.SCENE == 'iot',
            LOCALRES: projectSettings.LOCALRESOURCE
        }
    },
    output: {
        ascii_only: true,
        comments: /^!/
    }
};
/**
 * 删除build目录
 */
gulp.task('cleanBuild', () => {
    return del(buildFolder);
});
/**
 * 把src目录中的文件，移除相应的调试信息并压缩后放到build目录下
 * build目录下的文件与src目录下的一一对应，并未合并，供有动态加载的需求使用。
 */
gulp.task('build', gulp.series('cleanBuild', 'cleanSrc', () => {
    combineTool.config({
        debug: false
    });
    return combineTool.combine().then(() => {
        gulp.src(srcFolder + '/**/*.js')
            .pipe(minify(terserOptions))
            .pipe(gulp.dest(buildFolder));
    }).catch(ex => {
        console.error(ex);
    });
}));

let refactorWhites = {
    'designer': 2,
    'magix': 1,
    'magix5': 1,
    'i18n': 1,
    'panels': 1,
    'elements': 1,
    'viewer': 1,
    'neat': 1,
    'gallery': 1,
};
let guidCache = {};
let guidIndex = Math.floor(Math.random() * 200);
let guid = key => {
    if (key == 'magix5') {
        key = 'magix';
    }
    if (guidCache[key] != null) {
        return guidCache[key];
    }
    guidCache[key] = (guidIndex++).toString(32);
    return guidCache[key];
};
let strReg = /(["'`])([a-z0-9\.\/\-]+)(\1|\?|\/)/g;
let canMinifyStrs = 'toolbar,keyboard,const,pair,share,resource,code,help,select,tip,size,border,h-operate,h-size,v-operate,v-size,series,radius,cell,player,scroll,track,theme,spot,table,print,cursor,content,operate,wsize,format,loader,pole,color,bezier,item,timeline,history,example,service,shortcuts,contextmenu,stage,picker,branch,transform,model,setting,unit,lodop,rds,form,provider,tojson,normal,hollow,panel,generic,enum,picutre,align,font,dtable,ctable,ftable,field,mset,rule,baw,column,crule,lrule,box,selection,snap,elements,clipboard,ebase,ebind,sdrag,sdrop,cunit,style,virtual,label,iot,items,picture,list,snapshot,rstate,overview,codemirror,ckeditor5,datacenter,filesaver,hodbase,hodext,jspdf,zh-cn,gadget,header,axis,batch,common,consts,perf,en-us,mutex,viewer,monaco,roost,state,fontface,swiper'.split(',');
let canMinify = str => {
    return (str.startsWith('mx-') ||
        str.startsWith('header-') ||
        str.startsWith('axis-') ||
        str.startsWith('toolbar-') || canMinifyStrs.includes(str));
};
let refactorCode = str => {
    return str.replace(strReg, (_, q, path, q1) => {
        if (!path.includes('/') &&
            q1 != '/' &&
            path != 'magix5' &&
            path != 'magix') return _;
        let parts = path.split('/');
        let first = 0;
        while (first < parts.length) {
            if (parts[first] == '.' ||
                parts[first] == '..') {
                first++;
            } else {
                break;
            }
        }
        let part = parts[first];
        if (part && (
            refactorWhites[part] == 1 ||
            (refactorWhites[part] == 2 && parts[first + 1]) ||
            canMinify(part))) {
            parts[first] = guid(part);
            let next = first + 1;
            while (next < parts.length) {
                if (canMinify(parts[next])) {
                    parts[next] = guid(parts[next]);
                }
                next++;
            }
        }
        let last = parts[parts.length - 1];
        if (last == 'designer' ||
            last == 'index' ||
            last == 'dshow' ||
            last == 'help') {
            parts[parts.length - 1] = guid(last);
        }
        return q + parts.join('/') + q1;
    });
};
/**
 * 对src下的目录压缩合并到dist目录，对于不需要动态加载的需求，这样的方式便于交付代码。
 * github及gitee上就使用了该方式
 */
gulp.task('dist', gulp.series('cleanSrc', () => {
    combineTool.config({
        debug: false,
        mxViewProcessor(e) {
            let { path } = e;
            let i = path.lastIndexOf('/');
            if (i > -1) {
                let last = path.substring(i + 1);
                if (last == 'designer' ||
                    last == 'index' ||
                    last == 'dshow') {
                    path = path.substring(0, i + 1) + guid(last);
                }
            }
            return path;
        },
        compileJSEnd(content, e) {
            let str = ts.transpileModule(content, {
                compilerOptions: {
                    lib: ['es7'],
                    target: 'ES2019',
                    module: ts.ModuleKind.None
                }
            });
            content = str.outputText.replace(exportsReg, 'return ')
                .replace(/\}\/index`/g, '}/' + guid('index') + '`')
                .replace(emptyDeps, 's.d($1,()');
            //return content;
            //重构代码，转换模块路径，防止反向推测文件结构
            if (projectSettings.REWRITE_CODE) {
                return refactorCode(content);
            }
            return content;
        }
    });
    return del('./dist').then(() => {
        return combineTool.combine();
    }).then(() => {
        let files = [
            './src/designer.js',
            './src/gallery/**',
            './src/gadget/**',
            './src/i18n/**',
            './src/panels/**',
            './src/provider/**',
            './src/elements/**',
            './src/designer/**'];
        return gulp.src(files)
            .pipe(concat('designer.js'))
            .pipe(minify(terserOptions))
            .pipe(gulp.dest('./dist'));
    }).then(() => {
        let files = [
            './src/viewer.js',
            './src/i18n/**',
            './src/designer/service.js',
            './src/designer/transform.js',
            './src/designer/const.js',
            './src/designer/enum.js',
            './src/elements/**',
            './src/provider/**',
            './src/gallery/mx-dialog/**',
            './src/gallery/mx-toast/**',
            './src/gallery/mx-dropdown/**',
            './src/gallery/mx-number/**',
            './src/gallery/mx-monitor/**',
            './src/gallery/mx-runner/**',
            '!./src/elements/designer.js',
            '!./src/elements/**/designer.js',
            '!./src/elements/**/dshow.js',
            '!./src/elements/**/stage.js',
            '!./src/elements/lscreen/index.js',
            '!./src/elements/flow/index.js',
            '!./src/elements/svg/index.js',
            '!./src/elements/chart/index.js',
            '!./src/elements/designer.js',
            '!./src/elements/index.js',
            '!./src/provider/cell.js',
            '!./src/provider/codemirror.js',
            '!./src/provider/monaco.js',
            '!./src/provider/ckedior5.js',
            '!./src/provider/ebase.js',
            '!./src/provider/ebind.js',
            '!./src/provider/text.js',
            '!./src/provider/hodbase.js',
            '!./src/provider/hodext.js',
            '!./src/provider/hodflex.js',
            '!./src/provider/pole.js',
            '!./src/provider/snapshot.js',
            '!./src/provider/cunit.js',
            '!./src/provider/rstate.js',
            '!./src/provider/example.js',
            '!./src/provider/history.js',
            '!./src/provider/scroll.js',
            '!./src/provider/scale.js',
            '!./src/provider/prop.js',
            '!./src/provider/sdrag.js',
            '!./src/provider/sdrop.js',
            '!./src/provider/svg.js',
            '!./src/provider/wsize.js'];
        if (projectSettings.SCENE == 'default') {
            files.push('./src/viewer/**',
                `!./src/viewer/data.js`,
                `!./src/viewer/iot/**`,
                `!./src/viewer/iot.js`,
                `!./src/viewer/label.js`);
        } else if (projectSettings.SCENE == 'iot') {
            files.push(`./src/viewer/iot.js`);
            files.push(`./src/viewer/iot/**`);
        } else if (projectSettings.SCENE == 'label') {
            files.push('./src/viewer/**',
                `!./src/viewer/iot/**`,
                `!./src/viewer/iot.js`);
        }
        return gulp.src(files)
            .pipe(concat('viewer.js'))
            .pipe(minify(terserOptions))
            .pipe(gulp.dest('./dist'));
    }).then(() => {
        let ver = [time.getFullYear(), time.getMonth() + 1, time.getDate()].join('.');
        let package = JSON.parse(fs.readFileSync('./package.json'));
        package.version = ver;
        fs.writeFileSync('./package.json', JSON.stringify(package, null, 2));
        let files = [{
            html: './index.html',
            js: 'designer'
        }, {
            html: './viewer.html',
            js: 'viewer'
        }, {
            html: './mini.html',
            js: 'designer'
        }, {
            html: './split.html',
            js: 'designer'
        }, {
            html: './standalone.html',
            js: 'viewer',
            ignoreVersion: true
        }, {
            html: './virtual.html',
            js: 'viewer',
            ignoreVersion: true
        }];
        for (let f of files) {
            if (fs.existsSync(f.html)) {
                let content = fs.readFileSync(f.html).toString();
                let reg = new RegExp(`src="dist\\/${f.js}\\.js(\\?v=\\d+)?"`);
                content = content.replace(reg, `src="dist/${f.js}.js?v=${stamp}"`);
                if (!f.ignoreVersion) {
                    content = content.replace(/\.setup\(\{(?:\s*version:'\d+'(\s*,)?(\s*))?/g, `.setup({\n            version:'${stamp}'$1$2`);
                }
                fs.writeFileSync(f.html, content);
            }
        }
    });
}));