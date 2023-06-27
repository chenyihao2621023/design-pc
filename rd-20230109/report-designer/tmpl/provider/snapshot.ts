/**
 * 设计区快照插件
 */

import Magix from 'magix5';
import Service from '../designer/service';
import ToJSON from '../designer/tojson';
import HTML2CanvasProvider from './html2canvas';
let { State, mark, node, config, } = Magix;
//间隔多少毫秒时间后无操作进行快照处理
let SNAPSHOT_INTERVAL = 5000;
/**
 * 依附于哪个view，异步处理使用
 */
let OWNER_VIEW: Magix5.View;
/**
 * 保存数据到服务器方法
 * @param data 数据
 */
let saveToRemote = data => {
    /**
     * data中image是base64后的设计区图像
     * data中scale是当前设计区的缩放，如果需要保存非缩放图片，需要在服务端根据scale进行宽、高的调整，相除即可
     */
    console.log(data);
    //以下是用自带的接口管理进行保存数据，可换成自己喜欢的如axios库
    let url = config<string>('snapshotUrl');
    let page = State.get<Report.StagePage>('@:{global#stage.page}');
    console.log(page);
    if (url) {
        let s = new Service();
        s.save({
            name: '@:{post.by.url}',
            url,
            '@:{body}': data
        }, (ex, bag) => {
            console.log(ex, bag);
        });
    }
};
/**
 * 快照
 */
let takeSnapshot = async () => {
    let waitMark = mark(OWNER_VIEW, '@:{wait.html2canvas}');
    await HTML2CanvasProvider();
    let stage = node<HTMLDivElement>('_rd_sc');
    let options = {
        useCORS: true,
        scale: 2
    };
    let canvas = await html2canvas(stage, options);
    let scale = State.get<number>('@:{global#stage.scale}');
    if (waitMark()) {
        //document.body.appendChild(canvas);
        let image = canvas.toDataURL('image/jpeg', 1.0);
        saveToRemote({
            image,
            scale
        });
    }
};
/**
 * 定时器
 */
let lastTimer,
    lastJSON;
let reset = () => {
    lastJSON = ToJSON(1);
};
/**
 * 监控设计区，指定时间内无动作进行快照处理
 */
let watch = () => {
    clearTimeout(lastTimer);
    let m = mark(OWNER_VIEW, '@:{snapshot}');
    lastTimer = setTimeout(() => {
        //有阻止键盘的动作，说明鼠标在工作
        let prevent = State.get<boolean>('@:{global#pointer.is.active}');
        if (m() &&
            !prevent) {
            let newJSON = ToJSON(1);
            if (lastJSON != newJSON) {
                takeSnapshot();
            }
            lastJSON = newJSON;
        }
    }, SNAPSHOT_INTERVAL);
};
export default {
    /**
     * 安装插件
     */
    '@:{snapshot#setup}'(ownerView: Magix5.View) {
        OWNER_VIEW = ownerView;
        State.on('@:{event#history.shift.change}', watch);
        State.on('@:{event#history.list.change}', watch);
        State.on('@:{event#stage.select.element.props.change}', watch);
        State.on('@:{event#example.change}', reset);
    },
    /**
     * 卸载插件
     */
    '@:{snapshot#teardown}'() {
        OWNER_VIEW = null;
        lastJSON = null;
        clearTimeout(lastTimer);
        State.off('@:{event#history.shift.change}', watch);
        State.off('@:{event#history.list.change}', watch);
        State.off('@:{event#stage.select.element.props.change}', watch);
        State.off('@:{event#example.change}', reset);
    },
};