// 框架类
const fs = require('fs');
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
        let authorize_scope = my_authorize.scope ? my_authorize.scope : encodeURIComponent(['offline_access', 'Notes.Create', 'Notes.Read', 'Notes.Read.All', 'Notes.ReadWrite', 'Notes.ReadWrite.All', 'Notes.ReadWrite.CreatedByApp'].join(' '));

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
        console.log('向microsoftonline请求获取token', reqData); // 输出一下日志
        let awaitAccesstoken = await this.ctx.curl( // 文档：https://github.com/node-modules/urllib#api-doc
            'https://login.microsoftonline.com/common/oauth2/v2.0/token', {
                method: 'POST',
                data: reqData,
                contentType: 'application/x-www-form-urlencoded',
            }
        ).then(function (result) {
            if (result.status === 200) {
                let res = JSON.parse(result.data.toString('utf8'));
                console.log('成功向microsoftonline获取token', res); // 输出日志
                
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
            return this.ctx.body = consequencer.success(my_authorize.access_token);
        }

        /**
         * 过期的情况下 刷新新的访问令牌
         */
        let refresh_token = my_authorize.refresh_token;

        let authorize_scope = my_authorize.scope ? my_authorize.scope : encodeURIComponent(['offline_access', 'Notes.Create', 'Notes.Read', 'Notes.Read.All', 'Notes.ReadWrite', 'Notes.ReadWrite.All', 'Notes.ReadWrite.CreatedByApp'].join(' '));

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
                
                return consequencer.error({
                    params: reqData, // 直接返给前端, 看个啥日志
                    response: result,
                    message: JSON.parse(result.data.toString('utf8'))
                }, 400);
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
            return this.ctx.body = consequencer.success(awaitRefreshToken.data.access_token);
        } else {
            // 缓存新的访问令牌 失败 返回错误信息
            return this.ctx.body = awaitSaveToken;
        }
    }

    /**
     * 缓存所有页面
     */
    async storageIteratorPages() {
        const _this = this;
        const payload = this.ctx.request.body;

        /**
         * 判断参数
         */
        if (!payload || !payload.allPages || payload.allPages instanceof Array === false) {
            return this.ctx.body = consequencer.error('payload is error');
        }

        /**
         * 校验参数合法性
         */
        let isValid = true;
        payload.allPages.map(val => {
            if (!val.contentUrl || !val.parentSectionId) {
                isValid = false;
            }
        });
        if (isValid === false) {
            return this.ctx.body = consequencer.error('参数不合法!');
        }

        /**
         * 验证权限(是否登录)
         */
        // let myVerify = await this.ctx.service.user.validatingPayload();
        // if (myVerify.result !== 1) {
        //     return this.ctx.body = myVerify;
        // }
        
        /**
         * 执行清空操作
         */
        let awaitDelLablePages = await this.ctx.service.microsoft.delLablePages();
        if (awaitDelLablePages.result !== 1) {
            // 清空操作失败也不做任何处理
            return this.ctx.body = awaitDelLablePages;
        }

        // 设置缓存状态为 缓存中
        let awaitStatus = await this.ctx.service.microsoft.saveBykey('storageIteratorPagesStatus', 'caching');

        // 判断缓存状态是否成功
        if (awaitStatus.result === 1) {
            this.ctx.body = consequencer.success(null, '正在缓存中ing...');

        } else {
            this.ctx.body = consequencer.error(`设置缓存状态失败, ${awaitStatus.message}`);

        }

        /**
         * 循环执行缓存的SQL
         */
        for (let i = 0; i < payload.allPages.length; i++) {
            let contentUrl = payload.allPages[i].contentUrl;
            let parentSectionId = payload.allPages[i].parentSectionId;

            let awaitSavePages = await _this.ctx.service.microsoft.savePagesByParentSectionId(parentSectionId, contentUrl);

            if (awaitSavePages.result === 1) {
                console.log(`循环缓存Pages${i + 1}，执行成功!`);
            } else {
                console.log(`循环缓存Pages${i + 1}，执行失败!`, awaitSavePages);
            }

            // 最后一次
            if (i === (payload.allPages.length - 1)) {
                // 设置缓存状态为 缓存成功, 并且设置过期时间为一天后
                let awaitStatusfinished = await this.ctx.service.microsoft.saveBykey('storageIteratorPagesStatus', 'finished', (new Date().getTime() + (1000 * 60 * 60 * 24)));

                if (awaitStatusfinished.result === 1) {
                    console.log(`成功设置缓存状态为finished`);

                } else {
                    console.log(`设置缓存状态失败!`);
                }
            }
        }
    }

    /**
     * 查看缓存所有页面的状态
     */
    async getStoragePagesStatus() {
        let awaitStatus = await this.ctx.service.microsoft.getBykey('storageIteratorPagesStatus');

        // 判断是否有缓存状态
        if (awaitStatus.result !== 1) {
            // 没有的情况下, 返回
            return this.ctx.body = consequencer.error(`你还没有设置任何缓存状态噢`, 400);
        }

        // 有缓存状态的情况下
        if (awaitStatus.data.key_value === 'finished') {
            this.ctx.body = consequencer.success(awaitStatus.data, '缓存已完成');
        } else {
            this.ctx.body = consequencer.error(`正在缓存${awaitStatus.data.key_value}`, 233);
        }
    }

    /**
     * 根据分区id随机查询 OneNote notebook 
     */
    async getNotebookByParentSectionId() {
        // 判断 是否存在 id
        if (!this.ctx.request.query || !this.ctx.request.query.parentSectionId) {
            return this.ctx.body = consequencer.error('parentSectionId is error');
        }

        let parentSectionId = this.ctx.request.query.parentSectionId;

        this.ctx.body = await this.ctx.service.microsoft.getRandomPagesBy(parentSectionId);
    }

    /**
     * 图片转发 
     */
    async getNotebookImg() {
        // 判断 参数
        if (!this.ctx.request.query || !this.ctx.request.query.access_token || !this.ctx.request.query.encode_url) {
            return this.ctx.body = consequencer.error('param is error');
        }
        
        let access_token = this.ctx.request.query.access_token;
        let encode_url = this.ctx.request.query.encode_url;

        let awaitAccessImg = await this.ctx.curl( // 文档：https://github.com/node-modules/urllib#api-doc
            // https://graph.microsoft.com/v1.0/users('454766952@qq.com')/onenote/resources/0-3a4beff271790949b0daf33356403665!1-C4CA69B2C470620B!772/$value
            `https://graph.microsoft.com/v1.0/users('454766952@qq.com')/onenote/resources/${encode_url}`, {
                method: 'GET',
                headers: {
                    Authorization: access_token,
                    'Content-Type': 'image/png; charset=UTF-8'
                },
            }
        )
        .then(result => result)
        .catch(error => error);

        // // 判断是否获取成功
        if (awaitAccessImg.status !== 200) {
            // 失败的情况下 返回失败即可
            return this.ctx.body = new Buffer('iVBORw0KGgoAAAANSUhEUgAAAKAAAABkCAYAAAF2sQsZAAAAAXNSR0IArs4c6QAAIupJREFUeAHtnQmUnUWVx+stvSad7nS6E0IISZCwJMgSFgHRAY/HcXAXzYggkuByxiPqeEYdnTOamTNzjttxjjMug5jusOhoEEThqDOOC7KIICgCIZGQQBKy9JpOuvPS3W+Z/+97r15/73vf27q/F15n3j1Jv++r5VbVrftV3bp165YxxxRu2tuVV15P/3PesDt3xN5jw6L2wfe3sbFf4aFsXO9AyqzrmnrPRKRCk4/aNHmRpkeZyoX1+cjzsqYqAHPbobzCfZu890gyryBvwImtYW+QMRsHbvQJNea3fZNO4rAI8thA+vm3B9K/Tw7FTSifUGnkN3T9hy/CSxY2mLF4ujXndzWYB4XskkUNDvKXd6pReQ2dqqwvwkdUwznRkEkq48hEyrxSyB4SUpBTUBF8xhfhRarhn9S08YQx7Y0h87AKuDSDdG5DyCSKYPTtFBpwNk3LwMUqAABpSsgihWioNFO5nCzpP7496IrPPibipdkhm7j2H/huvXDbSF7Y3S8eWepO5tvLmQT/aXr6Pu1ObOJp5naHvXVJ6273e8j0Dv3GrOt8tRP4nbGUGY+54ws/h1SXdZ15/Z0TwLhQGEN+TEiQDf12/7tMQ+S2qQDFgPBFDQw5gdkcuQ+wVg7CTHQeDfeMplnLDhAMChTAfz4/wMY5L54/OZWxNeRbfoW+DhDwddAwvmsSg4zBo+waUiDIGGFAtv1Q3PncQLb1YNxBZmtKWi/4fno0kxHG1qYvljQxjQhndESzA4UXkX33bXJOoE3p+S3U5Jy8yWQq5WIED4r8V79ezk9VD/GjAANR72Dxr7R34FOGdD393/FD4Q7bvDkVufO5o691h9nnvA/PRhT9RbqBO/xGTDL2DuzS38+beOIcs777GoKKQfjC2AXjofiT/mluHfxLJ6J34NfeBHzY1QJz68HiPZCpTNRct+C/nedIdI63gva93PHRpi/2m52eGe1Lwabh/VOpruu4sFR6G5/z7dvAzO9043LQWNa5fv4JUxXMSZH78vzhhDNW79QvIhPA8Iq41H806fxnpCSMfuP3gEZPphEkSQqxcXosDS4JvliDnekPbNXo4tDth415z7yi5VN2WRSk9ZaKL45NTa+M6o/0T5pHJX8jh/9hIG6iwvjUcFr+fk4UJy/AbyWzgJNJf4q2gC+YhIUoSOZyPkUqZmUb+5GUS0Hf2ZhKuWFxS9jhM3dYxc+qZGQaJExT8PtacSTSXZFT8PiYMZPl0CgnV+kXGKu5RQwW8U/77pZ0vfxj66FVpsCmwQnD+qAU9A5cWHCu9uS96/nJL3qCsq9lDTPZ1M5DapuZ0OJlY/8VueHet9Aj3hC/d1Xukrcvb/jkD3bGXvCLn16YI275rP0stp6Buxzqbey7wQYV+71zZ2xPofhpUFCoksm/dhD2DPyPL+KQeZsJC/UNCzf6xnsC58xrXuIJyr6GzK3755hk033m+vkXZEN5uPnAIhOJ7i9vKM7JWfolEpkw753fVDohGot49DsmMrE+L3HjnP2p6wpKYHnJKwl45mCicVWZGcJmfddbTTx8aV76Kg6VzNdFoXfg7aa37wSzabB/qhr/trPD/O2Kg9mMt46mUu9JU7AcTV82X4kH5uJnDyXMae3So5WCTUNjU21xV86VsfSA50pc4rFsXL0H/tloIWWu75wzVcEiyIs1dbpxBYvr7e8zocgyszYkrWK58qCk6Mm0GGh2jU7JeFTuIcUhCwKPSy78w2DcebZxtgHIgwOSvkvCuu6F5vqu99p0JSmIWgZ1zKMSTKkIqteLuqVylZTzYEZVg+aFdCfNiZgTJJohVTn63oxWZlAVQ0Ozrwytta2Y/S1ZQUudy05Iq4BQLvMVPimp+TJpcAAawFploSq3WB/Bg/vT2h3izuyIGNYyaGcdxTSBFYDtgfwsma8Yxp5Oy/MRpof8JZV8xUJSkoIU5KwnXCVuG0nzGUF2H4DnQ+r+QxNTfGbXI8SRp6zCSOyCknngLad71YUAhdJddD2bFZctTncvfLdVldAskU13qdjiGWkBSRvR8ud+dX2lUHJNAnIqeeGCdEXQHNLtfASnzouYhAi2dG7YqTi8CMCPzg6BEsZU3wdUMdSXL2svIOI7ufz/qPgC4MODtrJ+OUBExYFC6YivCg86peoPlCwE7qhi6QrlLxResouhDMOKXdcWQlRO+CINQ5VC4Qq6arSwuXLExSoyMO6md7GUVrPw3Vh+jvi4MeP66vJjimMsJ1b7dKapgKw5PvqsWdd9Wjlo6mnqFKiEApuGrjY9+7oryVI0be++5eaWgbcVTXMMIgvPI0EWfvtoykweTWMMhfslyC+cEfpbRyaki0vPqo3SkV0zZ0btuHP74Sua2ub+MhYbvzKSMto1TiXevqLlinLqOKOCyynAScPqZ2I0biY1sAIRTQ7XdUyvbHdnNGjhf23b9PCka5Lz9yeDqXkSIkYO9cdOWnt664s5kQVeAiu8AP7c4NsOpwyzE9DQbMx2LWA2hKak23SM/1/UM6HWUROfSMeHI5NSnTT6J55e6J07j1x81YrWhyvJPTMCbuo/34TC5TcirlVCpOFBk0qmy43qK0wk/8KEkqWk7CUSMO8wybSgLulhSEuHN1bSUBNKHTTXdT1TLM9XHtrd8vFLl5ZptJHGFJKIFzKbZVEzduidJpR4tSq3XHLEm4sVJLVk8l/XtIY+c7bGn1kE5/54xDwxFP+1zOSuCKraYfPNkQ4zONZp1i/4gYS+dhGwpyTySPOsIx5tuuPyuVoXNF5esn1+CTYeOEfmBYfM9yRms3vQO3A3yfI/4f8aHzL7+paYjxdhZZfO0JaF+R1KIdcKwUa9JL+sKFHBuBvo6CN/fKSs3dWSld40uFbk+37+Wunqps6SmT0JWK2wb+2urCfJMX9ljx2FMMvvwOCWgYu0Of8F0zLvchM79KI5PNScT8DASjvOEG0a+oJ5b+en1Kor3C0LrHtAhN63z0e3i7qLOFSxeaC430nDNA7LeACORvvErxcOC9cfpWP2ixtVnCYL3zgvnjLf05OtT+LACIi+D7UuBhcQhDEIgC6ogVe0RRxV8dMYWaSjpK2VEl5xF0rP/ZiMMLZJf2iBIQG1HnH8Do+nxUXyQrgtSnuKcKK4t4pS4iAcZRBHvoBABu4LPumHy7bFL65wmGcSwazYzXm7tTuxR+NPZ2PYDKrhr5Ry1U4u6ND3izgoZhtF5fMWRB2NDxX5vbgUXBA/qj9rbJzesQVtUiZsuJfPjTj6eSrobCKoEzDNZtNhuQhnjUngafcYGOgkQuGCQMbAiPiYykIEYKkauEwNoUGna+PBEo84OBECMGs3ZPIRTn6M3AG2iXLiFAknYnDVAuVdAG4UykcV1+yJcyWr2mNgnzA1hAj200Xv24biLwPE2Te4BgJZIK2NI8wbZ9O5iUd6cFpwE88bZ9NU4zcQDqTCj/XHTZOwMYCfrE3TJVrmAhAUgzM4Bc46vyvqfIpOpOIYAzkJwQRzgbjMEg+cjGGt2kY+InZlb8Yq4ykDM78mFcHJCoYIG8cnzomLZsVherWktfyVplOnCv8EQkAmitXzI6ZFjYVgbD5hIHeBPkmesQjvbErHMaEskA4e7mQ85MALxIIAD4vQbI5CtB2eOPZ+ODmyXZvzzNiWaGycQuhzMnEQm70l8GFrWW2g7pWDZxJRXR2h1Y1sj8we2eq2G2XuQiACHHduZpKwcXzVzKJ0iJ1cbByfPRMJ4ytE9gJcfmJrRDvUU3HUa1ZMIt7G8E5D+E8jvMCOI+CNg1/sDrc3jiGAiaQQsOX/UsBUd82gdDfnzQBN4FkDaVyJWgUyBlKG+1MpUeZxFT29TkrEdl7+05FZRQjkxPOkDzSTEwUNT2dVg+qVrVOgToE6BeoUqFOgPAp8q/80Hfl+U3mJy0zFnkSQpiJlFutNVn0Z+Nt7X20aW+8zCSlLQ+ZpWRmf5a1Exe+3DB7WYneuwazj6JEl5obuvRXj8GTQkZX3RsLR04+Mjd50zar5L3iiC75OTw4siM4nItL4AYd4RIUiq8239pzmk6r8oJt11CBltD8p4OyPCf+V8zyDPz/cNXlEqo6rJpOJ33Qu7HieE83loqs+AWPRG7UXm64PlgWNrX8qt3K+6Zoa78xqaLGNaevc5JuuzED5KAlNTkx+7qoVTW9eu6L5Z0djk8nIRaZs46fqE/BDHcOyh7kn255Uqsls7Ls++17Jw8a+r5tExjaGfBPjn7GnIipB406rs+6ptae2fomwO58fvyMZT267anlonztNsefqj4G29JlaVW1Ihc2pY4msmVykIWWuaw+MAe7ePf7yVCJ089uWN15sq1zOb2AVKFnY5Phns2kwc9vY15N9L+fh5MEHssRDOTg5/oZyspWbZmI8FevY2XBZueltumPHgZR4q85CJCbTAzTjV+OuJrN2teubtNXy/H5zYImZ07Ane8A5ZUZ0lq7Dk2pGr3fvjqcSifi+q5Y3n1gJoukTkEN34ciKSgrT7Hmp0n85OwkYiTXh0PtL4kim7lWatMkJJ7ZTyXdIJCpfdEmkkmZ0+I/mIyszxon+JW7QMLGhXHvFDIo0AXv6PygZ4wvaBv+wWb/odn/0rtDe/l+ZUMPlJjm1Ee6Krc3HqAw640duNOsXfi3ICoY0Fn1dJrdXmkTs9WZO11aztbG41ejNA68JR0K/SKyr2AYpyHpXjMsxNLpLcmPTcKtZW8TyrELMUclRHzJr2RrvlM1bvzwmdDGxFN7OiqY+cOXSjFxXYWEvZXLHWiEuQ/f4PFZCjwZVl6g5PCz/Md3pPZzG1jmyWS7+XaZCkZfAACCo9mr8nJye5NHT/13T1Hq1YyAfOzyu1dUF5n0nPBXWOvL3Tu1u2tsqS/rrgqvpcYYpIoPuibHF5l3a4DapfzfNc580PYOrcmfh3gGWSS1yMHVlweb3DNzxlmWN77j7NW05SQ7KDiaGwUuNANYObtMSqhXaNMhe6sUSgX4342reMiy/MYnf5+7KpcxuFZNLmTJKwlYPi4BaAuqE6QcWYIFD7+DrHfca40c/lEvA9V0fm05h2KfUIlAvWdgFAzelGkzz8Mf0hW6QQqTVHB270Xxg8aO5BAymqOMXS6ThXDMev9S8u+UJ28g6AS0liv32HHitSfYPmmsXXuNNFigBGW0KjYTF4ryVKue9GL5iceXgzknTM7jUNDb+3NFppqQRCoVymhjUCOFMIo8P+tskM8EQhxLFC8/JUgvTW58ox/wNCy8vgAdzYMyHvWDjsEQIBNYv2C2Xve8zI7FTvcQDfyAEpNIYfjNoey3nmQQJO6o4bKfdQCOxrcbGb5/spt1AHLbU2BlOWOvJTIKdIjgOOP48knBsqt35MHInzqmHX6+4E5f7jDOrD3Y855c8EAI+I6v4Fg0GZ82POnbMwxn3ItSfhkDEM2VkuUueiC1fEPa44jBE72wKmx0iijsONznzFdcuee5xWfBbaQQrV3yxnCV8VB7OtnEYqOOOcRVxwm9dM/o1PKiwQAg4Lg5ZI2tUK7xuGU5/kkM6VoY5LnZ982VFj/f038sQksZhhkvhZ8qy9QwZosPFjymO3ycz+Vcp7ixZnsKAz4rbyMen267FQJvwYZSO+LnjcHIqTuEdmbjAPuMi1A6EgJjwWkt8zHDVTodA+I3BXpq1M9yFRSocxKeHIxzspSEO/7FIFa0dThzR2LbGFUc+zo3gyBOA0wH8iWBWt0+a/i2KAw8GmvpxyuwO2J2HU6jnTyAEbLLfkJDTCDhnVKyBwfhSHWuwQMM49oDt8okibIMrH1b2C8RZEAofTe4VBDbT9hwIhKYMCxybgGuH1SHnZYhu47xLORse5G+gYoytWLvGrjULQo41vuVMG7dA493q+SKIxjYXHZzo09ujZkRs6BcH17E8cx9nIBPE5JwIHO0+BmHLq/ZvIBzoV0lOFRWCeT7EIy0ELRbHGOsHELFQnF/6IMMCIyBN83KUrWixONL4kyWdu1AcZfHp+oET5xdRhbDACMjEgLc0PjMv2DhvOEMgBxMfUD4vEMfRBefgoieSEigLx3xeGhLH2RTOoBwLCISArDSYGBBTHEfhrlahIxzQrIpqiROZbq5hBaJJ2ZkxvQI4Z0lYTBC/S7OsBQgL4TiJxIy+Vyc+LRCHmEQcAnhQixGL3+83EALiH/xlOvtxrmZB4CnJeAANQiBm4uDUEieM+jMrDmcVoka+XJODFcDtySLkyv0Iy4pjRkcAt8SAsxCYkQG7NGvvRDjPMP0LioOolMUeiN8y0KlYgH8CIaDo45weoiEIxcykiDFPZFYhhNHGlSIynzNcyOpivgjA4M9/Zl4rLBPXgbDshIedeIRsZ6Uhwq4WYcF3emY18phWI7gK3K04ViHE0aFubg+QZjmoAiGgHMtmJxC4DXECLmQ85AChldtwAqFNU2f8Eg3FXVNSFCsOgPELZFZYhhgI0uoPx0N+u4RLVhoAeNfI9+KkvmK857dJsp7fPBW3TMfCqg2BENBdSdtgPl/OtWlYzAJxfF58jue7CEsCiHFORkhmWWiJbuP41OHwszrT3Ew4QIdwMpT0Zy/IPZvsKjqduAp/p1ggYOS4nrVjkxf1q1zHU91xrDjcx1rdcax9C8WdLC+fy9vCOUR3563mc+AcaCtbiHjEu7nLpre/1YizuKvxWzUCVqOytYgzEAK2VH+srph2GhIdebDijBVmCGQMnCNxQ1JETe0Ns6Z2a3sqpEvZyQMhIKUhsx0L9VHZLTtGCSv/hEOhEbTMsxdS+QvvGTSmcgLGIp/4xb6k+bPWqrMJNj0r49SIzPLWdz8eZL3TsmZv/x9kbXRudjlRqgQuXoIJWR7MBqCVVqIv5MC6UDuiGuW6ZZl1RQmzv0L56+F1CtQpUKdAnQJ1CtQpUKdAnQJ1CtQp4KHAsVB5e4qs0mtP30dkQvqPOv3Y5ejB4xNbdBL9/XLP/lCVSqwcbU/fOl0k8C86qXOiU8fE5DNazn1U3m1/Xjmy4yPH8cGAm/q/YaLNf5O9q8T2DddtTMT+WcqDz9mgl+SX4xENule2sfmNvnWcnLjarOv83ktSN1ehm7cfeVu0IfLlOW2NpyTQE0nNwbXzsdGJFxLJ5HveeUrL/a7kgTxWrskKpNiAkcjlrM5f5yPlBqKmls+aHjHohg0vTVs3y7VNw8BDpqEpn/nY9E/GYyac3JFf+WMXgoeXO3Yc/VFbR8tdyWTqnsYnTMOV3aHQlQtDobHhI2vEhyfpZMLtm7fJPU/AcHyMgBClZ+BanVy7RZ+tXLZ6NJQNUqFOTPzKHIy9oegFHwETV+c4l8pw7GGJBSfmnevnEutkclAHb19t1i/eEnTRQeDb/PRIZ3RO049a2pouix062qMrum4IAq8bx/HDgLRq4+AlugL1f2VO1KrOdbdTeny5901MbjGxscvMh5YN50ZW4W3TwfPFYb9QXdqnLoHKlMN1ZvH4dtPceIl597yBKpQ+I5Sbd46eEDEN32pta3xTbGxiR3wice3ala2/nRHSApmPLwakkT0HTzHhxANycLY4f9TRzn8i3i/Z5lU6ob+tAE1mHtzT/0YtiO5S+fmGQVH5yZk8er+Z7Hq9+WDoyMwLqw6GzftS3XLpf/Qt3aHD1SkhjfWlkYuq2aL1HTtMg7zrJeJPZp3F2fJwGheOdMti9gl5ebnMBgf6u2ngI6ah8R7nxso8UQCXNbE7za6uy2uV+e7Zm2qVC8VfNScTuyZHx++4/dkjJwVKHw+y448BaeA1crS3vutsrTh/kseELFZCoSaF32d6+97pocfMXnv6v2SiTV81cR+TBzwnTsb+yaxb+A5ToVOpmVWqstx7lVyeFH8aCocfTSWTP7t2ZeueyjBUljp/Cu7d2WwSna1m+Plx84lzZHcQINyyZ4FJNv+dRiH57kyslOpE5XsWDAEW58heOGwtBHgvQx4LCmA8v9W4xc8Foug1qgIiJQ7MkvFDIqlsVhJfNesWOVcuVqW4gJCmGfDWwwvlcOw209T2OscvX3y8zzS0KGxyQsLyOyUv/XhG5eHIdXRI+JuvbpRq5PqVTebqUxp9L1OZUTn/zzPHZRP92FDCfOWpmPkTy6ywCab/qkjXkPn23mWy9HrURBtadXjljWbd/F875fX2rdTn+oi+ph0SmC+WzOIzr5RZs42DXxT+T6yalzAPXtmePdpRZu56smlQ4Jbt4+b6B1jjJEdkyP+Kqi66plE/m0X+GCKvlw/wFjnz+HvJTb+2EVpFnmfmtHfIWeZvZsR8IAylVjD1rJxn6syXJXB1H165ENFC8m60sV3XzgTqYbasmt80dLJpTV1oJlJyDotYGZLCfeIR03rCVrez6qicpN4khPyfgp7D3SY1fpOYb5+Jt3x+KqL+NFsoUEXJujAJuF9+08D9pm3BK01M2pv45DYx3zMagXSSO3WOic49TVoAY24ZelFxN5obFv3QXwJf39avUuYbvIVfYlpMb6rZrAtpX+vYAUe8ih3zOnY1qa2S8G6bv3KskTqm/YgVV2/19N+sUfl9OhV6l7QQ3/BnQNueZYOPmkOda4wZ2q/E50mFsN9GVeMXhsMbAIfMa5bI1Wh4hTgZ3ebqkAGuc2YdhMyLTp2dITocLs6Ac355kXl6dcR8bhUurJws1WzwkFzl1JmvNIVhOxwoMBrCiDUNGIGc/OELNaJcJ0nwBq03mpzreOLjXzO7vvHR4gy4di1GOQmzofpNdLi76ixe/XYcyxK8Gy3HsuyiZW3sP1G7TVtN+4I2c0Sq5PjEmPS+WyQP/oMZHb3bfHDRczZ/cQa0qeq/dQpUQoH0jWrSeZSGOgOWplE9RSkKbPhV1Cx7+Sel0vu07B7n6lq/FyTFXylr9JJmZtXaFypV5aLxSDX46EWzj6uecoGkk8rD/wqyOZ4d8OAFVOIYiikQb1/kLLc80qXblvYiRpnlgM1XkzLyhiskqiXZtp3rbDVGInJrNrGwnHbV3Ago3jFbdcvXsFz9QnQY4vT2iFkgz7HEFQInn7zbcv8GwAoRH8vFGJi4PrmNw7sZhYEDh634HC3GiOQbUD78G1CaXs1pqmNXkTqShpP8eOA9nKkjeM6UB7YOORYr1Dabb6vyjWTydWsLfaXqWEOQkobkq6oP/yuCmhkBIfSIHHXjKBHm6xKR54mJ6JhnDiYMruFJ4wU68ZC8heClDfd6LVoV4q+GznpMYWPyjedlJvDAOE/LRbJ1u9cpxsN9MmWTDweRhfJtETNshWkFVhWyVXWEkb15SEMdB4UXB5EwH/XDtR9te0q+sfF96NcR5MMLMTShjax4cSHTf1TWBqrjhHWeSCGzFGrmM4KWu+StnU7BLyOjCYCb/RfkjBKX+nQergVxQw0DwUgwJh7gAdxMn5JxH71DnbpX+J4YTJgVuopnidxTgxsGGRUemIjpDA+kq+c3yEupEbOmwx3X/3JzuEJe+nBrnc0nJsC7PQ7t8a63WiMsjIQ7RJgZV9eHhRR83PdCHQGYnJEWOEk4l8upHHG4/udWNryS4q2ZtqFVsW3D2ykOOwHqv5y26RkHnM/LSTv5mBlmM9QMA0LEVvm3XCFvq3iaptMBXDW2ieOYusbEpYxOOJjHoyCdzkhFp52hzsN/JfmQzWBEnIduU+czwqBjXCXG3qWO25NxXYvfzJWaOknPB4Arb/xekod7JMjHyIOP9d36CKznVRzJkw8gHy52L+iOyul8IjvyUkfHX6fDsGnf7TCYHfnIe4qckeLQdJtGT/R6tA2xAf/vT6u9RzNtIx9eEqmn/pmTRRNGwzRrgmn2Qs0wINMN3mFx0wuRLcBQTMX4B90i2ZBREGYkDR0C08F8jAOWacnLM3dpnN8ddpy2HtKw9fABdZnKoSwYhGnXnYd8AHLZft0MjgviIe3MPEQ+AfmQDxdIPHDnoy66zdm57WC3Rl1cBlNHgDp2imHPyDAs7xbAwb0e5+vGSBjuiJjd3qpAuvmqv3OdRQaPO1+74nBDN9uhZhiwFCHR+p8tRjugkWmPpiDxhTOC4BPazQxuPPQ1fbRGDmxfUJ49Yg5GRZhPg13BfOBbpNGxQ8yx83DcGT2RvcjHaFuoPMKXaqrkfhQWUhMSExk9iy1OqCOy57nyVMx0u0fOwxENGB0RKQqV5W7nbH6eNQwIkemshRpNFuk/shydU04HkY9pCxmKkYX3UkAa5DzHn7fKKjcf9UE8OF9TeaV1XCSGO0H/K8lXqh21Hj+rGNASE+ZwT2U2vNRvOczqh2M6+aZbx+nm86v3bAirOQZElmMV+udDuhtDz4xcha6xcROYtKxOt2nq4/lUTWEsKujQYsBow6LkgKa/RXLYzAjENFtOvr3Kxyr2JPmaJ1+pj4KyWDShrmHaXap8TO0ly1IDUHizmiYfOkBEiOMBaooB6SDULagn4CJozK0PrAC5xgKi+3UWiwNULqxanUzKx5UZxeQocLPgeUYr1yMsZQVc7LJb/1nhstL1G/nIh4yGGmdMiwbKQxWECma17jaJqhGF6shKGlmUdgIHx+POHXhnZBiqUD5kVxY2tm2sllHOtyMjzHJgwKkJoE+2qVO36ytvEF25IgShH+ZCzwbR+eXdAo8wCStH9H4AK2nudbGMgRLbC+DgchxuIOK2IkZYLsBBqQw+1CLUw1WUg4J83HfK5YkwH6PXeZL1+MV1NvhQ2/jVkYsaUeMQd/q8qMNAMCIKc26vRAfpLo9n6sINSlwHyvtpygezwuFP68OxOkJv+2bTe82MgAxCMf3pbklvhUHEVvERF0Cm9X3pzuBmEHSDAMrbLWIW9ozRuXG7knMtn3oLfdvT6rwhMdrjYgpGJ3ZJKIdtrQHtJsAA4AInnc1FQna04d5YmAkdHMpqplerUIYZUCgvy+TjmhhGX646hWFOUvjyTB3RJ7Jlx4VE7ICgi3TuZFTh56o+qGuOSmPD5UgsklA4AzAmcVxyxKKGttn7IaEJ5cC0sx1qhgHp4JX6wpFxLEBerltglEEnh5z2gjoZxoDRvDsgpHe6RH+I504hmGZATMDVYahs+sR4bGGh7IYpUX7DfAB1OElpGAnZ8eCD+INGO5iN0QaDBZgAZkD5bPPxywWeqG1g7j2aahkRYTRGWvAi7y3LXKnjFKc/1JG7jZAJ2SlhpBvR/E4+O7ot0Ve4fF5avnTyqZ7Q5Fzl853rnZbMnj81w4Do+fjSkcsYYdwA4VlUoJBmakwbHKQtgpmSuDrNMoM7H88ocvdKqeyMUGIimKFbOr7ThA+8GmBygDB2GZiSGYEYidgOBD/709xOBnjzEQ/jwvSM2CPa+9VBHGdBs0o6PmfnAuQeoD4YMtA2ZEn2ouEsPkR2RZwFmE8+aESe2Q41w4ClCOkwgLT/3YvCzm4IoxE7HRoMCjIfOMm3WAzHomJY8huMwFTs06c5VQAv19Yxy5GPEY8PpFQ+JXGUyozSmIVRR6BYPupo9ZvIue62FcuXU+FZ+jJrGNDSlxED+Y7/QDkdRBrNdlkDh3LyWNzTzcfCJLtsBVkZQL0qbVsZaGs6iUviqul61it3nFKgZhjQGS/Sg9pxSurgm4WYMNuhZhgQQrKJz63dXgF/thM5yPozTfOfxQly6WyHmpIB+aK599oC8l4dcilgd1FyQ2fv2zFlwEq/1+ON2MeSTSql9bGsm7usqeHGHRr0cyr0IOfbHzwwaZ6UjqwO1afATX/WBashjS/xiV1y3L6n+iVOr4TcD2Xjgdep0lelzYsDlMRCIZBdbiKRM8xkwizWdtNli6RA5uBEHQKjAGf0th9Kmvv246lVaB23aKl79bBXnltz+zqwUtWHyE6pxL1mXfc9laLNnYLD4Uu0DfEBB0k15j+u31F9sXi54/mJSutaT18JBWA3Z1Mp9CaHG6vRn7n1GdE2073aYK9L7rl0qb/VKVCnQJ0CdQrUKVCLFPg/tVbjizWlELYAAAAASUVORK5CYII=', 'base64');
        }

        this.ctx.body = awaitAccessImg.data;
    }
}

module.exports = MicrosoftController;
