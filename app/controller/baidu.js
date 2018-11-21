const Controller = require('egg').Controller;

class WeixinController extends Controller {
    async index() {
        this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in baidu';
    }

    /**
     * 获取 百度音频的应用程序编程接口凭证
     */
    async getText2audioAccessToken() {
        // 如果数据库 存在 access_token, 并且 expires_timestamp 未过期. 返回 access_token.
        let myVerify = await this.ctx.service.baidu.findText2audioAccessToken();
        if (myVerify.result === 1) {
            // 这里表示 成功 并且 获取到 access_token， 直接向前端返回成功即可
            return this.ctx.body = myVerify;
        }

        // 这里不管什么情况（获取失败，已过期）, 都是刷新 access_token 并且返回
        this.ctx.body = await this.ctx.service.baidu.refreshText2audioAccessToken();
    }
}

module.exports = WeixinController;
