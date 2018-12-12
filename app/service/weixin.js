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

        let requestToken = await getjsonby(`https://api.weixin.qq.com/cgi-bin/token?grant_type=${grant_type}&appid=${appID}&secret=${appsecret}`)
        .then(
            val => {
                // val = {
                //     "access_token": "ACCESS_TOKEN",
                //     "expires_in": 7200000
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
        let expire_timestamp = Date.parse(new Date()) + 7200000;
        let access_token = requestToken.data;
        await this.ctx.app.mysql.query(`update weixin set value='${access_token}',expire_timestamp='${expire_timestamp}' where my_key='global_access_token';`);

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
        // 首先执行 SQL 查询 数据库是否存在 global_access_token
        let global_access_token = await this.ctx.app.mysql.query("select * from weixin where my_key='global_access_token';");
        
        // 判断查询是否正确
        if (global_access_token instanceof Array === false  || global_access_token.length <= 0) {
            return consequencer.error(' SQL 查询 公众号的全局唯一接口调用凭据 global_access_token 有误');
        }

        // 判断是否 有效 未过期
        let mytoken = global_access_token[0];
        if (Date.parse(new Date()) < parseInt(mytoken.expire_timestamp)) { // 现在日期 小于 过期时间
            // 未过期的情况下 直接返回 global_access_token
            return consequencer.success(mytoken);
        }

        // 过期情况下
        // 获取新的 global_access_token (向微信服务器请求)
        let refreshAccessToken = await this.ctx.service.weixin.requestGlobalAccess_token();

        // 判断是否成功获取新的 global_access_token
        if (refreshAccessToken.result === 1) {
            // 成功获取返回成功的数据即可
            return consequencer.success({
                "my_key": "global_access_token",
                "value": refreshAccessToken.data,
                "expire_timestamp": (Date.parse(new Date()) + 7200000 - 5)
            });
        } else {
            // 获取失败的情况下 返回 失败
            return refreshAccessToken;
        }
    }
    
    /**
     * 获取 jsapi_ticket
     * 如果数据库 存在 jsapi_ticket, 并且 expires_timestamp 未过期. 返回 jsapi_ticket.
     * 如果数据库 不存在 jsapi_ticket, 或 expires_timestamp 过期. 返回失败即可.
     */
    async getJsApi_ticket() {
        // 首先执行 SQL 查询 数据库是否存在 jsapi_ticket
        let jsapi_ticket = await this.ctx.app.mysql.query("select * from weixin where my_key='jsapi_ticket';");

        // 判断查询是否正确
        if (jsapi_ticket && jsapi_ticket instanceof Array  && checkRecord.length > 0) {

            // 判断一下是否未过期
            if (new Date().getTime() > jsapi_ticket[0].expire_timestamp) {
                // 未过期的情况 返回 jsapi_ticket 的值即可
                return consequencer.success(jsapi_ticket[0].value);

            } else {

                return consequencer.error('数据有误');
            }
        } else {

            return consequencer.error('数据有误');
        }
    }
    
    /**
     * 保存 jsapi_ticket
     */
    async saveJsApi_ticket(jsapi_ticket) {
        let expire_timestamp = Date.parse(new Date()) + 7200000;
        
        let awaitSave = await this.ctx.app.mysql.query(`update weixin set value='${jsapi_ticket}',expire_timestamp='${expire_timestamp}' where my_key='jsapi_ticket';`);

        // 判断是否插入成功
        if (awaitSave.warningCount === 0) {
            return consequencer.success();
        }
        
        return consequencer.error('SQL存储jsapi_ticket失败', 2, awaitSave);
    }
}

module.exports = weixinService;
