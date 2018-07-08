const Service = require('egg').Service;
const consequencer = require('./../utils/consequencer');
const getjsonby = require('./../utils/getjsonbyhttps');

class weixinService extends Service {
    /**
     * 向微信服务器请求公众号的全局唯一接口调用凭据
     * @return {object} {
     *    "global_access_token": "11_Hi0KxrnvVN_RP47QqLd6_lkV8EAgKSLG_CL28rFgJd4eMaVc0g4jEOIgZ_BulbYXvKcGUTVfN6aaQHpY-xNxiTPO7c5xU_Yj7nRS7bpRtYPsT1K61xG2haGyAcgFzDl9KfCGmKBJyK9SKX8wYBMbAEAGJU",
     * };
     */
    async requestGlobalAccess_token() {
        let grant_type = 'client_credential',
        appID = this.config.weixin.appID,
        appsecret = this.config.weixin.appsecret;

        let requestToken = await getjsonby(grant_type, appID, appsecret)
        .then(
            val => {
                // val = {
                //     "access_token": "ACCESS_TOKEN",
                //     "expires_in": 7200
                // }
                if (val.errcode) {
                    let errorMessage = ({
                        '-1': '系统繁忙，此时请开发者稍候再试',
                        '40001': 'AppSecret错误或者AppSecret不属于这个公众号，请开发者确认AppSecret的正确性',
                        '40002': '请确保grant_type字段值为client_credential',
                        '40164': '调用接口的IP地址不在白名单中，请在接口IP白名单中进行设置'
                    })[val.errcode];
        
                    return consequencer.error(`向微信服务器请求公众号的全局唯一接口调用凭据返回错误, 原因: ${errorMessage}. The access_token result is error, Because ${val.errmsg}.`)
                }
        
                return consequencer.success(val.access_token, 'get access_token successful');
            }, 
            error => consequencer.error(`向微信服务器请求报错, 原因: ${error}`, 400)
        );

        // 请求失败
        if (requestToken.result !== 1) {
            return requestToken;
        }

        // 请求成功
        let expire_timestamp = Date.parse(new Date()) + 7200;
        let access_token = requestToken.data;
        await this.ctx.app.mysql.query(`update weixin set value='${access_token}',expire_timestamp='${expire_timestamp}' where  my_key='global_access_token';`);

        // 判断是否更新成功
        let global_access_token = await this.ctx.app.mysql.query("select * from weixin where my_key='global_access_token';");
        if (global_access_token[0].value === access_token) {
            return requestToken;
        } else {
            return consequencer.error('更新失败', 200, access_token);
        }

    }
    /**
     * 获取公众号的全局唯一接口调用凭据
     * @return {object} {
     *    "my_key": "global_access_token",
     *    "value": "11_Hi0KxrnvVN_RP47QqLd6_lkV8EAgKSLG_CL28rFgJd4eMaVc0g4jEOIgZ_BulbYXvKcGUTVfN6aaQHpY-xNxiTPO7c5xU_Yj7nRS7bpRtYPsT1K61xG2haGyAcgFzDl9KfCGmKBJyK9SKX8wYBMbAEAGJU",
     *    "expire_timestamp": 733816000000
     * };
     */
    async getGlobalAccess_token() {
        let global_access_token = await this.ctx.app.mysql.query("select * from weixin where my_key='global_access_token';");
        
        // 是否查询成功
        if (global_access_token.length === 0) {
            return consequencer.error('查询为空');
        }

        // 判断是否过期
        let mytoken = global_access_token[0];
        if ((Date.parse(new Date()) + 7200) < mytoken.expire_timestamp) {
            return consequencer.success(mytoken);
        }

        // 过期 (向微信服务器请求)
        let refreshAccessToken = await this.ctx.service.weixin.requestGlobalAccess_token();
        if (refreshAccessToken.result === 1) {
            return consequencer.success({
                "my_key": "global_access_token",
                "value": refreshAccessToken.data,
                "expire_timestamp": (Date.parse(new Date()) + 7200 - 5)
            });
        } else {
            return refreshAccessToken;
        }
    }
}

module.exports = weixinService;
