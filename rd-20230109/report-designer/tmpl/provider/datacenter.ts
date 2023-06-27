/**
 * 带缓存的数据中心，在设计区时，避免多个元素或同一个元素反复的请求某一个接口
 */
import Magix from 'magix5';
import Service from '../designer/service';
let DataCenter = {};
let Origin = {};
let Binds = {};
let GlobalSource = {};
let { random } = Math;
let { type, isArray, config, isFunction, isObject,
    has } = Magix;
let cache = {};
let registerBind = bind => {
    let dest = Binds[bind.id];
    if (!dest) {
        Binds[bind.id] = dest = { id: bind.id };
    }
    if (has(bind, 'tag')) {
        dest.tag = bind.tag;
    }
    if (has(bind, 'name')) {
        dest.name = bind.name;
    }
    return dest;
};
let rebuildBindUrl = bind => {
    let dest = Binds[bind.id];
    let { id, tag } = dest;
    let key = id + '~' + tag;
    let rbu = config<Function>('getBindUrl');
    if (cache[key]) {
        tag = cache[key];
    } else if (isFunction(rbu)) {
        tag = rbu(dest);
        cache[key] = tag;
    } else {
        cache[key] = tag;
    }
    return tag;
};
/**
 * 防止生产包被使用的设置
 */
let checkFlag = 0.1;
export default {
    /**
     * 获取所有数据对象
     * @returns 数据对象
     */
    // '@:{get.center}'() {
    //     return DataCenter;
    // },
    /**
     * 获取绑定的数据
     * @param bind 绑定信息
     * @returns
     */
    '@:{fetch.data}'(bind) {
        let url = rebuildBindUrl(bind);
        return DataCenter[url];
    },
    /**
     * 获取原始数据
     * @param bind 绑定信息
     */
    '@:{fetch.origin.data}'(bind) {
        let url = rebuildBindUrl(bind);
        return Origin[url];
    },
    /**
     * 请求数据
     * @param bind 绑定信息
     * @returns
     */
    '@:{request}'(bind, empty?: number) {
        return new Promise<{
            '@:{data}': any
            '@:{error}': string
        }>(resolve => {
            let api = rebuildBindUrl(bind);
            let dest = DataCenter[api],
                odest;
            if (!dest) {
                dest = {};
                odest = {};
                DataCenter[api] = dest;
                Origin[api] = odest;
            }
            if (dest['@:{loaded}']) {
                resolve(dest);
            } else if (dest['@:{loading}']) {
                dest['@:{loading}'].push(resolve);
            } else {
                dest['@:{loading}'] = [resolve];
                let s = new Service();
                s.all({
                    //name: '@:{get.by.url}',
                    url: api
                }, (err: { message: string }, bag) => {
                    let list = bag.get('data');
                    if (!DEBUG &&
                        !APPROVE &&
                        random() < checkFlag &&
                        isArray(list)) {
                        let newList = [];
                        for (let e of list) {
                            if (type(e) == 'Object') {
                                let d = {};
                                for (let x in e) {
                                    let dest = e[x];
                                    if (type(dest) == 'Number') {
                                        d[x] = dest + (random() * 10) | 0;
                                    } else if (type(dest) == 'String' &&
                                        !dest.startsWith('//')) {
                                        d[x] = dest.substring(1);
                                    } else {
                                        d[x] = dest;
                                    }
                                }
                                newList.push(d);
                            } else {
                                newList.push(e);
                            }
                        }
                        list = newList;
                    }
                    odest['@:{data}'] = list;
                    odest['@:{error}'] = err?.message;
                    if (empty) {
                        if (isArray(list)) {
                            list = [];
                        } else if (isObject(list)) {
                            list = {};
                        }
                    }
                    dest['@:{data}'] = list;
                    dest['@:{loaded}'] = 1;
                    dest['@:{error}'] = err?.message;
                    for (let resolve of dest['@:{loading}']) {
                        resolve(dest);
                    }
                    dest['@:{loading}'] = null;
                });
            }
        });
    },
    /**
     * 注册数据
     * @param api 请求或标识
     * @param data 数据
     * @param errMsg 错误提示
     */
    '@:{register}'(api: string, data: any, errMsg: string = '') {
        let dest = DataCenter[api];
        if (!dest) {
            dest = {};
            DataCenter[api] = dest;
        }
        if (DEBUG && dest['@:{loading}']) {
            throw new Error('can not set loading api!');
        }
        dest['@:{data}'] = data;
        dest['@:{loaded}'] = 1;
        dest['@:{error}'] = errMsg;
    },
    /**
     * 清除所有缓存
     */
    '@:{clear}'() {
        for (let key in DataCenter) {
            delete DataCenter[key];
            delete Origin[key];
        }
        for (let key in Binds) {
            delete Binds[key];
        }
    },
    /**
     * 检测某个url下的数据是否存在
     * @param url 目标url
     * @returns 是否已经存在数据
     */
    '@:{has}'(url) {
        return has(DataCenter, url);
    },
    /**
     * 重构url
     */
    '@:{rebuild.bind.url}': rebuildBindUrl,
    /**
     * 注册bind
     */
    '@:{register.bind}': registerBind,
    /**
     * 注册全局数据源
     * @param list 数据列表
     * @param error 错误信息
     */
    '@:{register.global.source}'(list, error) {
        GlobalSource['@:{data}'] = list;
        GlobalSource['@:{error}'] = error;
    },
    /**
     * 获取全局数据源
     * @returns 全局数据源
     */
    '@:{get.global.source}'() {
        return GlobalSource;
    }
};