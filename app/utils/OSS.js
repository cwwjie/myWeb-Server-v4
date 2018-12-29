// 框架类
const path = require('path');
const { Readable, Writable } = require('stream');
var COS = require('cos-nodejs-sdk-v5'); // 引入模块
// 配置文件类
const config = require(path.relative(__dirname, './config/config.default.js'));



/**
 * 使用永久密钥创建实例
 */
let OssMount = new COS({
    SecretId: config.tencentoss.secretId,
    SecretKey: config.tencentoss.secretKey,
});

module.exports.mount = OssMount; // 暴露 oss 的实例



/**
 * 重写 stream Readable 的类
 * 目的是根据字符串创建一个可读流
 */
class CreateReadStreamByString extends Readable {
    constructor(str) {
        super({encoding: 'utf8'});
        this.myString = str;
    }

    /**
     * 继承了 Readable 的类必须实现(重写)这个方法(函数)
    // 否则(不重写)就没意义了
     */
    _read() {
        this.push(this.myString); // 把字符串一次性推进去
        this.push(null); // 触发 end 事件
    }
}

/**
 * 通过 string 上传到 oss 服务器
 * @param {string} str 要上传的字符串
 * @param {string} path 要上传的路径
 */
let putObjectByString = (str, path) => new Promise((resolve, reject) => {
    OssMount.putObject({
        Bucket : config.tencentoss.bucket,
        Region : config.tencentoss.region,
        Key : path,
        Body: new CreateReadStreamByString(str),
        // onProgress: function (progressData) { // 进度回调函数，回调是一个对象，包含进度信息
        //     console.log('progressData', progressData);
        // },
    }, function(err, data, ETag) {
        if(err) {
            return reject(err);
        }

        resolve(data, ETag);
    });
});

module.exports.putObjectByString = putObjectByString; // 暴露 通过 string 上传到 oss 服务器



/**
 * 重写 stream Writable 的类
 * 目的是 拦截 _write 的 chunk 数据
 */
class CreateWritableStream extends Writable {
    constructor(outputfun) {
        super();

        this.outputfun = outputfun;
    }

    _write(chunk, encoding, callback) {
        this.outputfun(chunk);
        callback();
    }
}

/**
 * 获取 oss 服务器的资源
 * @param {string} path 要获取的路径
 */
let getObject = path => {
    let result = '';
    /**
     * 输出的函数
     */
    let outputfun = chunk => {
        result += chunk.toString("utf-8");
    }

    /**
     * 初始化 自己重写 stream Writable 的类
     */
    let myWritableStream = new CreateWritableStream(outputfun);

    /**
     * 注册获取  oss 服务器的资源 的事件
     */
    let getObjectPromise = new Promise((resolve, reject) => {

        OssMount.getObject({
            Bucket : config.tencentoss.bucket,
            Region : config.tencentoss.region,
            Key : path,
            Output: myWritableStream,
        }, function(err, data) {
            if(err) {
                return reject(err);
            }
    
            resolve(data);
        });
    
    });

    /**
     * 注册 stream Writable 类 完成事件
     */
    let writableStreamPromise = new Promise((resolve, reject) => {
        myWritableStream.on('finish', () => {
            resolve(result);
        });
    });

    // 这里优先取 writableStreamPromise 的值
    // 第二个值仅仅是为了保证 stream Writable finish 无误
    return Promise.all([writableStreamPromise, getObjectPromise]);
}

module.exports.getObject = getObject; // 暴露 获取 oss 服务器的资源
