const Controller = require('egg').Controller;
const consequencer = require('./../utils/consequencer');
const encryption = require('./../utils/encryption');

class WeixinController extends Controller {
    async index() {
        this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in weixin';
    }

    /**
     * 验证开发者服务器 正确响应微信发送的Token验证
     * @return {string} echostr {};
     */
    async handle() {
        let request = this.ctx.request;

        // 判断参数
        if (request.header['content-type'] !== 'application/json' || !request.body || !request.body.signature || !request.body.echostr || !request.body.timestamp || !request.body.nonce) {
            return this.ctx.body = consequencer.error('参数错误!');
        }

        // 将token、timestamp、nonce三个参数进行字典序排序 拼接成一个字符串
        let hashcodeString = ['RejiejayWeChatHandleToken', request.body.timestamp, request.body.nonce].sort().join('');
        // sha1加密
        let hashcode = encryption.sha1ToLowerCase(hashcodeString);

        if (hashcode === request.echostr) {
            return this.ctx.body = request.echostr;
        } else {
            return this.ctx.body = consequencer.error('Token验证失败!');
        }
    }
}

module.exports = WeixinController;
