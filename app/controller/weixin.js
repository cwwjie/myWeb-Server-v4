const Controller = require('egg').Controller;
const consequencer = require('./../utils/consequencer');
const encryption = require('./../utils/encryption');
const postjsonby = require('./../utils/postjsonbyhttps');

class WeixinController extends Controller {
    async index() {
        this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in weixin';
    }

    /**
     * 验证开发者服务器 正确响应微信发送的Token验证
     * @return {string} echostr {};
     */
    async handle() {
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
     * 获取公众号的全局唯一接口调用凭据
     * @return {string} access_token '11_Hi0KxrnvVN_RP47QqLd6_lkV8EAgKSLG_CL28rFgJd4eMaVc0g4jEOIgZ_BulbYXvKcGUTVfN6aaQHpY-xNxiTPO7c5xU_Yj7nRS7bpRtYPsT1K61xG2haGyAcgFzDl9KfCGmKBJyK9SKX8wYBMbAEAGJU'
     */
    async getGlobalAccess_token() {
        let myAccessToken = await this.ctx.service.weixin.getGlobalAccess_token();

        // 查询失败
        if (myAccessToken.result !== 1) {
            return this.ctx.body = myAccessToken;
        }

        // 查询成功
        if (myAccessToken.data.value && typeof(myAccessToken.data.value) === 'string') { // 判断格式是否正确
            return this.ctx.body = consequencer.success({
                access_token: myAccessToken.data.value
            });
        } else {
            return this.ctx.body = consequencer.error('查询数据格式有误!');
        }
    }

    /**
     * 创建菜单界面
     * @return {boolen} 是否成功创建
     */
    async createMenu() {
        let myAccessToken = await this.ctx.service.weixin.getGlobalAccess_token();
        
        // 查询失败
        if (myAccessToken.result !== 1) {
            return this.ctx.body = consequencer.error(`获取access_token失败! 原因: ${myAccessToken.message}`);
        }

        let myMenu = [
            {
                'type': 'click',
                'name': '测试按钮',
                'key': 'V1001_TODAY_MUSIC'
            }
        ];
        let mycreate = await postjsonby(
            'api.weixin.qq.com', 
            `/cgi-bin/menu/create?access_token=${myAccessToken.data.value}`, 
            myMenu
        ).then(
            success => consequencer.success(success),
            error => consequencer.error(error)
        );

        return this.ctx.body = mycreate;
    }
}

module.exports = WeixinController;
