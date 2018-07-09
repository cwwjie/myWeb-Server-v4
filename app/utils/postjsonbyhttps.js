const https = require('https');
var querystring = require("querystring");

/**
 * 封装 post 请求 返回json格式
 * @param {string} hostname 请求的主机名 例如: api.weixin.qq.com
 * @param {string} path 地址 例如: /cgi-bin/menu/create?access_token=ACCESS_TOKEN
 * @param {object} reqData 请求的参数
 * @return {Promise} resolve: {}, reject: 'error';
 */
module.exports = (hostname, path, reqData) => new Promise((resolve, reject) => {
    const postData = querystring.stringify(reqData);
    const opts = {
        hostname: hostname,
        port: '443',
        path: path,
        method: 'POST',
        json: true,
        headers: {
            'Accept': 'application/json;version=2.0',
            'Content-Type': 'application/json',
        }
    }

    let req = https.request(opts, res => {
        let datas = [];
        let size = 0;

        if (res.statusCode !== 200) {
            res.resume();
            return reject(res);
        }

        if (!/^application\/json/.test(res.headers['content-type'])) {
            res.resume();
            return reject(`请求成功, 但是返回错误的数据. 原因: 不是json格式}`);
        }

        res.setEncoding('utf8');
        res.on('data', data => {
            datas.push(data);
            size += data.length;
        });
        res.on('end', () => {
            let buff = Buffer.concat(datas, size);
            let result = buff.toString();
            resolve(JSON.parse(result));
        });
    });

    req.on('error', err => {
        reject(err);
    });
    
    req.write(postData);
    req.end();
});
