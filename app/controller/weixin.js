// 框架类
const Controller = require('egg').Controller;
const parseString = require('xml2js').parseString;
const lodash = require('lodash');
// 组件类
const consequencer = require('./../utils/consequencer');
const encryption = require('./../utils/encryption');
const getjsonby = require('./../utils/getjsonbyhttps');

class WeixinController extends Controller {
    async index() {
        this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in weixin';
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
     * 如果数据库 存在 jsapi_ticket, 并且 expires_timestamp 未过期. 返回 jsapi_ticket.
     * 如果数据库 不存在 jsapi_ticket, 或 expires_timestamp 过期. 获取微信 jsapi_ticket 并且返回.
     */
    async getJsApi_ticket() {
        // 首先去数据查询一次 公众号用于调用微信JS接口的临时票据
        let jsapiTicketQuery =  await this.ctx.service.weixin.getJsApi_ticket();

        // 判断 查询数据库的结果是否正确
        if (jsapiTicketQuery.result === 1) {
            // 如果正确的情况下 直接返回结果即可
            return jsapiTicketQuery
        }

        // 如果数据库查询的 jsapi_ticket 不正确
        // 先获取公众号的全局唯一接口调用凭据
        let accessTokenQuery =  await this.ctx.controller.weixin.getGlobalAccess_token();

        // 判断 获取公众号的全局唯一接口调用凭据 是否有误
        if (accessTokenQuery.result !== 1) {
            // 如果有误的情况下 直接返回错误的接口 即可
            // 因为无法 获取公众号的全局唯一接口调用凭据的话 是无法继续下一步的
            return accessTokenQuery
        }

        // 成功获取 获取公众号的全局唯一接口调用凭据 的情况
        // 通过公众号的全局唯一接口调用凭据 access_token 交换调用微信JS接口的临时票据 jsapi_ticket
        let newJsapiTicketQuery = await getjsonby(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`)
        .then(val => {
            // 返回的数据格式参考例子
            // val = {
            //   "errcode": 0,
            //   "errmsg": "ok",
            //   "ticket": "bxLdikRXVbTPdHSM05e5u5sUoXNKd8-41ZO3MhKoyN5OfkWITDGgnr2fwJ0m9E8NYzWKVZvdVtaUgWvsdshFKA",
            //   "expires_in": 7200
            // }

            // 判断返回的数据是否正确
            if (val.errcode === 0) {
                return request.success(val.ticket)
            }
            return consequencer.error(`通过公众号的全局唯一接口调用凭据 access_token 交换调用微信JS接口的临时票据 jsapi_ticket 数据有误, 原因: ${val.errmsg}.`);

        }, error => {
            return consequencer.error(`通过公众号的全局唯一接口调用凭据 access_token 交换调用微信JS接口的临时票据 jsapi_ticket 错误, 原因: ${error}.`);
        });

        // 判断 通过公众号的全局唯一接口调用凭据 access_token 交换调用微信JS接口的临时票据 jsapi_ticket 有误
        if (newJsapiTicketQuery.result !== 1) {
            // 如果有误的情况下 直接返回错误结果
            return newJsapiTicketQuery
        }

        // 如果 成功 的情况下 (通过公众号的全局唯一接口调用凭据 access_token 交换调用微信JS接口的临时票据 jsapi_ticket)
        // 存储 jsapi_ticket
        let saveNewJsapiTicket =  await this.ctx.controller.weixin.saveJsApi_ticket(newJsapiTicketQuery.data);

        // 判断是否保存成功
        if (saveNewJsapiTicket.result === 1) {
        }
    }
}

module.exports = WeixinController;
