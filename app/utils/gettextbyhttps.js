const https = require('https');

/**
 * 封装 get 请求 返回 文本 TEXT 格式
 * @param {string} url 请求的链接
 * @return {Promise} Promise
 */
module.exports = url => new Promise((resolve, reject) => {
    https.get(url, res => {
        const { statusCode } = res;

        if (statusCode !== 200) {
            res.resume();
            return reject(`The Response statusCode have error, that is ${statusCode}`);

        }

        res.setEncoding('utf8');

        let rawData = '';
        res.on('data', chunk => rawData += chunk);
        res.on('end', () => {
            try {
                resolve(rawData);

            } catch (e) {
                reject(`The Response have error, that reason code is: ${e.message}`);

            }
        });
        
    }).on('error', e => {

        reject(`The Request have error, that reason code is: ${e.message}`);
    });
});
