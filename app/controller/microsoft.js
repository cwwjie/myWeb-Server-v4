// 框架类
const path = require('path');
const Controller = require('egg').Controller;
// 组件类
const consequencer = require(path.relative(__dirname, './app/utils/consequencer'));
const convertString = require(path.relative(__dirname, './app/utils/convertString'));

class MicrosoftController extends Controller {
    async index() {
        // this.app.config.microsoft 配置文件
        this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in 【microsoft】.';
    }

    /**
     * 缓存授权的参数
     * 因为这些地址 和 状态 授权项目 目的是为了 防止跨网站请求伪造攻击
     */
    async storageAuthorizeParam() {
        // 判断参数
        if (!this.ctx.request.query || !this.ctx.request.query.redirect_uri) {
            return this.ctx.body = consequencer.error('redirect_uri 参数错误', 233);
        }
        if (!this.ctx.request.query || !this.ctx.request.query.scope) {
            return this.ctx.body = consequencer.error('scope 参数错误', 233);
        }
        if (!this.ctx.request.query || !this.ctx.request.query.state) {
            return this.ctx.body = consequencer.error('state 参数错误', 233);
        }

        // 缓存这些参数
        let redirect_uri = this.ctx.request.query.redirect_uri;
        let scope = this.ctx.request.query.scope;
        let state = this.ctx.request.query.state;

        // 成功失败都直接返回去即可
        this.ctx.body = await this.ctx.service.microsoft.saveBykey(
            state, 
            convertString.stringToBase64(
                JSON.stringify({
                    redirect_uri: redirect_uri,
                    scope: scope,
                })
            )
        );
    }
    
    /**
     * 获取令牌
     */
    async authorize() {
        // 判断参数
        if (!this.ctx.request.query || !this.ctx.request.query.code) {
            return this.ctx.body = consequencer.error('code 参数错误', 233);
        }
        if (!this.ctx.request.query || !this.ctx.request.query.state) {
            return this.ctx.body = consequencer.error('state 参数错误', 233);
        }

        let authorize_code = this.ctx.request.query.code;
        let authorize_state = this.ctx.request.query.state;
        
        // 先根据授权的状态查询 是否存在这个授权动作
        const awaitkeyword = await this.ctx.service.microsoft.getBykey(authorize_state);

        // 判断是否存在这个授权动作
        if (awaitkeyword.result !== 1) {
            // 不存在的情况下, 返回跨域攻击
            return this.ctx.body = consequencer.error('检测到跨网站请求伪造攻击, 因为无此授权动作', 123);

        } else {
            // 存在的情况下, 删除掉这个缓存
            let delState = await this.ctx.service.microsoft.delBykey(authorize_state);
            
            // 判断删除是否成功
            if (delState.result !== 1) {
                // 失败的情况下, 返回失败
                return this.ctx.body = delState;
            }
        }

        let my_authorize = JSON.parse(convertString.base64ToString(awaitkeyword.data.key_value));

        // 初始化已经 授权的权限
        let authorize_scope = my_authorize.scope ? my_authorize.scope : encodeURIComponent(['Notes.Create', 'Notes.Read', 'Notes.Read.All', 'Notes.ReadWrite', 'Notes.ReadWrite.All', 'Notes.ReadWrite.CreatedByApp'].join(' '));

        // 初始化已经 重定向的url
        let redirect_uri = my_authorize.redirect_uri ? my_authorize.redirect_uri : encodeURIComponent('https://www.rejiejay.cn/microsoft/token.html');

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
        
        // 向 microsoftonline 请求获取 token
        let awaitAccesstoken = await this.ctx.curl( // 文档：https://github.com/node-modules/urllib#api-doc
            'https://login.microsoftonline.com/common/oauth2/v2.0/token', {
                method: 'POST',
                data: reqData,
                contentType: 'application/x-www-form-urlencoded',
            }
        ).then(function (result) {
            if (result.status === 200) {
                let res = JSON.parse(result.data.toString('utf8'));
                
                // {
                //     "token_type": "Bearer", // 表示令牌类型值 (这里是写死的)
                //     "scope": "user.read%20Fmail.read", // 权限
                //     "expires_in": 3600, // 过期时间
                //     "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik5HVEZ2ZEstZnl0aEV1Q...", // token
                //     "refresh_token": "AwABAAAAvPM1KaPlrEqdFSBzjqfTGAMxZGUTdM0t4B4..." // 刷新用的 token
                // }
                return consequencer.success(res);

            } else {
                return consequencer.error(result, 2334);
            }

        }).catch(error => consequencer.error(error, 400));

        // 判断是否获取成功
        if (awaitAccesstoken.result !== 1) {
            // 失败的情况下 返回失败即可
            return this.ctx.body = awaitAccesstoken;
        }

        // 成功获取token的情况下 缓存数据
        let awaitSaveToken = await this.ctx.service.microsoft.saveBykey(
            'access_token',
            convertString.stringToBase64(
                JSON.stringify({
                    access_token: awaitAccesstoken.data.access_token,
                    refresh_token: awaitAccesstoken.data.refresh_token,
                    scope: awaitAccesstoken.data.scope,
                    redirect_uri: redirect_uri,
                })
            ),
            new Date().getTime() + (awaitAccesstoken.data.expires_in * 1000) // 因为是以秒为单位
        );
        
        // 判断是否缓存成功
        if (awaitAccesstoken.result === 1) {
            // 成功的情况, 返回查询结果
            return this.ctx.body = awaitAccesstoken;
        } else {
            // 失败的情况下 返回失败存储结果即可
            return this.ctx.body = awaitSaveToken;
        }
    }

    /**
     * 获取 Token
     */
    async getToken() {
        // 验证请求
        let myVerify = await this.ctx.service.user.validatingPayload();
        if (myVerify.result !== 1) {
            return this.ctx.body = myVerify;
        }

        // 想数据库查询 Token
        let awaitAuthorize = await this.ctx.service.microsoft.getBykey('access_token');
        
        // 判断是查询成功 Token
        if (awaitAuthorize.result !== 1) {
            // 没有的情况下 返回233状态码即可
            return this.ctx.body = consequencer.error('这里并没有token啦啦啦', 233);
        }

        // 查询oken成功的情况下
        let my_authorize = JSON.parse(convertString.base64ToString(awaitAuthorize.data.key_value));
        
        // 判断是否过期
        if (new Date().getTime() < awaitAuthorize.data.expire_timestamp) {
            // 未过期的情况下，返回token
            return consequencer.success(my_authorize.access_token);
        }

        /**
         * 过期的情况下 刷新新的访问令牌
         */
        let refresh_token = my_authorize.refresh_token;

        let authorize_scope = my_authorize.scope ? my_authorize.scope : encodeURIComponent(['Notes.Create', 'Notes.Read', 'Notes.Read.All', 'Notes.ReadWrite', 'Notes.ReadWrite.All', 'Notes.ReadWrite.CreatedByApp'].join(' '));

        // 初始化已经 重定向的url
        let redirect_uri = my_authorize.redirect_uri ? my_authorize.redirect_uri : encodeURIComponent('https://www.rejiejay.cn/microsoft/token.html');

        let client_id = this.app.config.microsoft.appid; // 注册门户 (apps.dev.microsoft.com) 分配给应用的应用程序 ID。

        let client_secret = this.app.config.microsoft.appsecret; // 应用程序密匙

        let reqData = {
            client_id: client_id,
            scope: authorize_scope,
            refresh_token: refresh_token,
            redirect_uri: redirect_uri,
            grant_type: 'refresh_token',
            client_secret: client_secret,
        }
        
        // 向 microsoftonline 请求刷新 token
        let awaitRefreshToken = await this.ctx.curl( // 文档：https://github.com/node-modules/urllib#api-doc
            'https://login.microsoftonline.com/common/oauth2/v2.0/token', {
                method: 'POST',
                data: reqData,
                contentType: 'application/x-www-form-urlencoded',
            }
        ).then(function (result) {
            if (result.status === 200) {
                let res = JSON.parse(result.data.toString('utf8'));
                
                // {
                //     "token_type": "Bearer", // 表示令牌类型值 (这里是写死的)
                //     "scope": "user.read%20Fmail.read", // 权限
                //     "expires_in": 3600, // 过期时间
                //     "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik5HVEZ2ZEstZnl0aEV1Q...", // token
                //     "refresh_token": "AwABAAAAvPM1KaPlrEqdFSBzjqfTGAMxZGUTdM0t4B4..." // 刷新用的 token
                // }
                return consequencer.success(res);

            } else {
                return consequencer.error(result, 400);
            }

        }).catch(error => consequencer.error(error, 400));

        // 判断是否刷新 token成功
        if (awaitRefreshToken.result !== 1) {
            // (刷新新的访问令牌)失败 返回错误信息
            return this.ctx.body = awaitRefreshToken;
        }

        // 成功 刷新新的访问令牌 缓存数据
        let awaitSaveToken = await this.ctx.service.microsoft.saveBykey(
            'access_token',
            convertString.stringToBase64(
                JSON.stringify({
                    access_token: awaitRefreshToken.data.access_token,
                    refresh_token: awaitRefreshToken.data.refresh_token,
                    scope: awaitRefreshToken.data.scope,
                    redirect_uri: redirect_uri,
                })
            ),
            new Date().getTime() + (awaitRefreshToken.data.expires_in * 1000) // 因为是以秒为单位
        );

        // 判断是否 缓存新的访问令牌 成功
        if (awaitSaveToken.result === 1) {
            // 缓存新的访问令牌 成功 返回查询结果
            return this.ctx.body = consequencer.success(awaitRefreshToken.access_token);
        } else {
            // 缓存新的访问令牌 失败 返回错误信息
            return this.ctx.body = awaitSaveToken;
        }
    }
}

module.exports = MicrosoftController;
