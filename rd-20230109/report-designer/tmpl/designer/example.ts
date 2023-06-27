import Magix from 'magix5';
import Toast from '../gallery/mx-toast/index';
import I18n from '../i18n/index';
import Const from './const';
import DHistory from './history';
import Keyboard from './keyboard';
import Service from './service';
let { random, floor } = Math;
let { State, applyStyle, View, mark, config, Vframe } = Magix;
let P = Promise;
applyStyle('@:./example.less');
let alertMsg = msg => {
    Vframe.root().invoke('alert', msg);
};
let loadExampleContent = ({ id, title }) => {
    return new P<number>(resolve => {
        let s = new Service();
        let fill;
        let contentUrl = config<string>('getTemplateContentUrl');
        s.all({
            url: contentUrl.replaceAll('${id}', id),
        }, (ex, bag) => {
            if (ex) {
                alertMsg(ex.message);
            } else {
                fill = 1;
                State.fire('@:{event#example.change}', {
                    '@:{example.change.event#type}': DHistory['@:{history#example.from.list}'],
                    '@:{example.change.event#title}': title || id,
                    '@:{example.change.event#stage}': bag.get('data')
                });
            }
            resolve(fill);
        });
    });
};
export default View.extend({
    tmpl: '@:./example.html',
    init({ _close }) {
        this['@:{dialog.close}'] = _close;
        this.set({
            keyword: '',
            page: 1,
            size: 80
        });
    },
    render() {
        let m = mark(this, '@:{render}');
        let s = new Service();
        s.all({
            name: '@:{get.templates}',
            '@:{query}': {
                page: this.get('page'),
                size: this.get('size'),
                keyword: this.get('keyword')
            }
        }, (ex, bag) => {
            if (m()) {
                this.digest({
                    hl: Const['@:{const#show.help.and.ow.links}'],
                    error: ex,
                    list: bag.get('data.list', []),
                    total: bag.get('data.total', 0)
                });
            }
        })
    },
    '@:{search}<keyup>'({ code, eventTarget }: Magix5.MagixKeyboardEvent) {
        if (code == Keyboard['@:{key#enter}']) {
            let input = eventTarget as HTMLInputElement;
            let v = input.value;
            this.set({//每次搜索重置页数为第1页
                keyword: v,
                page: 1
            });
            this.render();
        }
    },
    '@:{change.page}<change>'(e) {
        console.log(e);
        this.set({
            page: e.page
        });
        this.render();
    },
    async '@:{use}<click>'(e) {
        this['@:{dialog.close}']();
        let { src } = e.params;
        Toast.show(I18n('@:{lang#template.fetching.content}'), 0, 1);
        await loadExampleContent(src);
        Toast.hide();
    },
}).static({
    '@:{show}'(owner) {
        if (config('getTemplateUrl')) {
            owner.mxDialog({
                view: '@:./example',
                width: 1076
            });
        }
    },
    '@:{load}'() {
        Toast.show(I18n('@:{lang#template.fetching.content}'), 0, 1);
        return new P<number>(async resolve => {
            let s = new Service();
            s.all('@:{get.templates}', async (ex, bag) => {
                let list = bag.get('data.list', []);
                let fill;
                if (DEBUG &&
                    Magix.parseUrl(location.href).params.id) {
                    let { params } = Magix.parseUrl(location.href)
                    fill = await loadExampleContent(params as any);
                    Toast.hide();
                    resolve(fill);
                } else {
                    let one = list[floor(random() * list.length)];
                    if (one) {
                        fill = await loadExampleContent(one);
                    }
                    Toast.hide();
                    resolve(fill);
                }
            });
        });
    }
});