/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import Const from '../designer/const';
import Service from '../designer/service';
import Dialog from '../gallery/mx-dialog/index';
import Toast from '../gallery/mx-toast/index';
import I18n from '../i18n/index';
import DataCenterProvider from '../provider/datacenter';
import FileSystemProvider from '../provider/fs';
import GenericProvider from '../provider/generic';
import HTML2CanvasProvider from '../provider/html2canvas';
import JSPDFProvider from '../provider/jspdf';
import PrinterGeneric from './generic/index';
import ResourcesLoader from './generic/resource';
/**
 * Lodop打印对象可以从 root/trash/lodop中拿出来放到./目录下即可
 */
import Lodop from './lodop/index';
import RDS from './rds/index';
import FillBatch from './unit/batch';
import FillCommon from './unit/common';
import FillCellTable from './unit/data-celltable';
import FillColTable from './unit/data-coltable';
import FillDTable from './unit/data-dtable';
import FillFTable from './unit/data-ftable';
import FillRepeater from './unit/data-repeater';
import FillRichText from './unit/richtext';

let { State, View, lowTaskFinale,
    has, applyStyle, parseUrl,
    config, mark, delay,
    task, toUrl, toParams } = Magix;
//是否以缩放的形式显示内容
//let SHOW_SCALE_CONTENT = false;
/**
 * 反调试
 */
//以下这个if语句完成在发布模式下的反调试功能，如果需要发布调试，可删除这个if语句
if (!DEBUG && !APPROVE) {
    // let F = Function,
    //     FS = F + '',
    //     FUS = F[FS] + '';
    // let a = `.${FS[5] + FS[6]}`;
    // let allowedHost = {
    //     [`x${FS[5]}${FS[2]}gl${FS[5]}e${a[0]}g${FS[5]}${FS[4]}h${FUS[0]}b${a}`]: 1,
    //     [`x${FS[5]}${FS[2]}gl${FS[5]}e${a[0]}g${FS[5]}${FS[4]}ee${a}`]: 1,
    //     [`rd${a}`]: 1
    // };
    // if (!allowedHost[location[`h${FS[6]}st${FS[2]}ame`]]) {
    //     unboot();
    // } else {
    // let now = performance.now.bind(performance);
    // let task = t1 => {
    //     t1 = now();
    //     F(`${FUS.slice(2, 4)}b${FS[1]}gg${FUS[3]}r`)();
    //     if (now() - t1 > 100) {
    //         Runner['@:{task.remove}'](task);
    //         unboot();
    //     }
    // }
    // Runner["@:{task.add}"](2000, task);
    //}
}

let { min } = Math;
applyStyle('@:./index.less');
let doc = document;
let docEle = doc.documentElement;
let P = Promise,
    d = window.viewer;
//let removedPoleReg = /<(\w+)[\s\S]*?role="pole"[\s\S]*?>[\s\S]*?<\/\1>/g;

/**
 * 格式转换列表
 */
let FormatList = [{
    text: '网页',
    value: 'web'
}, {
    text: '图片',
    value: 'image'
}, {
    text: 'PDF',
    value: 'pdf'
}];
if (SUPPORT_RDS) {
    FormatList.push({
        text: '图片-RDS服务',
        value: 'rdImage'
    }, {
        text: 'PDF-RDS服务',
        value: 'rdPdf'
    });
}

/**
 * 请求所有的api数据回来备用
 * @param apis api数组对象
 */
let fetchAllAPI = (apis) => {
    let promises = [];
    for (let api of apis) {
        promises.push(DataCenterProvider['@:{request}'](api));
    }
    return P.all(promises);
};
export default View.extend({
    tmpl: '@:./index.html',
    init() {
        docEle.classList.add('@:scoped.style:scrollable', '@:scoped.style:overflow-y-scroll', '@:./index.less:page-root');
        this['@:{update.title}']();
    },
    '@:{update.title}'() {
        if (APPROVE) {
            document.title = config('siteName') || I18n('@:{lang#site.name}');
        } else {
            document.title = I18n('@:{lang#site.name}');
        }
    },

    async render() {
        doc.rdState = 1;//初始化
        let inner = top != self;
        /**
         * 先渲染界面
         */
        this.set({
            inner,
            rds: SUPPORT_RDS,
            approve: APPROVE,
            d: DEBUG,
            format: FormatList,
            hasData: false,
            empty: true,
            sf: 'web'
        });
        if (!inner) {
            await this.digest();
        }
        doc.rdState |= 2;//基础页面渲染完成
        /*
            以下根据地址栏有无id来决定是否发送请求来获取某个id的具体内容
        */
        let contentUrl = config('getContentUrl');
        if (contentUrl &&
            !inner) {//地址栏有id，配置了获取内容的接口且当前页面非iframe引用
            let s = new Service();
            s.all('@:{get.content}', (ex, bag) => {
                if (!ex) {//如果请求未有异常，则根据请求回来的数据进行渲染界面
                    let stage = bag.get('data');
                    this['@:{render.page.by.json}'](stage);
                }
            });
        }
    },

    /**
     * 分页填充页面
     * @param elements 设计器生出的所有元素
     * @param page 页面对象
     * @param pages 分页填充数组
     * @param tip 是否进行提示
     * @param callback 对特殊元素的附加信息回调处理
     */
    async '@:{fill.page}'(elements, page, pages, tip, callback) {
        let logicCurrentPage = 0;
        let resLoader = this['@:{resources}'];
        let unit = this.get('unit');
        let footerHeight = State.get('@:{global#stage.page.footer.height}');
        let ox = State.get('@:{global#stage.page.x.offset}');
        let oy = State.get('@:{global#stage.page.y.offset}');
        for (let e of elements) {
            if (e.type == 'data-dtable' ||
                e.type == 'data-ftable') {
                PrinterGeneric['@:{recast.table.by.data}'](e);
            }
        }
        /**
         * 判断是否所有的元素都处理完了分页
         * @param elements 元素列表
         * @param indexesCache 元素的分页下标索引对象
         */
        let hasNextPage = (elements, indexesCache) => {
            for (let i = elements.length; i--;) {
                let e = elements[i];
                if (e.type == 'data-coltable' ||
                    e.type == 'data-celltable' ||
                    e.type == 'data-dtable' ||
                    e.type == 'data-rdtable' ||
                    e.type == 'batch-barcode' ||
                    e.type == 'batch-qrcode' ||
                    e.type == 'batch-text' ||
                    e.type == 'data-repeater' ||
                    e.type == 'data-ftable' ||
                    e.type == 'richtext' ||
                    e.type == 'html' ||
                    e.type == 'data-richtext') {
                    if (indexesCache[i] != -1) {
                        return true;
                    }
                }
            }
            return false;
        };
        /**
         * 如果当前处理的逻辑分页小于设计器指定的分页个数
         */
        while (logicCurrentPage < page.pages) {
            let offsetY = logicCurrentPage * page.height;
            //查找当前在设计区里，属于当前分页的元素
            let pageElements = PrinterGeneric['@:{find.current.page.elements}'](page, logicCurrentPage, elements, oy);
            logicCurrentPage++;
            let indexesCache = {};
            /**
             * 生成分页数据
             * @param elements 元素列表
             * @param page 页面对象
             * @param inHod 是否在容器里
             */
            let generatePage = async (elements, page, inHod?) => {
                let newPage = [];
                for (let i = 0; i < elements.length; i++) {
                    let e = elements[i];
                    let newElement = inHod ? e : {
                        type: e.type,
                        id: e.id,
                        props: GenericProvider['@:{generic#clone}'](e.props)
                    };
                    if (!inHod) {
                        //如果页头和页脚不偏移，则放开if语句
                        // if (e.type != 'hod-footer' &&
                        //     e.type != 'hod-header') {
                        newElement.props.x += ox;
                        newElement.props.y += oy;
                        //}
                        newElement.props.y -= offsetY;
                    }
                    if (e.type == 'pager') {//页码器
                        newElement.props.ext._currentPage = pages.length + 1;
                        if (!inHod) {
                            newPage.push(newElement);
                        }
                        callback(e.type, newElement, e.id);
                    } else if (e.type == 'number') {
                        if (!inHod) {
                            newPage.push(newElement);
                        }
                        callback(e.type, newElement, e.id);
                    } else if (e.type == 'data-coltable') {
                        //列表格
                        let last = indexesCache[i] || 0;
                        if (last != -1) {//如果未到最后一页，则继续填充
                            indexesCache[i] = FillColTable(newElement, last, page, footerHeight, newPage, inHod);
                        }
                    } else if (e.type == 'data-celltable') {
                        //单元格
                        if (inHod) {//在容器的情况下，始终填充第1条数据，这里可以根据需求进行调整
                            FillCellTable(newElement, 0, newPage, inHod);
                        } else {
                            let last = indexesCache[i] || 0;
                            if (last != -1) {
                                indexesCache[i] = FillCellTable(newElement, last, newPage, inHod);
                            }
                        }
                    } else if (e.type == 'data-dtable' ||
                        e.type == 'data-rdtable') {
                        //数据表格
                        let last = indexesCache[i] || 0;
                        if (last != -1) {
                            indexesCache[i] = await FillDTable(newElement, last, page, footerHeight, unit, newPage, inHod);
                        }
                    } else if (e.type == 'batch-barcode' ||
                        e.type == 'batch-qrcode' ||
                        e.type == 'batch-text') {
                        let last = indexesCache[i] || 0;
                        if (last != -1) {
                            indexesCache[i] = await FillBatch(newElement, last, page, footerHeight, newPage, inHod, unit);
                        }
                    } else if (e.type == 'data-repeater') {
                        let last = indexesCache[i] || 0;
                        if (last != -1) {
                            indexesCache[i] = await FillRepeater(newElement, last, page, footerHeight, newPage, inHod);
                        }
                    } else if (e.type == 'data-ftable') {
                        let last = indexesCache[i] || 0;
                        if (last != -1) {
                            indexesCache[i] = await FillFTable(newElement, last, page, footerHeight, resLoader, newPage, inHod, unit);
                        }
                    } else if (e.type == 'richtext' ||
                        e.type == 'data-richtext' ||
                        e.type == 'html') {
                        let last = indexesCache[i] || 0;
                        if (last != -1) {
                            indexesCache[i] = await FillRichText(newElement, last, page, footerHeight, resLoader, unit, newPage);
                        }
                    } else if (e.props.bind) {//如果有绑定，则进行数据填充
                        FillCommon(newElement, newPage, resLoader, inHod);
                    } else {
                        newPage.push(newElement);
                    }
                    //容器需要递归生成里面的内容
                    if (has(PrinterGeneric['@:{search.hod.bind.elements}'], e.type)) {
                        let { rows } = newElement.props;
                        for (let row of rows) {
                            for (let col of row.cols) {
                                if (col.elements?.length) {
                                    generatePage(col.elements, page, 1);
                                }
                            }
                        }
                    }
                }
                await delay(0);
                return newPage;
            };
            /**
             * 根据数据的多少，一直填充元素数据，直到所有数据均填充完
             */
            do {
                if (tip) {
                    PrinterGeneric['@:{show.msg}'](`正在计算第${pages.length + 1}页`);
                }
                let newPage = await generatePage(pageElements, page);
                pages.push(newPage);
            } while (hasNextPage(pageElements, indexesCache));
        }
        if (tip) {
            PrinterGeneric['@:{hide.msg}']();
        }
    },
    /**
     * 根据json对象渲染页面
     * @param stage 设计器产出的json对象
     */
    async '@:{render.page.by.json}'(stage) {
        if (!stage) {
            doc.rdState |= 4;//页面填充完成
            return;
        }
        let { page, elements = [], unit, vars } = stage;
        if (!page || !unit) {
            doc.rdState |= 4;//页面填充完成
            this.digest();
            return;
        }
        if (vars) {
            docEle.style.cssText = vars;
        }
        if (page.title) {
            doc.title = page.title;
        }
        Toast.show('正在准备数据...');
        DataCenterProvider['@:{clear}']();
        /**
         * 这里进行四个边距进行相应的宽高处理，边距在设计器里未开放
         */
        // let { marginLeft, marginRight, marginTop, marginBottom } = page;
        // if (marginLeft != null &&
        //     marginRight != null) {
        //     page.width -= marginLeft + marginRight;
        // }
        // if (marginTop != null &&
        //     marginBottom != null) {
        //     page.height -= marginTop + marginBottom;
        // }
        await this.digest({
            enable: false,
            empty: true,
            page,
            unit,
            hasData: true,
            loading: true
        });


        // if (SHOW_SCALE_CONTENT) {
        //     this['@:{scale.content}']();
        // }
        /**
         * 根据偏移量和边距，计算新的偏移量
         */
        let ox = page.xOffset;//- (marginLeft ?? 0);
        let oy = page.yOffset;//- (marginTop ?? 0);
        let pages = [];//分页对象
        let resourcesLoader = new ResourcesLoader();//资源加载收集器
        this['@:{resources}'] = resourcesLoader;
        let {
            '@:{footer.height}': footerHeight,
            '@:{apis}': bindApis,
        } = PrinterGeneric['@:{collect.bind.and.resource}'](elements, resourcesLoader);
        /**
         * 部分元素需要偏移量进行渲染，比如svg
         * 所以这里需要把计算后的偏移量进行设置，以供需要的元素使用
         */
        State.set({
            '@:{global#stage.unit}': unit,
            '@:{global#stage.page.footer.height}': footerHeight,
            '@:{global#stage.page.x.offset}': ox,
            '@:{global#stage.page.y.offset}': oy
        });
        //先加载数据
        await fetchAllAPI(bindApis);
        Toast.show('正在准备资源...');
        await resourcesLoader['@:{load}']();//等资源加载
        Toast.show('正在计算分页...');
        let pagers = [];//页码器对象，需要根据分页多少设置每个页码器的当前页码及总共页码
        let numbers = {};
        //再进行分页处理
        await this['@:{fill.page}'](elements, page, pages, true, (type, element, id) => {
            if (type == 'pager') {
                pagers.push(element);
            } else if (type == 'number') {
                let existNumbers = numbers[id];
                if (!existNumbers) {
                    numbers[id] = existNumbers = [];
                }
                existNumbers.push(element);
            }
        });
        //设置页码器的总页数
        for (let { props: { ext } } of pagers) {
            ext._totalPage = pages.length;
        }
        //设置序号器
        for (let vk in numbers) {
            let index = 0;
            let values = numbers[vk];
            for (let { props: { ext } } of values) {
                ext._fill = 1;
                ext._index = index++;
                ext._total = values.length;
            }
        }
        PrinterGeneric['@:{collate}'](pages);
        let { copies = 1 } = page;
        if (copies > 1) {
            let sourcePages = pages.slice();
            while (copies > 1) {
                pages.push(...sourcePages);
                copies--;
            }
        }
        Toast.show('等待页面生成...');
        console.log('startmain')
        await this.digest({
            stage,
            enable: false,
            images: null,
            pdf: null,
            sf: 'web',
            pages,
            loading: false
        });
        await PrinterGeneric['@:{wait.all.views.ready}'](this.id);
        await delay(200);
        await lowTaskFinale();//等待所有子组件任务完成
        Toast.show('正在检查图片状态...');
        await PrinterGeneric['@:{double.check.images}'](this.root);//检查页面上的图片是否就绪
        Toast.show('马上就好...');
        await this.digest({
            enable: true,
            empty: false
        });
        Toast.hide();
        doc.rdState |= 4;//页面填充完成
        // this['@:{to.pdf}']();
    },
    '@:{print}<click>'() {
        print();
    },
    '@:{lodop.setting}<click>'() {
        this.mxDialog({
            view: '@:./lodop/setting',
            width: 600,
        });
    },
    /**
     * lodop打印
     */
    async '@:{lodop.print}<click>'() {
        let m = mark(this, '@:{print.marker}');
        let page = this.get('page');
        let ld = await Lodop["@:{get.lodop}"]();
        if (m()) {
            if (ld) {//拿到lodop对象后，根据api进行页面及内容设置
                let styles = doc.getElementsByTagName('style');
                let htmlStyles = ['<!DOCTYPE html>'];
                for (let i = 0; i < styles.length; i++) {
                    let s = styles[i].innerHTML.trim();
                    if (s) {
                        htmlStyles.push(`<style>${s}</style>`);
                    }
                }
                let s = htmlStyles.join('');
                let { width, height } = page;
                width = Const['@:{const#to.px}'](width);
                height = Const['@:{const#to.px}'](height);
                //尺寸+1防止ld自动分页
                ld.SET_PRINT_PAGESIZE(0, (width + 1) + 'px', (height + 1) + 'px', 'report-designer');
                ld.SET_PRINT_MODE("POS_BASEON_PAPER", true);
                let pages = doc.querySelectorAll('[role="page-content"]');
                for (let i = 0; i < pages.length; i++) {
                    let p = pages[i];
                    ld.NewPage();
                    ld.ADD_PRINT_HTM(0, 0, width + 'px', height + 'px', `${s}<div class="@:scoped.style:{display-contents,designer-root,designer-ff}">${p.outerHTML}</div>`);
                }
                //这里仅使用了预览，如果打印则需要替换成PRINT方法
                ld.PREVIEW();//ld.PRINT();
            } else {
                //提示用户未能检测到lodop服务
                this.mxDialog({
                    view: '@:./lodop/tip',
                    width: 550
                });
            }
        }
    },
    /**
     * 转换内容到图片
     */
    '@:{get.content.as.images}'() {
        return new P(async resolve => {
            let images = this.get('images');
            let m = mark(this, '@:{image.client.convert}');
            if (images) {//已经转换过了
                resolve(images);
            } else {
                if (this.get('sf') != 'web') {
                    //需要先显示成页面
                    await this.digest({
                        sf: 'web'
                    });
                    await lowTaskFinale();
                    this.set({
                        sf: 'image'
                    });
                }
                images = [];
                let options = {
                    useCORS: true,
                    scale: devicePixelRatio
                };
                let pages = this.root.querySelectorAll('.@:index.less:page'),
                    pageIndex = 0;
                let total = pages.length;
                let thread = 4;//一次转换4个分页内容，太多会卡
                let svgs = doc.querySelectorAll('svg');
                //svg过多性能不好，需要控制下
                if (svgs.length > 20) {
                    thread = 2;
                }
                let work = async () => {
                    if (m()) {
                        scrollTo(0, 0);
                        let start = pageIndex + 1,
                            end = min(start + thread - 1, total);
                        PrinterGeneric['@:{show.msg}'](`转换进度：[${start}~${end}] / ${total}`);
                        await delay(20);
                        let promises = [];
                        while (pageIndex < end) {
                            promises.push(html2canvas(pages[pageIndex++], options));
                        }
                        let cs = await P.all(promises);
                        for (let c of cs) {
                            //image format MUST jpeg!
                            //generate pdf is fasteast!!
                            images.push(c.toDataURL('image/jpeg', 1.0));
                        }
                        if (pageIndex < total) {
                            await delay(0);
                            work();
                        } else {
                            PrinterGeneric['@:{hide.msg}']();
                            this.set({
                                images
                            });
                            resolve(images);
                        }
                    }
                };
                work();
            }
        });
    },
    /**
     * 转图片
     */
    async '@:{to.image}'() {
        let images = this.get('images');
        if (!images) {
            let m = mark(this, '@:{to.image.transform.mark}');
            try {
                Toast.show('正在加载图片转换插件...');
                await HTML2CanvasProvider();
                if (m()) {
                    Toast.show('正在转换为图片...');
                    images = await this['@:{get.content.as.images}']();
                }
                if (m()) {
                    Toast.show('转换图片成功～', 2e3);
                    this.digest({
                        enable: true,
                        images
                    });
                }
            } catch (ex) {
                console.log(ex);
                if (m()) {
                    Toast.show(ex.message || ex, 5e3);
                }
            }
        } else {
            this.digest({
                enable: true,
            });
        }
    },
    /**
     * 使用rd服务转图片
     */
    '@:{to.rd.image}'() {
        let images = this.get('rdImages');
        if (!images) {
            let m = mark(this, '@:{to.rd.image.transform.mark}');
            Toast.show(`正在使用RDS转换为图片...`);
            let data = {
                location: location.href,
                stage: this.get('stage')
            };
            let s = new Service();
            s.save({
                name: '@:{post.by.url}',
                url: config('rdsUrl') + 'image',
                '@:{body}': {
                    print: JSON.stringify(data)
                }
            }, (ex: {
                message: string
            }, bag) => {
                if (m()) {
                    if (ex) {
                        Toast.hide();
                        this.alert(RDS["@:{format.ex.message}"](ex));
                        this.digest({
                            sf: 'rdImage',
                        });
                        //Toast.show(ex.msg, 5e3);
                    } else {
                        Toast.show('转换图片成功～', 2e3);
                        this.digest({
                            sf: 'rdImage',
                            enable: true,
                            rdImages: bag.get('data', [])
                        });
                    }
                }
            });
        } else {
            this.digest({
                enable: true
            });
        }
    },
    /**
     * 使用rd服务转pdf
     */
    '@:{to.rd.pdf}'() {
        let pdf = this.get('rdPdf');
        if (!pdf) {
            let m = mark(this, '@:{to.rd.pdf.transform.mark}');
            //let pages = this.get('pages');
            Toast.show(`正在使用RDS转换为PDF...`);
            let data = {
                location: location.href,
                stage: this.get('stage')
            };
            let s = new Service();
            s.save({
                name: '@:{post.by.url}',
                url: config('rdsUrl') + 'pdf',
                '@:{body}': {
                    print: JSON.stringify(data)
                }
            }, (ex: {
                message: string
            }, bag) => {
                if (m()) {
                    if (ex) {
                        Toast.hide();
                        this.alert(RDS["@:{format.ex.message}"](ex));
                        this.digest({
                            sf: 'rdPdf',
                        });
                    } else {
                        Toast.show('转换PDF成功～', 2e3);
                        let data = bag.get('data', []);
                        let bstr = atob(data[0]);
                        let n = bstr.length;
                        let u8arr = new Uint8Array(n);
                        while (n--) {
                            u8arr[n] = bstr.charCodeAt(n);
                        }
                        let blob = new Blob([u8arr], {
                            type: 'application/pdf'
                        });
                        this.digest({
                            sf: 'rdPdf',
                            enable: false,
                            rdPdf: URL.createObjectURL(blob)
                        });
                    }
                }
            });
        } else {
            this.digest({
                enable: false
            });
        }
    },
    /**
     * 转pdf
     */
    async '@:{to.pdf}'() {
        let pdf = this.get('pdf');
        let page = this.get('page');
        if (!pdf &&
            page) {
            let m = mark(this, '@:{to.pdf.transform.mark}');
            try {
                let images = this.get('rdImages');
                if (!images) {
                    Toast.show('正在加载图片转换插件...');
                    await HTML2CanvasProvider();
                    Toast.show('正在转换为图片...');
                    images = await this['@:{get.content.as.images}']();
                }
                Toast.show('正在加载PDF插件...');
                await JSPDFProvider();
                Toast.show('正在生成PDF...');
                let width = Const['@:{const#to.px}'](page.width),
                    height = Const['@:{const#to.px}'](page.height);
                let doc = new jspdf.jsPDF({
                    unit: 'px',
                    hotfixes: ['px_scaling'],
                    //需要根据尺寸进行转向
                    orientation: width > height ? 'l' : 'p',
                    format: [width, height],
                    compress: true,
                });
                this['@:{js.pdf.document}'] = doc;
                doc.setDocumentProperties({
                    title: I18n('@:{lang#site.name}') + (APPROVE ? '' : '<未授权版>'),
                    subject: '打印页面',
                    author: 'kooboy_li@163.com',
                    keywords: '打印、可视化、编辑器',
                    creator: location.host,
                });
                let total = images.length;
                let toPdf = index => {
                    PrinterGeneric['@:{show.msg}'](`生成进度：${index + 1} / ${total}`);
                    if (index) {
                        doc.addPage();
                    }
                    let img = images[index];
                    doc.addImage(img, 'JPEG', 0, 0, width, height, undefined, 'FAST');
                    if (!APPROVE) {
                        doc.setLineWidth(2);
                        doc.line(0, 0, width, height);
                        doc.line(width, 0, 0, height);
                    }
                };
                for (let i = 0; i < total; i++) {
                    task(toPdf, [i]);
                }
                await lowTaskFinale();
                PrinterGeneric['@:{hide.msg}']();
                if (m()) {
                    Toast.show('转换PDF成功～', 2e3);
                    this.digest({
                        sf: 'pdf',
                        enable: false,
                        pdf: doc.output('bloburi')
                    });
                }
            } catch (ex) {
                console.log(ex);
                if (m()) {
                    Toast.show(ex.message || ex, 5e3);
                }
            }
        } else {
            this.digest({
                enable: false
            });
        }
    },
    /**
     * 用户在转换格式间切换时，前一个任务有可能未完成，需要标识为已取消
     */
    '@:{cancel.prev.task}'() {
        Toast.hide();
        mark(this, '@:{image.client.convert}');
        mark(this, '@:{to.image.transform.mark}');
        mark(this, '@:{to.rd.image.transform.mark}');
        mark(this, '@:{to.pdf.transform.mark}');
        mark(this, '@:{to.rd.pdf.transform.mark}');
        PrinterGeneric['@:{hide.msg}']();
    },
    /**
     * 切换转换格式
     * @param e 事件对象
     */
    async '@:{change.format}<change>'(e) {
        this['@:{cancel.prev.task}']();
        await this.digest({
            enable: false
        });
        this.set({
            sf: e.value
        });
        if (e.value == 'image') {
            this['@:{to.image}']();
        } else if (e.value == 'pdf') {
            this['@:{to.pdf}']();
        } else if (e.value == 'rdImage') {
            this['@:{to.rd.image}']();
        } else if (e.value == 'rdPdf') {
            this['@:{to.rd.pdf}']();
        } else {
            Toast.show('等待页面生成...');
            await this.digest();
            await PrinterGeneric['@:{wait.all.views.ready}'](this.id);
            await delay(200);
            await lowTaskFinale();//等待所有子组件任务完成
            Toast.show('正在检查图片状态...');
            await PrinterGeneric['@:{double.check.images}'](this.root);//检查页面上的图片是否就绪
            Toast.show('马上就好...');
            await delay(200);
            await this.digest({
                enable: true,
            });
            Toast.hide();
        }
    },
    '@:{silent.print}<click>'() {
        open('//github.com/xinglie/report-designer/issues/49');
    },
    /**
     * rd服务设置
     */
    '@:{rds.setting}<click>'() {
        this.mxDialog({
            view: '@:./rds/setting',
            width: 550
        });
    },
    /**
     * rd服务的打印
     */
    '@:{rds.print}<click>'() {
        let m = mark(this, '@:{rd.printer.mask}');
        Toast.show(`正在调用RDS打印服务...`);
        let printer = RDS["@:{get.config}"]();
        let data = {
            location: location.href,
            printer,
            stage: this.get('stage')
        };
        let s = new Service();
        s.save({
            name: '@:{post.by.url}',
            url: config('rdsUrl') + 'print',
            '@:{body}': {
                print: JSON.stringify(data)
            }
        }, (ex: {
            message: string
        }) => {
            if (m()) {
                if (ex) {
                    Toast.hide();
                    this.alert(RDS["@:{format.ex.message}"](ex));
                } else {
                    Toast.show('打印成功～', 2e3);
                }
            }
        });
    },
    '@:{open.with.id}<click>'() {
        let { params: currentParams, path } = parseUrl(location.href);
        let newParams = {
            ...currentParams,
        };
        if (!newParams.id) {
            newParams.id = 'xl';
        }
        let newUrl = toUrl(path, newParams);
        open(newUrl);
    },
    async '@:{export.to.native.file}<click>'() {
        let selectFormat = this.get('sf');
        let exportMark = mark(this, '@:{export.async}');
        try {
            await FileSystemProvider['@:{prepare}']();
        } catch (ex) {
            return this.alert(ex.message);
        }
        let fileName,
            fileContent,
            accept;
        Toast.show(I18n('@:{lang#export.file.processing}'));
        if (selectFormat == 'web') {
            let htmlStyles = [],
                htmlPages = [];
            let domStyles = doc.getElementsByTagName('style');
            for (let i = 0; i < domStyles.length; i++) {
                let s = domStyles[i].innerHTML.trim();
                if (s) {
                    htmlStyles.push(`<style>${s}</style>`);
                }
            }
            let domPages = doc.querySelectorAll('.@:./index.less:page');
            for (let i = 0; i < domPages.length; i++) {
                htmlPages.push(PrinterGeneric['@:{clean.html}'](domPages[i].outerHTML));
            }
            accept = ['.html'];
            fileName = `${I18n('@:{lang#site.name}')}-web.html`;
            fileContent = `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${I18n('@:{lang#site.name}')}-web</title>${htmlStyles.join('')}</head><body class="@:scoped.style:{flex,flex-direction-column,designer-root,designer-ff}">${htmlPages.join('')}</body></html>`;
            try {
                if (exportMark()) {
                    await FileSystemProvider['@:{save.file}'](fileName, fileContent, accept);
                    Toast.show(I18n('@:{lang#export.success}'), 3e3);
                }
            } catch (ex) {
                Toast.hide();
                if (exportMark() && ex.name != 'AbortError') {
                    this.alert(ex.message);
                }
            }
        } else if (selectFormat == 'pdf' &&
            this['@:{js.pdf.document}']) {
            this['@:{js.pdf.document}'].save(`${I18n('@:{lang#site.name}')}.pdf`);
            Toast.show(I18n('@:{lang#export.success}'), 3e3);
        } else if (selectFormat == 'rdPdf' &&
            this.get('rdPdf')) {
            let link = doc.createElement('a')
            link.download = `${I18n('@:{lang#site.name}')}.pdf`;
            link.href = this.get('rdPdf');
            link.click();
        } else {
            //https://www.tutorialspoint.com/Maximum-size-of-a-canvas-element-in-HTML

            //https://www.google.com/search?q=canvas+max+height&biw=1440&bih=757&ei=CfgFYe2aJouxmAWD4KLoDg&oq=canvas+max+height&gs_lcp=Cgdnd3Mtd2l6EAMyBQgAEIAEMgYIABAWEB4yBggAEBYQHjoHCAAQRxCwAzoECAAQQzoFCAAQkQI6CAgAEIAEELEDOg4ILhCABBCxAxDHARCjAjoICAAQsQMQgwE6CwgAEIAEELEDEIMBOgYIABAKEEM6BAguEEM6BwgAELEDEEM6CAguELEDEIMBOggILhCABBCxAzoFCC4QgAQ6CAgAEIAEEMkDOggIABAWEAoQHkoECEEYAFDUe1jQvgFghc4BaAFwAngAgAHnA4gBjDiSAQYzLTEzLjaYAQCgAQHIAQjAAQE&sclient=gws-wiz&ved=0ahUKEwitw4Og1Y7yAhWLGKYKHQOwCO0Q4dUDCA4&uact=5

            //https://www.npmjs.com/package/canvas-size
            Toast.show('暂不支持当前类型的文件导出', 3e3);
            // return;
            // let domPages = document.querySelectorAll('.@:./index.less:page');
            // let images = [],
            //     width = 0,
            //     height = 0;
            // for (let i = 0; i < domPages.length; i++) {
            //     let p = domPages[i];
            //     let innerImages = p.querySelectorAll('img');
            //     for (let j = 0; j < innerImages.length; j++) {
            //         let img = innerImages[j];
            //         width = img.width;
            //         height += img.height;
            //         images.push(img);
            //     }
            // }
            // let offsetY = 0;
            // let canvas = document.createElement('canvas');
            // canvas.width = width;
            // canvas.height = height;
            // let ctx = canvas.getContext('2d');
            // for (let i of images) {
            //     let height = i.height;
            //     ctx.drawImage(i, 0, offsetY, width, height);
            //     offsetY += height;
            // }
            // // document.body.appendChild(canvas);
            // // return;
            // try {
            //     let imgData = canvas.toDataURL('image/jpeg', 1.0);
            //     let link = document.createElement('a');
            //     let arr = imgData.split(','),
            //         mime = arr[0].match(/:(.*?);/)[1],
            //         bstr = atob(arr[1]),
            //         n = bstr.length,
            //         u8arr = new Uint8Array(n);
            //     while (n--) {
            //         u8arr[n] = bstr.charCodeAt(n);
            //     }
            //     let blob = new Blob([u8arr], { type: mime });
            //     let objurl = URL.createObjectURL(blob);
            //     link.download = `${I18n('@:{lang#site.name}')}-image.jpeg`;
            //     link.href = objurl;
            //     link.click();
            //     URL.revokeObjectURL(objurl);
            //     Toast.show(I18n('@:{lang#export.success}'), 3e3);
            // } catch (ex) {
            //     if (exportMark()) {
            //         Toast.hide();
            //         this.alert(ex.message);
            //     }
            // }
        }
    },
    // '@:{scale.content}'() {
    //     let wrapNode = node<HTMLElement>(`c_${this.id}`);
    //     let contentNode = wrapNode.firstElementChild as HTMLDivElement;
    //     let maxHeight = innerHeight - 44;//header height + margin bottom
    //     let contentHeight = contentNode.offsetHeight;
    //     let vRate = maxHeight / contentHeight;
    //     let maxWidth = docEle.offsetWidth;
    //     let contentWidth = contentNode.offsetWidth;
    //     let hRate = maxWidth / contentWidth;
    //     let rate = min(vRate, hRate);
    //     wrapNode.style.height = rate * contentHeight + 'px';
    //     contentNode.style.transform = `scale(${rate})`;
    // },
    '$win<keydown>&{passive:false}'(e: KeyboardEvent) {
        let { code,
            ctrlKey,
            shiftKey,
            altKey,
            metaKey } = e;
        if (code == 'KeyP' &&
            !shiftKey &&
            !altKey && (
                ctrlKey || metaKey
            )) {
            e.preventDefault();
            print();
        }
    },
    // '$win<resize>'() {
    //     if (SHOW_SCALE_CONTENT) {
    //         this['@:{scale.content}']();
    //     }
    // },
    /**
     * 当复制设计器中的内容到当前页面进行粘贴时
     * @param e 剪切板事件对象
     */
    '$doc<paste>'(e: ClipboardEvent) {
        let data = e.clipboardData.getData('text/plain');
        this['@:{render.page.by.json}'](GenericProvider['@:{generic#try.parse.json}'](data));
    },
    /**
     * 通过window派发render事件时，为rds提供的接口
     * @param e 渲染事件对象
     */
    '$win<render>'(e) {
        if (doc.rdState & 4) {//页面已经就绪，先删除
            doc.rdState ^= 4;
        }
        if (doc.rdState & 8) {//删除消息
            doc.rdState ^= 8;
        }
        doc.rdState |= 8;//接收到消息
        this['@:{render.page.by.json}'](GenericProvider['@:{generic#try.parse.json}'](e.json));

    },
    /**
     * 通过postMessage进行数据通讯
     * @param e 消息事件对象
     */
    '$win<message>'(e: MessageEvent) {
        let { protocol, host } = location;
        let origin = protocol + '//' + host;
        if (e.source != window) {//防止自己向自己postMessage
            (<Window>e.source).postMessage('@:{viewer.message.received}', origin);
        }
        if (e.origin == origin &&
            e.data) {
            this['@:{render.page.by.json}'](GenericProvider['@:{generic#try.parse.json}'](e.data));
        }
    }
}).merge(Dialog);