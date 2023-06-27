/*
    author:https://github.com/xinglie
*/
'ref@:./index.less';
import Magix from 'magix5';
import Const from '../../designer/const';
import Keyboard from '../../designer/keyboard';
import Service from '../../designer/service';
import Dialog from '../../gallery/mx-dialog/index';
import Toast from '../../gallery/mx-toast/index';
import I18n from '../../i18n/index';
let { View, mark, node, config } = Magix;
let { max, floor } = Math;
interface SaveImageResult {
    url?: string
    width?: number
    height?: number
};
let defaultSaveResult: SaveImageResult = {};
let getImageList = (itemList: DataTransferItemList) => {
    let files = [];
    for (let i of itemList) {
        if (i.type.startsWith('image/')) {
            files.push(i.getAsFile());
        }
    }
    return files;
}
export default View.extend({
    tmpl: '@:list.html',
    init({ defined, done, _close }) {
        let me = this;
        me['@:{defined}'] = defined;
        me['@:{dialog.close}'] = _close;
        me['@:{done.callback}'] = done;
        me.set({
            hl: Const['@:{const#show.help.and.ow.links}']
        });
        me.on('destroy', () => {
            Toast.hide();
        });
        /*
            图片接口返回groups用于分组，前端的current是显示groups的下标
            返回的list是选中分组的数据，total是选中分组的总数
        */
        me.set({
            page: 1,
            size: max(45, floor((innerHeight - 132) / 131) * 9),
            keyword: '',
            current: '',
        });
    },
    render() {
        let m = mark(this, '@:{render}');
        let s = new Service();
        let { page, size, keyword,
            current } = this.get();
        s.all({
            name: '@:{get.images}',
            '@:{query}': {
                page,
                size,
                keyword,
                groupId: current
            }
        }, (err, bag) => {
            if (m()) {
                let list = bag.get<object[]>('data.list', []);
                let groups = [...bag.get('data.groups', [])],
                    total = bag.get('data.total', 0);
                if (!current) {
                    current = groups[0]?.id;
                }
                if (config('imageUploadUrl')) {
                    groups.push({
                        title: '本地上传',
                        id: 'upload'
                    });
                }
                groups.push({
                    title: '网络图片',
                    id: 'network'
                });
                this.digest({
                    groups,
                    total,
                    error: err,
                    current,
                    list
                });
            }
        });
    },
    '@:{search}<keyup>'(e: Magix5.MagixKeyboardEvent) {
        if (e.code == Keyboard['@:{key#enter}']) {
            let input = e.eventTarget as HTMLInputElement;
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
    '@:{use}<click>'(e) {
        let me = this;
        let img = new Image();
        let done = me['@:{done.callback}'];
        let src = e.params.src;
        let defined = me['@:{defined}'];
        if (defined.im) {
            done({
                src
            });
            this['@:{dialog.close}']();
        } else {
            let m = mark(this, '@:{use}');
            Toast.show('正在获取图片尺寸...');
            img.onerror = () => {
                if (m()) {
                    Toast.hide();
                    me.alert(I18n('@:{lang#load.img.error}'));
                }
            };
            img.onload = () => {
                if (m()) {
                    Toast.hide();
                    let w = img.width;
                    let h = img.height;
                    done({
                        src,
                        width: w,
                        height: h
                    });
                    this['@:{dialog.close}']();
                }
            };
            img.src = src;
        }
    },
    // '@:{change.tab}<click>'(e: Magix5.MagixPointerEvent) {
    //     let { to } = e.params;
    //     if (to == 'network' ||
    //         to == 'upload') {
    //         this.digest({
    //             current: to
    //         });
    //     } else {
    //         this.set({
    //             page: 1,
    //             keyword: '',
    //             current: to
    //         });
    //         this.render();
    //     }
    // },
    '@:{change.category}<change>'({ value }: Magix5.MagixPointerEvent & {
        value: string
    }) {
        if (value == 'network' ||
            value == 'upload') {
            this.digest({
                current: value
            });
        } else {
            this.set({
                page: 1,
                keyword: '',
                current: value
            });
            this.render();
        }
    },
    '@:{close}<click>'() {
        this['@:{dialog.close}']();
    },
    '@:{upload.files}'(files) {
        let uploading = this.get('uploading');
        if (uploading) return;

        this.digest({
            uploadError: '',
            uploading: true
        });
        let done = this['@:{done.callback}'];
        let s = new Service();
        let fd = new FormData();
        for (let f of files) {
            fd.append('images[]', f);
        }
        s.save({
            name: '@:{post.by.url}',
            url: this.get('uploadUrl'),
            '@:{upload}': 1,
            '@:{body}': fd
        }, (ex, bag) => {
            if (ex) {
                this.digest({
                    uploading: false,
                    uploadError: ex.message
                });
            } else {
                let data = bag.get<SaveImageResult>('data', defaultSaveResult);
                done({
                    src: data.url,
                    width: data.width,
                    height: data.height
                });
                this['@:{dialog.close}']();
            }
        });
    },
    '@:{select.upload}<change>'(e: Magix5.MagixMixedEvent) {
        let target = e.eventTarget as HTMLInputElement;
        let files = target.files;
        this['@:{upload.files}'](files);
    },
    '@:{drop.upload}<drop>&{passive:false}'(e: DragEvent) {
        let files,
            { dataTransfer } = e;
        this['@:{prevent.default}'](e);
        if (dataTransfer?.items) {
            files = getImageList(dataTransfer.items);
        }
        if (files?.length) {
            this['@:{upload.files}'](files);
        }
    },
    '@:{retry}<click>'() {
        this.digest({
            uploadError: ''
        });
    },
    '@:{apply.network.image}<click>'() {
        let input = node<HTMLInputElement>(`_rd_nw_${this.id}`);
        let url = input.value.trim();
        if (url) {
            let done = this['@:{done.callback}'];
            let defined = this['@:{defined}'];
            if (defined.im) {
                done({
                    src: url
                });
                this['@:{dialog.close}']();
            } else {
                let m = mark(this, '@:{use}');
                Toast.show('正在获取图片尺寸...');
                let img = new Image();
                img.onload = () => {
                    if (m()) {
                        Toast.hide();
                        done({
                            src: url,
                            width: img.width,
                            height: img.height
                        });
                        this['@:{dialog.close}']();
                    }
                };
                img.onerror = () => {
                    if (m()) {
                        input.select();
                        Toast.show('无法加载图片，请检查地址后重试~', 2e3);
                    }
                };
                img.src = url;
            }
        } else {
            Toast.show('请粘贴/输入图片地址~', 2e3);
            input.focus();
        }
    },
    '@:{page.change}<change>'(e) {
        console.log(e.page);
    },
    '$doc<paste>'(e: ClipboardEvent) {
        let current = this.get('current');
        if (current == 'upload') {
            let clipboardData = e.clipboardData;
            let files;
            if (clipboardData?.items) {
                files = getImageList(clipboardData.items);
            }
            if (files?.length) {
                this['@:{upload.files}'](files);
            }
        }
    }
}).merge(Dialog);