/**
 * 尺寸变化插件
 */
import Magix from 'magix5';
import Runner from '../gallery/mx-runner/index';
let { State, node } = Magix;
let stage,
    cachedWidth,
    cachedHeight,
    cachedOffsetWidth,
    cachedOffsetHeight,
    cachedPageWidth,
    cachedPageHeight;
let watchSizeChange = () => {
    let stageRealWidth = stage.scrollWidth;
    let stageRealHeight = stage.scrollHeight;
    let stageOffsetWidth = stage.offsetWidth;
    let stageOffsetHeight = stage.offsetHeight;
    let page = State.get('@:{global#stage.page}');
    let changed;
    if (stageRealHeight) {
        if (stageRealWidth != cachedWidth) {
            cachedWidth = stageRealWidth;
            changed = 1;
        }
        if (stageRealHeight != cachedHeight) {
            cachedHeight = stageRealHeight;
            changed = 1;
        }
        if (stageOffsetWidth != cachedOffsetWidth) {
            cachedOffsetWidth = stageOffsetWidth;
            changed = 1;
        }
        if (stageOffsetHeight != cachedOffsetHeight) {
            cachedOffsetHeight = stageOffsetHeight;
            changed = 1;
        }
        if (page.width != cachedPageWidth) {
            changed = 1;
            cachedPageWidth = page.width;
        }
        if (page.height != cachedPageHeight) {
            changed = 1;
            cachedPageHeight = page.height;
        }
    }
    if (changed) {
        State.fire('@:{event#stage.size.change}');
    }
};

export default {
    '@:{wsize#update}': watchSizeChange,
    '@:{wsize#setup}'() {
        stage = node('_rd_stage');
        Runner["@:{task.add}"](330, watchSizeChange);
    },
    '@:{wsize#teardown}'() {
        stage = null;
        Runner['@:{task.remove}'](watchSizeChange);
    }
};