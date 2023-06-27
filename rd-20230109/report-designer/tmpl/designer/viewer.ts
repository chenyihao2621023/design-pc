/**
 * author:kooboy_li@163.com
 * 使用自定义对话框打印预览
 */
import Magix from 'magix5';
import Runner from '../gallery/mx-runner/index';
import StageGeneric from './generic';
import ToJSON from './tojson';
import Const from './const';
let { View, node } = Magix;
export default View.extend({
    tmpl: '@:./viewer.html',
    async render() {
        let previewUrl = StageGeneric['@:{generic#query.preview.url}'](1);
        await this.digest({
            src: previewUrl
        });
        let old = this['@:{viewer.post.fn}'];
        if (old) {
            Runner["@:{task.remove.background}"](old);
        }
        this['@:{viewer.try.send.message}'] = 0;
        let w = node<HTMLIFrameElement>(`_rd${this.id}`).contentWindow;
        let { protocol, host } = location;
        let origin = protocol + '//' + host;
        let post = () => {
            w.postMessage(ToJSON(1, 1), origin);
            this['@:{viewer.try.send.message}']++;
            if (this['@:{viewer.try.send.message}'] > Const['@:{const#viewer.try.send.times}']) {
                Runner["@:{task.remove.background}"](post);
            }
        };
        Runner["@:{task.add.background}"](Const['@:{const#viewer.try.send.interval}'], this['@:{viewer.post.fn}'] = post);
    },
    '$win<message>'(e: MessageEvent) {
        let { protocol, host } = location;
        let origin = protocol + '//' + host;
        if (e.origin == origin &&
            e.data == '@:{viewer.message.received}') {
            console.log('received', e);
            (<Window>e.source).focus();
            Runner["@:{task.remove.background}"](this['@:{viewer.post.fn}']);
        }
    },
})