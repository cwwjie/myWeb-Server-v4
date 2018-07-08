const https = require('https');

/**
 * 封装 get 请求 返回json格式
 * @param {string} url 请求的链接
 * @return {Promise} resolve: {}, reject: 'error';
 */
module.exports = url => new Promise((resolve, reject) => {
  https.get(url, res => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];

    if (statusCode !== 200) {
      res.resume();
      reject(`The Response statusCode have error, that is ${statusCode}`);
      return;
    } else if (!/^application\/json/.test(contentType)) {
      res.resume();
      reject(`The Response content-type is ${contentType} instead of application/json`);
      return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        resolve(JSON.parse(rawData));
      } catch (e) {
        reject(`The Response have error, that reason code is: ${e.message}`);
      }
    });
  }).on('error', (e) => {
    reject(`The Request have error, that reason code is: ${e.message}`);
  });
});
