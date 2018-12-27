// 框架类
const path = require('path');
const Controller = require('egg').Controller;
const parseString = require('xml2js').parseString;
const lodash = require('lodash');
// 组件类
const consequencer = require(path.relative(__dirname, './app/utils/consequencer'));
const encryption = require(path.relative(__dirname, './app/utils/encryption'));
const createRandomStr = require(path.relative(__dirname, './app/utils/createRandomStr'));

class WeixinController extends Controller {
    async index() {
        this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in 【weixin】.';
    }

    /**
     * 验证开发者服务器 正确响应微信发送的Token验证
     * @return {string} echostr {};
     */
    async responseHandle() {
        let request = this.ctx;

        // 判断参数
        if (!request.query || !request.query.signature || !request.query.echostr || !request.query.timestamp || !request.query.nonce) {
            return this.ctx.body = consequencer.error('参数错误!');
        }

        // 将token、timestamp、nonce三个参数进行字典序排序 拼接成一个字符串
        let hashcodeString = ['RejiejayWeChatHandleToken', request.query.timestamp, request.query.nonce].sort().join('');
        // sha1加密
        let hashcode = encryption.sha1ToLowerCase(hashcodeString);

        if (hashcode === request.query.signature) {
            return this.ctx.body = request.query.echostr;
        } else {
            return this.ctx.body = consequencer.error('Token验证失败!');
        }
    }

    /**
     * 文本消息
     * @param {xml} xml 
     * <xml>
     *   <ToUserName>rejiejay</ToUserName>
     *   <FromUserName>oI0FV0pK5sqCnE_LBBXb6sxdROwg</FromUserName>
     *   <CreateTime>1348831860</CreateTime>
     *   <MsgType>text</MsgType>
     *   <Content>this is a test</Content>
     *   <MsgId>1234567890123456</MsgId>
     * </xml>
     * @return {boolen} 是否成功创建
     */
    async messageHandle() {
        const _this = this;

        // 获取 body
        let xmlJsonResult = await new Promise((resolve, reject) => {
            let XML = '';
            
            _this.ctx.req.on('data', chunk => XML += chunk);

            _this.ctx.req.on('end', () => {
                try {
                    // 解析 XML
                    parseString(decodeURI(XML), (err, result) => {
                        if (err) {
                            return reject(`解析xml失败, 原因: ${err}`);
                        }
                        resolve(result);
                    });
                } catch (error) {
                    reject(`解析xml失败, 原因: ${error}`);
                }
            });
        })
        .then(
            xmlJson => consequencer.success(xmlJson),
            error => consequencer.error(error)
        ).catch(error => consequencer.error(error));

        // 解析 xml
        if (xmlJsonResult.result !== 1) {
            // {
            //     "result": 1,
            //     "data": {
            //         "xml": {
            //             "URL": ["https://www.rejiejay.cn/server/weixin/messagehandle"],
            //             "ToUserName": ["rejiejay"],
            //             "FromUserName": ["oI0FV0pK5sqCnE_LBBXb6sxdROwg"],
            //             "CreateTime": ["1348831860"],
            //             "MsgType": ["text"],
            //             "Content": ["thisIsATest"],
            //             "MsgId": ["1234567890123456"]
            //         }
            //     },
            //     "message":"success"
            // }
            return this.ctx.body = xmlJsonResult;
        }

        // 判断是否文本消息
        let xmlJson = xmlJsonResult.data.xml;
        if (xmlJson.MsgType[0] !== 'text') {
            return this.ctx.body = 'success';
        }

        // 判断是否本人
        this.ctx.status = 200;
        this.ctx.set('Content-Type', 'application/xml');
        let randomPassword = lodash.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 'a', 'b', 'c']).join('').slice(0, 6);
        let createRespondXml = Content => {
            return '<xml>' + 
                '<ToUserName><![CDATA[' + xmlJson.FromUserName[0] + ']]></ToUserName>' + 
                '<FromUserName><![CDATA[' + xmlJson.ToUserName[0] + ']]></FromUserName>' + 
                '<CreateTime>' + Math.floor(new Date().getTime() / 1000) + '</CreateTime>' + 
                '<MsgType><![CDATA[text]]></MsgType>' + 
                '<Content><![CDATA[' + Content + ']]></Content>' + 
            '</xml>';
        }
        if (xmlJson.FromUserName[0] === 'oAgi7wIJfHhDRx8_iDd0_b2Mkq-U') {
            this.ctx.service.user.savePassword(randomPassword, false);
            return this.ctx.body = createRespondXml('成功确认身份，你的密码是：' + randomPassword);
        }

        // 不是本人的情况
        if (xmlJson.Content[0] === '1') {
            this.ctx.service.user.savePassword(randomPassword, true);
            return this.ctx.body = createRespondXml('欢迎登陆：https://www.rejiejay.cn/#/user/login。你的密码是：' + randomPassword);
        }
        this.ctx.body = createRespondXml('回复1获取密码');
    }

    /**
     * 获取公众号的全局唯一接口调用凭据
     * 【注意】 此接口仅用来进行测试 server 层的代码, 所以不写任何逻辑
     */
    async getGlobalAccess_token() {
        this.ctx.body = await this.ctx.service.weixin.getGlobalAccess_token();
    }

    /**
     * 获取公众号用于调用微信JS接口的临时票据 jsapi_ticket 
     * 【注意】 此接口仅用来进行测试 server 层的代码, 所以不写任何逻辑
     */
    async getJsApi_ticket() {
        this.ctx.body = await this.ctx.service.weixin.getJsApi_ticket();
    }

    /**
     * 通过 url(当前网页的URL，不包含#及其后面部分) 获取公众号用于调用微信JS接口的配置信息
     * 配置信息:
     * 1. noncestr 随机字符串
     * 2. jsapi_ticket 公众号用于调用微信JS接口的临时票据
     * 3. timestamp 时间戳 精确到 秒 就是 new Date().getTime() / 1000
     * 4. signature 签名 sha1加密的签名
     * 文档： 附录1-JS-SDK使用权限签名算法 https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115
     * 微信 JS 接口签名校验合法性工具 https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=jsapisign
     */
    async getWxConfig() {
        // 判断 是否不存在 url 参数
        if (!this.ctx.request.query || !this.ctx.request.query.url) {
            return this.ctx.body = consequencer.error('参数错误!');
        }

        // 如果存在 url ，校验 url 的合法性
        let my_url = decodeURIComponent(this.ctx.request.query.url);
        if ( /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/.test(my_url) === false) {
            return this.ctx.body = consequencer.error('url参数不合法!');
        }

        // 去除掉 # 及其后面部分
        my_url = my_url.split('#')[0];

        // 获取 jsapi_ticket 公众号用于调用微信JS接口的临时票据
        let awaitJsapi_ticket = await this.ctx.service.weixin.getJsApi_ticket();

        // 判断获取的 jsapi_ticket 是否有误
        if (awaitJsapi_ticket.result !== 1) {
            return this.ctx.body = consequencer.error(`获取公众号用于调用微信JS接口的临时票据有误, 原因: ${awaitJsapi_ticket.message}`);
        }

        let jsapi_ticket = awaitJsapi_ticket.data;
        
        // 随机 生成签名的15位长的随机串
        let nonceStr = createRandomStr(15); 

        // 生成 timestamp 时间戳 精确到 秒
        let timestamp = `${parseInt(new Date().getTime() / 1000)}`; // 必须字符串

        /**
         * 对所有待签名参数按照字段名的 ASCII 码从小到大排序（字典序）后，使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串string1
         */
        // 需要进行 ASCII 码从小到大排序（字典序）的对象
        let sortObj = { 
            jsapi_ticket: jsapi_ticket,
            noncestr: nonceStr, // 所有参数名均为小写字符
            timestamp: timestamp,
            url: my_url
        }
        // ASCII 码从小到大排序（字典序）后的数组
        let asciiSortArry = Object.keys(sortObj).sort(); // 先用Object内置类的keys方法获取要排序对象的属性名数组 再利用Array的sort方法进行排序
        
        // 遍历 ASCII 码从小到大排序（字典序）
        let asciiSortUrlString = ''; // 创建一个新的字符串，用于存放排好序的URL键值对的格式（即key1=value1&key2=value2…）
        for (var i = 0; i < asciiSortArry.length; i++) {
            asciiSortUrlString += `${[asciiSortArry[i]]}=${sortObj[asciiSortArry[i]]}${i === (asciiSortArry.length - 1) ? '' : '&'}`
        }

        // sha1加密
        let signature = encryption.sha1ToLowerCase(asciiSortUrlString);

        this.ctx.body = consequencer.success({
            appId: this.config.weixin.appID,
            timestamp: timestamp,
            nonceStr: nonceStr,
            signature: signature
        });
    }
}

module.exports = WeixinController;
