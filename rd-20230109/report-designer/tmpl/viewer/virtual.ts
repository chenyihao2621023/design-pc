/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
import RDService from '../designer/service';
import DataCenterProvider from '../provider/datacenter';
import PrinterGeneric from './generic/index';
import ResourcesLoader from './generic/resource';
import IndexView from './index';

let { State, lowTaskFinale,
    applyStyle,
    delay, } = Magix;
applyStyle('@:./virtual.less');

export default IndexView.extend({
    tmpl: '@:./virtual.html',
    init() {//不要删除，这里阻止父类init的调用

    },
    render() {
        this.digest();
    },
    async getHTML({ stage, data }) {
        for (let key in data) {
            let src = data[key];
            let {
                '@:{data}': apiData,
                '@:{error}': error
            } = RDService['@:{extract.error.and.data}'](src, key);
            DataCenterProvider['@:{register}'](key, apiData, error);
        }
        if (!stage) {
            return {
                styles: [],
                pages: []
            };
        };
        let { page, elements, unit } = stage;
        if (!page || !elements || !unit) {
            return {
                styles: [],
                pages: []
            };
        }
        let resourcesLoader = new ResourcesLoader();//资源加载收集器
        this['@:{resources}'] = resourcesLoader;
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
        this.set({
            page,
            unit
        });
        /**
         * 根据偏移量和边距，计算新的偏移量
         */
        let ox = page.xOffset;// - (marginLeft ?? 0);
        let oy = page.yOffset;//- (marginTop ?? 0);
        let pages = [];//分页对象
        let {
            '@:{footer.height}': footerHeight
        } = PrinterGeneric['@:{collect.bind.and.resource}'](elements, resourcesLoader, 1);

        State.set({
            '@:{global#stage.unit}': unit,
            '@:{global#stage.page.footer.height}': footerHeight,
            '@:{global#stage.page.x.offset}': ox,
            '@:{global#stage.page.y.offset}': oy
        });

        await resourcesLoader['@:{load}']();
        let pagers = [];//页码器对象，需要根据分页多少设置每个页码器的当前页码及总共页码
        let numbers = {};
        //再进行分页处理
        await this['@:{fill.page}'](elements, page, pages, false, (type, element, id) => {
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
        PrinterGeneric['@:{collate}'](pages);
        await this.digest({
            stage,
            pages,
        });
        await lowTaskFinale();//等待所有任务完成
        await delay(1000);

        let htmlStyles = [],
            htmlPages = [];
        let domStyles = document.getElementsByTagName('style');
        for (let i = 0; i < domStyles.length; i++) {
            let s = domStyles[i].innerHTML.trim();
            if (s) {
                htmlStyles.push(`<style>${s}</style>`);
            }
        }
        let domPages = document.querySelectorAll('.@:./virtual.less:page');
        for (let i = 0; i < domPages.length; i++) {
            htmlPages.push(PrinterGeneric['@:{clean.html}'](domPages[i].outerHTML));
        }

        return {
            styles: htmlStyles,
            pages: htmlPages
        };
        // this.digest({//清空
        //     pages: null
        // });
    }
});