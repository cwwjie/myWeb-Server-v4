// 框架类
const path = require('path');
const Controller = require('egg').Controller;
// 组件类
const consequencer = require(path.relative(__dirname, './app/utils/consequencer'));
const postformurlencodedbyhttps = require(path.relative(__dirname, './app/utils/postformurlencodedbyhttps'));

class MicrosoftController extends Controller {
    async index() {
        // this.app.config.microsoft 配置文件
        this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in 【microsoft】.';
    }
    
    /**
     * 获取令牌 （code）
     */
    async authorize() {
        // 判断参数
        let authorize_code = '';
        if (this.ctx.request.query && this.ctx.request.query.code) {
            authorize_code = this.ctx.request.query.code;

        } else {
            return this.ctx.body = consequencer.error('cdoe 参数错误', 233);

        }

        // 初始化已经 授权的权限
        let authorize_scope = this.ctx.request.query.scope ? this.ctx.request.query.scope : encodeURIComponent(['Notes.Create', 'Notes.Read', 'Notes.Read.All', 'Notes.ReadWrite', 'Notes.ReadWrite.All', 'Notes.ReadWrite.CreatedByApp'].join(' '));

        // 初始化已经 重定向的url
        let redirect_uri = this.ctx.request.query.redirect_uri ? this.ctx.request.query.redirect_uri : encodeURIComponent('https://www.rejiejay.cn/microsoft/microsoft/token.html');

        let client_id = this.app.config.microsoft.appid; // 注册门户 (apps.dev.microsoft.com) 分配给应用的应用程序 ID。

        let client_secret = this.app.config.microsoft.appsecret; // 应用程序密匙

        let reqData = {
            client_id: client_id,
            scope: authorize_scope,
            code: authorize_code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code',
            client_secret: client_secret,
        }
        
        let awaitAccesstoken = await postformurlencodedbyhttps('https://login.microsoftonline.com', '/common/oauth2/v2.0/token', reqData)
        .then(
            res => consequencer.success(res),
            error => consequencer.error(`向微信服务器请求报错, 原因: ${error}`, 400)
        );

        this.ctx.body = awaitAccesstoken;
    }
}

module.exports = MicrosoftController;
