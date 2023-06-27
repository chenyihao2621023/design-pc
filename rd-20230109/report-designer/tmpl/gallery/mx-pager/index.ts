/*
    author:https://github.com/xinglie
*/
import Magix from 'magix5';
let { floor } = Math;
let { View, applyStyle, dispatch } = Magix;
applyStyle('@:./index.less');
export default View.extend({
    tmpl: '@:./index.html',
    assign(data) {
        this.set(data);
    },
    render() {
        let total = this.get<number>('total') || 0;//总共有多少页
        let page = (this.get<number>('page') | 0) || 1;//当前显示第几页
        let size = this.get<number>('size') || 20;//每页显示多少个
        let step = this.get<number>('step') || 9;//页码过多时，中间显示几个
        let max = this.get('mmax');
        let min = this.get('mmin');
        let pages = floor(total / size) + 1;
        if (page > pages) {//对页码进行纠正
            page = pages;
        }
        let middle = step / 2 | 0;//步长中间数值
        let start = max(1, page - middle);
        let end = min(pages, start + step - 1);
        start = max(1, end - step + 1);
        let offset;
        if (start <= 2) { //=2 +1  =1  +2
            offset = 3 - start;
            if (end + offset < pages) {
                end += offset;
            }
        }
        if (end + 2 > pages) {
            offset = 2 - (pages - end);
            if ((start - offset) > 1) {
                start -= offset;
            }
        }
        if (start == 3) {
            start -= 1;
        }
        if (end + 2 == pages) {
            end += 1;
        }
        this.digest({
            start,
            end,
            page,
            pages
        });
    },
    '@:{to.page}<click>'(e: Magix5.MagixPointerEvent) {
        let { page } = e.params;
        dispatch(this.root, 'change', {
            page
        });
        this.render({
            page
        });
    }
});