//资源加载器，对于页面加载完成就需要转成图片或pdf的情况下，需要等待图片等资源就绪后才能转换
import Magix from 'magix5';
let { use, isFunction, Base } = Magix;
let P = Promise;
let loadProvider = async file => {
    let [provider] = await use<Function[]>('@:../../provider/' + file);
    if (isFunction(provider)) {
        await provider();
    } else if (isFunction(provider['@:{load.library}'])) {
        await provider['@:{load.library}']();
    }
};
let loadScript = async file => await use('@:../../elements/' + file + '/index');
let loadImage = src => {
    return new P<void>(resolve => {
        let img = new Image();
        img.onload = img.onerror = () => {
            resolve();
        };
        img.src = src;
        if (img.complete) {
            resolve();
        }
    });
};

export default Base.extend({
    ctor() {
        this['@:{locker}'] = {};
        this['@:{queue}'] = [];
    },
    /**
     * 添加资源
     * @param type 资源类型
     * @param src 资源地址
     */
    '@:{add}'(type, src) {
        let key = type + '~' + src;
        let locker = this['@:{locker}'];
        let queue = this['@:{queue}'];
        //同一类型的资源只需要加载一次，所以进行锁定判断
        if (locker[key] != 1) {
            locker[key] = 1;
            queue.push({
                type,
                src
            });
        }
    },
    /**
     * 加载资源
     */
    '@:{load}'() {
        /**
         * 根据不同的资源进行相应的加载，目前只有图片和第三方组件需要进行资源加载
         */
        let promises = [];
        let queue = this['@:{queue}'];
        for (let { type, src } of queue) {
            if (type == '@:{provider}') {
                promises.push(loadProvider(src));
            } else if (type == '@:{script}') {
                promises.push(loadScript(src));
            } else {
                promises.push(loadImage(src));
            }
        }
        return P.all(promises);
    },
    /**
     * 清除已加载
     */
    '@:{clear.loaded}'() {
        this['@:{queue}'].length = 0;
    }
});
