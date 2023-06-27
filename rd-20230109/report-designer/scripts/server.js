/**
 * 该文件是nodejs下的接收与响应中文服务端试验页面
 */
let http = require('http');
let qs = require('querystring');
let url = require('url');

http.createServer((request, response) => {
    //暂存请求体信息
    let body = '';

    //每当接收到请求体数据，累加到post中
    request.on('data', chunk => body += chunk);

    //在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    request.on('end', () => {
        // 解析参数
        let form = qs.parse(body);  //将一个字符串反序列化为一个对象
        console.log('body=>', form);
        console.log('stage=>', form.stage);
        let refer = request.headers.referer;
        let u = url.parse(refer);
        response.setHeader('Access-Control-Allow-Credentials', 'true');
        response.setHeader('Access-Control-Allow-Origin', u.protocol + '//' + u.hostname);
        response.end(JSON.stringify({
            status: 0,
            message: '响应中文测试'
        }));
    });
}).listen(9988);