import Magix from 'magix5';
let { Service, toParams, toUrl, config, HIGH, State } = Magix;

/**
 * 提取错误和数据
 * @param response 响应数据
 * @param url 接口url
 * @returns 错误和数据
 */
let extractErrorAndData = (response, url) => {
    let error;
    let data;
    if (response.success) {
        data = response.data;
    } else {
        error = response.message || `接口${url}错误`;
    }
    return {
        '@:{error}': error,
        '@:{data}': data
    };
};
/**
 * 使用jsonp向后端请求
 * @param sendUrl 请求地址
 * @param options 请求参数
 * @param callbackKey 回调字符串
 */
// let jsonp = (sendUrl, options, callbackKey = 'callback') => {
//     let doc = document;
//     let head = doc.head;
//     return new Promise<any>((resolve, reject) => {
//         let script = doc.createElement('script');
//         let key = guid('script_');
//         window[key] = r => {
//             clean();
//             resolve(r);
//         };
//         let clean = () => {
//             delete window[key];
//             head.removeChild(script);
//         };
//         script.onerror = e => {
//             clean();
//             reject(Error(sendUrl + '[script error]'));
//         };
//         let body = options && options.body || {};
//         body[callbackKey] = key;
//         sendUrl = toUrl(sendUrl, body);
//         script.src = sendUrl;
//         head.appendChild(script);
//     });
// };
/**
 * 使用fetch进行请求
 * @param sendUrl 请求地址
 * @param options 请求参数
 */
let send = (sendUrl, options) => {
    return fetch(sendUrl, options).then(res => {
        if (res.ok) {
            return res.json();
        }
        throw Error(res.statusText || 'Response error');
    });
};
/**
 * 与后端接口交互对象
 */
let RDService = Service.extend((bag, callback) => {
    State.fire('@:{event#magix.request}', {
        '@:{is.start}': 1
    });
    let method = bag.get('@:{method}') || 'get';
    let query = bag.get('@:{query}');
    let body = bag.get('@:{body}');
    let url = bag.get('url');
    //console.log(bag.get('name'));
    let isUpload = bag.get('@:{upload}');
    let headers = {
        'Accept': 'application/json',
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    let options = {
        method,
        credentials: 'include'
    } as RequestInit;
    if (!isUpload) {
        options.headers = headers;
    }
    let version = DEBUG ? Date.now() : config('version');
    /**
     * query放url里，body放请求的body里，某些后端严格区分取参数时，从body里还是request里面取
     */
    url = toUrl(url, { ...query, v: version });
    if (body &&
        !isUpload) {
        options.body = toParams(body);
    }
    //如果需要jsonp，则把上面的jsonp函数解除注释，在这里根据情况调用send或jsonp函数即可
    //对于jsonp，只有get方法，没有post方法，所以在jsonp里，会把body中的参数拼接到url里，超长会被截断，这里需要注意
    //所以优先使用fetch方法进行跨域请求
    send(url, options).then(res => {
        State.fire('@:{event#magix.request}');
        let {
            '@:{error}': error,
            '@:{data}': data
        } = extractErrorAndData(res, url);
        if (error) {
            callback({
                message: error
            });
        } else {
            bag.set({
                data
            });
            //setTimeout(callback, 5e3);
            callback();
        }
    }).catch(ex => {
        State.fire('@:{event#magix.request}');
        callback({ message: ex.message });
    });
});
/**
 * service中只有2个约定的key:name和cache
 * name必须配置，指示接口的名称
 * cache如果配置，则指示该接口缓存多长时间(ms为单位)
 * 其它均可以自定义设置
 */
RDService.add([{
    name: '@:{get.images}',
    url: config('getImageUrl'),
    cache: 1 * 60 * HIGH
}, {
    name: '@:{get.fields}',
    url: config('getFieldUrl')
}, {
    name: '@:{get.templates}',
    url: config('getTemplateUrl'),
    cache: 1 * 60 * HIGH
}, {
    name: '@:{save.content}',
    url: config('saveContentUrl'),
    '@:{method}': 'post'
}, {
    name: '@:{get.content}',
    url: config('getContentUrl')
}, {
    name: '@:{get.preset}',
    url: config('presetUrl')
}, /*{
    name: '@:{get.by.url}'
},*/ {
    name: '@:{post.by.url}',
    '@:{method}': 'post'
}]);

RDService['@:{extract.error.and.data}'] = extractErrorAndData;
export default RDService;